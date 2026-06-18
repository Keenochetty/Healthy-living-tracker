import { createGroceryList, getGroceryLists } from "./fitnessNutritionService";
import type { GroceryList } from "./fitnessNutritionTypes";
import { useFitnessNutritionResource } from "./useFitnessNutritionResource";

export function useGroceryLists() {
  return useFitnessNutritionResource<GroceryList, Partial<GroceryList>>(getGroceryLists, createGroceryList);
}
