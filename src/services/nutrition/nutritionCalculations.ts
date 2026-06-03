import type {
  FoodDetails,
  NutritionTotals,
  Recipe,
  RecipeIngredient,
  SavedMealItem,
  ServingOption
} from "@/types/nutrition";

export function convertServingMultiplier({
  baseQuantity,
  baseUnit,
  quantity,
  serving,
  servingOptions
}: {
  baseQuantity: number;
  baseUnit: string;
  quantity: number;
  serving: Pick<ServingOption, "quantity" | "unit">;
  servingOptions?: ServingOption[];
}) {
  if (baseQuantity <= 0) {
    return Math.max(0, quantity);
  }

  if (serving.unit === baseUnit) {
    return Math.max(0, quantity / baseQuantity);
  }

  const selectedServing = servingOptions?.find(
    (option) => option.quantity === serving.quantity && option.unit === serving.unit
  );
  const baseServing = servingOptions?.find(
    (option) => option.quantity === baseQuantity && option.unit === baseUnit
  );

  if (selectedServing?.gramsEquivalent && baseServing?.gramsEquivalent && serving.quantity) {
    return Math.max(
      0,
      (quantity * selectedServing.gramsEquivalent) /
        (serving.quantity * baseServing.gramsEquivalent)
    );
  }

  return Math.max(0, quantity / baseQuantity);
}

export function calculateFoodNutritionByQuantity({
  food,
  quantity,
  serving
}: {
  food: FoodDetails;
  quantity: number;
  serving: Pick<ServingOption, "quantity" | "unit">;
}): NutritionTotals {
  const multiplier = convertServingMultiplier({
    baseQuantity: food.defaultServingSize,
    baseUnit: food.defaultServingUnit,
    quantity,
    serving,
    servingOptions: food.servingOptions
  });

  return {
    calories: food.calories * multiplier,
    carbsG: food.carbsG * multiplier,
    fatG: food.fatG * multiplier,
    proteinG: food.proteinG * multiplier
  };
}

export function calculateSavedMealTotals(items: SavedMealItem[]): NutritionTotals {
  return items.reduce(
    (totals, item) => ({
      calories: totals.calories + item.calories,
      carbsG: totals.carbsG + item.carbsG,
      fatG: totals.fatG + item.fatG,
      proteinG: totals.proteinG + item.proteinG
    }),
    emptyTotals()
  );
}

export function calculateRecipeTotals(ingredients: RecipeIngredient[]): NutritionTotals {
  return ingredients.reduce(
    (totals, ingredient) => ({
      calories: totals.calories + ingredient.calories,
      carbsG: totals.carbsG + ingredient.carbsG,
      fatG: totals.fatG + ingredient.fatG,
      proteinG: totals.proteinG + ingredient.proteinG
    }),
    emptyTotals()
  );
}

export function calculateRecipePerServing(
  recipe: Pick<Recipe, "servings">,
  ingredients: RecipeIngredient[]
): NutritionTotals {
  const servings = Math.max(1, recipe.servings || 1);
  const totals = calculateRecipeTotals(ingredients);

  return {
    calories: totals.calories / servings,
    carbsG: totals.carbsG / servings,
    fatG: totals.fatG / servings,
    proteinG: totals.proteinG / servings
  };
}

export function multiplyTotals(totals: NutritionTotals, multiplier: number): NutritionTotals {
  return {
    calories: totals.calories * multiplier,
    carbsG: totals.carbsG * multiplier,
    fatG: totals.fatG * multiplier,
    proteinG: totals.proteinG * multiplier
  };
}

export function emptyTotals(): NutritionTotals {
  return {
    calories: 0,
    carbsG: 0,
    fatG: 0,
    proteinG: 0
  };
}

export function roundNutrition(value: number) {
  return Math.round(value * 10) / 10;
}
