import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useColorScheme } from "react-native";

import { getHealthOSChartTheme, getHealthOSPalette, type HealthOSColorMode } from "@/theme/healthos";
import {
  getActiveNutritionTarget,
  getDailyNutritionSummary,
  getNutritionEntriesByDate,
  getNutritionGoalMessage,
  getRecipes,
  getSavedMeals,
  getWaterGoal,
  toNutritionDateKey,
} from "@/lib/nutritionStorage";
import { getTrustedHealthContentCards } from "@/lib/trustedContentStorage";
import type { NutritionDiaryEntry, NutritionMealGroup } from "@/types/nutrition";

import type {
  HealthOSDietGoal,
  HealthOSMealDisplay,
  HealthOSMealTimelineSectionDisplay,
  HealthOSNutritionData,
  HealthOSNutritionCaution,
  HealthOSNutritionSource,
} from "./HealthOSNutritionTypes";

const mealSections: Array<{
  addLabel: string;
  group: NutritionMealGroup;
  key: HealthOSMealTimelineSectionDisplay["key"];
  title: string;
}> = [
  { addLabel: "Add breakfast", group: "breakfast", key: "breakfast", title: "Breakfast" },
  { addLabel: "Plan lunch", group: "lunch", key: "lunch", title: "Lunch" },
  { addLabel: "Scan dinner label", group: "dinner", key: "dinner", title: "Dinner" },
  { addLabel: "Add snack", group: "snacks", key: "snack", title: "Snacks" },
  { addLabel: "Add water", group: "notes", key: "drink", title: "Drinks / Water" },
];

const emptyData: HealthOSNutritionData = {
  activeGoal: "Choose your first nutrition goal.",
  activeMealPlan: null,
  contentPreview: [],
  dailyProgress: {
    hasLoggedFood: false,
    percent: 0,
    statusNote: "Scan a label or log your first meal.",
  },
  dietPreferences: [],
  emptyState: "Scan a label or log your first meal.",
  error: null,
  grocerySummary: {
    ingredientCount: 0,
    missingIngredients: [],
    status: "Ingredients from meal plans will appear here.",
  },
  loading: true,
  macroLegendItems: [],
  macroSegments: [],
  mealTimeline: [],
  nutritionCautions: [],
  selectedDate: toNutritionDateKey(new Date()),
  suggestedMealPlans: [],
  target: null,
};

export function useHealthOSNutritionData(): HealthOSNutritionData {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const chart = getHealthOSChartTheme(mode);
  const [data, setData] = useState<HealthOSNutritionData>(emptyData);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        const today = new Date();
        const selectedDate = toNutritionDateKey(today);
        setData((current) => ({ ...current, loading: true, error: null }));

        try {
          const [
            entries,
            summary,
            target,
            waterGoal,
            savedMeals,
            recipes,
            contentCards,
          ] = await Promise.all([
            getNutritionEntriesByDate(selectedDate),
            getDailyNutritionSummary(today),
            getActiveNutritionTarget(),
            getWaterGoal(today),
            getSavedMeals(),
            getRecipes(),
            getTrustedHealthContentCards(),
          ]);

          if (cancelled) return;

          const caloriePercent = target
            ? percent(summary.calories, target.caloriesTarget)
            : 0;
          const activeGoal = target
            ? titleCase(target.goalType.replace(/_/g, " "))
            : "Choose your first nutrition goal.";
          const hasLoggedFood = entries.length > 0;
          const meals = entries.map(mapEntryToMeal);
          const mealTimeline = mealSections.map((section) => ({
            addLabel: section.addLabel,
            key: section.key,
            meals: meals.filter((meal) => meal.rawEntry.mealGroup === section.group),
            title: section.title,
          }));
          const macroSegments = [
            {
              color: palette.nutrition,
              key: "calories",
              label: "Calories",
              max: target?.caloriesTarget,
              value: target ? summary.calories : 0,
            },
            {
              color: chart.macroColors.protein,
              key: "protein",
              label: "Protein",
              max: target?.proteinTargetG,
              value: target ? summary.proteinGrams : 0,
            },
            {
              color: chart.macroColors.carbs,
              key: "carbs",
              label: "Carbs",
              max: target?.carbsTargetG,
              value: target ? summary.carbsGrams : 0,
            },
            {
              color: chart.macroColors.fat,
              key: "fat",
              label: "Fat",
              max: target?.fatTargetG,
              value: target ? summary.fatGrams : 0,
            },
            {
              color: palette.skyBlue,
              key: "water",
              label: "Water",
              max: waterGoal.targetMl,
              value: waterGoal.currentMl,
            },
          ];
          const macroLegendItems = [
            {
              color: palette.nutrition,
              key: "calories",
              label: "Calories",
              target: target ? `${Math.round(target.caloriesTarget).toLocaleString()} kcal` : undefined,
              value: hasLoggedFood ? `${Math.round(summary.calories).toLocaleString()} kcal` : "Not logged",
            },
            {
              color: chart.macroColors.protein,
              key: "protein",
              label: "Protein",
              target: target ? `${Math.round(target.proteinTargetG)}g` : undefined,
              value: hasLoggedFood ? `${Math.round(summary.proteinGrams)}g` : "Not logged",
            },
            {
              color: chart.macroColors.carbs,
              key: "carbs",
              label: "Carbs",
              target: target ? `${Math.round(target.carbsTargetG)}g` : undefined,
              value: hasLoggedFood ? `${Math.round(summary.carbsGrams)}g` : "Not logged",
            },
            {
              color: chart.macroColors.fat,
              key: "fat",
              label: "Fat",
              target: target ? `${Math.round(target.fatTargetG)}g` : undefined,
              value: hasLoggedFood ? `${Math.round(summary.fatGrams)}g` : "Not logged",
            },
            {
              color: palette.skyBlue,
              key: "water",
              label: "Water",
              target: `${formatWater(waterGoal.targetMl)}`,
              value: waterGoal.currentMl > 0 ? formatWater(waterGoal.currentMl) : "Not logged",
            },
          ];

          setData({
            activeGoal,
            activeMealPlan: null,
            contentPreview: contentCards
              .filter(
                (card) =>
                  card.status === "published" &&
                  (card.realm === "nutrition" ||
                    card.topicTags.some((tag) =>
                      ["nutrition", "food", "recipe", "hydration", "protein"].includes(
                        tag.toLowerCase(),
                      ),
                    )),
              )
              .slice(0, 3)
              .map((card) => ({
                id: card.id,
                publishedAt: card.publishedDate,
                sourceName: card.sourceOrganization,
                sourceUrl: card.sourceUrl,
                summary: card.shortSummary,
                title: card.title,
                topic: card.topicTags[0] ?? "Nutrition",
              })),
            dailyProgress: {
              hasLoggedFood,
              percent: caloriePercent,
              statusNote: hasLoggedFood
                ? getNutritionGoalMessage(target)
                : "Scan a label or log your first meal.",
            },
            dietPreferences: buildDietPreferences(target),
            emptyState: hasLoggedFood ? null : "Scan a label or log your first meal.",
            error: null,
            grocerySummary: {
              ingredientCount: 0,
              missingIngredients: [],
              status:
                recipes.length || savedMeals.length
                  ? "Recipe and saved-meal ingredients are ready to connect to shopping lists."
                  : "Ingredients from meal plans will appear here.",
            },
            loading: false,
            macroLegendItems,
            macroSegments,
            mealTimeline,
            nutritionCautions: buildCautions(entries, target),
            selectedDate,
            suggestedMealPlans: [
              {
                description: "Use your protein target and saved meals when you create a plan.",
                id: "high-protein",
                title: "High protein",
              },
              {
                description: "Plan practical meals for shared family routines.",
                id: "balanced-family",
                title: "Balanced family meals",
              },
              {
                description: "Keep pregnancy-specific nutrition advice review-first.",
                id: "pregnancy-friendly",
                title: "Pregnancy-friendly",
              },
              {
                description: "Child-friendly planning stays separate from medical advice.",
                id: "child-friendly",
                title: "Child-friendly",
              },
            ],
            target,
          });
        } catch {
          if (cancelled) return;
          setData((current) => ({
            ...current,
            error: "Nutrition data could not be loaded right now.",
            loading: false,
          }));
        }
      }

      void load();

      return () => {
        cancelled = true;
      };
    }, [chart.macroColors.carbs, chart.macroColors.fat, chart.macroColors.protein, palette.nutrition, palette.skyBlue]),
  );

  return data;
}

function mapEntryToMeal(entry: NutritionDiaryEntry): HealthOSMealDisplay {
  return {
    calories: entry.calories,
    carbsG: entry.carbsG,
    cautions: entry.allergens?.length ? ["Allergen info"] : [],
    fatG: entry.fatG,
    fiberG: entry.fiberG,
    id: entry.id,
    ingredients: entry.ingredients
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    name: entry.foodName,
    notes: entry.notes,
    proteinG: entry.proteinG,
    rawEntry: entry,
    source: mapSource(entry),
    timeLabel: formatTime(entry.createdAt),
    type: mapMealType(entry.mealGroup),
  };
}

function mapMealType(group: NutritionMealGroup): HealthOSMealDisplay["type"] {
  if (group === "snacks") return "snack";
  if (group === "notes") return "drink";
  if (group === "supplements") return "drink";
  return group;
}

function mapSource(entry: NutritionDiaryEntry): HealthOSNutritionSource {
  switch (entry.entrySource) {
    case "barcode_scan":
      return "scan";
    case "smart_log":
      return "ai";
    case "recipe":
      return "recipe";
    case "saved_meal":
      return "mealPlan";
    case "food_details":
    case "custom_food":
    case "manual":
    default:
      return "manual";
  }
}

function buildDietPreferences(target: HealthOSNutritionData["target"]) {
  const selected = new Set<HealthOSDietGoal>();
  if (target?.goalType === "gain_muscle") selected.add("muscleGain");
  if (target?.goalType === "lose_weight") selected.add("weightLoss");
  if (target?.goalType === "maintain_weight" || target?.goalType === "general_health") {
    selected.add("balanced");
  }
  if (target?.proteinTargetG && target.proteinTargetG >= 120) selected.add("highProtein");

  return [
    ["balanced", "Balanced"],
    ["highProtein", "High protein"],
    ["weightLoss", "Weight loss"],
    ["muscleGain", "Muscle gain"],
    ["familyMeals", "Family meals"],
    ["diabetesFriendly", "Diabetes-friendly caution"],
    ["pregnancyFriendly", "Pregnancy-friendly"],
    ["childFriendly", "Child-friendly"],
    ["budgetMeals", "Budget meals"],
    ["mealPrep", "Meal prep"],
    ["vegetarian", "Vegetarian"],
    ["vegan", "Vegan"],
    ["allergyAware", "Allergy-aware"],
  ].map(([key, label]) => ({
    key: key as HealthOSDietGoal,
    label,
    selected: selected.has(key as HealthOSDietGoal),
  }));
}

function buildCautions(
  entries: NutritionDiaryEntry[],
  target: HealthOSNutritionData["target"],
): HealthOSNutritionCaution[] {
  if (!entries.length) {
    return [
      {
        body: "Nutrition cautions will appear when meals, preferences, or scan results are connected.",
        id: "missing-data",
        title: "No meal data to review",
        type: "missingData" as const,
      },
      {
        body: "Medication-food interaction checks require review and are not medical advice.",
        id: "medication-placeholder",
        title: "Medication timing review",
        type: "medication" as const,
      },
    ];
  }

  const cautions: HealthOSNutritionCaution[] = entries
    .filter((entry) => entry.allergens?.length)
    .slice(0, 2)
    .map((entry) => ({
      body: `${entry.foodName} includes allergen metadata. Review against your personal preferences before relying on it.`,
      id: `allergen-${entry.id}`,
      title: "Allergen review",
      type: "allergy" as const,
    }));

  if (target) {
    const proteinTotal = entries.reduce((total, entry) => total + entry.proteinG, 0);
    if (proteinTotal < target.proteinTargetG * 0.35) {
      cautions.push({
        body: "Protein is still below your selected target today. This is a tracking prompt, not medical advice.",
        id: "protein-target",
        title: "Protein target",
        type: "protein",
      });
    }
  }

  return cautions.length
    ? cautions
    : [
        {
          body: "No specific caution flags were found in today logs. High-risk guidance still needs professional review.",
          id: "general-review",
          title: "Review-first nutrition",
          type: "missingData" as const,
        },
      ];
}

function percent(value: number, target?: number) {
  if (!target || target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / target) * 100)));
}

function formatWater(amountMl: number) {
  return amountMl >= 1000
    ? `${(amountMl / 1000).toFixed(1)}L`
    : `${Math.round(amountMl)}ml`;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (character) => character.toUpperCase());
}
