import { createFitnessGoalDraft, getFitnessGoals } from "./fitnessNutritionService";
import type { FitnessGoal } from "./fitnessNutritionTypes";
import { useFitnessNutritionResource } from "./useFitnessNutritionResource";

export function useFitnessGoals() {
  return useFitnessNutritionResource<FitnessGoal, Partial<FitnessGoal>>(getFitnessGoals, createFitnessGoalDraft);
}
