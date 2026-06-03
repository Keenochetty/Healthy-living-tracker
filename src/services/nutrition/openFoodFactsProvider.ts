import type { FoodDetails, FoodSearchResult } from "@/types/nutrition";

export async function searchOpenFoodFactsFoods(_query: string): Promise<FoodSearchResult[]> {
  return [];
}

export async function getOpenFoodFactsFoodDetails(_sourceFoodId: string): Promise<FoodDetails | null> {
  return null;
}
