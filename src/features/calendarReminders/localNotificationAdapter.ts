import { Linking } from "react-native";

import {
  cancelLocalNotification,
  getNotificationPermissionStatus as getExistingNotificationPermissionStatus,
  requestNotificationPermission,
  scheduleLocalNotification,
} from "@/services/reminders/notificationService";
import type { ReminderCategory } from "@/types/healthTimeline";

import { getPrivacySafeNotificationBody } from "./calendarReminderPrivacy";
import { validateNotificationCopyPrivacy, validateReminderReviewBeforeScheduling } from "./calendarReminderValidation";
import type {
  HealthOSCalendarReminderServiceResult,
  HealthOSReminder,
  HealthOSReminderCategory,
} from "./calendarReminderTypes";

export async function getNotificationPermissionStatus(): Promise<HealthOSCalendarReminderServiceResult<string>> {
  const status = await getExistingNotificationPermissionStatus();
  return { data: status, error: null, status: status === "unavailable" ? "notificationDeferred" : "ready" };
}

export async function requestNotificationPermissionByUserAction(): Promise<HealthOSCalendarReminderServiceResult<string>> {
  const status = await requestNotificationPermission();
  return { data: status, error: null, status: status === "unavailable" ? "notificationDeferred" : "ready" };
}

export async function scheduleLocalReminderNotification(
  reminder: HealthOSReminder,
): Promise<HealthOSCalendarReminderServiceResult<string>> {
  const review = validateReminderReviewBeforeScheduling({ ...reminder, status: "localScheduled" });
  if (!review.valid) return { data: null, error: review.error, status: "error" };
  const copy = validateNotificationCopyPrivacy(reminder.category, reminder.titlePrivacySafe);
  if (!copy.valid) return { data: null, error: copy.error, status: "error" };
  if (!reminder.id || !reminder.scheduledFor) {
    return { data: null, error: "Reminder ID and scheduled time are required.", status: "error" };
  }

  const record = await scheduleLocalNotification({
    body: getPrivacySafeNotificationBody(reminder.category),
    category: toLegacyReminderCategory(reminder.category),
    data: {
      reminderId: reminder.id,
      sourceRealm: reminder.sourceRealm,
    },
    detailLevel: "private",
    reminderId: reminder.id,
    route: "/reminders",
    scheduledAt: reminder.scheduledFor,
    title: reminder.titlePrivacySafe,
  });

  return {
    data: record.notificationId ?? null,
    error: record.errorMessage ?? null,
    status: record.notificationId ? "ready" : "notificationDeferred",
  };
}

export async function cancelLocalReminderNotification(notificationId?: string | null) {
  if (!notificationId) {
    return { data: null, error: null, status: "ready" } satisfies HealthOSCalendarReminderServiceResult<null>;
  }
  await cancelLocalNotification(notificationId);
  return { data: notificationId, error: null, status: "ready" } satisfies HealthOSCalendarReminderServiceResult<string>;
}

export async function openNotificationSettings() {
  await Linking.openSettings();
}

function toLegacyReminderCategory(category: HealthOSReminderCategory): ReminderCategory {
  switch (category) {
    case "medication":
      return "medication";
    case "supplements":
      return "supplement";
    case "pregnancy":
      return "pregnancy";
    case "babyChild":
      return "baby_medicine";
    case "womensHealth":
      return "womens_health";
    case "fitness":
      return "workout";
    case "nutrition":
      return "food_meal";
    case "records":
      return "records";
    case "family":
    case "caregiver":
      return "family_caregiver";
    default:
      return "custom";
  }
}
