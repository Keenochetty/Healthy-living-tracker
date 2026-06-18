import { Alert, Linking } from "react-native";
import { Href, router } from "expo-router";

import {
  completeHealthReminder,
  rescheduleReminder,
  snoozeHealthReminder,
} from "@/services/reminders/reminderEngine";
import {
  requestNotificationPermission,
  updateNotificationSettings,
  updateReminderCategorySettings,
} from "@/services/reminders/notificationService";
import type { ReminderCategory } from "@/types/healthTimeline";

import type { HealthOSReminderDisplayItem } from "@/features/reminders";

type Options = {
  onRefresh: () => Promise<void>;
};

export function useHealthOSNotificationsActions({ onRefresh }: Options) {
  async function enableNotifications() {
    await requestNotificationPermission();
    await onRefresh();
  }

  async function openDeviceSettings() {
    await Linking.openSettings();
  }

  function openReminder(item: HealthOSReminderDisplayItem) {
    if (item.routeTarget) {
      router.push(item.routeTarget as Href);
      return;
    }
    router.push(`/reminders/${item.id}` as Href);
  }

  async function markDone(item: HealthOSReminderDisplayItem) {
    await completeHealthReminder(item.id);
    await onRefresh();
  }

  async function snooze(item: HealthOSReminderDisplayItem, minutes = 30) {
    await snoozeHealthReminder(item.id, minutes);
    await onRefresh();
  }

  async function rescheduleTomorrow(item: HealthOSReminderDisplayItem) {
    const next = new Date();
    next.setDate(next.getDate() + 1);
    next.setHours(9, 0, 0, 0);
    await rescheduleReminder(item.id, next.toISOString());
    await onRefresh();
  }

  function dismiss() {
    Alert.alert(
      "Dismiss not connected",
      "Reminder deletion is intentionally kept out of the center until a confirmation flow is added.",
    );
  }

  async function updateCategoryNotification(
    category: ReminderCategory,
    notificationEnabled: boolean,
  ) {
    await updateReminderCategorySettings(category, { notificationEnabled });
    await onRefresh();
  }

  async function updateCategoryQuickActions(
    category: ReminderCategory,
    quickActionsEnabled: boolean,
  ) {
    await updateReminderCategorySettings(category, { quickActionsEnabled });
    await onRefresh();
  }

  async function updateQuietHours(enabled: boolean) {
    await updateNotificationSettings({ quietHoursEnabled: enabled });
    await onRefresh();
  }

  function registerPushToken() {
    Alert.alert(
      "Push registration deferred",
      "Remote push tokens are not configured. Local notification settings remain available.",
    );
  }

  function saveReviewedReminder() {
    Alert.alert(
      "Review required",
      "This preview does not save or schedule automatically. A reviewed reminder save flow can be connected next.",
    );
  }

  return {
    dismiss,
    enableNotifications,
    markDone,
    openDeviceSettings,
    openReminder,
    registerPushToken,
    rescheduleTomorrow,
    saveReviewedReminder,
    snooze,
    updateCategoryNotification,
    updateCategoryQuickActions,
    updateQuietHours,
  };
}
