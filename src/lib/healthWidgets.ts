import { APP_WIDGETS } from "@/constants/widgets";
import {
  calculateBiometricWidgetValue,
  getWidgetRouteType,
  isBiometricWidget
} from "@/lib/biometricsStorage";
import {
  calculateDeviceSyncWidgetValue,
  DEVICE_SYNC_WIDGET_KEYS,
  isDeviceSyncWidget
} from "@/services/healthSync/healthSyncService";
import {
  calculateDailyNutritionProgress,
  formatMacroProgress,
  getActiveNutritionTarget,
  getTodayNutritionSummary
} from "@/lib/nutritionStorage";
import {
  calculateMedicationWidgetValue,
  calculateSupplementWidgetValue,
  getAvailableMedicationWidgets,
  getAvailableSupplementWidgets
} from "@/lib/medicationSupplementStorage";
import { getUserPreferences, updateUserPreferences } from "@/lib/userPreferences";
import type { WidgetKey } from "@/types/app";
import type { HealthQuickWidget } from "@/types/nutrition";

const LOCAL_USER_ID = "local-user";
const LOCAL_PROFILE_ID = "local-profile";

export const NUTRITION_WIDGET_KEYS = [
  "calories_today",
  "protein_today",
  "water_today",
  "calories_progress",
  "protein_progress",
  "water_progress",
  "fiber_progress",
  "goal_weight",
  "nutrition_goal",
  "food_diary_status"
] as const satisfies WidgetKey[];

export const MEDICATION_WIDGET_KEYS = [
  ...getAvailableMedicationWidgets(),
  "medication"
] as const satisfies WidgetKey[];

export const SUPPLEMENT_WIDGET_KEYS = [
  ...getAvailableSupplementWidgets()
] as const satisfies WidgetKey[];

const HEALTH_WIDGET_KEYS = [
  ...NUTRITION_WIDGET_KEYS,
  ...MEDICATION_WIDGET_KEYS,
  ...SUPPLEMENT_WIDGET_KEYS,
  "weight",
  "biometric_goal_weight",
  "sleep",
  "energy",
  "mood",
  "resting_heart_rate",
  "blood_pressure",
  "blood_glucose",
  "digestion",
  "symptoms",
  ...DEVICE_SYNC_WIDGET_KEYS,
  "workout",
  "water",
  "baby_feed",
  "cycle",
  "elder_checkin",
  "food_log"
] as const satisfies WidgetKey[];

export function isNutritionWidget(widgetKey: WidgetKey) {
  return NUTRITION_WIDGET_KEYS.includes(widgetKey as (typeof NUTRITION_WIDGET_KEYS)[number]);
}

export function isMedicationWidget(widgetKey: WidgetKey) {
  return MEDICATION_WIDGET_KEYS.includes(widgetKey as (typeof MEDICATION_WIDGET_KEYS)[number]);
}

export function isSupplementWidget(widgetKey: WidgetKey) {
  return SUPPLEMENT_WIDGET_KEYS.includes(widgetKey as (typeof SUPPLEMENT_WIDGET_KEYS)[number]);
}

function toHealthWidget(widgetKey: WidgetKey, orderIndex: number, isPinned = true): HealthQuickWidget {
  const widget = APP_WIDGETS.find((item) => item.key === widgetKey);

  return {
    category: isDeviceSyncWidget(widgetKey)
      ? "device_sync"
      : isBiometricWidget(widgetKey)
      ? "biometrics"
      : isNutritionWidget(widgetKey)
      ? "nutrition"
      : isMedicationWidget(widgetKey)
        ? "medication"
        : isSupplementWidget(widgetKey)
          ? "wellness"
      : widget?.moduleKey === "fitness"
        ? "fitness"
        : widget?.moduleKey === "personal_health"
          ? "wellness"
          : "custom",
    id: `health-widget-${widgetKey}`,
    isPinned,
    orderIndex,
    profileId: LOCAL_PROFILE_ID,
    title: widget?.title ?? widgetKey,
    userId: LOCAL_USER_ID,
    widgetKey
  };
}

export async function getPinnedHealthWidgets() {
  const preferences = await getUserPreferences();

  return preferences.enabledWidgets
    .filter((widgetKey) => HEALTH_WIDGET_KEYS.includes(widgetKey as (typeof HEALTH_WIDGET_KEYS)[number]))
    .map((widgetKey, orderIndex) => toHealthWidget(widgetKey, orderIndex));
}

export async function getAvailableHealthWidgets() {
  const preferences = await getUserPreferences();
  const pinnedWidgets = new Set(preferences.enabledWidgets);

  return HEALTH_WIDGET_KEYS.map((widgetKey, orderIndex) =>
    toHealthWidget(widgetKey, orderIndex, pinnedWidgets.has(widgetKey))
  );
}

export async function pinHealthWidget(widgetKey: WidgetKey) {
  const preferences = await getUserPreferences();

  if (preferences.enabledWidgets.includes(widgetKey)) {
    return getPinnedHealthWidgets();
  }

  await updateUserPreferences({
    enabledWidgets: [...preferences.enabledWidgets, widgetKey]
  });

  return getPinnedHealthWidgets();
}

export async function unpinHealthWidget(widgetKey: WidgetKey) {
  const preferences = await getUserPreferences();

  await updateUserPreferences({
    enabledWidgets: preferences.enabledWidgets.filter((key) => key !== widgetKey)
  });

  return getPinnedHealthWidgets();
}

export async function reorderHealthWidgets(widgetKeys: WidgetKey[]) {
  const preferences = await getUserPreferences();
  const requestedWidgets = widgetKeys.filter((widgetKey) =>
    HEALTH_WIDGET_KEYS.includes(widgetKey as (typeof HEALTH_WIDGET_KEYS)[number])
  );
  const otherWidgets = preferences.enabledWidgets.filter(
    (widgetKey) => !requestedWidgets.includes(widgetKey)
  );

  await updateUserPreferences({
    enabledWidgets: [...requestedWidgets, ...otherWidgets]
  });

  return getPinnedHealthWidgets();
}

export async function getAvailableNutritionWidgets() {
  const availableWidgets = await getAvailableHealthWidgets();

  return availableWidgets.filter((widget) => isNutritionWidget(widget.widgetKey));
}

export async function calculateWidgetValue(widgetKey: WidgetKey) {
  if (isDeviceSyncWidget(widgetKey)) {
    return calculateDeviceSyncWidgetValue(widgetKey);
  }

  if (isBiometricWidget(widgetKey)) {
    return calculateBiometricWidgetValue(widgetKey);
  }

  if (isMedicationWidget(widgetKey)) {
    return calculateMedicationWidgetValue(widgetKey);
  }

  if (isSupplementWidget(widgetKey)) {
    return calculateSupplementWidgetValue(widgetKey);
  }

  const [summary, progress, target] = await Promise.all([
    getTodayNutritionSummary(),
    calculateDailyNutritionProgress(new Date()),
    getActiveNutritionTarget()
  ]);

  switch (widgetKey) {
    case "calories_progress":
      return progress
        ? formatMacroProgress(progress.caloriesConsumed, progress.caloriesTarget, "kcal")
        : summary.foodLogCount
          ? `${Math.round(summary.calories).toLocaleString()} kcal`
          : "No target";
    case "protein_progress":
      return progress
        ? formatMacroProgress(progress.proteinConsumedG, progress.proteinTargetG, "g")
        : `${Math.round(summary.proteinGrams)}g`;
    case "water_progress":
      return progress
        ? `${formatWaterValue(progress.waterConsumedMl)} / ${formatWaterValue(progress.waterTargetMl)}`
        : `${Math.round(summary.waterMl)}ml`;
    case "fiber_progress":
      return progress
        ? formatMacroProgress(progress.fiberConsumedG ?? 0, progress.fiberTargetG ?? 0, "g")
        : "No target";
    case "goal_weight":
      return target?.currentWeightKg && target.goalWeightKg
        ? `${target.currentWeightKg} kg -> ${target.goalWeightKg} kg`
        : "Set goal";
    case "nutrition_goal":
      return target ? getNutritionGoalLabel(target.goalType) : "Set goal";
    case "calories_today":
      return summary.foodLogCount ? `${Math.round(summary.calories).toLocaleString()}` : "No logs";
    case "protein_today":
      return `${Math.round(summary.proteinGrams)}g`;
    case "water_today":
      return `${Math.round(summary.waterMl)}ml`;
    case "food_diary_status":
    case "food_log":
      return summary.foodLogCount ? `${summary.foodLogCount} entries` : "No logs";
    default:
      return "Ready";
  }
}

export { getWidgetRouteType as getBiometricWidgetRouteType, isBiometricWidget };

function formatWaterValue(amountMl: number) {
  return amountMl >= 1000 ? `${(amountMl / 1000).toFixed(1)} L` : `${Math.round(amountMl)} ml`;
}

function getNutritionGoalLabel(goalType: string) {
  switch (goalType) {
    case "lose_weight":
      return "Lose Weight";
    case "gain_muscle":
      return "Gain Muscle";
    case "maintain_weight":
      return "Maintain Weight";
    case "improve_running":
      return "Improve Running";
    case "workout_recovery":
      return "Workout Recovery";
    case "general_health":
      return "General Health";
    case "custom":
      return "Custom Goal";
    default:
      return "Nutrition Goal";
  }
}
