import type { HealthOSAIImportTargetConfig } from "./types";

const ALL_GENERAL = ["article", "general_note", "unknown"] as const;

export const HEALTHOS_AI_IMPORT_TARGETS: HealthOSAIImportTargetConfig[] = [
  {
    allowedImportTypes: ["food_label", "meal", "meal_plan", "recipe", "grocery_list"],
    description: "Meals, recipes, labels, groceries, and nutrition drafts.",
    key: "nutrition",
    label: "Nutrition",
    requiresReview: true,
    routeTarget: "/food",
    saveHandlerKey: "appAI:nutrition",
    sensitive: false,
  },
  {
    allowedImportTypes: ["medication", "prescription", "doctor_note"],
    description: "Medication drafts and prescription review.",
    key: "medication",
    label: "Medication",
    requiresReview: true,
    routeTarget: "/medication",
    saveHandlerKey: "appAI:medication",
    sensitive: true,
  },
  {
    allowedImportTypes: ["supplement", "prescription", "doctor_note"],
    description: "Supplement drafts and timing review.",
    key: "supplements",
    label: "Supplements",
    requiresReview: true,
    routeTarget: "/supplements",
    saveHandlerKey: "appAI:supplements",
    sensitive: true,
  },
  {
    allowedImportTypes: ["prescription", "doctor_note", "medical_record", "lab_report", "vaccine_card", "pregnancy_document", "baby_child_document", ...ALL_GENERAL],
    description: "Source files, notes, reports, and review copies.",
    key: "records",
    label: "Records",
    requiresReview: true,
    routeTarget: "/records",
    saveHandlerKey: "appAI:records",
    sensitive: true,
  },
  {
    allowedImportTypes: ["workout_plan", "exercise", "gym_machine"],
    description: "Workout plans, exercises, equipment, and schedules.",
    key: "fitness",
    label: "Fitness",
    requiresReview: true,
    routeTarget: "/fitness",
    saveHandlerKey: "appAI:fitness",
    sensitive: false,
  },
  {
    allowedImportTypes: ["meal_plan", "medication", "supplement", "doctor_note", "vaccine_card", "workout_plan", "pregnancy_document", "baby_child_document", "calendar_event"],
    description: "Appointments, reminders, events, and plan scheduling.",
    key: "calendar",
    label: "Calendar",
    requiresReview: true,
    routeTarget: "/(tabs)/calendar",
    saveHandlerKey: "appAI:calendar",
    sensitive: false,
  },
  {
    allowedImportTypes: ["pregnancy_document", "doctor_note", "calendar_event"],
    description: "Pregnancy documents, dates, appointments, and notes.",
    key: "pregnancy",
    label: "Pregnancy",
    requiresReview: true,
    routeTarget: "/pregnancy",
    sensitive: true,
  },
  {
    allowedImportTypes: ["baby_child_document", "vaccine_card", "doctor_note", "calendar_event"],
    description: "Child documents, vaccine cards, notes, and follow-ups.",
    key: "babyChild",
    label: "Baby / Child",
    requiresReview: true,
    routeTarget: "/baby-child",
    sensitive: true,
  },
  {
    allowedImportTypes: ["cycle_note", "symptom_note", "calendar_event"],
    description: "Cycle, symptoms, mood, contraception, and privacy-sensitive notes.",
    key: "womensHealth",
    label: "Women's Health",
    requiresReview: true,
    routeTarget: "/cycle",
    sensitive: true,
  },
  {
    allowedImportTypes: ["family_note", "meal_plan", "calendar_event"],
    description: "Family notes and sharing candidates. Sharing is never automatic.",
    key: "family",
    label: "Family",
    requiresReview: true,
    routeTarget: "/circle",
    sensitive: true,
  },
  {
    allowedImportTypes: ["medical_record", "lab_report", "symptom_note", "doctor_note", ...ALL_GENERAL],
    description: "General health notes, biometrics context, and source-backed summaries.",
    key: "health",
    label: "Health",
    requiresReview: true,
    routeTarget: "/health",
    sensitive: true,
  },
  {
    allowedImportTypes: [...ALL_GENERAL],
    description: "General dashboard context only.",
    key: "home",
    label: "Home",
    requiresReview: true,
    routeTarget: "/(tabs)/today",
    sensitive: false,
  },
  {
    allowedImportTypes: ["unknown"],
    description: "Do not import. Keep as reviewed note or discard.",
    key: "none",
    label: "Do not import",
    requiresReview: true,
    sensitive: false,
  },
];

export function getAIImportTargetConfig(target: string) {
  return HEALTHOS_AI_IMPORT_TARGETS.find((item) => item.key === target) ?? null;
}

export function getAllowedTargetsForImportType(importType: string) {
  return HEALTHOS_AI_IMPORT_TARGETS.filter((target) =>
    target.allowedImportTypes.includes(importType as never),
  );
}
