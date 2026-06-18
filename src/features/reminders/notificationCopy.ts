import type { ReminderCategory } from "@/types/healthTimeline";

import { getReminderCategoryConfig } from "./reminderCategories";

export const HEALTHOS_NOTIFICATION_PRIVACY_COPY =
  "Lock-screen notification text stays privacy-safe by default. Sensitive categories avoid names, doses, results, and private details unless the user explicitly changes the detail level.";

export function getPrivacySafeNotificationTitle(category: ReminderCategory) {
  const config = getReminderCategoryConfig(category);
  if (config.sensitive) return "Health reminder";
  return `${config.label} reminder`;
}

export function getPrivacySafeNotificationSubtitle(category: ReminderCategory) {
  const config = getReminderCategoryConfig(category);
  if (config.sensitive) return "Open HealthSync to review this private reminder.";
  return "Open HealthSync when you are ready.";
}

export function sanitizeReminderOverview(value?: string) {
  if (!value) return "Reminder details stay private until opened.";
  return value.length > 90 ? `${value.slice(0, 87).trim()}...` : value;
}
