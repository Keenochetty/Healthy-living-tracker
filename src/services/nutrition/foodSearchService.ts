import {
  getCommonFoods,
  getLocalFoodDetails,
  toSearchResult,
} from "@/services/nutrition/localFoodProvider";
import { getStoredFoodDetails, searchLocalFoods } from "@/lib/nutritionStorage";
import {
  getOpenFoodFactsFoodDetails,
  searchOpenFoodFactsFoods,
} from "@/services/nutrition/openFoodFactsProvider";
import {
  getUsdaFoodDetails,
  searchUsdaFoods,
} from "@/services/nutrition/usdaFoodProvider";
import type {
  FoodDetails,
  FoodSearchResult,
  FoodSource,
} from "@/types/nutrition";

export async function searchFoods(query: string): Promise<FoodSearchResult[]> {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return getCommonFoods();
  }

  const [localResults, usdaResults, openFoodFactsResults] = await Promise.all([
    searchLocalFoods(trimmedQuery),
    searchUsdaFoods(trimmedQuery),
    searchOpenFoodFactsFoods(trimmedQuery),
  ]);

  return dedupeResults([
    ...localResults,
    ...usdaResults,
    ...openFoodFactsResults,
  ]);
}

export async function getFoodDetails(source: FoodSource, sourceFoodId: string) {
  switch (source) {
    case "local":
      return getLocalFoodDetails(sourceFoodId);
    case "custom":
      return getStoredFoodDetails(source, sourceFoodId);
    case "usda":
      return getUsdaFoodDetails(sourceFoodId);
    case "open_food_facts":
      return getOpenFoodFactsFoodDetails(sourceFoodId);
    default:
      return null;
  }
}

export function normalizeFoodResult(
  raw: unknown,
  source: FoodSource,
): FoodSearchResult {
  if (isFoodSearchResult(raw)) {
    return raw;
  }

  if (isFoodDetails(raw)) {
    return toSearchResult(raw);
  }

  return {
    id: `${source}-unknown`,
    name: "Unknown food",
    source,
    sourceFoodId: "unknown",
  };
}

export function normalizeFoodDetails(
  raw: unknown,
  source: FoodSource,
): FoodDetails {
  if (isFoodDetails(raw)) {
    return raw;
  }

  return {
    calories: 0,
    carbsG: 0,
    dataQuality: "unknown",
    defaultServingSize: 1,
    defaultServingUnit: "serving",
    fatG: 0,
    id: `${source}-unknown`,
    name: "Unknown food",
    proteinG: 0,
    servingOptions: [{ label: "1 serving", quantity: 1, unit: "serving" }],
    source,
    sourceFoodId: "unknown",
  };
}

function dedupeResults(results: FoodSearchResult[]) {
  const seen = new Set<string>();

  return results.filter((result) => {
    const key = `${result.source}:${result.sourceFoodId}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function isFoodSearchResult(value: unknown): value is FoodSearchResult {
  return Boolean(
    value &&
    typeof value === "object" &&
    "source" in value &&
    "sourceFoodId" in value &&
    "name" in value,
  );
}

function isFoodDetails(value: unknown): value is FoodDetails {
  return Boolean(
    value &&
    typeof value === "object" &&
    "servingOptions" in value &&
    "calories" in value &&
    "proteinG" in value,
  );
}
