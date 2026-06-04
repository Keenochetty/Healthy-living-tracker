import type { FoodSource, NutritionDiaryEntry, NutritionMealGroup } from "@/types/nutrition";

export type SmartLogMethod =
  | "meal_photo"
  | "nutrition_label"
  | "voice_log"
  | "recipe_url"
  | "repeat_meal"
  | "quick_meal_builder";

export type SmartLogStatus =
  | "draft"
  | "review"
  | "confirmed"
  | "cancelled"
  | "unavailable";

export type SmartLogSession = {
  createdAt: string;
  entryDate: string;
  id: string;
  imageUri?: string;
  inputText?: string;
  mealGroup: NutritionMealGroup;
  method: SmartLogMethod;
  message?: string;
  profileId: string;
  recipeUrl?: string;
  sourceMetadata?: Record<string, unknown>;
  status: SmartLogStatus;
  updatedAt: string;
  userId: string;
};

export type SmartLogSuggestedEntry = {
  calories: number;
  carbsG: number;
  confidence: number;
  createdAt: string;
  fatG: number;
  fiberG?: number;
  foodName: string;
  id: string;
  mealGroup: NutritionMealGroup;
  notes?: string;
  profileId: string;
  proteinG: number;
  quantity: number;
  sessionId: string;
  source?: FoodSource;
  sourceFoodId?: string;
  sourceRefId?: string;
  status: "active" | "removed";
  unit: string;
  updatedAt: string;
  userId: string;
};

export type SmartFoodSuggestion = {
  actionLabel: string;
  createdAt: string;
  id: string;
  message: string;
  priority: number;
  route: string;
  title: string;
  type: "protein" | "water" | "repeat_meal" | "workout_support" | "diary_reminder" | "general";
};

export type ConfirmedSmartLogEntry = NutritionDiaryEntry;
