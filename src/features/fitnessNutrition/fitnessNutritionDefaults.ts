import type {
  FitnessGoal,
  FitnessNutritionPrivacyScope,
  FitnessNutritionSourceType,
  FoodItem,
  GroceryList,
  HydrationLog,
  MealLog,
  MealPlan,
  NutritionGoal,
  NutritionReviewFlag,
  WorkoutPlan,
  WorkoutSession,
} from "./fitnessNutritionTypes";

const today = () => new Date().toISOString().slice(0, 10);

export function defaultFitnessGoal(title = "Fitness goal", sourceType: FitnessNutritionSourceType = "manual"): FitnessGoal {
  return { goalType: "general", privacyScope: "private", reviewStatus: sourceType === "manual" ? "userEntered" : "needsReview", sourceType, status: "draft", title };
}

export function defaultWorkoutPlan(title = "Workout plan", sourceType: FitnessNutritionSourceType = "manual"): WorkoutPlan {
  return { equipment: [], planType: "general", reviewStatus: sourceType === "manual" ? "userEntered" : "needsReview", schedule: {}, sourceType, status: "draft", title };
}

export function defaultWorkoutSession(title = "Workout", sourceType: FitnessNutritionSourceType = "manual"): WorkoutSession {
  return { reviewStatus: sourceType === "manual" ? "userEntered" : "needsReview", sessionDate: today(), sourceType, status: "planned", title };
}

export function defaultNutritionGoal(title = "Nutrition goal", sourceType: FitnessNutritionSourceType = "manual"): NutritionGoal {
  return { goalType: "general", privacyScope: "private", reviewStatus: sourceType === "manual" ? "userEntered" : "needsReview", sourceType, status: "draft", title };
}

export function defaultMealLog(sourceType: FitnessNutritionSourceType = "manual"): MealLog {
  return { mealDate: today(), mealType: "meal", privacyScope: "private", reviewStatus: sourceType === "manual" ? "userEntered" : "needsReview", sourceType };
}

export function defaultFoodItem(displayName = "Food item", sourceType: FitnessNutritionSourceType = "manual"): FoodItem {
  return { displayName, nutrients: {}, reviewStatus: sourceType === "manual" ? "userEntered" : "needsReview", sourceType };
}

export function defaultMealPlan(title = "Meal plan", sourceType: FitnessNutritionSourceType = "manual"): MealPlan {
  return { grocerySummary: {}, mealDays: [], reviewStatus: sourceType === "manual" ? "userEntered" : "needsReview", sourceType, status: "draft", title };
}

export function defaultGroceryList(title = "Grocery list", privacyScope: FitnessNutritionPrivacyScope = "private"): GroceryList {
  return { privacyScope, status: "draft", title };
}

export function defaultHydrationLog(amountValue = 0, amountUnit = "ml"): HydrationLog {
  return { amountUnit, amountValue, loggedAt: new Date().toISOString(), sourceType: "manual" };
}

export function defaultNutritionReviewFlag(message: string, relatedTable: string): NutritionReviewFlag {
  return { flagType: "review_required", message, relatedTable, severity: "caution", sourceType: "system", status: "open" };
}
