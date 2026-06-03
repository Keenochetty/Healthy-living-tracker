import { Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import { NUTRITION_MEAL_GROUP_OPTIONS } from "@/constants/nutritionOptions";
import {
  addIngredientToRecipe,
  addRecipeServingToDiary,
  createRecipe,
  getCommonFoodResults,
  getCustomFoods,
  getRecipeById,
  removeIngredientFromRecipe,
  updateRecipe
} from "@/lib/nutritionStorage";
import {
  calculateRecipePerServing,
  calculateRecipeTotals,
  roundNutrition
} from "@/services/nutrition/nutritionCalculations";
import type { FoodSearchResult, NutritionMealGroup, Recipe, RecipeIngredient } from "@/types/nutrition";

const INPUT_STYLE = {
  backgroundColor: "#ffffff",
  borderColor: "#fde68a",
  borderRadius: 16,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 50,
  paddingHorizontal: 14
};

export default function RecipeScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [foodChoices, setFoodChoices] = useState<FoodSearchResult[]>(() => getCommonFoodResults().slice(0, 8));
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState("4");
  const [prepTimeMinutes, setPrepTimeMinutes] = useState("");
  const [cookTimeMinutes, setCookTimeMinutes] = useState("");
  const [instructions, setInstructions] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSharedWithFamily, setIsSharedWithFamily] = useState(false);
  const [ingredientQuantity, setIngredientQuantity] = useState("1");
  const [diaryServings, setDiaryServings] = useState("1");
  const [mealGroup, setMealGroup] = useState<NutritionMealGroup>("dinner");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.resolve()
      .then(async () => {
        const customFoods = await getCustomFoods();
        setFoodChoices([
          ...customFoods.map((food) => ({
            brand: food.brand,
            caloriesPerServing: food.calories,
            carbsGPerServing: food.carbsG,
            fatGPerServing: food.fatG,
            id: food.id,
            name: food.name,
            proteinGPerServing: food.proteinG,
            servingLabel: `${food.servingSize} ${food.servingUnit}`,
            source: "custom" as const,
            sourceFoodId: `custom-food-${food.id}`,
            verified: false
          })),
          ...getCommonFoodResults().slice(0, 8)
        ]);

        if (!params.id) return;

        const result = await getRecipeById(params.id);

        if (!result) return;

        setRecipe(result.recipe);
        setIngredients(result.ingredients);
        setName(result.recipe.name);
        setDescription(result.recipe.description ?? "");
        setServings(String(result.recipe.servings));
        setPrepTimeMinutes(result.recipe.prepTimeMinutes ? String(result.recipe.prepTimeMinutes) : "");
        setCookTimeMinutes(result.recipe.cookTimeMinutes ? String(result.recipe.cookTimeMinutes) : "");
        setInstructions(result.recipe.instructions ?? "");
        setImageUrl(result.recipe.imageUrl ?? "");
        setIsSharedWithFamily(result.recipe.isSharedWithFamily);
      })
      .catch(() => undefined);
  }, [params.id]);

  const totals = useMemo(() => calculateRecipeTotals(ingredients), [ingredients]);
  const perServing = useMemo(() => {
    const recipeForTotals = recipe ?? {
      servings: Math.max(1, Number(servings) || 1)
    };

    return calculateRecipePerServing(recipeForTotals, ingredients);
  }, [ingredients, recipe, servings]);

  async function saveRecipe() {
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Recipe name is required.");
      return null;
    }

    const payload = {
      cookTimeMinutes: optionalNumber(cookTimeMinutes),
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      instructions: instructions.trim() || undefined,
      isSharedWithFamily,
      name,
      prepTimeMinutes: optionalNumber(prepTimeMinutes),
      servings: Math.max(1, Number(servings) || 1)
    };

    if (recipe) {
      const updatedRecipe = await updateRecipe(recipe.id, payload);
      setRecipe(updatedRecipe);
      return updatedRecipe;
    }

    const nextRecipe = await createRecipe(payload);
    setRecipe(nextRecipe);
    return nextRecipe;
  }

  async function addIngredient(food: FoodSearchResult) {
    const savedRecipe = recipe ?? (await saveRecipe());

    if (!savedRecipe) return;

    const multiplier = Math.max(0, Number(ingredientQuantity) || 1);
    const ingredient = await addIngredientToRecipe({
      calories: (food.caloriesPerServing ?? 0) * multiplier,
      carbsG: (food.carbsGPerServing ?? 0) * multiplier,
      customFoodId: food.source === "custom" ? food.sourceFoodId.replace("custom-food-", "") : undefined,
      fatG: (food.fatGPerServing ?? 0) * multiplier,
      foodName: food.name,
      foodSource: food.source,
      notes: food.servingLabel,
      proteinG: (food.proteinGPerServing ?? 0) * multiplier,
      quantity: multiplier,
      recipeId: savedRecipe.id,
      sourceFoodId: food.sourceFoodId,
      unit: food.servingLabel ?? "serving"
    });

    setIngredients((current) => [...current, ingredient]);
  }

  async function removeIngredient(ingredientId: string) {
    await removeIngredientFromRecipe(ingredientId);
    setIngredients((current) => current.filter((ingredient) => ingredient.id !== ingredientId));
  }

  async function addToDiary() {
    const savedRecipe = recipe ?? (await saveRecipe());

    if (!savedRecipe) return;

    await addRecipeServingToDiary({
      mealGroup,
      recipeId: savedRecipe.id,
      servings: Math.max(0, Number(diaryServings) || 1)
    });
    router.replace({ pathname: "/food", params: { tab: "diary" } } as Href);
  }

  return (
    <ScreenWrapper backgroundColor="#fffaf0">
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#b45309", fontSize: 14, fontWeight: "800" }}>Food / Nutrition</Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          {params.id ? "Edit Recipe" : "Create Recipe"}
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 20 }}>
          Nutrition values are estimates and may vary by ingredients, preparation, and serving size.
        </Text>
      </View>

      <AppCard>
        <View style={{ gap: 12 }}>
          <TextInput onChangeText={setName} placeholder="Recipe name" placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={name} />
          <TextInput multiline onChangeText={setDescription} placeholder="Description optional" placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, minHeight: 76, paddingTop: 13 }} value={description} />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TextInput keyboardType="numeric" onChangeText={setServings} placeholder="Servings" placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, flex: 1 }} value={servings} />
            <TextInput keyboardType="numeric" onChangeText={setPrepTimeMinutes} placeholder="Prep min" placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, flex: 1 }} value={prepTimeMinutes} />
            <TextInput keyboardType="numeric" onChangeText={setCookTimeMinutes} placeholder="Cook min" placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, flex: 1 }} value={cookTimeMinutes} />
          </View>
          <TextInput multiline onChangeText={setInstructions} placeholder="Instructions" placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, minHeight: 120, paddingTop: 13 }} value={instructions} />
          <TextInput onChangeText={setImageUrl} placeholder="Photo placeholder optional" placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={imageUrl} />

          <View style={{ alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 18, flexDirection: "row", justifyContent: "space-between", padding: 14 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#0f172a", fontWeight: "900" }}>Share with family</Text>
              <Text style={{ color: "#64748b", marginTop: 3 }}>Prepared for later permissions.</Text>
            </View>
            <Switch disabled onValueChange={setIsSharedWithFamily} value={isSharedWithFamily} />
          </View>

          {errorMessage ? <Text style={{ color: "#dc2626", fontWeight: "800" }}>{errorMessage}</Text> : null}
          <TouchableOpacity activeOpacity={0.85} onPress={saveRecipe} style={{ alignItems: "center", backgroundColor: "#f59e0b", borderRadius: 18, justifyContent: "center", minHeight: 52 }}>
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>Save Recipe</Text>
          </TouchableOpacity>
        </View>
      </AppCard>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <MetricCard label="Total kcal" value={`${Math.round(totals.calories)}`} />
        <MetricCard label="Per serving" value={`${Math.round(perServing.calories)}`} />
        <MetricCard label="Protein" value={`${roundNutrition(perServing.proteinG)}g`} />
        <MetricCard label="Carbs" value={`${roundNutrition(perServing.carbsG)}g`} />
        <MetricCard label="Fat" value={`${roundNutrition(perServing.fatG)}g`} />
      </View>

      <AppCard>
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>Ingredients</Text>
          {ingredients.length ? (
            ingredients.map((ingredient) => (
              <View key={ingredient.id} style={{ backgroundColor: "#f8fafc", borderRadius: 16, padding: 12 }}>
                <View style={{ flexDirection: "row", gap: 8, justifyContent: "space-between" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#0f172a", fontWeight: "900" }}>{ingredient.foodName}</Text>
                    <Text style={{ color: "#64748b", marginTop: 3 }}>{ingredient.quantity} {ingredient.unit} - {Math.round(ingredient.calories)} kcal</Text>
                  </View>
                  <TouchableOpacity activeOpacity={0.85} onPress={() => removeIngredient(ingredient.id)}>
                    <Text style={{ color: "#dc2626", fontWeight: "900" }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ color: "#64748b", lineHeight: 21 }}>No ingredients yet.</Text>
          )}
        </View>
      </AppCard>

      <AppCard>
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>Add ingredients</Text>
          <TextInput keyboardType="numeric" onChangeText={setIngredientQuantity} placeholder="Quantity multiplier" placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={ingredientQuantity} />
          {foodChoices.map((food) => (
            <TouchableOpacity key={`${food.source}-${food.sourceFoodId}`} activeOpacity={0.85} onPress={() => addIngredient(food)} style={{ backgroundColor: "#fffbeb", borderRadius: 16, padding: 12 }}>
              <Text style={{ color: "#0f172a", fontWeight: "900" }}>{food.name}</Text>
              <Text style={{ color: "#64748b", marginTop: 3 }}>{food.servingLabel ?? "serving"} - {Math.round(food.caloriesPerServing ?? 0)} kcal</Text>
            </TouchableOpacity>
          ))}
        </View>
      </AppCard>

      <AppCard>
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>Add to diary</Text>
          <TextInput keyboardType="numeric" onChangeText={setDiaryServings} placeholder="Servings to add" placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={diaryServings} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {NUTRITION_MEAL_GROUP_OPTIONS.filter((option) => option.key !== "notes").map((option) => (
              <TouchableOpacity key={option.key} activeOpacity={0.85} onPress={() => setMealGroup(option.key)} style={{ backgroundColor: mealGroup === option.key ? "#f59e0b" : "#fffbeb", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 }}>
                <Text style={{ color: mealGroup === option.key ? "#ffffff" : "#92400e", fontWeight: "900" }}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity activeOpacity={0.85} onPress={addToDiary} style={{ alignItems: "center", backgroundColor: "#f59e0b", borderRadius: 18, justifyContent: "center", minHeight: 52 }}>
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>Add Recipe Serving</Text>
          </TouchableOpacity>
        </View>
      </AppCard>
    </ScreenWrapper>
  );
}

function optionalNumber(value: string) {
  const parsedValue = Number(value);

  return value.trim() && Number.isFinite(parsedValue) && parsedValue >= 0
    ? parsedValue
    : undefined;
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ backgroundColor: "#ffffff", borderColor: "#fde68a", borderRadius: 18, borderWidth: 1, flexGrow: 1, minWidth: "30%", padding: 14 }}>
      <Text style={{ color: "#92400e", fontSize: 12, fontWeight: "900" }}>{label}</Text>
      <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900", marginTop: 4 }}>{value}</Text>
    </View>
  );
}
