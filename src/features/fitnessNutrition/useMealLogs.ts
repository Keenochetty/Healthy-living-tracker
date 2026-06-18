import { createMealLog, getMealLogs } from "./fitnessNutritionService";
import type { MealLog } from "./fitnessNutritionTypes";
import { useFitnessNutritionResource } from "./useFitnessNutritionResource";

export function useMealLogs() {
  return useFitnessNutritionResource<MealLog, Partial<MealLog>>(getMealLogs, createMealLog);
}
