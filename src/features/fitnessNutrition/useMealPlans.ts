import { createMealPlanDraft, getMealPlans } from "./fitnessNutritionService";
import type { MealPlan } from "./fitnessNutritionTypes";
import { useFitnessNutritionResource } from "./useFitnessNutritionResource";

export function useMealPlans() {
  return useFitnessNutritionResource<MealPlan, Partial<MealPlan>>(getMealPlans, createMealPlanDraft);
}
