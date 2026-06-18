import type { ReminderCategory } from "@/types/healthTimeline";

const MEDICAL_CONFIRMATION_CATEGORIES = new Set<ReminderCategory>([
  "medication",
  "supplement",
  "contraception",
  "baby_medicine",
  "pregnancy",
  "records",
  "lab_follow_up",
  "prescription_refill",
  "vaccine",
]);

export function requiresReminderReview(category: ReminderCategory) {
  return MEDICAL_CONFIRMATION_CATEGORIES.has(category);
}

export function canScheduleReminderCandidate(input: {
  category: ReminderCategory;
  confirmed: boolean;
  dueAt?: string;
}) {
  return Boolean(
    input.confirmed &&
      input.dueAt &&
      !Number.isNaN(new Date(input.dueAt).getTime()),
  );
}

export function getReminderSafetyNotes(category: ReminderCategory) {
  if (requiresReminderReview(category)) {
    return [
      "Review the title, time, category, and linked record before saving.",
      "HealthSync does not create medical reminders silently from AI output.",
      "Medication and baby medicine reminders should follow professional or label guidance.",
    ];
  }
  return [
    "Review the reminder before saving.",
    "You can change notification detail and quiet-hour behavior in category settings.",
  ];
}

export const HEALTHOS_REMINDER_LOCK_SCREEN_RULES = [
  "Use privacy-safe titles by default.",
  "Do not show medication names, doses, test results, pregnancy details, or child details on the lock screen unless the user changes notification detail level.",
  "Shared caregiver and family visibility stays off unless existing reminder data explicitly allows it.",
];
