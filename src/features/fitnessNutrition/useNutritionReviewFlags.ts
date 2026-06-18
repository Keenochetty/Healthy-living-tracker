import { createNutritionReviewFlag, getNutritionReviewFlags } from "./fitnessNutritionService";
import type { NutritionReviewFlag } from "./fitnessNutritionTypes";
import { useFitnessNutritionResource } from "./useFitnessNutritionResource";

export function useNutritionReviewFlags() {
  return useFitnessNutritionResource<NutritionReviewFlag, Partial<NutritionReviewFlag>>(getNutritionReviewFlags, createNutritionReviewFlag);
}
