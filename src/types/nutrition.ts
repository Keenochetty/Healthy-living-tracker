import type { WidgetKey } from "@/types/app";

export type NutritionMealGroup =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snacks"
  | "supplements"
  | "notes";

export type NutritionWidgetKey =
  | "calories_today"
  | "protein_today"
  | "water_today"
  | "calories_progress"
  | "protein_progress"
  | "water_progress"
  | "fiber_progress"
  | "goal_weight"
  | "nutrition_goal"
  | "food_diary_status";

export type NutritionGoalType =
  | "lose_weight"
  | "gain_muscle"
  | "maintain_weight"
  | "improve_running"
  | "general_health"
  | "workout_recovery"
  | "custom";

export type ActivityLevel =
  | "low"
  | "light"
  | "moderate"
  | "high"
  | "athlete";

export type NutritionDayAdjustment = {
  caloriesAdjustmentPercent?: number;
  carbsAdjustmentPercent?: number;
  fatAdjustmentPercent?: number;
  mode:
    | "same"
    | "higher_calories"
    | "higher_carbs"
    | "higher_protein"
    | "lower_calories"
    | "lower_carbs"
    | "custom";
  proteinAdjustmentPercent?: number;
};

export type NutritionTarget = {
  activityLevel?: ActivityLevel;
  caloriesTarget: number;
  carbsTargetG: number;
  createdAt: string;
  currentWeightKg?: number;
  fatTargetG: number;
  fiberTargetG?: number;
  goalDate?: string;
  goalType: NutritionGoalType;
  goalWeightKg?: number;
  id: string;
  isActive: boolean;
  mainWorkoutFocus?: string;
  preferredUnits?: "metric" | "imperial";
  profileId: string;
  proteinTargetG: number;
  restDayAdjustment?: NutritionDayAdjustment;
  trainingDaysPerWeek?: number;
  updatedAt: string;
  userId: string;
  waterTargetMl: number;
  workoutDayAdjustment?: NutritionDayAdjustment;
};

export type DailyNutritionProgress = {
  caloriesConsumed: number;
  caloriesTarget: number;
  carbsConsumedG: number;
  carbsTargetG: number;
  date: string;
  fatConsumedG: number;
  fatTargetG: number;
  fiberConsumedG?: number;
  fiberTargetG?: number;
  proteinConsumedG: number;
  proteinTargetG: number;
  waterConsumedMl: number;
  waterTargetMl: number;
};

export type NutritionDiaryEntry = {
  allergens?: string[];
  barcode?: string;
  brand?: string;
  calories: number;
  carbsG: number;
  createdAt: string;
  confirmationSource?: "manual_review" | "edited_suggestion" | "accepted_suggestion";
  entrySource?: "manual" | "food_details" | "custom_food" | "saved_meal" | "recipe" | "barcode_scan" | "smart_log";
  entryDate: string;
  fatG: number;
  fiberG?: number;
  foodName: string;
  id: string;
  imageUrl?: string;
  ingredients?: string;
  mealGroup: NutritionMealGroup;
  notes?: string;
  profileId: string;
  proteinG: number;
  quantity: number;
  source?: FoodSource;
  sourceGroupId?: string;
  sourceFoodId?: string;
  sourceItemId?: string;
  sourceRefId?: string;
  smartLogSessionId?: string;
  unit: string;
  updatedAt?: string;
  userId: string;
};

export type WaterLog = {
  amountMl: number;
  createdAt: string;
  id: string;
  loggedAt: string;
  profileId: string;
  userId: string;
};

export type NutritionDailyNote = {
  createdAt: string;
  entryDate: string;
  id: string;
  note: string;
  profileId: string;
  updatedAt: string;
  userId: string;
};

export type HealthQuickWidget = {
  category: "nutrition" | "fitness" | "medication" | "biometrics" | "device_sync" | "wellness" | "custom";
  id: string;
  isPinned: boolean;
  orderIndex: number;
  profileId: string;
  title: string;
  userId: string;
  widgetKey: WidgetKey;
};

export type FoodSource = "local" | "custom" | "usda" | "open_food_facts";

export type FoodDataQuality = "verified" | "community" | "estimated" | "unknown";

export type ServingOption = {
  gramsEquivalent?: number;
  label: string;
  quantity: number;
  unit: string;
};

export type FoodSearchResult = {
  brand?: string;
  caloriesPerServing?: number;
  carbsGPerServing?: number;
  description?: string;
  fatGPerServing?: number;
  id: string;
  imageUrl?: string;
  name: string;
  proteinGPerServing?: number;
  servingLabel?: string;
  source: FoodSource;
  sourceFoodId: string;
  verified?: boolean;
};

export type FoodDetails = {
  allergens?: string[];
  barcode?: string;
  brand?: string;
  calciumMg?: number;
  calories: number;
  carbsG: number;
  dataQuality?: FoodDataQuality;
  defaultServingSize: number;
  defaultServingUnit: string;
  description?: string;
  fatG: number;
  fiberG?: number;
  id: string;
  imageUrl?: string;
  ingredients?: string;
  ironMg?: number;
  name: string;
  nutrientsJson?: Record<string, unknown>;
  potassiumMg?: number;
  proteinG: number;
  servingOptions: ServingOption[];
  sodiumMg?: number;
  source: FoodSource;
  sourceFoodId: string;
  sugarG?: number;
  vitaminAMcg?: number;
  vitaminCMg?: number;
  vitaminDMcg?: number;
};

export type BarcodeScanResult = {
  barcode: string;
  barcodeType?: string;
  scannedAt: string;
};

export type BarcodeProductLookupResult = {
  barcode: string;
  message?: string;
  product?: FoodDetails;
  status: "found" | "not_found" | "incomplete" | "error";
};

export type BarcodeProductCache = {
  allergens?: string[];
  barcode: string;
  brand?: string;
  calories?: number;
  carbsG?: number;
  createdAt: string;
  dataQuality: FoodDataQuality;
  fatG?: number;
  fiberG?: number;
  id: string;
  imageUrl?: string;
  ingredients?: string;
  lastFetchedAt: string;
  name: string;
  nutrientsJson?: Record<string, unknown>;
  proteinG?: number;
  rawSourceJson?: Record<string, unknown>;
  servingSize?: number;
  servingUnit?: string;
  sodiumMg?: number;
  source: FoodSource;
  sourceFoodId: string;
  sugarG?: number;
  updatedAt: string;
};

export type RecentlyScannedProduct = {
  barcode: string;
  brand?: string;
  calories?: number;
  createdAt: string;
  id: string;
  imageUrl?: string;
  lastScannedAt: string;
  productName: string;
  profileId: string;
  source: FoodSource;
  sourceFoodId: string;
  timesScanned: number;
  userId: string;
};

export type RecentFood = {
  brand?: string;
  defaultMealGroup: NutritionMealGroup;
  defaultQuantity: number;
  defaultUnit: string;
  foodName: string;
  id: string;
  lastUsedAt: string;
  profileId: string;
  source: FoodSource;
  sourceFoodId: string;
  timesUsed: number;
  userId: string;
};

export type FavouriteFood = {
  brand?: string;
  createdAt: string;
  defaultQuantity: number;
  defaultUnit: string;
  foodName: string;
  id: string;
  profileId: string;
  source: FoodSource;
  sourceFoodId: string;
  userId: string;
};

export type CustomFood = {
  barcode?: string;
  brand?: string;
  calciumMg?: number;
  calories: number;
  carbsG: number;
  createdAt: string;
  fatG: number;
  fiberG?: number;
  id: string;
  imageUrl?: string;
  ironMg?: number;
  isSharedWithFamily: boolean;
  name: string;
  notes?: string;
  potassiumMg?: number;
  profileId: string;
  proteinG: number;
  servingSize: number;
  servingUnit: string;
  sodiumMg?: number;
  sugarG?: number;
  updatedAt: string;
  userId: string;
  vitaminAMcg?: number;
  vitaminCMg?: number;
  vitaminDMcg?: number;
};

export type SavedMeal = {
  createdAt: string;
  defaultMealGroup: NutritionMealGroup;
  description?: string;
  id: string;
  isSharedWithFamily: boolean;
  name: string;
  profileId: string;
  updatedAt: string;
  userId: string;
};

export type SavedMealItem = {
  calories: number;
  carbsG: number;
  customFoodId?: string;
  fatG: number;
  foodName: string;
  foodSource: FoodSource;
  id: string;
  orderIndex: number;
  proteinG: number;
  quantity: number;
  savedMealId: string;
  sourceFoodId: string;
  unit: string;
};

export type Recipe = {
  cookTimeMinutes?: number;
  createdAt: string;
  description?: string;
  id: string;
  imageUrl?: string;
  instructions?: string;
  isSharedWithFamily: boolean;
  name: string;
  prepTimeMinutes?: number;
  profileId: string;
  servings: number;
  updatedAt: string;
  userId: string;
};

export type RecipeIngredient = {
  calories: number;
  carbsG: number;
  customFoodId?: string;
  fatG: number;
  foodName: string;
  foodSource: FoodSource;
  id: string;
  notes?: string;
  orderIndex: number;
  proteinG: number;
  quantity: number;
  recipeId: string;
  sourceFoodId: string;
  unit: string;
};

export type NutritionTotals = {
  calories: number;
  carbsG: number;
  fatG: number;
  proteinG: number;
};

export type MealType =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "drink"
  | "supplement"
  | "other";

export type FoodLogSource =
  | "manual"
  | "photo_placeholder"
  | "barcode_placeholder"
  | "ai_estimate_later";

export type NutritionEstimate = {
  calciumMg?: number;
  calories?: number;
  carbsGrams?: number;
  fatGrams?: number;
  fibreGrams?: number;
  ironMg?: number;
  potassiumMg?: number;
  proteinGrams?: number;
  sodiumMg?: number;
  sugarGrams?: number;
  vitaminCMg?: number;
};

export type FoodLog = {
  createdAt: string;
  estimateOnly: boolean;
  id: string;
  imageUri?: string;
  loggedAt: string;
  mealType: MealType;
  name: string;
  notes?: string;
  nutrition: NutritionEstimate;
  portionDescription?: string;
  source: FoodLogSource;
  updatedAt: string;
};

export type DailyNutritionSummary = {
  calories: number;
  carbsGrams: number;
  date: string;
  estimateOnly: boolean;
  fatGrams: number;
  foodLogCount: number;
  proteinGrams: number;
  waterMl: number;
};

export type WaterGoal = {
  currentMl: number;
  date: string;
  targetMl: number;
};

export type ReportRange = "today" | "7_days" | "30_days";

export type NutritionReportSummary = {
  bestProteinDay?: string;
  caloriesAverage: number;
  caloriesTargetAverage?: number;
  carbsAverageG: number;
  endDate: string;
  fatAverageG: number;
  fiberAverageG: number;
  foodLoggingConsistencyPercent: number;
  lowLoggingDay?: string;
  mealsLogged: number;
  notesLogged: number;
  proteinAverageG: number;
  proteinTargetAverageG?: number;
  range: ReportRange;
  startDate: string;
  targetHitRatePercent?: number;
  totalDays: number;
  waterAverageMl: number;
  waterTargetAverageMl?: number;
  daysLogged: number;
  workoutDays: number;
  workoutDaysWithFoodLogs: number;
};

export type DailyMacroTrend = {
  calories: number;
  caloriesTarget?: number;
  carbsG: number;
  date: string;
  fatG: number;
  fiberG: number;
  proteinG: number;
  proteinTargetG?: number;
  waterMl: number;
  waterTargetMl?: number;
};

export type WaterTrendReport = {
  averageMl: number;
  bestHydrationDay?: string;
  daysUnderTarget: number;
  targetAverageMl?: number;
  trends: DailyMacroTrend[];
};

export type GoalProgressReport = {
  caloriesConsistencyPercent?: number;
  carbsConsistencyPercent?: number;
  currentWeightKg?: number;
  fiberConsistencyPercent?: number;
  goalMessage: string;
  goalType?: NutritionGoalType;
  goalWeightKg?: number;
  hasTarget: boolean;
  proteinConsistencyPercent?: number;
  waterConsistencyPercent?: number;
  workoutFoodConsistencyPercent?: number;
};

export type DiaryConsistencyReport = {
  currentLoggingStreakDays: number;
  daysLogged: number;
  missedMealGroups: NutritionMealGroup[];
  mostConsistentMealGroup?: NutritionMealGroup;
  totalDays: number;
  totalMealsLogged: number;
};

export type WorkoutFoodConnectionReport = {
  averageCaloriesOnWorkoutDays?: number;
  averageProteinGOnWorkoutDays?: number;
  averageWaterMlOnWorkoutDays?: number;
  hasWorkoutData: boolean;
  message: string;
  proteinTargetHitPercent?: number;
  waterTargetHitPercent?: number;
  workoutDays: number;
  workoutDaysWithFoodLogs: number;
};

export type NutritionInsight = {
  createdAt: string;
  dateRange: ReportRange;
  id: string;
  message: string;
  severity: "info" | "positive" | "gentle_warning";
  title: string;
  type: "protein" | "water" | "calories" | "fiber" | "logging" | "workout_food" | "goal" | "general";
};

export type MostLoggedFood = {
  averageQuantity?: number;
  averageUnit?: string;
  brand?: string;
  foodName: string;
  lastLoggedAt?: string;
  source?: FoodSource;
  timesLogged: number;
};

export type MostUsedMealItem = {
  id?: string;
  itemType: "saved_meal" | "recipe";
  name: string;
  timesUsed: number;
};
