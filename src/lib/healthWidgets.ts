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
import {
  calculateRecordWidgetValue,
  getAvailableRecordWidgets,
  isRecordWidget
} from "@/lib/healthRecordsStorage";
import {
  calculateWomensHealthWidgetValue,
  getAvailableWomensHealthWidgets,
  isWomensHealthWidget
} from "@/lib/womensHealthStorage";
import {
  calculatePregnancyWidgetValue,
  getAvailablePregnancyWidgets,
  isPregnancyWidget
} from "@/lib/pregnancyStorage";
import {
  calculateMensHealthWidgetValue,
  getAvailableMensHealthWidgets,
  isMensHealthWidget
} from "@/lib/mensHealthStorage";
import {
  calculateBabyWidgetValue,
  getAvailableBabyWidgets,
  isBabyWidget
} from "@/lib/babyChildStorage";
import {
  calculateWidgetValueWithPermissions,
  getActiveProfile,
  getPermissionCategoryForWidget,
  getPinnedHealthWidgetsForProfile as getProfileWidgetKeys,
  pinHealthWidgetForProfile as pinProfileWidgetKey,
  reorderHealthWidgetsForProfile as reorderProfileWidgetKeys,
  unpinHealthWidgetForProfile as unpinProfileWidgetKey
} from "@/lib/familyPermissionsStorage";
import {
  calculateHealthCalendarWidgetValue,
  getAvailableHealthCalendarWidgets,
  isHealthCalendarWidget
} from "@/services/reminders/reminderEngine";
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

export const RECORD_WIDGET_KEYS = [
  ...getAvailableRecordWidgets()
] as const satisfies WidgetKey[];

export const HEALTH_CALENDAR_WIDGET_KEYS = [
  ...getAvailableHealthCalendarWidgets()
] as const satisfies WidgetKey[];

export const WOMENS_HEALTH_WIDGET_KEYS = [
  ...getAvailableWomensHealthWidgets()
] as const satisfies WidgetKey[];

export const PREGNANCY_WIDGET_KEYS = [
  ...getAvailablePregnancyWidgets()
] as const satisfies WidgetKey[];

export const MENS_HEALTH_WIDGET_KEYS = [
  ...getAvailableMensHealthWidgets()
] as const satisfies WidgetKey[];

export const BABY_WIDGET_KEYS = [
  ...getAvailableBabyWidgets()
] as const satisfies WidgetKey[];

const HEALTH_WIDGET_KEYS = [
  ...NUTRITION_WIDGET_KEYS,
  ...MEDICATION_WIDGET_KEYS,
  ...SUPPLEMENT_WIDGET_KEYS,
  ...RECORD_WIDGET_KEYS,
  ...HEALTH_CALENDAR_WIDGET_KEYS,
  ...WOMENS_HEALTH_WIDGET_KEYS,
  ...PREGNANCY_WIDGET_KEYS,
  ...MENS_HEALTH_WIDGET_KEYS,
  ...BABY_WIDGET_KEYS,
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
  "cycle",
  "elder_checkin",
  "food_log"
] as const satisfies WidgetKey[];

const UNIQUE_HEALTH_WIDGET_KEYS = Array.from(new Set(HEALTH_WIDGET_KEYS)) as WidgetKey[];

export function isNutritionWidget(widgetKey: WidgetKey) {
  return NUTRITION_WIDGET_KEYS.includes(widgetKey as (typeof NUTRITION_WIDGET_KEYS)[number]);
}

export function isMedicationWidget(widgetKey: WidgetKey) {
  return MEDICATION_WIDGET_KEYS.includes(widgetKey as (typeof MEDICATION_WIDGET_KEYS)[number]);
}

export function isSupplementWidget(widgetKey: WidgetKey) {
  return SUPPLEMENT_WIDGET_KEYS.includes(widgetKey as (typeof SUPPLEMENT_WIDGET_KEYS)[number]);
}

function toHealthWidget(widgetKey: WidgetKey, orderIndex: number, isPinned = true, profileId = LOCAL_PROFILE_ID): HealthQuickWidget {
  const widget = APP_WIDGETS.find((item) => item.key === widgetKey);

  return {
    category: isDeviceSyncWidget(widgetKey)
      ? "device_sync"
      : isBiometricWidget(widgetKey)
      ? "biometrics"
      : isNutritionWidget(widgetKey)
      ? "nutrition"
      : isBabyWidget(widgetKey)
      ? "wellness"
      : isMedicationWidget(widgetKey)
        ? "medication"
        : isSupplementWidget(widgetKey)
          ? "wellness"
          : isRecordWidget(widgetKey)
            ? "wellness"
            : isHealthCalendarWidget(widgetKey)
              ? "wellness"
              : isWomensHealthWidget(widgetKey)
                ? "wellness"
                : isPregnancyWidget(widgetKey)
                  ? "wellness"
                  : isMensHealthWidget(widgetKey)
                    ? "wellness"
      : widget?.moduleKey === "fitness"
        ? "fitness"
        : widget?.moduleKey === "personal_health"
          ? "wellness"
          : "custom",
    id: `health-widget-${widgetKey}`,
    isPinned,
    orderIndex,
    profileId,
    title: widget?.title ?? widgetKey,
    userId: LOCAL_USER_ID,
    widgetKey
  };
}

export async function getPinnedHealthWidgets() {
  const activeProfile = await getActiveProfile();

  if (activeProfile) {
    return getPinnedHealthWidgetsForProfile(activeProfile.id);
  }

  const preferences = await getUserPreferences();

  return preferences.enabledWidgets
    .filter((widgetKey) => UNIQUE_HEALTH_WIDGET_KEYS.includes(widgetKey))
    .filter((widgetKey, index, widgets) => widgets.indexOf(widgetKey) === index)
    .map((widgetKey, orderIndex) => toHealthWidget(widgetKey, orderIndex));
}

export async function getAvailableHealthWidgets() {
  const activeProfile = await getActiveProfile();

  if (activeProfile) {
    return getAvailableHealthWidgetsForProfile(activeProfile.id);
  }

  const preferences = await getUserPreferences();
  const pinnedWidgets = new Set(preferences.enabledWidgets);

  return UNIQUE_HEALTH_WIDGET_KEYS.map((widgetKey, orderIndex) =>
    toHealthWidget(widgetKey, orderIndex, pinnedWidgets.has(widgetKey))
  );
}

export async function pinHealthWidget(widgetKey: WidgetKey) {
  const activeProfile = await getActiveProfile();

  if (activeProfile) {
    return pinHealthWidgetForProfile(activeProfile.id, widgetKey);
  }

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
  const activeProfile = await getActiveProfile();

  if (activeProfile) {
    return unpinHealthWidgetForProfile(activeProfile.id, widgetKey);
  }

  const preferences = await getUserPreferences();

  await updateUserPreferences({
    enabledWidgets: preferences.enabledWidgets.filter((key) => key !== widgetKey)
  });

  return getPinnedHealthWidgets();
}

export async function reorderHealthWidgets(widgetKeys: WidgetKey[]) {
  const activeProfile = await getActiveProfile();

  if (activeProfile) {
    return reorderHealthWidgetsForProfile(activeProfile.id, widgetKeys);
  }

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

export async function getPinnedHealthWidgetsForProfile(profileId: string) {
  const preferences = await getUserPreferences();
  const widgetKeys = await getProfileWidgetKeys(profileId, preferences.enabledWidgets);

  return widgetKeys
    .filter((widgetKey) => HEALTH_WIDGET_KEYS.includes(widgetKey as (typeof HEALTH_WIDGET_KEYS)[number]))
    .map((widgetKey, orderIndex) => toHealthWidget(widgetKey, orderIndex, true, profileId));
}

export async function getAvailableHealthWidgetsForProfile(profileId: string) {
  const preferences = await getUserPreferences();
  const widgetKeys = await getProfileWidgetKeys(profileId, preferences.enabledWidgets);
  const pinnedWidgets = new Set(widgetKeys);

  return HEALTH_WIDGET_KEYS.map((widgetKey, orderIndex) =>
    toHealthWidget(widgetKey, orderIndex, pinnedWidgets.has(widgetKey), profileId)
  );
}

export async function pinHealthWidgetForProfile(profileId: string, widgetKey: WidgetKey) {
  const preferences = await getUserPreferences();

  await pinProfileWidgetKey(profileId, widgetKey, preferences.enabledWidgets);

  return getPinnedHealthWidgetsForProfile(profileId);
}

export async function unpinHealthWidgetForProfile(profileId: string, widgetKey: WidgetKey) {
  const preferences = await getUserPreferences();

  await unpinProfileWidgetKey(profileId, widgetKey, preferences.enabledWidgets);

  return getPinnedHealthWidgetsForProfile(profileId);
}

export async function reorderHealthWidgetsForProfile(profileId: string, widgetKeys: WidgetKey[]) {
  await reorderProfileWidgetKeys(
    profileId,
    widgetKeys.filter((widgetKey) =>
      HEALTH_WIDGET_KEYS.includes(widgetKey as (typeof HEALTH_WIDGET_KEYS)[number])
    )
  );

  return getPinnedHealthWidgetsForProfile(profileId);
}

export async function calculateWidgetValue(widgetKey: WidgetKey) {
  const activeProfile = await getActiveProfile();

  if (activeProfile) {
    return calculateWidgetValueForProfile(activeProfile.id, widgetKey);
  }

  return calculateWidgetValueDirect(widgetKey);
}

export async function calculateWidgetValueForProfile(profileId: string, widgetKey: WidgetKey) {
  return calculateWidgetValueWithPermissions({
    calculate: calculateWidgetValueDirect,
    category: getPermissionCategoryForWidget(widgetKey),
    profileId,
    widgetKey
  });
}

async function calculateWidgetValueDirect(widgetKey: WidgetKey) {
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

  if (isRecordWidget(widgetKey)) {
    return calculateRecordWidgetValue(widgetKey);
  }

  if (isHealthCalendarWidget(widgetKey)) {
    return calculateHealthCalendarWidgetValue(widgetKey);
  }

  if (isWomensHealthWidget(widgetKey) || widgetKey === "cycle" || widgetKey === "cycle_private") {
    return calculateWomensHealthWidgetValue(widgetKey);
  }

  if (isPregnancyWidget(widgetKey)) {
    return calculatePregnancyWidgetValue(widgetKey);
  }

  if (isMensHealthWidget(widgetKey)) {
    return calculateMensHealthWidgetValue(widgetKey);
  }

  if (isBabyWidget(widgetKey)) {
    return calculateBabyWidgetValue(widgetKey);
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

export { getWidgetRouteType as getBiometricWidgetRouteType, isBabyWidget, isBiometricWidget, isHealthCalendarWidget, isMensHealthWidget, isPregnancyWidget, isRecordWidget, isWomensHealthWidget };

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
