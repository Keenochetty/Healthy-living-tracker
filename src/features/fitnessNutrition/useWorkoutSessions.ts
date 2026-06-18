import { createWorkoutSession, getWorkoutSessions } from "./fitnessNutritionService";
import type { WorkoutSession } from "./fitnessNutritionTypes";
import { useFitnessNutritionResource } from "./useFitnessNutritionResource";

export function useWorkoutSessions() {
  return useFitnessNutritionResource<WorkoutSession, Partial<WorkoutSession>>(getWorkoutSessions, createWorkoutSession);
}
