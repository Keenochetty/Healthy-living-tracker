import type { HealthOSReminder } from "./calendarReminderTypes";

const SIMPLE_REPEAT_RULES = new Set(["none", "daily", "weekly", "monthly", "yearly"]);

export function normalizeRepeatRule(value?: string | null) {
  const normalized = value?.trim().toLowerCase();
  return normalized && SIMPLE_REPEAT_RULES.has(normalized) ? normalized : "none";
}

export function getRepeatRuleLabel(value?: string | null) {
  switch (normalizeRepeatRule(value)) {
    case "daily":
      return "Daily";
    case "weekly":
      return "Weekly";
    case "monthly":
      return "Monthly";
    case "yearly":
      return "Yearly";
    default:
      return "Does not repeat";
  }
}

export function isValidRepeatRule(value?: string | null) {
  return SIMPLE_REPEAT_RULES.has(normalizeRepeatRule(value));
}

export function getNextReminderOccurrence(reminder: Pick<HealthOSReminder, "repeatRule" | "scheduledFor">) {
  if (!reminder.scheduledFor) return null;
  const scheduled = new Date(reminder.scheduledFor);
  if (Number.isNaN(scheduled.getTime())) return null;
  const next = new Date(scheduled);
  switch (normalizeRepeatRule(reminder.repeatRule)) {
    case "daily":
      next.setDate(next.getDate() + 1);
      return next.toISOString();
    case "weekly":
      next.setDate(next.getDate() + 7);
      return next.toISOString();
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      return next.toISOString();
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      return next.toISOString();
    default:
      return null;
  }
}

export function isReminderDue(reminder: Pick<HealthOSReminder, "scheduledFor" | "status">, at = new Date()) {
  if (!reminder.scheduledFor || reminder.status === "cancelled" || reminder.status === "completed") return false;
  const scheduled = new Date(reminder.scheduledFor);
  return !Number.isNaN(scheduled.getTime()) && scheduled.getTime() <= at.getTime();
}

export function isReminderOverdue(reminder: Pick<HealthOSReminder, "scheduledFor" | "status">, at = new Date()) {
  if (!isReminderDue(reminder, at)) return false;
  const scheduled = new Date(reminder.scheduledFor as string);
  return at.getTime() - scheduled.getTime() > 60 * 60 * 1000;
}
