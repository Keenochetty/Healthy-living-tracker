import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  ActivityLevel,
  DailyNutritionSummary,
  CustomFood,
  DailyNutritionProgress,
  FavouriteFood,
  FoodDetails,
  FoodSource,
  FoodLog,
  FoodLogSource,
  FoodSearchResult,
  MealType,
  NutritionDailyNote,
  NutritionDiaryEntry,
  NutritionEstimate,
  NutritionGoalType,
  NutritionMealGroup,
  NutritionTarget,
  NutritionDayAdjustment,
  Recipe,
  RecipeIngredient,
  RecentFood,
  SavedMeal,
  SavedMealItem,
  WaterGoal,
  WaterLog
} from "@/types/nutrition";
import { createCustomDetails, getCommonFoods, searchLocalFoods as searchSeedFoods, toSearchResult } from "@/services/nutrition/localFoodProvider";
import {
  calculateFoodNutritionByQuantity,
  calculateRecipePerServing,
  calculateRecipeTotals,
  calculateSavedMealTotals,
  multiplyTotals
} from "@/services/nutrition/nutritionCalculations";

const NUTRITION_ENTRIES_STORAGE_KEY = "family_health_nutrition_entries";
const LEGACY_FOOD_LOGS_STORAGE_KEY = "family_health_food_logs";
const WATER_LOGS_STORAGE_KEY = "family_health_water_logs";
const WATER_TARGETS_STORAGE_KEY = "family_health_water_targets";
const LEGACY_WATER_GOALS_STORAGE_KEY = "family_health_water_goals";
const DAILY_NOTES_STORAGE_KEY = "family_health_nutrition_daily_notes";
const RECENT_FOODS_STORAGE_KEY = "family_health_recent_foods";
const FAVOURITE_FOODS_STORAGE_KEY = "family_health_favourite_foods";
const CUSTOM_FOODS_STORAGE_KEY = "family_health_custom_foods";
const SAVED_MEALS_STORAGE_KEY = "family_health_saved_meals";
const SAVED_MEAL_ITEMS_STORAGE_KEY = "family_health_saved_meal_items";
const RECIPES_STORAGE_KEY = "family_health_recipes";
const RECIPE_INGREDIENTS_STORAGE_KEY = "family_health_recipe_ingredients";
const NUTRITION_TARGETS_STORAGE_KEY = "family_health_nutrition_targets";
const DEFAULT_WATER_TARGET_ML = 2000;
const LOCAL_USER_ID = "local-user";
const LOCAL_PROFILE_ID = "local-profile";
const nutritionListeners = new Set<() => void>();

type CreateNutritionEntryInput = {
  allergens?: string[];
  barcode?: string;
  brand?: string;
  calories?: number;
  carbsG?: number;
  confirmationSource?: NutritionDiaryEntry["confirmationSource"];
  entrySource?: NutritionDiaryEntry["entrySource"];
  entryDate?: string;
  fatG?: number;
  fiberG?: number;
  foodName: string;
  imageUrl?: string;
  ingredients?: string;
  mealGroup: NutritionMealGroup;
  notes?: string;
  profileId?: string;
  proteinG?: number;
  quantity?: number;
  source?: FoodSource;
  sourceGroupId?: string;
  sourceFoodId?: string;
  sourceItemId?: string;
  sourceRefId?: string;
  smartLogSessionId?: string;
  unit?: string;
  userId?: string;
};

type AddFoodLogInput = {
  estimateOnly?: boolean;
  imageUri?: string;
  loggedAt?: string;
  mealType: MealType | NutritionMealGroup;
  name: string;
  notes?: string;
  nutrition?: NutritionEstimate;
  portionDescription?: string;
  source?: FoodLogSource;
};

export function subscribeToNutrition(listener: () => void) {
  nutritionListeners.add(listener);

  return () => {
    nutritionListeners.delete(listener);
  };
}

function notifyNutritionListeners() {
  nutritionListeners.forEach((listener) => listener());
}

export function toNutritionDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTodayDateKey() {
  return toNutritionDateKey(new Date());
}

function isSameDay(isoDate: string, date: Date) {
  return toNutritionDateKey(new Date(isoDate)) === toNutritionDateKey(date);
}

async function readJsonArray<T>(key: string) {
  try {
    const storedValue = await AsyncStorage.getItem(key);

    if (!storedValue) {
      return [] as T[];
    }

    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue) ? (parsedValue as T[]) : [];
  } catch {
    return [] as T[];
  }
}

async function writeJsonArray<T>(key: string, value: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
  notifyNutritionListeners();

  return value;
}

async function readJsonRecord<T>(key: string) {
  try {
    const storedValue = await AsyncStorage.getItem(key);

    if (!storedValue) {
      return {} as Record<string, T>;
    }

    const parsedValue = JSON.parse(storedValue);

    return parsedValue && typeof parsedValue === "object"
      ? (parsedValue as Record<string, T>)
      : {};
  } catch {
    return {} as Record<string, T>;
  }
}

async function writeJsonRecord<T>(key: string, value: Record<string, T>) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
  notifyNutritionListeners();

  return value;
}

function numberOrZero(value?: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function toMealGroup(mealType: MealType | NutritionMealGroup): NutritionMealGroup {
  switch (mealType) {
    case "snack":
      return "snacks";
    case "supplement":
      return "supplements";
    case "other":
    case "drink":
      return "notes";
    default:
      return mealType;
  }
}

function toLegacyMealType(mealGroup: NutritionMealGroup): MealType {
  switch (mealGroup) {
    case "snacks":
      return "snack";
    case "supplements":
      return "supplement";
    case "notes":
      return "other";
    default:
      return mealGroup;
  }
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getNutritionEntries() {
  const [entries, legacyLogs] = await Promise.all([
    readJsonArray<NutritionDiaryEntry>(NUTRITION_ENTRIES_STORAGE_KEY),
    readJsonArray<FoodLog>(LEGACY_FOOD_LOGS_STORAGE_KEY)
  ]);
  const migratedLegacyEntries = legacyLogs
    .filter((log) => !entries.some((entry) => entry.id === log.id))
    .map(legacyFoodLogToNutritionEntry);

  return [...entries, ...migratedLegacyEntries].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

function legacyFoodLogToNutritionEntry(log: FoodLog): NutritionDiaryEntry {
  return {
    calories: numberOrZero(log.nutrition.calories),
    carbsG: numberOrZero(log.nutrition.carbsGrams),
    createdAt: log.createdAt,
    entryDate: toNutritionDateKey(new Date(log.loggedAt)),
    fatG: numberOrZero(log.nutrition.fatGrams),
    fiberG: numberOrZero(log.nutrition.fibreGrams),
    foodName: log.name,
    id: log.id,
    mealGroup: toMealGroup(log.mealType),
    notes: log.notes,
    profileId: LOCAL_PROFILE_ID,
    proteinG: numberOrZero(log.nutrition.proteinGrams),
    quantity: 1,
    unit: log.portionDescription ?? "serving",
    updatedAt: log.updatedAt,
    userId: LOCAL_USER_ID
  };
}

function nutritionEntryToFoodLog(entry: NutritionDiaryEntry): FoodLog {
  return {
    createdAt: entry.createdAt,
    estimateOnly: false,
    id: entry.id,
    loggedAt: `${entry.entryDate}T12:00:00.000Z`,
    mealType: toLegacyMealType(entry.mealGroup),
    name: entry.foodName,
    notes: entry.notes,
    nutrition: {
      calories: entry.calories,
      carbsGrams: entry.carbsG,
      fatGrams: entry.fatG,
      fibreGrams: entry.fiberG,
      proteinGrams: entry.proteinG
    },
    portionDescription: `${entry.quantity} ${entry.unit}`.trim(),
    source: "manual",
    updatedAt: entry.updatedAt ?? entry.createdAt
  };
}

export async function createNutritionEntry(input: CreateNutritionEntryInput) {
  const now = new Date().toISOString();
  const entry: NutritionDiaryEntry = {
    allergens: input.allergens,
    barcode: input.barcode,
    brand: input.brand,
    calories: Math.max(0, numberOrZero(input.calories)),
    carbsG: Math.max(0, numberOrZero(input.carbsG)),
    confirmationSource: input.confirmationSource,
    createdAt: now,
    entrySource: input.entrySource,
    entryDate: input.entryDate ?? getTodayDateKey(),
    fatG: Math.max(0, numberOrZero(input.fatG)),
    fiberG: Math.max(0, numberOrZero(input.fiberG)),
    foodName: input.foodName.trim(),
    id: createId("nutrition"),
    imageUrl: input.imageUrl,
    ingredients: input.ingredients,
    mealGroup: input.mealGroup,
    notes: input.notes?.trim() || undefined,
    profileId: input.profileId ?? LOCAL_PROFILE_ID,
    proteinG: Math.max(0, numberOrZero(input.proteinG)),
    quantity: Math.max(0, numberOrZero(input.quantity ?? 1)),
    source: input.source,
    sourceGroupId: input.sourceGroupId,
    sourceFoodId: input.sourceFoodId,
    sourceItemId: input.sourceItemId,
    sourceRefId: input.sourceRefId,
    smartLogSessionId: input.smartLogSessionId,
    unit: input.unit?.trim() || "serving",
    updatedAt: now,
    userId: input.userId ?? LOCAL_USER_ID
  };
  const entries = await getNutritionEntries();

  await writeJsonArray(NUTRITION_ENTRIES_STORAGE_KEY, [entry, ...entries]);

  return entry;
}

export async function getNutritionEntriesByDate(date: Date | string) {
  const dateKey = typeof date === "string" ? date : toNutritionDateKey(date);
  const entries = await getNutritionEntries();

  return entries.filter((entry) => entry.entryDate === dateKey);
}

export async function updateNutritionEntry(
  id: string,
  partial: Partial<Omit<NutritionDiaryEntry, "id" | "createdAt">>
) {
  const entries = await getNutritionEntries();
  const updatedEntries = entries.map((entry) =>
    entry.id === id
      ? {
          ...entry,
          ...partial,
          updatedAt: new Date().toISOString()
        }
      : entry
  );

  await writeJsonArray(NUTRITION_ENTRIES_STORAGE_KEY, updatedEntries);

  return updatedEntries.find((entry) => entry.id === id) ?? null;
}

export async function deleteNutritionEntry(id: string) {
  const entries = await getNutritionEntries();
  const entry = entries.find((item) => item.id === id) ?? null;

  await writeJsonArray(
    NUTRITION_ENTRIES_STORAGE_KEY,
    entries.filter((item) => item.id !== id)
  );

  return entry;
}

export async function addWaterLog(amountMl: number, loggedAt = new Date().toISOString()) {
  const now = new Date().toISOString();
  const waterLog: WaterLog = {
    amountMl: Math.max(0, Math.round(amountMl)),
    createdAt: now,
    id: createId("water"),
    loggedAt,
    profileId: LOCAL_PROFILE_ID,
    userId: LOCAL_USER_ID
  };
  const logs = await readJsonArray<WaterLog>(WATER_LOGS_STORAGE_KEY);

  await writeJsonArray(WATER_LOGS_STORAGE_KEY, [waterLog, ...logs]);

  return waterLog;
}

export async function getWaterLogsByDate(date: Date | string) {
  const dateKey = typeof date === "string" ? date : toNutritionDateKey(date);
  const [logs, legacyGoals] = await Promise.all([
    readJsonArray<WaterLog>(WATER_LOGS_STORAGE_KEY),
    readJsonArray<WaterGoal>(LEGACY_WATER_GOALS_STORAGE_KEY)
  ]);
  const legacyGoal = legacyGoals.find((goal) => goal.date === dateKey);
  const legacyLog =
    legacyGoal && legacyGoal.currentMl > 0
      ? [
          {
            amountMl: legacyGoal.currentMl,
            createdAt: `${dateKey}T12:00:00.000Z`,
            id: `legacy-water-${dateKey}`,
            loggedAt: `${dateKey}T12:00:00.000Z`,
            profileId: LOCAL_PROFILE_ID,
            userId: LOCAL_USER_ID
          }
        ]
      : [];

  return [...logs, ...legacyLog].filter((log) => toNutritionDateKey(new Date(log.loggedAt)) === dateKey);
}

export async function saveNutritionDailyNote(note: string, entryDate = getTodayDateKey()) {
  const notes = await readJsonArray<NutritionDailyNote>(DAILY_NOTES_STORAGE_KEY);
  const now = new Date().toISOString();
  const currentNote = notes.find((item) => item.entryDate === entryDate);
  const nextNote: NutritionDailyNote = {
    createdAt: currentNote?.createdAt ?? now,
    entryDate,
    id: currentNote?.id ?? createId("nutrition-note"),
    note: note.trim(),
    profileId: currentNote?.profileId ?? LOCAL_PROFILE_ID,
    updatedAt: now,
    userId: currentNote?.userId ?? LOCAL_USER_ID
  };

  await writeJsonArray(DAILY_NOTES_STORAGE_KEY, [
    nextNote,
    ...notes.filter((item) => item.entryDate !== entryDate)
  ]);

  return nextNote;
}

export async function getNutritionDailyNote(entryDate = getTodayDateKey()) {
  const notes = await readJsonArray<NutritionDailyNote>(DAILY_NOTES_STORAGE_KEY);

  return notes.find((item) => item.entryDate === entryDate) ?? null;
}

async function getWaterTargets() {
  return readJsonRecord<number>(WATER_TARGETS_STORAGE_KEY);
}

export async function getWaterGoal(date: Date) {
  const dateKey = toNutritionDateKey(date);
  const [targets, waterLogs, legacyGoals, activeNutritionTarget] = await Promise.all([
    getWaterTargets(),
    getWaterLogsByDate(dateKey),
    readJsonArray<WaterGoal>(LEGACY_WATER_GOALS_STORAGE_KEY),
    getActiveNutritionTarget()
  ]);
  const legacyGoal = legacyGoals.find((item) => item.date === dateKey);

  return {
    currentMl: waterLogs.reduce((total, log) => total + numberOrZero(log.amountMl), 0),
    date: dateKey,
    targetMl: targets[dateKey] ?? legacyGoal?.targetMl ?? activeNutritionTarget?.waterTargetMl ?? DEFAULT_WATER_TARGET_ML
  };
}

export async function setWaterGoal(targetMl: number) {
  const dateKey = getTodayDateKey();
  const targets = await getWaterTargets();

  await writeJsonRecord(WATER_TARGETS_STORAGE_KEY, {
    ...targets,
    [dateKey]: Math.max(0, Math.round(targetMl))
  });

  return getWaterGoal(new Date());
}

export async function addWaterFromNutrition(amountMl: number) {
  await addWaterLog(amountMl);

  return getWaterGoal(new Date());
}

export async function getDailyNutritionSummary(date: Date): Promise<DailyNutritionSummary> {
  const [entries, waterGoal] = await Promise.all([
    getNutritionEntriesByDate(date),
    getWaterGoal(date)
  ]);

  return {
    calories: entries.reduce((total, entry) => total + numberOrZero(entry.calories), 0),
    carbsGrams: entries.reduce((total, entry) => total + numberOrZero(entry.carbsG), 0),
    date: toNutritionDateKey(date),
    estimateOnly: false,
    fatGrams: entries.reduce((total, entry) => total + numberOrZero(entry.fatG), 0),
    foodLogCount: entries.length,
    proteinGrams: entries.reduce((total, entry) => total + numberOrZero(entry.proteinG), 0),
    waterMl: waterGoal.currentMl
  };
}

export async function getTodayNutritionSummary() {
  return getDailyNutritionSummary(new Date());
}

export function calculateTargetProgressPercent(consumed?: number, target?: number) {
  if (!target || target <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round((numberOrZero(consumed) / target) * 100)));
}

export function formatMacroProgress(consumed: number, target: number, unit: string) {
  return `${Math.round(numberOrZero(consumed)).toLocaleString()} / ${Math.round(numberOrZero(target)).toLocaleString()} ${unit}`;
}

export function suggestGoalMessage(goalType?: NutritionGoalType) {
  switch (goalType) {
    case "gain_muscle":
      return "Your targets are set to support muscle gain and workout recovery.";
    case "lose_weight":
      return "Your targets are set for steady progress. Avoid extreme restriction and keep your plan sustainable.";
    case "improve_running":
      return "Your targets support energy and recovery for running.";
    case "workout_recovery":
      return "Your targets focus on recovery, protein, hydration, and steady energy.";
    case "maintain_weight":
      return "Your targets focus on balanced nutrition and hydration.";
    case "general_health":
      return "Your targets focus on balanced nutrition, fiber, and hydration.";
    case "custom":
      return "Your custom targets personalize your food dashboard.";
    default:
      return "Choose a nutrition goal to personalize your food dashboard.";
  }
}

export function getNutritionGoalMessage(target: NutritionTarget | null, progress?: DailyNutritionProgress | null) {
  if (!target) {
    return "Choose a nutrition goal to personalize your food dashboard.";
  }

  if (target.goalType === "gain_muscle" && progress && progress.proteinConsumedG < progress.proteinTargetG) {
    return "Protein is still below your target today. You can log another meal or adjust your target if needed.";
  }

  if (target.goalType === "lose_weight" && progress && progress.caloriesConsumed < progress.caloriesTarget * 0.45) {
    return "Your logged intake looks low today. Make sure your plan is sustainable and speak to a healthcare professional if you have concerns.";
  }

  if (progress && progress.waterConsumedMl < progress.waterTargetMl * 0.5) {
    return "Hydration is below your target today.";
  }

  return suggestGoalMessage(target.goalType);
}

export function suggestNutritionTargetsFromGoal(input: {
  activityLevel?: ActivityLevel;
  currentWeightKg?: number;
  goalType: NutritionGoalType;
  trainingDaysPerWeek?: number;
}) {
  const weightKg = Math.max(45, numberOrZero(input.currentWeightKg) || 75);
  const activityMultiplier = getActivityMultiplier(input.activityLevel);
  const trainingBoost = Math.min(250, Math.max(0, numberOrZero(input.trainingDaysPerWeek)) * 25);
  const maintenanceCalories = Math.round(weightKg * 28 * activityMultiplier + trainingBoost);

  switch (input.goalType) {
    case "lose_weight":
      return {
        caloriesTarget: Math.max(1400, maintenanceCalories - 300),
        carbsTargetG: Math.round(weightKg * 2.4),
        fatTargetG: Math.round(weightKg * 0.8),
        fiberTargetG: 30,
        proteinTargetG: Math.round(weightKg * 1.8),
        waterTargetMl: Math.round(Math.max(2000, weightKg * 35))
      };
    case "gain_muscle":
      return {
        caloriesTarget: maintenanceCalories + 250,
        carbsTargetG: Math.round(weightKg * 3.4),
        fatTargetG: Math.round(weightKg * 0.9),
        fiberTargetG: 30,
        proteinTargetG: Math.round(weightKg * 2),
        waterTargetMl: Math.round(Math.max(2400, weightKg * 38))
      };
    case "improve_running":
      return {
        caloriesTarget: maintenanceCalories + 100,
        carbsTargetG: Math.round(weightKg * 4),
        fatTargetG: Math.round(weightKg * 0.8),
        fiberTargetG: 28,
        proteinTargetG: Math.round(weightKg * 1.6),
        waterTargetMl: Math.round(Math.max(2400, weightKg * 40))
      };
    case "workout_recovery":
      return {
        caloriesTarget: maintenanceCalories,
        carbsTargetG: Math.round(weightKg * 3),
        fatTargetG: Math.round(weightKg * 0.85),
        fiberTargetG: 30,
        proteinTargetG: Math.round(weightKg * 1.9),
        waterTargetMl: Math.round(Math.max(2300, weightKg * 38))
      };
    case "maintain_weight":
      return {
        caloriesTarget: maintenanceCalories,
        carbsTargetG: Math.round(weightKg * 3),
        fatTargetG: Math.round(weightKg * 0.85),
        fiberTargetG: 30,
        proteinTargetG: Math.round(weightKg * 1.5),
        waterTargetMl: Math.round(Math.max(2000, weightKg * 35))
      };
    case "general_health":
    case "custom":
    default:
      return {
        caloriesTarget: maintenanceCalories,
        carbsTargetG: Math.round(weightKg * 2.8),
        fatTargetG: Math.round(weightKg * 0.8),
        fiberTargetG: 30,
        proteinTargetG: Math.round(weightKg * 1.4),
        waterTargetMl: Math.round(Math.max(2000, weightKg * 35))
      };
  }
}

export function suggestNutritionTargets(input: {
  activityLevel?: ActivityLevel;
  currentWeightKg?: number;
  goalType: NutritionGoalType;
  trainingDaysPerWeek?: number;
}) {
  return suggestNutritionTargetsFromGoal(input);
}

function getActivityMultiplier(activityLevel?: ActivityLevel) {
  switch (activityLevel) {
    case "athlete":
      return 1.45;
    case "high":
      return 1.3;
    case "moderate":
      return 1.15;
    case "light":
      return 1.05;
    case "low":
    default:
      return 1;
  }
}

export function applyWorkoutDayAdjustment(target: NutritionTarget) {
  return applyDayAdjustment(target, target.workoutDayAdjustment);
}

export function applyRestDayAdjustment(target: NutritionTarget) {
  return applyDayAdjustment(target, target.restDayAdjustment);
}

function applyDayAdjustment(target: NutritionTarget, adjustment?: NutritionDayAdjustment) {
  if (!adjustment || adjustment.mode === "same") {
    return target;
  }

  return {
    ...target,
    caloriesTarget: applyPercent(target.caloriesTarget, adjustment.caloriesAdjustmentPercent),
    carbsTargetG: applyPercent(target.carbsTargetG, adjustment.carbsAdjustmentPercent),
    fatTargetG: applyPercent(target.fatTargetG, adjustment.fatAdjustmentPercent),
    proteinTargetG: applyPercent(target.proteinTargetG, adjustment.proteinAdjustmentPercent)
  };
}

function applyPercent(value: number, adjustmentPercent?: number) {
  return Math.round(value * (1 + numberOrZero(adjustmentPercent) / 100));
}

export async function getDailyTargetForDate(_date: Date | string) {
  return getActiveNutritionTarget();
}

export async function createNutritionTarget(
  input: Omit<NutritionTarget, "id" | "userId" | "profileId" | "createdAt" | "updatedAt" | "isActive"> & {
    isActive?: boolean;
    profileId?: string;
    userId?: string;
  }
) {
  const now = new Date().toISOString();
  const targets = await readJsonArray<NutritionTarget>(NUTRITION_TARGETS_STORAGE_KEY);
  const shouldActivate = input.isActive ?? true;
  const target: NutritionTarget = {
    ...input,
    caloriesTarget: Math.max(0, Math.round(input.caloriesTarget)),
    carbsTargetG: Math.max(0, Math.round(input.carbsTargetG)),
    createdAt: now,
    fatTargetG: Math.max(0, Math.round(input.fatTargetG)),
    fiberTargetG: input.fiberTargetG === undefined ? undefined : Math.max(0, Math.round(input.fiberTargetG)),
    id: createId("nutrition-target"),
    isActive: shouldActivate,
    preferredUnits: input.preferredUnits ?? "metric",
    profileId: input.profileId ?? LOCAL_PROFILE_ID,
    proteinTargetG: Math.max(0, Math.round(input.proteinTargetG)),
    updatedAt: now,
    userId: input.userId ?? LOCAL_USER_ID,
    waterTargetMl: Math.max(0, Math.round(input.waterTargetMl))
  };
  const nextTargets = shouldActivate
    ? targets.map((item) => ({ ...item, isActive: false }))
    : targets;

  await writeJsonArray(NUTRITION_TARGETS_STORAGE_KEY, [target, ...nextTargets]);

  return target;
}

export async function getActiveNutritionTarget() {
  const targets = await readJsonArray<NutritionTarget>(NUTRITION_TARGETS_STORAGE_KEY);

  return targets.find((target) => target.isActive) ?? null;
}

export async function updateNutritionTarget(
  id: string,
  partial: Partial<Omit<NutritionTarget, "id" | "userId" | "profileId" | "createdAt">>
) {
  const targets = await readJsonArray<NutritionTarget>(NUTRITION_TARGETS_STORAGE_KEY);
  const updatedTargets = targets.map((target) =>
    target.id === id
      ? {
          ...target,
          ...partial,
          updatedAt: new Date().toISOString()
        }
      : target
  );

  await writeJsonArray(NUTRITION_TARGETS_STORAGE_KEY, updatedTargets);

  return updatedTargets.find((target) => target.id === id) ?? null;
}

export async function deleteNutritionTarget(id: string) {
  const targets = await readJsonArray<NutritionTarget>(NUTRITION_TARGETS_STORAGE_KEY);
  const target = targets.find((item) => item.id === id) ?? null;

  await writeJsonArray(
    NUTRITION_TARGETS_STORAGE_KEY,
    targets.filter((item) => item.id !== id)
  );

  return target;
}

export async function setActiveNutritionTarget(id: string) {
  const targets = await readJsonArray<NutritionTarget>(NUTRITION_TARGETS_STORAGE_KEY);
  const updatedTargets = targets.map((target) => ({
    ...target,
    isActive: target.id === id,
    updatedAt: target.id === id ? new Date().toISOString() : target.updatedAt
  }));

  await writeJsonArray(NUTRITION_TARGETS_STORAGE_KEY, updatedTargets);

  return updatedTargets.find((target) => target.id === id) ?? null;
}

export async function calculateDailyNutritionProgress(date: Date | string): Promise<DailyNutritionProgress | null> {
  const dateValue = typeof date === "string" ? new Date(`${date}T12:00:00.000Z`) : date;
  const [target, entries, waterGoal] = await Promise.all([
    getDailyTargetForDate(date),
    getNutritionEntriesByDate(date),
    getWaterGoal(dateValue)
  ]);

  if (!target) {
    return null;
  }

  return {
    caloriesConsumed: entries.reduce((total, entry) => total + numberOrZero(entry.calories), 0),
    caloriesTarget: target.caloriesTarget,
    carbsConsumedG: entries.reduce((total, entry) => total + numberOrZero(entry.carbsG), 0),
    carbsTargetG: target.carbsTargetG,
    date: typeof date === "string" ? date : toNutritionDateKey(date),
    fatConsumedG: entries.reduce((total, entry) => total + numberOrZero(entry.fatG), 0),
    fatTargetG: target.fatTargetG,
    fiberConsumedG: entries.reduce((total, entry) => total + numberOrZero(entry.fiberG), 0),
    fiberTargetG: target.fiberTargetG,
    proteinConsumedG: entries.reduce((total, entry) => total + numberOrZero(entry.proteinG), 0),
    proteinTargetG: target.proteinTargetG,
    waterConsumedMl: waterGoal.currentMl,
    waterTargetMl: target.waterTargetMl
  };
}

export async function searchLocalFoods(query: string) {
  const customFoods = await getStoredCustomFoodDetails();
  const customResults = customFoods
    .filter((food) => {
      const normalizedQuery = query.trim().toLowerCase();

      return (
        !normalizedQuery ||
        food.name.toLowerCase().includes(normalizedQuery) ||
        (food.brand?.toLowerCase() ?? "").includes(normalizedQuery)
      );
    })
    .map(toSearchResult);
  const seedResults = await searchSeedFoods(query);

  return [...customResults, ...seedResults];
}

export async function getStoredFoodDetails(source: FoodSource, sourceFoodId: string) {
  if (source === "custom") {
    const customFoods = await getStoredCustomFoodDetails();

    return customFoods.find((food) => food.sourceFoodId === sourceFoodId) ?? null;
  }

  return null;
}

export async function createCustomFood(
  input: Omit<CustomFood, "id" | "userId" | "profileId" | "createdAt" | "updatedAt">
) {
  const now = new Date().toISOString();
  const customFood: CustomFood = {
    ...input,
    calories: Math.max(0, input.calories),
    carbsG: Math.max(0, input.carbsG),
    createdAt: now,
    fatG: Math.max(0, input.fatG),
    id: createId("custom-food"),
    name: input.name.trim(),
    profileId: LOCAL_PROFILE_ID,
    proteinG: Math.max(0, input.proteinG),
    servingSize: Math.max(0, input.servingSize),
    servingUnit: input.servingUnit.trim(),
    updatedAt: now,
    userId: LOCAL_USER_ID
  };
  const customFoods = await getCustomFoods();

  await writeJsonArray(CUSTOM_FOODS_STORAGE_KEY, [customFood, ...customFoods]);

  return customFood;
}

export async function getCustomFoods() {
  const storedItems = await readJsonArray<CustomFood | FoodDetails>(CUSTOM_FOODS_STORAGE_KEY);
  const customFoods = storedItems.filter(isCustomFood);

  return customFoods.sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );
}

export async function getCustomFoodById(id: string) {
  const customFoods = await getCustomFoods();

  return customFoods.find((food) => food.id === id) ?? null;
}

export async function updateCustomFood(
  id: string,
  partial: Partial<Omit<CustomFood, "id" | "userId" | "profileId" | "createdAt">>
) {
  const customFoods = await getCustomFoods();
  const updatedFoods = customFoods.map((food) =>
    food.id === id
      ? {
          ...food,
          ...partial,
          updatedAt: new Date().toISOString()
        }
      : food
  );

  await writeJsonArray(CUSTOM_FOODS_STORAGE_KEY, updatedFoods);

  return updatedFoods.find((food) => food.id === id) ?? null;
}

export async function deleteCustomFood(id: string) {
  const customFoods = await getCustomFoods();
  const customFood = customFoods.find((food) => food.id === id) ?? null;

  await writeJsonArray(
    CUSTOM_FOODS_STORAGE_KEY,
    customFoods.filter((food) => food.id !== id)
  );

  return customFood;
}

export async function addCustomFoodToDiary({
  customFood,
  mealGroup,
  quantity
}: {
  customFood: CustomFood;
  mealGroup: NutritionMealGroup;
  quantity: number;
}) {
  const details = customFoodToFoodDetails(customFood);
  const totals = calculateFoodNutritionByQuantity({
    food: details,
    quantity,
    serving: { quantity: customFood.servingSize, unit: customFood.servingUnit }
  });

  return createNutritionEntry({
    calories: totals.calories,
    carbsG: totals.carbsG,
    entrySource: "custom_food",
    fatG: totals.fatG,
    fiberG: numberOrZero(customFood.fiberG) * Math.max(0, quantity / Math.max(1, customFood.servingSize)),
    foodName: customFood.name,
    mealGroup,
    notes: customFood.notes,
    proteinG: totals.proteinG,
    quantity,
    sourceRefId: customFood.id,
    unit: customFood.servingUnit
  });
}

export async function createSavedMeal(
  input: Omit<SavedMeal, "id" | "userId" | "profileId" | "createdAt" | "updatedAt">
) {
  const now = new Date().toISOString();
  const savedMeal: SavedMeal = {
    ...input,
    createdAt: now,
    id: createId("saved-meal"),
    name: input.name.trim(),
    profileId: LOCAL_PROFILE_ID,
    updatedAt: now,
    userId: LOCAL_USER_ID
  };
  const savedMeals = await getSavedMeals();

  await writeJsonArray(SAVED_MEALS_STORAGE_KEY, [savedMeal, ...savedMeals]);

  return savedMeal;
}

export async function getSavedMeals() {
  const savedMeals = await readJsonArray<SavedMeal>(SAVED_MEALS_STORAGE_KEY);

  return savedMeals.sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );
}

export async function getSavedMealById(id: string) {
  const [savedMeals, items] = await Promise.all([getSavedMeals(), getSavedMealItems(id)]);
  const savedMeal = savedMeals.find((meal) => meal.id === id) ?? null;

  return savedMeal ? { savedMeal, items } : null;
}

export async function updateSavedMeal(
  id: string,
  partial: Partial<Omit<SavedMeal, "id" | "userId" | "profileId" | "createdAt">>
) {
  const savedMeals = await getSavedMeals();
  const updatedMeals = savedMeals.map((meal) =>
    meal.id === id
      ? {
          ...meal,
          ...partial,
          updatedAt: new Date().toISOString()
        }
      : meal
  );

  await writeJsonArray(SAVED_MEALS_STORAGE_KEY, updatedMeals);

  return updatedMeals.find((meal) => meal.id === id) ?? null;
}

export async function deleteSavedMeal(id: string) {
  const [savedMeals, items] = await Promise.all([
    getSavedMeals(),
    readJsonArray<SavedMealItem>(SAVED_MEAL_ITEMS_STORAGE_KEY)
  ]);
  const savedMeal = savedMeals.find((meal) => meal.id === id) ?? null;

  await Promise.all([
    writeJsonArray(
      SAVED_MEALS_STORAGE_KEY,
      savedMeals.filter((meal) => meal.id !== id)
    ),
    writeJsonArray(
      SAVED_MEAL_ITEMS_STORAGE_KEY,
      items.filter((item) => item.savedMealId !== id)
    )
  ]);

  return savedMeal;
}

export async function getSavedMealItems(savedMealId: string) {
  const items = await readJsonArray<SavedMealItem>(SAVED_MEAL_ITEMS_STORAGE_KEY);

  return items
    .filter((item) => item.savedMealId === savedMealId)
    .sort((left, right) => left.orderIndex - right.orderIndex);
}

export async function addItemToSavedMeal(input: Omit<SavedMealItem, "id" | "orderIndex">) {
  const items = await readJsonArray<SavedMealItem>(SAVED_MEAL_ITEMS_STORAGE_KEY);
  const mealItems = items.filter((item) => item.savedMealId === input.savedMealId);
  const item: SavedMealItem = {
    ...input,
    id: createId("saved-meal-item"),
    orderIndex: mealItems.length
  };

  await writeJsonArray(SAVED_MEAL_ITEMS_STORAGE_KEY, [...items, item]);
  await updateSavedMeal(input.savedMealId, {});

  return item;
}

export async function removeItemFromSavedMeal(itemId: string) {
  const items = await readJsonArray<SavedMealItem>(SAVED_MEAL_ITEMS_STORAGE_KEY);
  const item = items.find((mealItem) => mealItem.id === itemId) ?? null;

  await writeJsonArray(
    SAVED_MEAL_ITEMS_STORAGE_KEY,
    items.filter((mealItem) => mealItem.id !== itemId)
  );

  if (item) {
    await updateSavedMeal(item.savedMealId, {});
  }

  return item;
}

export async function updateSavedMealItem(
  itemId: string,
  partial: Partial<Omit<SavedMealItem, "id" | "savedMealId">>
) {
  const items = await readJsonArray<SavedMealItem>(SAVED_MEAL_ITEMS_STORAGE_KEY);
  const updatedItems = items.map((item) =>
    item.id === itemId ? { ...item, ...partial } : item
  );
  const updatedItem = updatedItems.find((item) => item.id === itemId) ?? null;

  await writeJsonArray(SAVED_MEAL_ITEMS_STORAGE_KEY, updatedItems);

  if (updatedItem) {
    await updateSavedMeal(updatedItem.savedMealId, {});
  }

  return updatedItem;
}

export async function addSavedMealToDiary(savedMealId: string, mealGroup?: NutritionMealGroup) {
  const savedMealWithItems = await getSavedMealById(savedMealId);

  if (!savedMealWithItems) {
    return [];
  }

  const sourceGroupId = createId("saved-meal-group");
  const targetMealGroup = mealGroup ?? savedMealWithItems.savedMeal.defaultMealGroup;
  const entries = [];

  for (const item of savedMealWithItems.items) {
    entries.push(
      await createNutritionEntry({
        calories: item.calories,
        carbsG: item.carbsG,
        entrySource: "saved_meal",
        fatG: item.fatG,
        foodName: item.foodName,
        mealGroup: targetMealGroup,
        proteinG: item.proteinG,
        quantity: item.quantity,
        sourceGroupId,
        sourceItemId: item.id,
        sourceRefId: savedMealWithItems.savedMeal.id,
        unit: item.unit
      })
    );
  }

  return entries;
}

export async function createRecipe(
  input: Omit<Recipe, "id" | "userId" | "profileId" | "createdAt" | "updatedAt">
) {
  const now = new Date().toISOString();
  const recipe: Recipe = {
    ...input,
    createdAt: now,
    id: createId("recipe"),
    name: input.name.trim(),
    profileId: LOCAL_PROFILE_ID,
    servings: Math.max(1, input.servings || 1),
    updatedAt: now,
    userId: LOCAL_USER_ID
  };
  const recipes = await getRecipes();

  await writeJsonArray(RECIPES_STORAGE_KEY, [recipe, ...recipes]);

  return recipe;
}

export async function getRecipes() {
  const recipes = await readJsonArray<Recipe>(RECIPES_STORAGE_KEY);

  return recipes.sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );
}

export async function getRecipeById(id: string) {
  const [recipes, ingredients] = await Promise.all([getRecipes(), getRecipeIngredients(id)]);
  const recipe = recipes.find((item) => item.id === id) ?? null;

  return recipe ? { recipe, ingredients } : null;
}

export async function updateRecipe(
  id: string,
  partial: Partial<Omit<Recipe, "id" | "userId" | "profileId" | "createdAt">>
) {
  const recipes = await getRecipes();
  const updatedRecipes = recipes.map((recipe) =>
    recipe.id === id
      ? {
          ...recipe,
          ...partial,
          servings: partial.servings ? Math.max(1, partial.servings) : recipe.servings,
          updatedAt: new Date().toISOString()
        }
      : recipe
  );

  await writeJsonArray(RECIPES_STORAGE_KEY, updatedRecipes);

  return updatedRecipes.find((recipe) => recipe.id === id) ?? null;
}

export async function deleteRecipe(id: string) {
  const [recipes, ingredients] = await Promise.all([
    getRecipes(),
    readJsonArray<RecipeIngredient>(RECIPE_INGREDIENTS_STORAGE_KEY)
  ]);
  const recipe = recipes.find((item) => item.id === id) ?? null;

  await Promise.all([
    writeJsonArray(
      RECIPES_STORAGE_KEY,
      recipes.filter((item) => item.id !== id)
    ),
    writeJsonArray(
      RECIPE_INGREDIENTS_STORAGE_KEY,
      ingredients.filter((ingredient) => ingredient.recipeId !== id)
    )
  ]);

  return recipe;
}

export async function getRecipeIngredients(recipeId: string) {
  const ingredients = await readJsonArray<RecipeIngredient>(RECIPE_INGREDIENTS_STORAGE_KEY);

  return ingredients
    .filter((ingredient) => ingredient.recipeId === recipeId)
    .sort((left, right) => left.orderIndex - right.orderIndex);
}

export async function addIngredientToRecipe(input: Omit<RecipeIngredient, "id" | "orderIndex">) {
  const ingredients = await readJsonArray<RecipeIngredient>(RECIPE_INGREDIENTS_STORAGE_KEY);
  const recipeIngredients = ingredients.filter((ingredient) => ingredient.recipeId === input.recipeId);
  const ingredient: RecipeIngredient = {
    ...input,
    id: createId("recipe-ingredient"),
    orderIndex: recipeIngredients.length
  };

  await writeJsonArray(RECIPE_INGREDIENTS_STORAGE_KEY, [...ingredients, ingredient]);
  await updateRecipe(input.recipeId, {});

  return ingredient;
}

export async function removeIngredientFromRecipe(ingredientId: string) {
  const ingredients = await readJsonArray<RecipeIngredient>(RECIPE_INGREDIENTS_STORAGE_KEY);
  const ingredient = ingredients.find((item) => item.id === ingredientId) ?? null;

  await writeJsonArray(
    RECIPE_INGREDIENTS_STORAGE_KEY,
    ingredients.filter((item) => item.id !== ingredientId)
  );

  if (ingredient) {
    await updateRecipe(ingredient.recipeId, {});
  }

  return ingredient;
}

export async function updateRecipeIngredient(
  ingredientId: string,
  partial: Partial<Omit<RecipeIngredient, "id" | "recipeId">>
) {
  const ingredients = await readJsonArray<RecipeIngredient>(RECIPE_INGREDIENTS_STORAGE_KEY);
  const updatedIngredients = ingredients.map((ingredient) =>
    ingredient.id === ingredientId ? { ...ingredient, ...partial } : ingredient
  );
  const updatedIngredient =
    updatedIngredients.find((ingredient) => ingredient.id === ingredientId) ?? null;

  await writeJsonArray(RECIPE_INGREDIENTS_STORAGE_KEY, updatedIngredients);

  if (updatedIngredient) {
    await updateRecipe(updatedIngredient.recipeId, {});
  }

  return updatedIngredient;
}

export async function calculateRecipeNutrition(recipeId: string) {
  const recipeWithIngredients = await getRecipeById(recipeId);

  if (!recipeWithIngredients) {
    return { perServing: { calories: 0, carbsG: 0, fatG: 0, proteinG: 0 }, totals: { calories: 0, carbsG: 0, fatG: 0, proteinG: 0 } };
  }

  return {
    perServing: calculateRecipePerServing(recipeWithIngredients.recipe, recipeWithIngredients.ingredients),
    totals: calculateRecipeTotals(recipeWithIngredients.ingredients)
  };
}

export async function addRecipeServingToDiary({
  mealGroup,
  recipeId,
  servings
}: {
  mealGroup: NutritionMealGroup;
  recipeId: string;
  servings: number;
}) {
  const recipeWithIngredients = await getRecipeById(recipeId);

  if (!recipeWithIngredients) {
    return null;
  }

  const perServing = calculateRecipePerServing(
    recipeWithIngredients.recipe,
    recipeWithIngredients.ingredients
  );
  const totals = multiplyTotals(perServing, Math.max(0, servings));

  return createNutritionEntry({
    calories: totals.calories,
    carbsG: totals.carbsG,
    entrySource: "recipe",
    fatG: totals.fatG,
    foodName: recipeWithIngredients.recipe.name,
    mealGroup,
    notes: "Recipe serving",
    proteinG: totals.proteinG,
    quantity: servings,
    sourceRefId: recipeId,
    unit: servings === 1 ? "serving" : "servings"
  });
}

function customFoodToFoodDetails(customFood: CustomFood): FoodDetails {
  return {
    barcode: customFood.barcode,
    brand: customFood.brand,
    calciumMg: customFood.calciumMg,
    calories: customFood.calories,
    carbsG: customFood.carbsG,
    dataQuality: "estimated",
    defaultServingSize: customFood.servingSize,
    defaultServingUnit: customFood.servingUnit,
    description: customFood.notes,
    fatG: customFood.fatG,
    fiberG: customFood.fiberG,
    id: customFood.id,
    imageUrl: customFood.imageUrl,
    ingredients: customFood.notes,
    ironMg: customFood.ironMg,
    name: customFood.name,
    potassiumMg: customFood.potassiumMg,
    proteinG: customFood.proteinG,
    servingOptions: [
      {
        label: `${customFood.servingSize} ${customFood.servingUnit}`,
        quantity: customFood.servingSize,
        unit: customFood.servingUnit
      }
    ],
    sodiumMg: customFood.sodiumMg,
    source: "custom",
    sourceFoodId: getCustomFoodSourceFoodId(customFood),
    sugarG: customFood.sugarG,
    vitaminAMcg: customFood.vitaminAMcg,
    vitaminCMg: customFood.vitaminCMg,
    vitaminDMcg: customFood.vitaminDMcg
  };
}

async function getStoredCustomFoodDetails() {
  const storedItems = await readJsonArray<CustomFood | FoodDetails>(CUSTOM_FOODS_STORAGE_KEY);

  return storedItems.map((item) =>
    isCustomFood(item) ? customFoodToFoodDetails(item) : item
  );
}

function isCustomFood(value: CustomFood | FoodDetails): value is CustomFood {
  return "servingSize" in value && "servingUnit" in value;
}

function getCustomFoodSourceFoodId(customFood: CustomFood) {
  return `custom-food-${customFood.id}`;
}

export async function getRecentFoods() {
  const recentFoods = await readJsonArray<RecentFood>(RECENT_FOODS_STORAGE_KEY);

  return recentFoods.sort(
    (left, right) =>
      new Date(right.lastUsedAt).getTime() - new Date(left.lastUsedAt).getTime()
  );
}

export async function saveRecentFood({
  defaultMealGroup,
  defaultQuantity,
  defaultUnit,
  details
}: {
  defaultMealGroup: NutritionMealGroup;
  defaultQuantity: number;
  defaultUnit: string;
  details: FoodDetails;
}) {
  const recentFoods = await getRecentFoods();
  const now = new Date().toISOString();
  const currentFood = recentFoods.find(
    (food) => food.source === details.source && food.sourceFoodId === details.sourceFoodId
  );
  const nextFood: RecentFood = {
    brand: details.brand,
    defaultMealGroup,
    defaultQuantity,
    defaultUnit,
    foodName: details.name,
    id: currentFood?.id ?? createId("recent-food"),
    lastUsedAt: now,
    profileId: currentFood?.profileId ?? LOCAL_PROFILE_ID,
    source: details.source,
    sourceFoodId: details.sourceFoodId,
    timesUsed: (currentFood?.timesUsed ?? 0) + 1,
    userId: currentFood?.userId ?? LOCAL_USER_ID
  };

  await writeJsonArray(RECENT_FOODS_STORAGE_KEY, [
    nextFood,
    ...recentFoods.filter((food) => food.id !== nextFood.id)
  ]);

  return nextFood;
}

export async function getFavouriteFoods() {
  const favouriteFoods = await readJsonArray<FavouriteFood>(FAVOURITE_FOODS_STORAGE_KEY);

  return favouriteFoods.sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

export async function saveFavouriteFood({
  defaultQuantity,
  defaultUnit,
  details
}: {
  defaultQuantity: number;
  defaultUnit: string;
  details: FoodDetails;
}) {
  const favouriteFoods = await getFavouriteFoods();
  const currentFood = favouriteFoods.find(
    (food) => food.source === details.source && food.sourceFoodId === details.sourceFoodId
  );

  if (currentFood) {
    return currentFood;
  }

  const favouriteFood: FavouriteFood = {
    brand: details.brand,
    createdAt: new Date().toISOString(),
    defaultQuantity,
    defaultUnit,
    foodName: details.name,
    id: createId("favourite-food"),
    profileId: LOCAL_PROFILE_ID,
    source: details.source,
    sourceFoodId: details.sourceFoodId,
    userId: LOCAL_USER_ID
  };

  await writeJsonArray(FAVOURITE_FOODS_STORAGE_KEY, [favouriteFood, ...favouriteFoods]);

  return favouriteFood;
}

export async function removeFavouriteFood(source: FoodSource, sourceFoodId: string) {
  const favouriteFoods = await getFavouriteFoods();
  const removedFood =
    favouriteFoods.find((food) => food.source === source && food.sourceFoodId === sourceFoodId) ?? null;

  await writeJsonArray(
    FAVOURITE_FOODS_STORAGE_KEY,
    favouriteFoods.filter((food) => food.source !== source || food.sourceFoodId !== sourceFoodId)
  );

  return removedFood;
}

export async function createCustomFoodFromNoResult({
  calories,
  carbsG,
  fatG,
  foodName,
  mealGroup,
  proteinG,
  quantity,
  unit
}: {
  calories?: number;
  carbsG?: number;
  fatG?: number;
  foodName: string;
  mealGroup?: NutritionMealGroup;
  proteinG?: number;
  quantity?: number;
  unit?: string;
}) {
  const customFood = createCustomDetails({
    calories,
    carbsG,
    fatG,
    foodName,
    mealGroup,
    proteinG,
    quantity,
    unit
  });
  const customFoods = await readJsonArray<FoodDetails>(CUSTOM_FOODS_STORAGE_KEY);

  await writeJsonArray(CUSTOM_FOODS_STORAGE_KEY, [
    customFood,
    ...customFoods.filter((food) => food.sourceFoodId !== customFood.sourceFoodId)
  ]);

  return customFood;
}

export async function addFoodDetailsToDiary({
  details,
  mealGroup,
  quantity,
  serving
}: {
  details: FoodDetails;
  mealGroup: NutritionMealGroup;
  quantity: number;
  serving: { quantity: number; unit: string };
}) {
  const multiplier = getServingMultiplier(details, quantity, serving);
  const entry = await createNutritionEntry({
    calories: details.calories * multiplier,
    carbsG: details.carbsG * multiplier,
    fatG: details.fatG * multiplier,
    fiberG: numberOrZero(details.fiberG) * multiplier,
    foodName: details.name,
    allergens: details.allergens,
    barcode: details.barcode,
    brand: details.brand,
    imageUrl: details.imageUrl,
    ingredients: details.ingredients,
    mealGroup,
    notes: `${getSourceLabel(details.source)} - ${details.dataQuality ?? "unknown"} data`,
    proteinG: details.proteinG * multiplier,
    quantity,
    source: details.source,
    sourceFoodId: details.sourceFoodId,
    sourceRefId: details.id,
    unit: serving.unit
  });

  await saveRecentFood({
    defaultMealGroup: mealGroup,
    defaultQuantity: quantity,
    defaultUnit: serving.unit,
    details
  });

  return entry;
}

export function getCommonFoodResults(): FoodSearchResult[] {
  return getCommonFoods();
}

function getServingMultiplier(
  details: FoodDetails,
  quantity: number,
  serving: { quantity: number; unit: string }
) {
  if (details.defaultServingSize <= 0) {
    return Math.max(0, quantity);
  }

  if (serving.unit === details.defaultServingUnit) {
    return Math.max(0, quantity / details.defaultServingSize);
  }

  const selectedServing = details.servingOptions.find(
    (option) => option.quantity === serving.quantity && option.unit === serving.unit
  );
  const defaultServing = details.servingOptions.find(
    (option) =>
      option.quantity === details.defaultServingSize &&
      option.unit === details.defaultServingUnit
  );

  if (selectedServing?.gramsEquivalent && defaultServing?.gramsEquivalent) {
    return Math.max(
      0,
      (quantity * selectedServing.gramsEquivalent) /
        (serving.quantity * defaultServing.gramsEquivalent)
    );
  }

  return Math.max(0, quantity / details.defaultServingSize);
}

function getSourceLabel(source: FoodSource) {
  switch (source) {
    case "open_food_facts":
      return "Open Food Facts";
    case "usda":
      return "USDA";
    case "custom":
      return "Custom";
    default:
      return "Local";
  }
}

export async function getFoodLogs() {
  const entries = await getNutritionEntries();

  return entries.map(nutritionEntryToFoodLog);
}

export async function getFoodLogsByDate(date: Date) {
  const entries = await getNutritionEntriesByDate(date);

  return entries.map(nutritionEntryToFoodLog);
}

export async function getTodayFoodLogs() {
  return getFoodLogsByDate(new Date());
}

export async function addFoodLog(input: AddFoodLogInput) {
  const entryDate = input.loggedAt ? toNutritionDateKey(new Date(input.loggedAt)) : getTodayDateKey();
  const entry = await createNutritionEntry({
    calories: input.nutrition?.calories,
    carbsG: input.nutrition?.carbsGrams,
    entryDate,
    fatG: input.nutrition?.fatGrams,
    foodName: input.name,
    mealGroup: toMealGroup(input.mealType),
    notes: input.notes,
    proteinG: input.nutrition?.proteinGrams,
    quantity: 1,
    unit: input.portionDescription ?? "serving"
  });

  return nutritionEntryToFoodLog(entry);
}

export async function updateFoodLog(id: string, partial: Partial<Omit<FoodLog, "id" | "createdAt">>) {
  const updatedEntry = await updateNutritionEntry(id, {
    calories: partial.nutrition?.calories,
    carbsG: partial.nutrition?.carbsGrams,
    fatG: partial.nutrition?.fatGrams,
    foodName: partial.name,
    mealGroup: partial.mealType ? toMealGroup(partial.mealType) : undefined,
    notes: partial.notes,
    proteinG: partial.nutrition?.proteinGrams,
    unit: partial.portionDescription
  });

  return updatedEntry ? nutritionEntryToFoodLog(updatedEntry) : null;
}

export async function deleteFoodLog(id: string) {
  const deletedEntry = await deleteNutritionEntry(id);

  return deletedEntry ? nutritionEntryToFoodLog(deletedEntry) : null;
}
