import {
  cancelLocalNotification,
  initializeNotifications,
  requestNotificationPermission as requestCentralNotificationPermission,
  scheduleLocalNotification
} from "@/services/reminders/notificationService";
import type { AppReminder } from "@/types/reminders";

export async function configureNotifications() {
  return initializeNotifications();
}

export async function requestNotificationPermission() {
  const status = await requestCentralNotificationPermission();
  return status === "granted" || status === "provisional";
}

export async function scheduleReminderNotification(reminder: AppReminder) {
  if (!reminder.notify) return null;

  const record = await scheduleLocalNotification({
    body: getLegacyNotificationBody(reminder),
    category: reminder.type === "medication" ? "medication" : reminder.type === "fitness" ? "workout" : reminder.type === "food" ? "food_meal" : "custom",
    detailLevel: reminder.type === "medication" ? "category" : "detailed",
    params: { reminderId: reminder.id },
    reminderId: reminder.id,
    route: `/reminders/${reminder.id}`,
    scheduledAt: reminder.dueAt,
    title: reminder.type === "medication" ? "Medication reminder" : reminder.title
  });

  return record.notificationId ?? null;
}

export async function scheduleMedicationNotification(reminder: AppReminder) {
  return scheduleReminderNotification(reminder);
}

export async function cancelReminderNotification(notificationId?: string | null) {
  if (!notificationId) return null;
  return cancelLocalNotification(notificationId);
}

export async function rescheduleReminderNotification(reminder: AppReminder) {
  await cancelReminderNotification(reminder.notificationId);
  return scheduleReminderNotification(reminder);
}

function getLegacyNotificationBody(reminder: AppReminder) {
  if (reminder.type === "medication") {
    return "Medication reminder. Always follow your prescription label or healthcare professional's instructions.";
  }

  return "Reminder from your health and care planner.";
}
