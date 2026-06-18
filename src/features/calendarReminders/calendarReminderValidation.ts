import { isSensitiveReminderCategory } from "./calendarReminderPrivacy";
import type {
  HealthOSCalendarEventType,
  HealthOSReminder,
  HealthOSReminderCategory,
  HealthOSReminderStatus,
} from "./calendarReminderTypes";

const EVENT_TYPES: HealthOSCalendarEventType[] = [
  "general",
  "appointment",
  "medication",
  "supplement",
  "pregnancy",
  "babyChild",
  "womensHealth",
  "fitness",
  "nutrition",
  "records",
  "family",
  "caregiver",
  "aiImportReview",
  "health",
  "other",
];

const REMINDER_CATEGORIES: HealthOSReminderCategory[] = [
  "medication",
  "supplements",
  "calendar",
  "pregnancy",
  "babyChild",
  "womensHealth",
  "family",
  "caregiver",
  "records",
  "aiImport",
  "fitness",
  "nutrition",
  "security",
  "general",
];

const REMINDER_STATUSES: HealthOSReminderStatus[] = [
  "draft",
  "needsReview",
  "scheduled",
  "localScheduled",
  "pushPending",
  "due",
  "completed",
  "missed",
  "snoozed",
  "skipped",
  "dismissed",
  "cancelled",
  "failed",
  "deferred",
  "unknown",
];

export type ValidationResult = { error: string; valid: false } | { error: null; valid: true };

export function validateCalendarEventTitle(title?: string | null): ValidationResult {
  return title?.trim() ? valid() : invalid("Calendar event title is required.");
}

export function validateCalendarEventTimeRange(startAt?: string | null, endAt?: string | null): ValidationResult {
  if (!startAt || Number.isNaN(new Date(startAt).getTime())) return invalid("Calendar event start time is required.");
  if (endAt && new Date(endAt).getTime() < new Date(startAt).getTime()) {
    return invalid("Calendar event end time cannot be before start time.");
  }
  return valid();
}

export function validateCalendarEventType(type?: string | null): ValidationResult {
  return EVENT_TYPES.includes(type as HealthOSCalendarEventType) ? valid() : invalid("Calendar event type is not supported.");
}

export function validateReminderTitle(title?: string | null): ValidationResult {
  return title?.trim() ? valid() : invalid("Reminder title is required.");
}

export function validateReminderSchedule(reminder: Pick<HealthOSReminder, "scheduledFor" | "status">): ValidationResult {
  if (!["scheduled", "localScheduled", "pushPending"].includes(reminder.status)) return valid();
  if (!reminder.scheduledFor || Number.isNaN(new Date(reminder.scheduledFor).getTime())) {
    return invalid("A scheduled reminder needs a valid scheduled time.");
  }
  return valid();
}

export function validateReminderCategory(category?: string | null): ValidationResult {
  return REMINDER_CATEGORIES.includes(category as HealthOSReminderCategory) ? valid() : invalid("Reminder category is not supported.");
}

export function validateReminderStatus(status?: string | null): ValidationResult {
  return REMINDER_STATUSES.includes(status as HealthOSReminderStatus) ? valid() : invalid("Reminder status is not supported.");
}

export function validateReminderReviewBeforeScheduling(
  reminder: Pick<HealthOSReminder, "category" | "reviewRequired" | "reviewedAt" | "scheduledFor" | "status">,
): ValidationResult {
  const schedule = validateReminderSchedule(reminder);
  if (!schedule.valid) return schedule;
  if (["scheduled", "localScheduled"].includes(reminder.status) && reminder.reviewRequired && !reminder.reviewedAt) {
    return invalid("Review this reminder before scheduling.");
  }
  if (["scheduled", "localScheduled"].includes(reminder.status) && isSensitiveReminderCategory(reminder.category) && !reminder.reviewedAt) {
    return invalid("Sensitive reminders require review before scheduling.");
  }
  return valid();
}

export function validateNotificationCopyPrivacy(
  category: HealthOSReminderCategory,
  titlePrivacySafe?: string | null,
): ValidationResult {
  if (!titlePrivacySafe?.trim()) return invalid("A privacy-safe notification title is required.");
  if (!isSensitiveReminderCategory(category)) return valid();
  const lower = titlePrivacySafe.toLowerCase();
  const unsafeFragments = ["dose", "period", "lab result", "diagnosis", "pregnancy test"];
  return unsafeFragments.some((fragment) => lower.includes(fragment))
    ? invalid("Notification title may include sensitive details.")
    : valid();
}

function valid(): ValidationResult {
  return { error: null, valid: true };
}

function invalid(error: string): ValidationResult {
  return { error, valid: false };
}
