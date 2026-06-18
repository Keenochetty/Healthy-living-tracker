import type {
  HealthReminder,
  ReminderActionLog,
  ScheduledNotificationRecord,
} from "@/types/healthTimeline";

import { getReminderCategoryConfig } from "./reminderCategories";
import type {
  HealthOSReminderDisplayItem,
  HealthOSReminderHistoryItem,
  HealthOSTodayReminderSummary,
} from "./types";

export function normalizeHealthReminder(
  reminder: HealthReminder,
): HealthOSReminderDisplayItem {
  const category = reminder.category ?? "custom";
  const config = getReminderCategoryConfig(category);
  const dueAt = reminder.snoozedUntil ?? reminder.dueAt;

  return {
    category,
    categoryLabel: config.label,
    dueLabel: formatReminderDueLabel(dueAt),
    id: reminder.id,
    isPrivate: reminder.lockedPrivate || reminder.isPrivate,
    notes: reminder.notes,
    notificationEnabled: reminder.notificationEnabled,
    rawDueAt: dueAt,
    routeTarget: reminder.route ?? config.routeTarget,
    sourceLabel: reminder.sourceRealm ?? reminder.source,
    status: reminder.status,
    statusLabel: statusLabel(reminder.status),
    title: reminder.lockedPrivate ? config.label : reminder.title,
  };
}

export function normalizeReminderHistory(
  actionLogs: ReminderActionLog[],
  notificationRecords: ScheduledNotificationRecord[],
): HealthOSReminderHistoryItem[] {
  const actions = actionLogs.map((log) => ({
    action: log.action,
    createdAt: log.createdAt,
    id: log.id,
    reminderId: log.reminderId,
    source: "action" as const,
    title: actionTitle(log.action),
  }));
  const notifications = notificationRecords.map((record) => ({
    action: record.status,
    createdAt: record.updatedAt ?? record.createdAt,
    id: record.id,
    reminderId: record.reminderId,
    source: "notification" as const,
    title: record.status === "failed" ? "Notification not scheduled" : `Notification ${record.status}`,
  }));

  return [...actions, ...notifications]
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    )
    .slice(0, 12);
}

export function summarizeTodayReminders(
  items: HealthOSReminderDisplayItem[],
): HealthOSTodayReminderSummary {
  const active = items.filter(
    (item) =>
      item.status === "due" ||
      item.status === "missed" ||
      item.status === "snoozed" ||
      item.status === "upcoming",
  );
  return {
    completedCount: items.filter((item) => item.status === "completed").length,
    dueCount: items.filter((item) => item.status === "due").length,
    nextItem: active[0],
    overdueCount: items.filter((item) => item.status === "missed").length,
    totalCount: items.length,
  };
}

export function filterReminderItems(
  items: HealthOSReminderDisplayItem[],
  filter: string,
) {
  switch (filter) {
    case "due":
      return items.filter(
        (item) => item.status === "due" || item.status === "missed",
      );
    case "today":
      return items.filter((item) => isToday(item.rawDueAt));
    case "upcoming":
      return items.filter(
        (item) => item.status === "upcoming" || item.status === "snoozed",
      );
    case "scheduled":
      return items.filter((item) => item.notificationEnabled);
    default:
      return items;
  }
}

export function normalizeUnknownReminder() {
  return [];
}

function statusLabel(status: HealthReminder["status"]) {
  switch (status) {
    case "due":
      return "Due";
    case "missed":
      return "Needs attention";
    case "snoozed":
      return "Snoozed";
    case "completed":
      return "Done";
    case "skipped":
      return "Skipped";
    case "paused":
      return "Paused";
    case "cancelled":
      return "Cancelled";
    default:
      return "Upcoming";
  }
}

function actionTitle(action: ReminderActionLog["action"]) {
  switch (action) {
    case "completed":
    case "taken":
      return "Marked complete";
    case "snoozed":
      return "Snoozed";
    case "rescheduled":
      return "Rescheduled";
    case "opened":
      return "Opened";
    case "skipped":
      return "Skipped";
    default:
      return "Dismissed";
  }
}

function formatReminderDueLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No time set";
  return date.toLocaleString(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  });
}

function isToday(value: string) {
  const date = new Date(value);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}
