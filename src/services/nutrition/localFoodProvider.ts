import type {
  FoodDetails,
  FoodSearchResult,
  FoodSource,
  NutritionMealGroup
} from "@/types/nutrition";

type LocalFoodSeed = FoodDetails & {
  common?: boolean;
};

const serving100g = [
  { label: "100 g", quantity: 100, unit: "g", gramsEquivalent: 100 }
];

export const LOCAL_SEED_FOODS: LocalFoodSeed[] = [
  seed("egg", "Egg", 1, "large egg", 78, 6.3, 0.6, 5.3, [
    { label: "1 large egg", quantity: 1, unit: "large egg", gramsEquivalent: 50 },
    { label: "100 g", quantity: 100, unit: "g", gramsEquivalent: 100 }
  ]),
  seed("chicken-breast", "Chicken breast", 100, "g", 165, 31, 0, 3.6, serving100g),
  seed("rice", "Rice", 100, "g cooked", 130, 2.7, 28, 0.3, serving100g),
  seed("oats", "Oats", 40, "g", 150, 5, 27, 3, [
    { label: "40 g serving", quantity: 40, unit: "g", gramsEquivalent: 40 },
    { label: "100 g", quantity: 100, unit: "g", gramsEquivalent: 100 }
  ]),
  seed("banana", "Banana", 1, "medium", 105, 1.3, 27, 0.4, [
    { label: "1 medium banana", quantity: 1, unit: "medium", gramsEquivalent: 118 },
    { label: "100 g", quantity: 100, unit: "g", gramsEquivalent: 100 }
  ]),
  seed("apple", "Apple", 1, "medium", 95, 0.5, 25, 0.3, [
    { label: "1 medium apple", quantity: 1, unit: "medium", gramsEquivalent: 182 },
    { label: "100 g", quantity: 100, unit: "g", gramsEquivalent: 100 }
  ]),
  seed("bread-slice", "Bread slice", 1, "slice", 80, 3, 15, 1, [
    { label: "1 slice", quantity: 1, unit: "slice", gramsEquivalent: 32 }
  ]),
  seed("milk", "Milk", 250, "ml", 122, 8, 12, 4.8, [
    { label: "250 ml cup", quantity: 250, unit: "ml", gramsEquivalent: 258 },
    { label: "100 ml", quantity: 100, unit: "ml", gramsEquivalent: 103 }
  ]),
  seed("greek-yogurt", "Greek yogurt", 170, "g", 100, 17, 6, 0.7, [
    { label: "170 g tub", quantity: 170, unit: "g", gramsEquivalent: 170 },
    { label: "100 g", quantity: 100, unit: "g", gramsEquivalent: 100 }
  ]),
  seed("tuna", "Tuna", 100, "g", 132, 29, 0, 1, serving100g),
  seed("potato", "Potato", 1, "medium", 161, 4.3, 37, 0.2, [
    { label: "1 medium potato", quantity: 1, unit: "medium", gramsEquivalent: 173 },
    { label: "100 g", quantity: 100, unit: "g", gramsEquivalent: 100 }
  ]),
  seed("sweet-potato", "Sweet potato", 1, "medium", 112, 2, 26, 0.1, [
    { label: "1 medium sweet potato", quantity: 1, unit: "medium", gramsEquivalent: 130 },
    { label: "100 g", quantity: 100, unit: "g", gramsEquivalent: 100 }
  ]),
  seed("peanut-butter", "Peanut butter", 2, "tbsp", 190, 8, 7, 16, [
    { label: "2 tbsp", quantity: 2, unit: "tbsp", gramsEquivalent: 32 },
    { label: "1 tbsp", quantity: 1, unit: "tbsp", gramsEquivalent: 16 }
  ]),
  seed("whey-protein", "Whey protein", 1, "scoop", 120, 24, 3, 2, [
    { label: "1 scoop", quantity: 1, unit: "scoop", gramsEquivalent: 30 }
  ]),
  seed("beef-mince", "Beef mince", 100, "g", 250, 26, 0, 15, serving100g),
  seed("broccoli", "Broccoli", 100, "g", 35, 2.4, 7, 0.4, serving100g),
  seed("spinach", "Spinach", 100, "g", 23, 2.9, 3.6, 0.4, serving100g),
  seed("avocado", "Avocado", 0.5, "avocado", 120, 1.5, 6, 11, [
    { label: "1/2 avocado", quantity: 0.5, unit: "avocado", gramsEquivalent: 75 },
    { label: "100 g", quantity: 100, unit: "g", gramsEquivalent: 100 }
  ]),
  seed("water", "Water", 250, "ml", 0, 0, 0, 0, [
    { label: "250 ml glass", quantity: 250, unit: "ml", gramsEquivalent: 250 }
  ]),
  seed("coffee", "Coffee", 250, "ml", 2, 0.3, 0, 0, [
    { label: "250 ml cup", quantity: 250, unit: "ml", gramsEquivalent: 250 }
  ])
];

function seed(
  sourceFoodId: string,
  name: string,
  defaultServingSize: number,
  defaultServingUnit: string,
  calories: number,
  proteinG: number,
  carbsG: number,
  fatG: number,
  servingOptions: FoodDetails["servingOptions"]
): LocalFoodSeed {
  return {
    calories,
    carbsG,
    common: true,
    dataQuality: "estimated",
    defaultServingSize,
    defaultServingUnit,
    description: "Local seed data. Nutrition values are placeholders.",
    fatG,
    fiberG: carbsG > 0 ? Math.round(carbsG * 0.12 * 10) / 10 : 0,
    id: `local-${sourceFoodId}`,
    name,
    nutrientsJson: { note: "Estimated local seed nutrition data" },
    proteinG,
    servingOptions,
    sodiumMg: 0,
    source: "local",
    sourceFoodId,
    sugarG: carbsG > 0 ? Math.round(carbsG * 0.25 * 10) / 10 : 0
  };
}

export async function searchLocalFoods(query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return getCommonFoods();
  }

  return LOCAL_SEED_FOODS.filter((food) => {
    const brand = food.brand?.toLowerCase() ?? "";

    return food.name.toLowerCase().includes(normalizedQuery) || brand.includes(normalizedQuery);
  }).map(toSearchResult);
}

export async function getLocalFoodDetails(sourceFoodId: string) {
  return LOCAL_SEED_FOODS.find((food) => food.sourceFoodId === sourceFoodId) ?? null;
}

export function getCommonFoods() {
  return LOCAL_SEED_FOODS.map(toSearchResult);
}

export function toSearchResult(food: FoodDetails): FoodSearchResult {
  return {
    brand: food.brand,
    caloriesPerServing: food.calories,
    carbsGPerServing: food.carbsG,
    description: food.description,
    fatGPerServing: food.fatG,
    id: food.id,
    imageUrl: food.imageUrl,
    name: food.name,
    proteinGPerServing: food.proteinG,
    servingLabel: `${food.defaultServingSize} ${food.defaultServingUnit}`,
    source: food.source,
    sourceFoodId: food.sourceFoodId,
    verified: food.dataQuality === "verified"
  };
}

export function createCustomDetails({
  calories,
  carbsG,
  fatG,
  foodName,
  mealGroup,
  proteinG,
  quantity,
  unit
}: {
  calories?: number;
  carbsG?: number;
  fatG?: number;
  foodName: string;
  mealGroup?: NutritionMealGroup;
  proteinG?: number;
  quantity?: number;
  unit?: string;
}) {
  const sourceFoodId = `custom-${foodName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const servingUnit = unit?.trim() || "serving";
  const servingQuantity = quantity && Number.isFinite(quantity) ? quantity : 1;
  const details: FoodDetails = {
    calories: calories ?? 0,
    carbsG: carbsG ?? 0,
    dataQuality: "estimated",
    defaultServingSize: servingQuantity,
    defaultServingUnit: servingUnit,
    description: mealGroup ? `Custom ${mealGroup} food` : "Custom food",
    fatG: fatG ?? 0,
    id: `custom-${sourceFoodId}`,
    name: foodName.trim(),
    proteinG: proteinG ?? 0,
    servingOptions: [
      {
        label: `${servingQuantity} ${servingUnit}`,
        quantity: servingQuantity,
        unit: servingUnit
      }
    ],
    source: "custom",
    sourceFoodId
  };

  return details;
}

export function isLocalFoodSource(source: FoodSource) {
  return source === "local" || source === "custom";
}
