import type { Href } from "expo-router";

import type { HealthOSSegmentedRingSegment } from "@/components/healthos/charts/HealthOSSegmentedRingChart";
import type { NutritionDiaryEntry, NutritionTarget } from "@/types/nutrition";

export type HealthOSMealType =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "drink";

export type HealthOSNutritionSource =
  | "manual"
  | "scan"
  | "ai"
  | "recipe"
  | "mealPlan"
  | "import";

export type HealthOSNutritionCautionType =
  | "allergy"
  | "diabetic"
  | "medication"
  | "pregnancy"
  | "child"
  | "sodium"
  | "sugar"
  | "protein"
  | "missingData";

export type HealthOSDietGoal =
  | "balanced"
  | "highProtein"
  | "weightLoss"
  | "muscleGain"
  | "familyMeals"
  | "diabetesFriendly"
  | "pregnancyFriendly"
  | "childFriendly"
  | "budgetMeals"
  | "mealPrep"
  | "vegetarian"
  | "vegan"
  | "allergyAware";

export type HealthOSMacroLegendItem = {
  color: string;
  key: string;
  label: string;
  target?: string;
  value: string;
};

export type HealthOSMealDisplay = {
  calories?: number;
  carbsG?: number;
  cautions: string[];
  fatG?: number;
  fiberG?: number;
  id: string;
  ingredients?: string[];
  name: string;
  notes?: string;
  proteinG?: number;
  rawEntry: NutritionDiaryEntry;
  source: HealthOSNutritionSource;
  timeLabel?: string;
  type: HealthOSMealType;
};

export type HealthOSMealTimelineSectionDisplay = {
  addLabel: string;
  key: HealthOSMealType;
  meals: HealthOSMealDisplay[];
  title: string;
};

export type HealthOSMealPlanDisplay = {
  description: string;
  id: string;
  isActive?: boolean;
  meta?: string;
  title: string;
};

export type HealthOSGrocerySummary = {
  ingredientCount: number;
  missingIngredients: string[];
  status: string;
};

export type HealthOSNutritionCaution = {
  body: string;
  id: string;
  title: string;
  type: HealthOSNutritionCautionType;
};

export type HealthOSNutritionContentItem = {
  id: string;
  publishedAt?: string;
  routeTarget?: Href;
  sourceName: string;
  sourceUrl: string;
  summary: string;
  title: string;
  topic: string;
};

export type HealthOSNutritionDailyProgress = {
  hasLoggedFood: boolean;
  percent: number;
  statusNote: string;
};

export type HealthOSNutritionData = {
  activeGoal: string;
  activeMealPlan: HealthOSMealPlanDisplay | null;
  contentPreview: HealthOSNutritionContentItem[];
  dailyProgress: HealthOSNutritionDailyProgress;
  dietPreferences: Array<{ key: HealthOSDietGoal; label: string; selected: boolean }>;
  emptyState: string | null;
  error: string | null;
  grocerySummary: HealthOSGrocerySummary;
  loading: boolean;
  macroLegendItems: HealthOSMacroLegendItem[];
  macroSegments: HealthOSSegmentedRingSegment[];
  mealTimeline: HealthOSMealTimelineSectionDisplay[];
  nutritionCautions: HealthOSNutritionCaution[];
  selectedDate: string;
  suggestedMealPlans: HealthOSMealPlanDisplay[];
  target: NutritionTarget | null;
};
