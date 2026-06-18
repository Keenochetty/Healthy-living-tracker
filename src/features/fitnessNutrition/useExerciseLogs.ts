import { createExerciseLog, getExerciseLogs } from "./fitnessNutritionService";
import type { ExerciseLog } from "./fitnessNutritionTypes";
import { useFitnessNutritionResource } from "./useFitnessNutritionResource";

export function useExerciseLogs(workoutSessionId?: string) {
  return useFitnessNutritionResource<ExerciseLog, Partial<ExerciseLog>>(
    () => getExerciseLogs(workoutSessionId),
    createExerciseLog,
  );
}
