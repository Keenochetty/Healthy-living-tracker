import type { FoodDetails, FoodSearchResult } from "@/types/nutrition";

export async function searchUsdaFoods(_query: string): Promise<FoodSearchResult[]> {
  return [];
}

export async function getUsdaFoodDetails(_sourceFoodId: string): Promise<FoodDetails | null> {
  return null;
}
