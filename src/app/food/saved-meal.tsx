import { Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import { NUTRITION_MEAL_GROUP_OPTIONS } from "@/constants/nutritionOptions";
import {
  addItemToSavedMeal,
  addSavedMealToDiary,
  createSavedMeal,
  getCommonFoodResults,
  getCustomFoods,
  getSavedMealById,
  removeItemFromSavedMeal,
  updateSavedMeal
} from "@/lib/nutritionStorage";
import { calculateSavedMealTotals, roundNutrition } from "@/services/nutrition/nutritionCalculations";
import type { FoodSearchResult, NutritionMealGroup, SavedMeal, SavedMealItem } from "@/types/nutrition";

const INPUT_STYLE = {
  backgroundColor: "#ffffff",
  borderColor: "#fde68a",
  borderRadius: 16,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 50,
  paddingHorizontal: 14
};

export default function SavedMealScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const [savedMeal, setSavedMeal] = useState<SavedMeal | null>(null);
  const [items, setItems] = useState<SavedMealItem[]>([]);
  const [foodChoices, setFoodChoices] = useState<FoodSearchResult[]>(() => getCommonFoodResults().slice(0, 8));
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultMealGroup, setDefaultMealGroup] = useState<NutritionMealGroup>("breakfast");
  const [isSharedWithFamily, setIsSharedWithFamily] = useState(false);
  const [quantity, setQuantity] = useState("1");
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

        const result = await getSavedMealById(params.id);

        if (!result) return;

        setSavedMeal(result.savedMeal);
        setItems(result.items);
        setName(result.savedMeal.name);
        setDescription(result.savedMeal.description ?? "");
        setDefaultMealGroup(result.savedMeal.defaultMealGroup);
        setIsSharedWithFamily(result.savedMeal.isSharedWithFamily);
      })
      .catch(() => undefined);
  }, [params.id]);

  const totals = useMemo(() => calculateSavedMealTotals(items), [items]);

  async function saveMeal() {
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Meal name is required.");
      return null;
    }

    if (savedMeal) {
      const updatedMeal = await updateSavedMeal(savedMeal.id, {
        defaultMealGroup,
        description: description.trim() || undefined,
        isSharedWithFamily,
        name
      });

      setSavedMeal(updatedMeal);
      return updatedMeal;
    }

    const nextMeal = await createSavedMeal({
      defaultMealGroup,
      description: description.trim() || undefined,
      isSharedWithFamily,
      name
    });

    setSavedMeal(nextMeal);
    return nextMeal;
  }

  async function addFood(food: FoodSearchResult) {
    const meal = savedMeal ?? (await saveMeal());

    if (!meal) return;

    const multiplier = Math.max(0, Number(quantity) || 1);
    const item = await addItemToSavedMeal({
      calories: (food.caloriesPerServing ?? 0) * multiplier,
      carbsG: (food.carbsGPerServing ?? 0) * multiplier,
      customFoodId: food.source === "custom" ? food.sourceFoodId.replace("custom-food-", "") : undefined,
      fatG: (food.fatGPerServing ?? 0) * multiplier,
      foodName: food.name,
      foodSource: food.source,
      proteinG: (food.proteinGPerServing ?? 0) * multiplier,
      quantity: multiplier,
      savedMealId: meal.id,
      sourceFoodId: food.sourceFoodId,
      unit: food.servingLabel ?? "serving"
    });

    setItems((current) => [...current, item]);
  }

  async function removeItem(itemId: string) {
    await removeItemFromSavedMeal(itemId);
    setItems((current) => current.filter((item) => item.id !== itemId));
  }

  async function addMealToDiary() {
    const meal = savedMeal ?? (await saveMeal());

    if (!meal) return;

    await addSavedMealToDiary(meal.id, defaultMealGroup);
    router.replace({ pathname: "/food", params: { tab: "diary" } } as Href);
  }

  return (
    <ScreenWrapper backgroundColor="#fffaf0">
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#b45309", fontSize: 14, fontWeight: "800" }}>Food / Nutrition</Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          {params.id ? "Edit Saved Meal" : "Create Saved Meal"}
        </Text>
      </View>

      <AppCard>
        <View style={{ gap: 12 }}>
          <TextInput onChangeText={setName} placeholder="Meal name" placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={name} />
          <TextInput multiline onChangeText={setDescription} placeholder="Description optional" placeholderTextColor="#94a3b8" style={{ ...INPUT_STYLE, minHeight: 76, paddingTop: 13 }} value={description} />

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {NUTRITION_MEAL_GROUP_OPTIONS.filter((option) => option.key !== "notes").map((option) => (
              <TouchableOpacity
                activeOpacity={0.85}
                key={option.key}
                onPress={() => setDefaultMealGroup(option.key)}
                style={{
                  backgroundColor: defaultMealGroup === option.key ? "#f59e0b" : "#fffbeb",
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 9
                }}
              >
                <Text style={{ color: defaultMealGroup === option.key ? "#ffffff" : "#92400e", fontWeight: "900" }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 18, flexDirection: "row", justifyContent: "space-between", padding: 14 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#0f172a", fontWeight: "900" }}>Share with family</Text>
              <Text style={{ color: "#64748b", marginTop: 3 }}>Prepared for later permissions.</Text>
            </View>
            <Switch disabled onValueChange={setIsSharedWithFamily} value={isSharedWithFamily} />
          </View>

          {errorMessage ? <Text style={{ color: "#dc2626", fontWeight: "800" }}>{errorMessage}</Text> : null}

          <TouchableOpacity activeOpacity={0.85} onPress={saveMeal} style={{ alignItems: "center", backgroundColor: "#f59e0b", borderRadius: 18, justifyContent: "center", minHeight: 52 }}>
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>Save Meal</Text>
          </TouchableOpacity>
        </View>
      </AppCard>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <MetricCard label="Calories" value={`${Math.round(totals.calories)}`} />
        <MetricCard label="Protein" value={`${roundNutrition(totals.proteinG)}g`} />
        <MetricCard label="Carbs" value={`${roundNutrition(totals.carbsG)}g`} />
        <MetricCard label="Fat" value={`${roundNutrition(totals.fatG)}g`} />
      </View>

      <AppCard>
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>Items</Text>
          {items.length ? (
            items.map((item) => (
              <View key={item.id} style={{ backgroundColor: "#f8fafc", borderRadius: 16, padding: 12 }}>
                <View style={{ flexDirection: "row", gap: 8, justifyContent: "space-between" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#0f172a", fontWeight: "900" }}>{item.foodName}</Text>
                    <Text style={{ color: "#64748b", marginTop: 3 }}>{item.quantity} {item.unit} - {Math.round(item.calories)} kcal</Text>
                  </View>
                  <TouchableOpacity activeOpacity={0.85} onPress={() => removeItem(item.id)}>
                    <Text style={{ color: "#dc2626", fontWeight: "900" }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ color: "#64748b", lineHeight: 21 }}>No foods added yet.</Text>
          )}
        </View>
      </AppCard>

      <AppCard>
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>Add foods</Text>
          <TextInput keyboardType="numeric" onChangeText={setQuantity} placeholder="Quantity multiplier" placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={quantity} />
          {foodChoices.map((food) => (
            <TouchableOpacity key={`${food.source}-${food.sourceFoodId}`} activeOpacity={0.85} onPress={() => addFood(food)} style={{ backgroundColor: "#fffbeb", borderRadius: 16, padding: 12 }}>
              <Text style={{ color: "#0f172a", fontWeight: "900" }}>{food.name}</Text>
              <Text style={{ color: "#64748b", marginTop: 3 }}>{food.servingLabel ?? "serving"} - {Math.round(food.caloriesPerServing ?? 0)} kcal</Text>
            </TouchableOpacity>
          ))}
        </View>
      </AppCard>

      <TouchableOpacity activeOpacity={0.85} onPress={addMealToDiary} style={{ alignItems: "center", backgroundColor: "#f59e0b", borderRadius: 18, justifyContent: "center", minHeight: 54 }}>
        <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>Add Saved Meal to Diary</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ backgroundColor: "#ffffff", borderColor: "#fde68a", borderRadius: 18, borderWidth: 1, flexGrow: 1, minWidth: "30%", padding: 14 }}>
      <Text style={{ color: "#92400e", fontSize: 12, fontWeight: "900" }}>{label}</Text>
      <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900", marginTop: 4 }}>{value}</Text>
    </View>
  );
}
