import type { Href } from "expo-router";

import type { AppIconName } from "@/constants/appIcons";
import type { FitnessSummary } from "@/types/fitness";
import type { DailyNutritionSummary } from "@/types/nutrition";

export type HealthOSHomeTimelineItem = {
  dueAt: string;
  icon: AppIconName;
  id: string;
  route: Href;
  title: string;
  type: string;
};

export type HealthOSHomeSummaries = {
  fitness: FitnessSummary | null;
  nutrition: DailyNutritionSummary | null;
};
