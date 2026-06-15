import type {
  CaregiverRateType,
  CaregiverServiceType,
  CaregiverUpdateNote,
} from "@/types/caregiver";

export const CAREGIVER_SERVICE_OPTIONS: Array<{
  description: string;
  emoji: string;
  key: CaregiverServiceType;
  label: string;
}> = [
  {
    description: "General child support.",
    emoji: "Child",
    key: "child_care",
    label: "Child care",
  },
  {
    description: "Baby routines and care notes.",
    emoji: "Baby",
    key: "baby_care",
    label: "Baby care",
  },
  {
    description: "Support for older loved ones.",
    emoji: "Elder",
    key: "elder_care",
    label: "Elder care",
  },
  {
    description: "Extra support needs.",
    emoji: "Care",
    key: "special_needs",
    label: "Special needs",
  },
  {
    description: "School pickup coordination.",
    emoji: "Pickup",
    key: "school_pickup",
    label: "School pickup",
  },
  {
    description: "Reminder support only.",
    emoji: "Reminder",
    key: "medication_reminder_support",
    label: "Medication reminder support",
  },
  {
    description: "Meals and food updates.",
    emoji: "Meal",
    key: "meal_support",
    label: "Meal support",
  },
  {
    description: "Movement support notes.",
    emoji: "Mobility",
    key: "mobility_support",
    label: "Mobility support",
  },
  {
    description: "Homework and study support.",
    emoji: "Study",
    key: "homework_support",
    label: "Homework support",
  },
  {
    description: "Overnight care planning.",
    emoji: "Night",
    key: "overnight_care",
    label: "Overnight care",
  },
  {
    description: "General family care support.",
    emoji: "General",
    key: "general_care",
    label: "General care",
  },
];

export const CAREGIVER_RATE_TYPE_LABELS: Record<CaregiverRateType, string> = {
  custom: "custom",
  daily: "daily",
  hourly: "hourly",
  monthly: "monthly",
  weekly: "weekly",
};

export const DEFAULT_CAREGIVER_PERMISSION_LABELS = [
  "view_assigned_schedule",
  "add_care_notes",
  "check_in_out",
  "send_parent_updates",
  "view_emergency_contact_placeholder",
];

export const CAREGIVER_UPDATE_NOTE_TYPES: Array<{
  key: CaregiverUpdateNote["noteType"];
  label: string;
}> = [
  { key: "activity", label: "Activity" },
  { key: "meal", label: "Meal" },
  { key: "mood", label: "Mood" },
  { key: "milestone", label: "Milestone" },
  { key: "incident", label: "Incident" },
  { key: "pickup", label: "Pickup" },
  { key: "dropoff", label: "Dropoff" },
  { key: "general", label: "General" },
];

export const CAREGIVER_DISCLAIMER =
  "Caregiver profiles help families organise care and communication. Always verify caregiver details, experience and suitability yourself.";

export const CAREGIVER_PRIVACY_DISCLAIMER =
  "Caregivers only get access to information approved by the parent or adult being cared for.";

export function getCaregiverServiceLabel(service: CaregiverServiceType) {
  return (
    CAREGIVER_SERVICE_OPTIONS.find((option) => option.key === service)?.label ??
    service
  );
}
