import { Platform } from "react-native";

import type { AppReminder } from "@/types/reminders";

type ExpoNotificationsModule = typeof import("expo-notifications");

let notificationsConfigured = false;
let notificationsModule: ExpoNotificationsModule | null = null;

async function loadNotifications() {
  if (notificationsModule) {
    return notificationsModule;
  }

  try {
    notificationsModule = await import("expo-notifications");

    return notificationsModule;
  } catch {
    return null;
  }
}

export async function configureNotifications() {
  if (notificationsConfigured) {
    return true;
  }

  const Notifications = await loadNotifications();

  if (!Notifications) {
    return false;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true
    })
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("reminders", {
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: "#8b5cf6",
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      name: "Reminders"
    });
  }

  notificationsConfigured = true;

  return true;
}

export async function requestNotificationPermission() {
  const configured = await configureNotifications();

  if (!configured) {
    return false;
  }

  const Notifications = await loadNotifications();

  if (!Notifications) {
    return false;
  }

  const currentPermissions = await Notifications.getPermissionsAsync();

  if (
    currentPermissions.granted ||
    currentPermissions.ios?.status ===
      Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return true;
  }

  const requestedPermissions = await Notifications.requestPermissionsAsync();

  return (
    requestedPermissions.granted ||
    requestedPermissions.ios?.status ===
      Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

function getNotificationBody(reminder: AppReminder) {
  if (reminder.type === "medication") {
    return "Medication reminder. Please follow your healthcare professional's instructions.";
  }

  return "Reminder from your health and care planner.";
}

export async function scheduleReminderNotification(reminder: AppReminder) {
  if (!reminder.notify) {
    return null;
  }

  const allowed = await requestNotificationPermission();

  if (!allowed) {
    return null;
  }

  const dueAt = new Date(reminder.dueAt);

  if (dueAt.getTime() <= Date.now()) {
    return null;
  }

  const Notifications = await loadNotifications();

  if (!Notifications) {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      body: getNotificationBody(reminder),
      data: {
        reminderId: reminder.id,
        type: reminder.type
      },
      title: reminder.title
    },
    trigger: {
      channelId: Platform.OS === "android" ? "reminders" : undefined,
      date: dueAt,
      type: Notifications.SchedulableTriggerInputTypes.DATE
    }
  });
}

export async function scheduleMedicationNotification(reminder: AppReminder) {
  if (!reminder.notify) {
    return null;
  }

  const allowed = await requestNotificationPermission();

  if (!allowed) {
    return null;
  }

  const dueAt = new Date(reminder.dueAt);

  if (dueAt.getTime() <= Date.now()) {
    return null;
  }

  const Notifications = await loadNotifications();

  if (!Notifications) {
    return null;
  }

  const medicationName =
    typeof reminder.metadata?.medicationName === "string"
      ? reminder.metadata.medicationName
      : reminder.title.replace("Medication: ", "");

  return Notifications.scheduleNotificationAsync({
    content: {
      body: `${medicationName}. Follow your healthcare professional's instructions.`,
      data: {
        medicationId: reminder.linkedEntityId,
        reminderId: reminder.id,
        type: reminder.type
      },
      title: "Medication reminder"
    },
    trigger: {
      channelId: Platform.OS === "android" ? "reminders" : undefined,
      date: dueAt,
      type: Notifications.SchedulableTriggerInputTypes.DATE
    }
  });
}

export async function cancelReminderNotification(notificationId?: string | null) {
  if (!notificationId) {
    return;
  }

  const Notifications = await loadNotifications();

  if (!Notifications) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function rescheduleReminderNotification(reminder: AppReminder) {
  await cancelReminderNotification(reminder.notificationId);

  return scheduleReminderNotification(reminder);
}
