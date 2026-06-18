import { createWorkoutPlanDraft, getWorkoutPlans } from "./fitnessNutritionService";
import type { WorkoutPlan } from "./fitnessNutritionTypes";
import { useFitnessNutritionResource } from "./useFitnessNutritionResource";

export function useWorkoutPlans() {
  return useFitnessNutritionResource<WorkoutPlan, Partial<WorkoutPlan>>(getWorkoutPlans, createWorkoutPlanDraft);
}
