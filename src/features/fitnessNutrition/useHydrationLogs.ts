import { createHydrationLog, getHydrationLogs } from "./fitnessNutritionService";
import type { HydrationLog } from "./fitnessNutritionTypes";
import { useFitnessNutritionResource } from "./useFitnessNutritionResource";

export function useHydrationLogs() {
  return useFitnessNutritionResource<HydrationLog, Partial<HydrationLog>>(getHydrationLogs, createHydrationLog);
}
