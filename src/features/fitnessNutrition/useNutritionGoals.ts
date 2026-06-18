import { createNutritionGoalDraft, getNutritionGoals } from "./fitnessNutritionService";
import type { NutritionGoal } from "./fitnessNutritionTypes";
import { useFitnessNutritionResource } from "./useFitnessNutritionResource";

export function useNutritionGoals() {
  return useFitnessNutritionResource<NutritionGoal, Partial<NutritionGoal>>(getNutritionGoals, createNutritionGoalDraft);
}
