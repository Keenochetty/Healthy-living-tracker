import { Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import { NUTRITION_MEAL_GROUP_OPTIONS } from "@/constants/nutritionOptions";
import {
  addCustomFoodToDiary,
  addRecipeServingToDiary,
  addSavedMealToDiary,
  deleteCustomFood,
  deleteRecipe,
  deleteSavedMeal,
  getCustomFoodById,
  getRecipeById,
  getSavedMealById,
} from "@/lib/nutritionStorage";
import {
  calculateRecipePerServing,
  calculateRecipeTotals,
  calculateSavedMealTotals,
  roundNutrition,
} from "@/services/nutrition/nutritionCalculations";
import type {
  CustomFood,
  NutritionMealGroup,
  Recipe,
  RecipeIngredient,
  SavedMeal,
  SavedMealItem,
} from "@/types/nutrition";

type LibraryItemType = "custom_food" | "saved_meal" | "recipe";

export default function LibraryItemScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    type?: LibraryItemType;
  }>();
  const [customFood, setCustomFood] = useState<CustomFood | null>(null);
  const [savedMeal, setSavedMeal] = useState<SavedMeal | null>(null);
  const [savedMealItems, setSavedMealItems] = useState<SavedMealItem[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [recipeIngredients, setRecipeIngredients] = useState<
    RecipeIngredient[]
  >([]);
  const [mealGroup, setMealGroup] = useState<NutritionMealGroup>("breakfast");
  const [quantity, setQuantity] = useState("1");

  useEffect(() => {
    Promise.resolve()
      .then(async () => {
        if (!params.id || !params.type) return;

        if (params.type === "custom_food") {
          setCustomFood(await getCustomFoodById(params.id));
        }

        if (params.type === "saved_meal") {
          const result = await getSavedMealById(params.id);
          setSavedMeal(result?.savedMeal ?? null);
          setSavedMealItems(result?.items ?? []);
          setMealGroup(result?.savedMeal.defaultMealGroup ?? "breakfast");
        }

        if (params.type === "recipe") {
          const result = await getRecipeById(params.id);
          setRecipe(result?.recipe ?? null);
          setRecipeIngredients(result?.ingredients ?? []);
          setMealGroup("dinner");
        }
      })
      .catch(() => undefined);
  }, [params.id, params.type]);

  const savedMealTotals = useMemo(
    () => calculateSavedMealTotals(savedMealItems),
    [savedMealItems],
  );
  const recipeTotals = useMemo(
    () => calculateRecipeTotals(recipeIngredients),
    [recipeIngredients],
  );
  const recipePerServing = useMemo(
    () =>
      recipe ? calculateRecipePerServing(recipe, recipeIngredients) : null,
    [recipe, recipeIngredients],
  );

  async function addToDiary() {
    if (customFood) {
      await addCustomFoodToDiary({
        customFood,
        mealGroup,
        quantity: Number(quantity) || customFood.servingSize,
      });
    }

    if (savedMeal) {
      await addSavedMealToDiary(savedMeal.id, mealGroup);
    }

    if (recipe) {
      await addRecipeServingToDiary({
        mealGroup,
        recipeId: recipe.id,
        servings: Number(quantity) || 1,
      });
    }

    router.replace({ pathname: "/(tabs)/food", params: { tab: "diary" } } as Href);
  }

  async function deleteLibraryItem() {
    if (!params.id || !params.type) return;

    if (params.type === "custom_food") {
      await deleteCustomFood(params.id);
    }

    if (params.type === "saved_meal") {
      await deleteSavedMeal(params.id);
    }

    if (params.type === "recipe") {
      await deleteRecipe(params.id);
    }

    router.replace({ pathname: "/(tabs)/food", params: { tab: "library" } } as Href);
  }

  const title =
    customFood?.name ?? savedMeal?.name ?? recipe?.name ?? "Library item";

  return (
    <ScreenWrapper backgroundColor="#fffaf0">
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#b45309", fontSize: 14, fontWeight: "800" }}>
          Nutrition Library
        </Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          {title}
        </Text>
      </View>

      <AppCard>
        {customFood ? (
          <View style={{ gap: 8 }}>
            <Text style={{ color: "#64748b" }}>
              {customFood.brand ?? "Custom food"}
            </Text>
            <MetricLine
              label="Serving"
              value={`${customFood.servingSize} ${customFood.servingUnit}`}
            />
            <MetricLine
              label="Calories"
              value={`${Math.round(customFood.calories)}`}
            />
            <MetricLine
              label="Protein"
              value={`${roundNutrition(customFood.proteinG)}g`}
            />
            <MetricLine
              label="Carbs"
              value={`${roundNutrition(customFood.carbsG)}g`}
            />
            <MetricLine
              label="Fat"
              value={`${roundNutrition(customFood.fatG)}g`}
            />
            {customFood.notes ? (
              <Text style={{ color: "#64748b", lineHeight: 21 }}>
                {customFood.notes}
              </Text>
            ) : null}
          </View>
        ) : null}

        {savedMeal ? (
          <View style={{ gap: 8 }}>
            <Text style={{ color: "#64748b" }}>
              {savedMeal.description ?? "Saved meal"}
            </Text>
            <MetricLine
              label="Calories"
              value={`${Math.round(savedMealTotals.calories)}`}
            />
            <MetricLine
              label="Protein"
              value={`${roundNutrition(savedMealTotals.proteinG)}g`}
            />
            <MetricLine
              label="Carbs"
              value={`${roundNutrition(savedMealTotals.carbsG)}g`}
            />
            <MetricLine
              label="Fat"
              value={`${roundNutrition(savedMealTotals.fatG)}g`}
            />
            {savedMealItems.map((item) => (
              <Text key={item.id} style={{ color: "#64748b" }}>
                {item.foodName} - {Math.round(item.calories)} kcal
              </Text>
            ))}
          </View>
        ) : null}

        {recipe ? (
          <View style={{ gap: 8 }}>
            <Text style={{ color: "#64748b" }}>
              {recipe.description ?? "Recipe"}
            </Text>
            <MetricLine label="Servings" value={`${recipe.servings}`} />
            <MetricLine
              label="Total calories"
              value={`${Math.round(recipeTotals.calories)}`}
            />
            <MetricLine
              label="Per-serving calories"
              value={`${Math.round(recipePerServing?.calories ?? 0)}`}
            />
            {recipeIngredients.map((ingredient) => (
              <Text key={ingredient.id} style={{ color: "#64748b" }}>
                {ingredient.foodName} - {Math.round(ingredient.calories)} kcal
              </Text>
            ))}
            {recipe.instructions ? (
              <Text style={{ color: "#64748b", lineHeight: 21 }}>
                {recipe.instructions}
              </Text>
            ) : null}
          </View>
        ) : null}
      </AppCard>

      <AppCard>
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Add to diary
          </Text>
          <TextInput
            keyboardType="numeric"
            onChangeText={setQuantity}
            placeholder="Quantity or servings"
            placeholderTextColor="#94a3b8"
            style={{
              backgroundColor: "#ffffff",
              borderColor: "#fde68a",
              borderRadius: 16,
              borderWidth: 1,
              color: "#0f172a",
              minHeight: 50,
              paddingHorizontal: 14,
            }}
            value={quantity}
          />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {NUTRITION_MEAL_GROUP_OPTIONS.filter(
              (option) => option.key !== "notes",
            ).map((option) => (
              <TouchableOpacity
                key={option.key}
                activeOpacity={0.85}
                onPress={() => setMealGroup(option.key)}
                style={{
                  backgroundColor:
                    mealGroup === option.key ? "#f59e0b" : "#fffbeb",
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 9,
                }}
              >
                <Text
                  style={{
                    color: mealGroup === option.key ? "#ffffff" : "#92400e",
                    fontWeight: "900",
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={addToDiary}
            style={{
              alignItems: "center",
              backgroundColor: "#f59e0b",
              borderRadius: 18,
              justifyContent: "center",
              minHeight: 52,
            }}
          >
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
              Add to Diary
            </Text>
          </TouchableOpacity>
          {params.type === "custom_food" ? (
            <EditButton href={`/food/custom-food?id=${params.id}`} />
          ) : null}
          {params.type === "saved_meal" ? (
            <EditButton href={`/food/saved-meal?id=${params.id}`} />
          ) : null}
          {params.type === "recipe" ? (
            <EditButton href={`/food/recipe?id=${params.id}`} />
          ) : null}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={deleteLibraryItem}
            style={{
              alignItems: "center",
              backgroundColor: "#fef2f2",
              borderRadius: 18,
              justifyContent: "center",
              minHeight: 48,
            }}
          >
            <Text style={{ color: "#dc2626", fontSize: 15, fontWeight: "900" }}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </AppCard>
    </ScreenWrapper>
  );
}

function MetricLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ color: "#64748b", fontWeight: "800" }}>{label}</Text>
      <Text style={{ color: "#0f172a", fontWeight: "900" }}>{value}</Text>
    </View>
  );
}

function EditButton({ href }: { href: string }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(href as Href)}
      style={{
        alignItems: "center",
        backgroundColor: "#fffbeb",
        borderRadius: 18,
        justifyContent: "center",
        minHeight: 48,
      }}
    >
      <Text style={{ color: "#92400e", fontSize: 15, fontWeight: "900" }}>
        Edit
      </Text>
    </TouchableOpacity>
  );
}
