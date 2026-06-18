import type {
  ExerciseLog,
  ExerciseSetLog,
  FitnessGoal,
  FoodItem,
  GroceryList,
  GroceryListItem,
  HydrationLog,
  MealItem,
  MealLog,
  MealPlan,
  NutritionGoal,
  NutritionReviewFlag,
  WorkoutPlan,
  WorkoutSession,
} from "./fitnessNutritionTypes";

export type FitnessNutritionValidation = { errors: string[]; valid: boolean };

function ok(): FitnessNutritionValidation {
  return { errors: [], valid: true };
}

function required(value: unknown, label: string): FitnessNutritionValidation {
  if (typeof value === "string" && value.trim().length > 0) return ok();
  if (typeof value === "number" && Number.isFinite(value)) return ok();
  return { errors: [`${label} is required.`], valid: false };
}

export const validateFitnessGoal = (input: Partial<FitnessGoal>) => required(input.title, "Fitness goal title");
export const validateWorkoutPlan = (input: Partial<WorkoutPlan>) => required(input.title, "Workout plan title");
export const validateWorkoutSession = (input: Partial<WorkoutSession>) => required(input.title, "Workout title");
export const validateExerciseLog = (input: Partial<ExerciseLog>) => required(input.exerciseName, "Exercise name");
export const validateExerciseSetLog = (input: Partial<ExerciseSetLog>) => required(input.exerciseLogId, "Exercise log");
export const validateNutritionGoal = (input: Partial<NutritionGoal>) => required(input.title, "Nutrition goal title");
export const validateFoodItem = (input: Partial<FoodItem>) => required(input.displayName, "Food name");
export const validateMealLog = (input: Partial<MealLog>) => required(input.mealDate, "Meal date");
export const validateMealItem = (input: Partial<MealItem>) => required(input.displayName, "Meal item name");
export const validateMealPlan = (input: Partial<MealPlan>) => required(input.title, "Meal plan title");
export const validateGroceryList = (input: Partial<GroceryList>) => required(input.title, "Grocery list title");
export const validateGroceryListItem = (input: Partial<GroceryListItem>) => required(input.displayName, "Grocery item name");
export const validateHydrationLog = (input: Partial<HydrationLog>) => required(input.amountValue, "Hydration amount");
export const validateNutritionReviewFlag = (input: Partial<NutritionReviewFlag>) => required(input.message, "Review flag message");

export function validateReviewBeforePlanActivation(input: { reviewStatus?: string; status?: string }): FitnessNutritionValidation {
  if (input.status === "active" && input.reviewStatus !== "reviewed") {
    return { errors: ["Plans require review before activation."], valid: false };
  }
  return ok();
}

export function validateReviewBeforeCalendarOrReminderLink(input: { reviewStatus?: string }): FitnessNutritionValidation {
  if (input.reviewStatus !== "reviewed") {
    return { errors: ["Calendar and reminder links require review first."], valid: false };
  }
  return ok();
}
