import type {
  HealthOSCalendarEventType,
  HealthOSReminderCategory,
  HealthOSReminderStatus,
} from "./calendarReminderTypes";

const SENSITIVE_EVENT_TYPES = new Set<HealthOSCalendarEventType>([
  "medication",
  "supplement",
  "pregnancy",
  "babyChild",
  "womensHealth",
  "records",
  "caregiver",
  "aiImportReview",
  "health",
  "other",
]);

const SENSITIVE_REMINDER_CATEGORIES = new Set<HealthOSReminderCategory>([
  "medication",
  "supplements",
  "pregnancy",
  "babyChild",
  "womensHealth",
  "caregiver",
  "records",
  "aiImport",
  "security",
  "general",
]);

export function isSensitiveCalendarEventType(type?: string | null) {
  if (!type) return true;
  return SENSITIVE_EVENT_TYPES.has(type as HealthOSCalendarEventType);
}

export function isSensitiveReminderCategory(category?: string | null) {
  if (!category) return true;
  return SENSITIVE_REMINDER_CATEGORIES.has(category as HealthOSReminderCategory);
}

export function requiresReminderReview(category?: string | null, sourceRealm?: string | null) {
  if (sourceRealm === "aiImport" || sourceRealm === "scan") return true;
  return isSensitiveReminderCategory(category);
}

export function getPrivacySafeReminderTitle(
  category?: string | null,
  proposedTitle?: string | null,
) {
  if (!isSensitiveReminderCategory(category) && proposedTitle?.trim()) {
    return proposedTitle.trim();
  }

  switch (category) {
    case "medication":
      return "Medication reminder";
    case "supplements":
      return "Supplement reminder";
    case "pregnancy":
      return "Pregnancy reminder";
    case "babyChild":
      return "Baby care reminder";
    case "womensHealth":
      return "Private health reminder";
    case "records":
      return "Health record reminder";
    case "caregiver":
    case "family":
      return "Family health reminder";
    case "fitness":
      return proposedTitle?.trim() || "Fitness reminder";
    case "nutrition":
      return proposedTitle?.trim() || "Nutrition reminder";
    default:
      return "Health reminder";
  }
}

export function getPrivacySafeNotificationBody(category?: string | null) {
  switch (category) {
    case "medication":
      return "Review your medication reminder.";
    case "supplements":
      return "Review your supplement reminder.";
    case "pregnancy":
    case "babyChild":
    case "womensHealth":
    case "records":
      return "You have a private health reminder.";
    default:
      return "You have a health reminder.";
  }
}

export function canShowCalendarDetailsInSharedContext(type?: string | null) {
  return !isSensitiveCalendarEventType(type);
}

export function canShowReminderDetailsInSharedContext(category?: string | null) {
  return !isSensitiveReminderCategory(category);
}

export function getReminderPrivacyLabel(category?: string | null) {
  return isSensitiveReminderCategory(category) ? "Private" : "Shareable";
}

export function getCalendarEventTypeLabel(type?: string | null) {
  return titleize(type ?? "general");
}

export function getReminderCategoryLabel(category?: string | null) {
  return titleize(category ?? "general");
}

export function isTerminalReminderStatus(status: HealthOSReminderStatus) {
  return ["cancelled", "completed", "dismissed", "failed", "skipped"].includes(status);
}

function titleize(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()).trim();
}
