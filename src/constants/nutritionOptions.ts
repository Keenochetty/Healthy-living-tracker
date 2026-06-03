import type { MealType, NutritionMealGroup } from "@/types/nutrition";

export type MealTypeOption = {
  colour: string;
  emoji: string;
  key: MealType | NutritionMealGroup;
  label: string;
};

export const MEAL_TYPE_OPTIONS: MealTypeOption[] = [
  { colour: "#f97316", emoji: "AM", key: "breakfast", label: "Breakfast" },
  { colour: "#22c55e", emoji: "Mid", key: "lunch", label: "Lunch" },
  { colour: "#8b5cf6", emoji: "PM", key: "dinner", label: "Dinner" },
  { colour: "#ec4899", emoji: "Bite", key: "snacks", label: "Snacks" },
  { colour: "#64748b", emoji: "Sup", key: "supplements", label: "Supplements" },
  { colour: "#94a3b8", emoji: "Note", key: "notes", label: "Notes" }
];

export const NUTRITION_MEAL_GROUP_OPTIONS = MEAL_TYPE_OPTIONS as Array<
  MealTypeOption & { key: NutritionMealGroup }
>;

export const QUICK_FOOD_EXAMPLES = [
  "Apple",
  "Orange",
  "Egg",
  "Rice",
  "Chicken",
  "Salad",
  "Oats",
  "Yoghurt",
  "Water"
];

export const QUICK_WATER_AMOUNTS = [250, 500, 750];

export const NUTRITION_DISCLAIMER =
  "This app can help you track meals and hydration. Nutrition values are estimates and do not replace advice from a doctor, dietitian or healthcare professional.";

export function getMealTypeOption(mealType: MealType | NutritionMealGroup) {
  const normalisedMealType =
    mealType === "snack" ? "snacks" : mealType === "supplement" ? "supplements" : mealType;

  return (
    MEAL_TYPE_OPTIONS.find((option) => option.key === normalisedMealType) ??
    MEAL_TYPE_OPTIONS[MEAL_TYPE_OPTIONS.length - 1]
  );
}
