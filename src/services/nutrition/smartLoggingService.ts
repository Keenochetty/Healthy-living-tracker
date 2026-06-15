import AsyncStorage from "@react-native-async-storage/async-storage";

import { getWorkoutSessions } from "@/lib/fitnessStorage";
import {
  createNutritionEntry,
  getActiveNutritionTarget,
  getCustomFoods,
  getFavouriteFoods,
  getNutritionEntriesByDate,
  getNutritionGoalMessage,
  getNutritionEntries,
  getRecentFoods,
  getRecipeById,
  getRecipes,
  getSavedMealById,
  getSavedMeals,
  getTodayNutritionSummary,
  getWaterGoal,
  saveRecentFood,
  toNutritionDateKey,
} from "@/lib/nutritionStorage";
import {
  calculateRecipePerServing,
  calculateSavedMealTotals,
} from "@/services/nutrition/nutritionCalculations";
import type {
  FoodDetails,
  FoodSource,
  NutritionDiaryEntry,
  NutritionMealGroup,
} from "@/types/nutrition";
import type {
  SmartFoodSuggestion,
  SmartLogMethod,
  SmartLogSession,
  SmartLogSuggestedEntry,
} from "@/types/smartLogging";

const SMART_LOG_SESSIONS_STORAGE_KEY = "family_health_smart_log_sessions";
const SMART_LOG_SUGGESTED_ENTRIES_STORAGE_KEY =
  "family_health_smart_log_suggested_entries";
const SMART_FOOD_SUGGESTIONS_STORAGE_KEY =
  "family_health_smart_food_suggestions";
const LOCAL_USER_ID = "local-user";
const LOCAL_PROFILE_ID = "local-profile";

type DraftInput = {
  entryDate?: string;
  imageUri?: string;
  inputText?: string;
  mealGroup?: NutritionMealGroup;
  recipeUrl?: string;
};

type QuickBuilderItem = {
  calories: number;
  carbsG?: number;
  fatG?: number;
  foodName: string;
  proteinG?: number;
  quantity?: number;
  source?: FoodSource;
  sourceFoodId?: string;
  sourceRefId?: string;
  unit?: string;
};

export async function createSmartLogSession({
  entryDate,
  imageUri,
  inputText,
  mealGroup = "breakfast",
  method,
  message,
  recipeUrl,
  sourceMetadata,
}: DraftInput & {
  method: SmartLogMethod;
  message?: string;
  sourceMetadata?: Record<string, unknown>;
}) {
  const now = new Date().toISOString();
  const session: SmartLogSession = {
    createdAt: now,
    entryDate: entryDate ?? toNutritionDateKey(new Date()),
    id: createId("smart-log"),
    imageUri,
    inputText,
    mealGroup,
    method,
    message,
    profileId: LOCAL_PROFILE_ID,
    recipeUrl,
    sourceMetadata,
    status: "review",
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
  const sessions = await readJsonArray<SmartLogSession>(
    SMART_LOG_SESSIONS_STORAGE_KEY,
  );

  await writeJsonArray(SMART_LOG_SESSIONS_STORAGE_KEY, [session, ...sessions]);

  return session;
}

export async function createMealPhotoDraft(input: DraftInput = {}) {
  const analysis = await analyzeMealPhoto(input.imageUri);
  const session = await createSmartLogSession({
    ...input,
    method: "meal_photo",
    message: analysis.message,
    sourceMetadata: { placeholder: true },
  });
  const suggestedEntries = await saveSessionSuggestions(
    session,
    analysis.entries.map((entry) => ({
      ...entry,
      mealGroup: session.mealGroup,
    })),
  );

  return { session, suggestedEntries };
}

export async function createNutritionLabelDraft(input: DraftInput = {}) {
  const analysis = await analyzeNutritionLabel(input.imageUri);
  const session = await createSmartLogSession({
    ...input,
    method: "nutrition_label",
    message: analysis.message,
    sourceMetadata: { placeholder: true },
  });
  const suggestedEntries = await saveSessionSuggestions(
    session,
    analysis.entries.map((entry) => ({
      ...entry,
      mealGroup: session.mealGroup,
    })),
  );

  return { session, suggestedEntries };
}

export async function createVoiceLogDraft(input: DraftInput = {}) {
  const text = input.inputText?.trim();
  const parsed = text
    ? await parseVoiceMealText(text, input.mealGroup)
    : await transcribeVoiceMeal();
  const session = await createSmartLogSession({
    ...input,
    inputText: text,
    method: "voice_log",
    message: parsed.message,
  });
  const suggestedEntries = await saveSessionSuggestions(
    session,
    parsed.entries,
  );

  return { session, suggestedEntries };
}

export async function createRecipeUrlDraft(input: DraftInput = {}) {
  const importedRecipe = await importRecipeFromUrl(input.recipeUrl);
  const session = await createSmartLogSession({
    ...input,
    method: "recipe_url",
    message: importedRecipe.message,
    sourceMetadata: { placeholder: true },
  });
  const suggestedEntries = await saveSessionSuggestions(
    session,
    importedRecipe.entries,
  );

  return { session, suggestedEntries };
}

export async function createRepeatMealDraft(input: DraftInput = {}) {
  const entryDate = input.entryDate ?? toNutritionDateKey(new Date());
  const latestMealEntries = await getLatestRepeatableMeal(entryDate);
  const session = await createSmartLogSession({
    ...input,
    entryDate,
    mealGroup:
      input.mealGroup ?? latestMealEntries[0]?.mealGroup ?? "breakfast",
    method: "repeat_meal",
    message: latestMealEntries.length
      ? "Review this previous meal before adding it again."
      : "No previous meal was found. Add items manually or use Quick Meal Builder.",
  });
  const suggestedEntries = await saveSessionSuggestions(
    session,
    latestMealEntries.map((entry) =>
      diaryEntryToSuggestion(entry, session.mealGroup),
    ),
  );

  return { session, suggestedEntries };
}

export async function createQuickMealBuilderDraft(
  input: DraftInput & { items?: QuickBuilderItem[] } = {},
) {
  const session = await createSmartLogSession({
    ...input,
    method: "quick_meal_builder",
    message:
      "Build a meal from foods you already use, then confirm before saving.",
  });
  const suggestedEntries = await saveSessionSuggestions(
    session,
    (input.items ?? []).map((item) => ({
      calories: item.calories,
      carbsG: item.carbsG ?? 0,
      confidence: 1,
      fatG: item.fatG ?? 0,
      foodName: item.foodName,
      mealGroup: session.mealGroup,
      notes: "Quick meal builder",
      proteinG: item.proteinG ?? 0,
      quantity: item.quantity ?? 1,
      source: item.source,
      sourceFoodId: item.sourceFoodId,
      sourceRefId: item.sourceRefId,
      unit: item.unit ?? "serving",
    })),
  );

  return { session, suggestedEntries };
}

export async function updateSmartLogSuggestedEntry(
  id: string,
  partial: Partial<
    Omit<SmartLogSuggestedEntry, "id" | "createdAt" | "sessionId">
  >,
) {
  const entries = await getAllSmartLogSuggestedEntries();
  const updatedEntries = entries.map((entry) =>
    entry.id === id
      ? {
          ...entry,
          ...partial,
          calories: numberOrZero(partial.calories ?? entry.calories),
          carbsG: numberOrZero(partial.carbsG ?? entry.carbsG),
          fatG: numberOrZero(partial.fatG ?? entry.fatG),
          proteinG: numberOrZero(partial.proteinG ?? entry.proteinG),
          quantity: numberOrZero(partial.quantity ?? entry.quantity),
          updatedAt: new Date().toISOString(),
        }
      : entry,
  );

  await writeJsonArray(SMART_LOG_SUGGESTED_ENTRIES_STORAGE_KEY, updatedEntries);

  return updatedEntries.find((entry) => entry.id === id) ?? null;
}

export async function addSmartLogSuggestedEntry(
  sessionId: string,
  input: Omit<
    SmartLogSuggestedEntry,
    | "createdAt"
    | "id"
    | "profileId"
    | "sessionId"
    | "status"
    | "updatedAt"
    | "userId"
  >,
) {
  const session = await getSmartLogSessionById(sessionId);

  if (!session) {
    return null;
  }

  const [entry] = await saveSessionSuggestions(session, [input]);

  return entry ?? null;
}

export async function removeSmartLogSuggestedEntry(id: string) {
  const entries = await getAllSmartLogSuggestedEntries();
  const updatedEntries = entries.map((entry) =>
    entry.id === id
      ? {
          ...entry,
          status: "removed" as const,
          updatedAt: new Date().toISOString(),
        }
      : entry,
  );

  await writeJsonArray(SMART_LOG_SUGGESTED_ENTRIES_STORAGE_KEY, updatedEntries);

  return updatedEntries.find((entry) => entry.id === id) ?? null;
}

export async function confirmSmartLogSession(sessionId: string) {
  const savedEntries = await saveSmartLogEntriesToDiary(sessionId);
  const sessions = await getSmartLogSessions();
  const now = new Date().toISOString();

  await writeJsonArray(
    SMART_LOG_SESSIONS_STORAGE_KEY,
    sessions.map((session) =>
      session.id === sessionId
        ? { ...session, status: "confirmed" as const, updatedAt: now }
        : session,
    ),
  );

  return savedEntries;
}

export async function cancelSmartLogSession(sessionId: string) {
  const sessions = await getSmartLogSessions();
  const now = new Date().toISOString();

  await writeJsonArray(
    SMART_LOG_SESSIONS_STORAGE_KEY,
    sessions.map((session) =>
      session.id === sessionId
        ? { ...session, status: "cancelled" as const, updatedAt: now }
        : session,
    ),
  );
}

export async function saveSmartLogEntriesToDiary(sessionId: string) {
  const [session, suggestedEntries] = await Promise.all([
    getSmartLogSessionById(sessionId),
    getSmartLogSuggestedEntries(sessionId),
  ]);

  if (!session) {
    return [] as NutritionDiaryEntry[];
  }

  const activeSuggestions = suggestedEntries.filter(
    (entry) => entry.status === "active" && entry.foodName.trim(),
  );
  const savedEntries: NutritionDiaryEntry[] = [];

  for (const suggestion of activeSuggestions) {
    const savedEntry = await createNutritionEntry({
      calories: suggestion.calories,
      carbsG: suggestion.carbsG,
      confirmationSource:
        suggestion.confidence >= 0.95
          ? "accepted_suggestion"
          : "edited_suggestion",
      entryDate: session.entryDate,
      entrySource: "smart_log",
      fatG: suggestion.fatG,
      fiberG: suggestion.fiberG,
      foodName: suggestion.foodName,
      mealGroup: suggestion.mealGroup,
      notes: suggestion.notes,
      proteinG: suggestion.proteinG,
      quantity: suggestion.quantity,
      source: suggestion.source,
      sourceFoodId: suggestion.sourceFoodId,
      sourceRefId: suggestion.sourceRefId,
      smartLogSessionId: session.id,
      unit: suggestion.unit,
    });

    savedEntries.push(savedEntry);
    await saveRecentFood({
      defaultMealGroup: suggestion.mealGroup,
      defaultQuantity: suggestion.quantity,
      defaultUnit: suggestion.unit,
      details: suggestionToFoodDetails(suggestion),
    });
  }

  return savedEntries;
}

export async function generateSmartFoodSuggestions() {
  const suggestions = await buildSmartFoodSuggestions();

  await writeJsonArray(SMART_FOOD_SUGGESTIONS_STORAGE_KEY, suggestions);

  return suggestions;
}

export async function getSmartFoodSuggestionsForToday() {
  const storedSuggestions = await readJsonArray<SmartFoodSuggestion>(
    SMART_FOOD_SUGGESTIONS_STORAGE_KEY,
  );
  const todayKey = toNutritionDateKey(new Date());
  const todaysStoredSuggestions = storedSuggestions.filter((suggestion) =>
    suggestion.createdAt.startsWith(todayKey),
  );

  return todaysStoredSuggestions.length
    ? todaysStoredSuggestions.sort(
        (left, right) => left.priority - right.priority,
      )
    : generateSmartFoodSuggestions();
}

export async function getSmartLogSessionById(id: string) {
  const sessions = await getSmartLogSessions();

  return sessions.find((session) => session.id === id) ?? null;
}

export async function getSmartLogSuggestedEntries(sessionId: string) {
  const entries = await getAllSmartLogSuggestedEntries();

  return entries
    .filter((entry) => entry.sessionId === sessionId)
    .sort(
      (left, right) =>
        new Date(left.createdAt).getTime() -
        new Date(right.createdAt).getTime(),
    );
}

export async function getQuickMealBuilderFoods() {
  const [recentFoods, favouriteFoods, customFoods, savedMeals, recipes] =
    await Promise.all([
      getRecentFoods(),
      getFavouriteFoods(),
      getCustomFoods(),
      getSavedMeals(),
      getRecipes(),
    ]);
  const savedMealFoods = await Promise.all(
    savedMeals.slice(0, 8).map(async (meal) => {
      const mealWithItems = await getSavedMealById(meal.id);
      const totals = mealWithItems
        ? calculateSavedMealTotals(mealWithItems.items)
        : { calories: 0, carbsG: 0, fatG: 0, proteinG: 0 };

      return {
        calories: totals.calories,
        carbsG: totals.carbsG,
        fatG: totals.fatG,
        foodName: meal.name,
        id: `saved-meal-${meal.id}`,
        proteinG: totals.proteinG,
        quantity: 1,
        source: "custom" as const,
        sourceFoodId: `saved-meal-${meal.id}`,
        sourceRefId: meal.id,
        unit: "meal",
      };
    }),
  );
  const recipeFoods = await Promise.all(
    recipes.slice(0, 8).map(async (recipe) => {
      const recipeWithIngredients = await getRecipeById(recipe.id);
      const totals = recipeWithIngredients
        ? calculateRecipePerServing(
            recipeWithIngredients.recipe,
            recipeWithIngredients.ingredients,
          )
        : { calories: 0, carbsG: 0, fatG: 0, proteinG: 0 };

      return {
        calories: totals.calories,
        carbsG: totals.carbsG,
        fatG: totals.fatG,
        foodName: recipe.name,
        id: `recipe-${recipe.id}`,
        proteinG: totals.proteinG,
        quantity: 1,
        source: "custom" as const,
        sourceFoodId: `recipe-${recipe.id}`,
        sourceRefId: recipe.id,
        unit: "serving",
      };
    }),
  );

  return [
    ...recentFoods.slice(0, 8).map((food) => ({
      calories: 0,
      carbsG: 0,
      fatG: 0,
      foodName: food.foodName,
      id: `recent-${food.id}`,
      proteinG: 0,
      quantity: food.defaultQuantity,
      source: food.source,
      sourceFoodId: food.sourceFoodId,
      unit: food.defaultUnit,
    })),
    ...favouriteFoods.slice(0, 8).map((food) => ({
      calories: 0,
      carbsG: 0,
      fatG: 0,
      foodName: food.foodName,
      id: `favourite-${food.id}`,
      proteinG: 0,
      quantity: food.defaultQuantity,
      source: food.source,
      sourceFoodId: food.sourceFoodId,
      unit: food.defaultUnit,
    })),
    ...customFoods.slice(0, 8).map((food) => ({
      calories: food.calories,
      carbsG: food.carbsG,
      fatG: food.fatG,
      foodName: food.name,
      id: `custom-${food.id}`,
      proteinG: food.proteinG,
      quantity: food.servingSize,
      source: "custom" as const,
      sourceFoodId: `custom-food-${food.id}`,
      unit: food.servingUnit,
    })),
    ...savedMealFoods,
    ...recipeFoods,
  ];
}

export async function analyzeMealPhoto(_imageUri?: string) {
  return {
    entries: [placeholderSuggestion("Suggested from photo")],
    message:
      "Photo analysis is prepared but not connected yet. You can still add food manually from this photo.",
  };
}

export async function analyzeNutritionLabel(_imageUri?: string) {
  return {
    entries: [
      placeholderSuggestion(
        "Nutrition label item",
        "Enter the label values manually.",
      ),
    ],
    message:
      "Label scanning is prepared but not connected yet. Enter the label values manually.",
  };
}

export async function transcribeVoiceMeal() {
  return {
    entries: [placeholderSuggestion("Typed meal", "Type what you ate.")],
    message:
      "Voice logging is prepared but not connected yet. Type what you ate.",
  };
}

export async function parseVoiceMealText(
  text: string,
  mealGroup: NutritionMealGroup = "breakfast",
) {
  const chunks = text
    .split(/\band\b|,|\+/i)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  const entries = (chunks.length ? chunks : [text]).map((chunk) => ({
    calories: 0,
    carbsG: 0,
    confidence: 0.45,
    fatG: 0,
    foodName: cleanupVoiceFoodName(chunk),
    mealGroup,
    notes:
      "Parsed from typed voice fallback. Please confirm all values before saving.",
    proteinG: 0,
    quantity: parseQuantity(chunk),
    unit: "serving",
  }));

  return {
    entries,
    message: "Review the typed meal draft before saving.",
  };
}

export async function importRecipeFromUrl(_recipeUrl?: string) {
  return {
    entries: [] as Array<
      Omit<
        SmartLogSuggestedEntry,
        | "createdAt"
        | "id"
        | "profileId"
        | "sessionId"
        | "status"
        | "updatedAt"
        | "userId"
      >
    >,
    message:
      "Recipe link import is prepared for a backend connection later. You can still create the recipe manually.",
  };
}

async function buildSmartFoodSuggestions() {
  const now = new Date();
  const todayKey = toNutritionDateKey(now);
  const [summary, waterGoal, target, todayEntries, workouts] =
    await Promise.all([
      getTodayNutritionSummary(),
      getWaterGoal(now),
      getActiveNutritionTarget(),
      getNutritionEntriesByDate(todayKey),
      getWorkoutSessions(),
    ]);
  const suggestions: SmartFoodSuggestion[] = [];
  const progressMessage = getNutritionGoalMessage(target, null);

  if (target && summary.proteinGrams < target.proteinTargetG * 0.65) {
    suggestions.push(
      createSuggestion(
        "protein",
        "Protein check-in",
        "Based on your logs, a protein-focused food could help you move toward today's target.",
        "Open Smart Log",
        "/food/smart-log?method=quick_meal_builder",
        1,
      ),
    );
  }

  if (waterGoal.currentMl < waterGoal.targetMl * 0.55) {
    suggestions.push(
      createSuggestion(
        "water",
        "Hydration check-in",
        "Your water log is still below today's target. A quick water log may help keep the day complete.",
        "Log Water",
        "/food?tab=water",
        2,
      ),
    );
  }

  if (todayEntries.length === 0) {
    suggestions.push(
      createSuggestion(
        "diary_reminder",
        "Start today's diary",
        "Add a meal when you are ready so your reports have more complete context.",
        "Add Food",
        "/food?tab=add",
        3,
      ),
    );
  }

  if (
    workouts.some(
      (workout) => workout.completed && workout.startedAt.startsWith(todayKey),
    )
  ) {
    suggestions.push(
      createSuggestion(
        "workout_support",
        "Workout support",
        "Based on your workout log, reviewing food and water today may help your recovery notes later.",
        "Build Meal",
        "/food/smart-log?method=quick_meal_builder",
        4,
      ),
    );
  }

  suggestions.push(
    createSuggestion(
      "repeat_meal",
      "Repeat a previous meal",
      "If you ate something familiar, repeat a recent meal and edit it before saving.",
      "Repeat Meal",
      "/food/smart-log?method=repeat_meal",
      5,
    ),
  );

  if (target) {
    suggestions.push(
      createSuggestion(
        "general",
        "Goal context",
        progressMessage,
        "View Targets",
        "/food?tab=targets",
        6,
      ),
    );
  }

  return suggestions.slice(0, 5);
}

async function saveSessionSuggestions(
  session: SmartLogSession,
  suggestions: Array<
    Omit<
      SmartLogSuggestedEntry,
      | "createdAt"
      | "id"
      | "profileId"
      | "sessionId"
      | "status"
      | "updatedAt"
      | "userId"
    >
  >,
) {
  const storedEntries = await getAllSmartLogSuggestedEntries();
  const now = new Date().toISOString();
  const entries: SmartLogSuggestedEntry[] = suggestions.map((suggestion) => ({
    ...suggestion,
    calories: numberOrZero(suggestion.calories),
    carbsG: numberOrZero(suggestion.carbsG),
    confidence: Math.max(0, Math.min(1, suggestion.confidence)),
    createdAt: now,
    fatG: numberOrZero(suggestion.fatG),
    foodName: suggestion.foodName.trim(),
    id: createId("smart-entry"),
    mealGroup: suggestion.mealGroup,
    profileId: LOCAL_PROFILE_ID,
    proteinG: numberOrZero(suggestion.proteinG),
    quantity: numberOrZero(suggestion.quantity || 1),
    sessionId: session.id,
    status: "active",
    unit: suggestion.unit.trim() || "serving",
    updatedAt: now,
    userId: LOCAL_USER_ID,
  }));

  await writeJsonArray(SMART_LOG_SUGGESTED_ENTRIES_STORAGE_KEY, [
    ...entries,
    ...storedEntries,
  ]);

  return entries;
}

async function getSmartLogSessions() {
  return readJsonArray<SmartLogSession>(SMART_LOG_SESSIONS_STORAGE_KEY);
}

async function getAllSmartLogSuggestedEntries() {
  return readJsonArray<SmartLogSuggestedEntry>(
    SMART_LOG_SUGGESTED_ENTRIES_STORAGE_KEY,
  );
}

async function getLatestRepeatableMeal(todayKey: string) {
  const entries = await getNutritionEntries();
  const groupedEntries = new Map<string, NutritionDiaryEntry[]>();

  entries
    .filter(
      (entry) => entry.entryDate <= todayKey && entry.mealGroup !== "notes",
    )
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    )
    .forEach((entry) => {
      const key = `${entry.entryDate}-${entry.mealGroup}`;
      groupedEntries.set(key, [...(groupedEntries.get(key) ?? []), entry]);
    });

  return Array.from(groupedEntries.values())[0] ?? [];
}

function diaryEntryToSuggestion(
  entry: NutritionDiaryEntry,
  mealGroup: NutritionMealGroup,
) {
  return {
    calories: entry.calories,
    carbsG: entry.carbsG,
    confidence: 1,
    fatG: entry.fatG,
    fiberG: entry.fiberG,
    foodName: entry.foodName,
    mealGroup,
    notes: "Repeated from a previous meal. Please confirm before saving.",
    proteinG: entry.proteinG,
    quantity: entry.quantity,
    source: entry.source,
    sourceFoodId: entry.sourceFoodId,
    sourceRefId: entry.sourceRefId,
    unit: entry.unit,
  };
}

function placeholderSuggestion(
  foodName: string,
  notes = "Please confirm the food, quantity, and nutrition before saving.",
) {
  return {
    calories: 0,
    carbsG: 0,
    confidence: 0.2,
    fatG: 0,
    foodName,
    mealGroup: "breakfast" as const,
    notes,
    proteinG: 0,
    quantity: 1,
    source: "custom" as const,
    sourceFoodId: createId("smart-placeholder-food"),
    unit: "serving",
  };
}

function suggestionToFoodDetails(
  suggestion: SmartLogSuggestedEntry,
): FoodDetails {
  return {
    calories: suggestion.calories,
    carbsG: suggestion.carbsG,
    dataQuality: "estimated",
    defaultServingSize: suggestion.quantity,
    defaultServingUnit: suggestion.unit,
    fatG: suggestion.fatG,
    fiberG: suggestion.fiberG,
    id: suggestion.sourceFoodId ?? suggestion.id,
    name: suggestion.foodName,
    proteinG: suggestion.proteinG,
    servingOptions: [
      {
        label: suggestion.unit,
        quantity: suggestion.quantity || 1,
        unit: suggestion.unit,
      },
    ],
    source: suggestion.source ?? "custom",
    sourceFoodId: suggestion.sourceFoodId ?? `smart-log-${suggestion.id}`,
  };
}

function createSuggestion(
  type: SmartFoodSuggestion["type"],
  title: string,
  message: string,
  actionLabel: string,
  route: string,
  priority: number,
) {
  return {
    actionLabel,
    createdAt: new Date().toISOString(),
    id: createId(`smart-suggestion-${type}`),
    message,
    priority,
    route,
    title,
    type,
  };
}

function cleanupVoiceFoodName(value: string) {
  return (
    value
      .replace(/\b\d+(\.\d+)?\b/g, "")
      .replace(/\b(servings?|cups?|grams?|g|ml|pieces?|slices?)\b/gi, "")
      .trim() ||
    value.trim() ||
    "Typed meal item"
  );
}

function parseQuantity(value: string) {
  const match = value.match(/\b\d+(\.\d+)?\b/);

  return match ? Number(match[0]) : 1;
}

function numberOrZero(value: number | undefined) {
  return Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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

  return value;
}
