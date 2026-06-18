import type { HealthOSAIImportDetectedType, HealthOSAIImportTarget } from "./aiImportTypes";

export type HealthOSAIImportTargetRegistryItem = {
  key: HealthOSAIImportTarget;
  label: string;
  privacyLevel: "standard" | "sensitive" | "high";
  requiresReview: true;
  canAutoSave: false;
  supportedDetectedTypes: HealthOSAIImportDetectedType[];
  importServiceDependency: string | null;
  safetyWarning: string;
};

const GENERAL: HealthOSAIImportDetectedType[] = ["generalNote", "article", "unknown"];

export const HEALTHOS_AI_IMPORT_TARGET_REGISTRY: Record<HealthOSAIImportTarget, HealthOSAIImportTargetRegistryItem> = {
  nutrition: target("nutrition", "Nutrition", "standard", ["foodLabel", "meal", "mealPlan", "recipe", "groceryList"], "nutritionService"),
  medication: target("medication", "Medication", "high", ["medication", "prescription", "doctorNote"], "medicationService"),
  supplements: target("supplements", "Supplements", "high", ["supplement", "prescription", "doctorNote"], "supplementService"),
  records: target("records", "Records", "high", ["medicalRecord", "labReport", "vaccineCard", "doctorNote", "pregnancyDocument", "babyChildDocument", ...GENERAL], "recordService"),
  fitness: target("fitness", "Fitness", "standard", ["workoutPlan", "exercise", "gymMachine"], "fitnessService"),
  calendar: target("calendar", "Calendar", "sensitive", ["calendarEvent", "reminder", "doctorNote", "workoutPlan", "mealPlan"], "calendarService"),
  reminders: target("reminders", "Reminders", "high", ["reminder", "calendarEvent", "medication", "supplement", "doctorNote"], "reminderService"),
  pregnancy: target("pregnancy", "Pregnancy", "high", ["pregnancyDocument", "doctorNote", "calendarEvent", "symptomNote"], "pregnancyService"),
  babyChild: target("babyChild", "Baby / Child", "high", ["babyChildDocument", "vaccineCard", "doctorNote", "calendarEvent"], "babyChildService"),
  womensHealth: target("womensHealth", "Women's Health", "high", ["cycleNote", "symptomNote", "calendarEvent"], "womensHealthService"),
  family: target("family", "Family", "high", ["familyNote", "calendarEvent", ...GENERAL], "familyService"),
  health: target("health", "Health", "high", ["medicalRecord", "labReport", "doctorNote", "symptomNote", ...GENERAL], "healthService"),
  trustedContent: target("trustedContent", "Trusted Content", "sensitive", ["article", "generalNote"], "trustedContentService"),
  home: target("home", "Home", "standard", GENERAL, null),
  none: target("none", "Do not import", "standard", ["unknown"], null),
};

export function getAIImportTargetRegistryItem(targetKey: string) {
  return HEALTHOS_AI_IMPORT_TARGET_REGISTRY[targetKey as HealthOSAIImportTarget] ?? HEALTHOS_AI_IMPORT_TARGET_REGISTRY.none;
}

export function isValidAIImportTarget(targetKey: string): targetKey is HealthOSAIImportTarget {
  return targetKey in HEALTHOS_AI_IMPORT_TARGET_REGISTRY;
}

function target(
  key: HealthOSAIImportTarget,
  label: string,
  privacyLevel: HealthOSAIImportTargetRegistryItem["privacyLevel"],
  supportedDetectedTypes: HealthOSAIImportDetectedType[],
  importServiceDependency: string | null,
): HealthOSAIImportTargetRegistryItem {
  return {
    key,
    label,
    privacyLevel,
    requiresReview: true,
    canAutoSave: false,
    supportedDetectedTypes,
    importServiceDependency,
    safetyWarning: "Review is required. AI output is only a candidate until the user confirms it.",
  };
}
