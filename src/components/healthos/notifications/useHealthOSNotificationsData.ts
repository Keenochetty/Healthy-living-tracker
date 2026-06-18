import { useCallback, useEffect, useMemo, useState } from "react";

import {
  filterReminderItems,
  getReminderCategoryConfig,
  normalizeHealthReminder,
  normalizeReminderHistory,
  summarizeTodayReminders,
  type HealthOSCategoryPreference,
  type HealthOSDevicePushStatus,
  type HealthOSNotificationPermissionDisplay,
  type HealthOSQuietHoursDisplay,
  type HealthOSReminderDisplayItem,
  type HealthOSReminderFilterKey,
  type HealthOSReminderHistoryItem,
  type HealthOSReminderReviewCandidate,
  type HealthOSTodayReminderSummary,
} from "@/features/reminders";
import {
  getHealthReminders,
  getOverdueReminders,
  getRemindersForDate,
  getUpcomingReminders,
  updateOverdueReminders,
} from "@/services/reminders/reminderEngine";
import {
  getNotificationPermissionStatus,
  getNotificationSettings,
  getReminderActionLogs,
  getReminderCategorySettings,
  getScheduledNotificationRecords,
} from "@/services/reminders/notificationService";
import type {
  NotificationSettings,
  ReminderCategorySettings,
  ScheduledNotificationRecord,
} from "@/types/healthTimeline";

export type HealthOSUpcomingReminderSection = {
  dateLabel: string;
  items: HealthOSReminderDisplayItem[];
};

export type HealthOSNotificationsData = {
  activeFilter: HealthOSReminderFilterKey;
  categoryPreferences: HealthOSCategoryPreference[];
  devicePushStatus: HealthOSDevicePushStatus;
  error?: string;
  filteredInboxItems: HealthOSReminderDisplayItem[];
  history: HealthOSReminderHistoryItem[];
  inboxItems: HealthOSReminderDisplayItem[];
  loading: boolean;
  needsReviewQueue: HealthOSReminderReviewCandidate[];
  permission: HealthOSNotificationPermissionDisplay;
  quietHours: HealthOSQuietHoursDisplay;
  scheduledRecords: ScheduledNotificationRecord[];
  setActiveFilter: (filter: HealthOSReminderFilterKey) => void;
  settings?: NotificationSettings;
  todaySummary: HealthOSTodayReminderSummary;
  upcomingSections: HealthOSUpcomingReminderSection[];
  refresh: () => Promise<void>;
};

export function useHealthOSNotificationsData(): HealthOSNotificationsData {
  const [activeFilter, setActiveFilter] =
    useState<HealthOSReminderFilterKey>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [items, setItems] = useState<HealthOSReminderDisplayItem[]>([]);
  const [todayItems, setTodayItems] = useState<HealthOSReminderDisplayItem[]>([]);
  const [upcomingItems, setUpcomingItems] = useState<HealthOSReminderDisplayItem[]>([]);
  const [needsReviewQueue] = useState<HealthOSReminderReviewCandidate[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>();
  const [categorySettings, setCategorySettings] = useState<
    ReminderCategorySettings[]
  >([]);
  const [scheduledRecords, setScheduledRecords] = useState<
    ScheduledNotificationRecord[]
  >([]);
  const [history, setHistory] = useState<HealthOSReminderHistoryItem[]>([]);
  const [permission, setPermission] =
    useState<HealthOSNotificationPermissionDisplay>(
      permissionDisplay("not_requested"),
    );

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);
      await updateOverdueReminders();
      const [
        allReminders,
        today,
        upcoming,
        overdue,
        permissionStatus,
        notificationSettings,
        categoryPrefs,
        notificationRecords,
        actionLogs,
      ] = await Promise.all([
        getHealthReminders(),
        getRemindersForDate(new Date()),
        getUpcomingReminders(30),
        getOverdueReminders(),
        getNotificationPermissionStatus(),
        getNotificationSettings(),
        getReminderCategorySettings(),
        getScheduledNotificationRecords(),
        getReminderActionLogs(),
      ]);
      const merged = mergeById([...overdue, ...today, ...upcoming, ...allReminders]);
      setItems(merged.map(normalizeHealthReminder));
      setTodayItems(today.map(normalizeHealthReminder));
      setUpcomingItems(upcoming.map(normalizeHealthReminder));
      setPermission(permissionDisplay(permissionStatus));
      setSettings(notificationSettings);
      setCategorySettings(categoryPrefs);
      setScheduledRecords(notificationRecords);
      setHistory(normalizeReminderHistory(actionLogs, notificationRecords));
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Reminder Center could not load right now.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredInboxItems = useMemo(
    () => filterReminderItems(items, activeFilter),
    [activeFilter, items],
  );
  const todaySummary = useMemo(
    () => summarizeTodayReminders(todayItems),
    [todayItems],
  );
  const upcomingSections = useMemo(
    () => groupUpcomingSections(upcomingItems),
    [upcomingItems],
  );
  const categoryPreferences = useMemo(
    () =>
      categorySettings.map((item) => ({
        config: getReminderCategoryConfig(item.category),
        settings: item,
      })),
    [categorySettings],
  );

  return {
    activeFilter,
    categoryPreferences,
    devicePushStatus: getDevicePushStatus(permission.status),
    error,
    filteredInboxItems,
    history,
    inboxItems: items,
    loading,
    needsReviewQueue,
    permission,
    quietHours: {
      behavior: "delay",
      enabled: Boolean(settings?.quietHoursEnabled),
      end: settings?.quietHoursEnd,
      start: settings?.quietHoursStart,
    },
    scheduledRecords,
    setActiveFilter,
    settings,
    todaySummary,
    upcomingSections,
    refresh,
  };
}

function mergeById<T extends { id: string }>(items: T[]) {
  const byId = new Map<string, T>();
  items.forEach((item) => byId.set(item.id, item));
  return Array.from(byId.values());
}

function permissionDisplay(
  status: HealthOSNotificationPermissionDisplay["status"],
): HealthOSNotificationPermissionDisplay {
  switch (status) {
    case "granted":
      return {
        description: "Device notifications are available for confirmed reminders.",
        label: "Notifications on",
        status,
        tone: "success",
      };
    case "provisional":
      return {
        description: "iOS provisional notifications are available. Review device settings for full alerts.",
        label: "Provisional",
        status,
        tone: "warning",
      };
    case "denied":
      return {
        description: "Device notifications are blocked. In-app reminder lists still work.",
        label: "Blocked",
        status,
        tone: "danger",
      };
    case "unavailable":
      return {
        description: "Device delivery is unavailable in this environment. In-app reminders still work.",
        label: "Unavailable",
        status,
        tone: "warning",
      };
    default:
      return {
        description: "Enable notifications when you want device alerts for confirmed reminders.",
        label: "Not requested",
        status,
        tone: "neutral",
      };
  }
}

function getDevicePushStatus(
  permissionStatus: HealthOSNotificationPermissionDisplay["status"],
): HealthOSDevicePushStatus {
  if (permissionStatus === "unavailable") {
    return {
      description: "This build cannot use device notification delivery. No push token is stored.",
      label: "Unavailable",
      status: "unavailable",
    };
  }
  return {
    description: "Remote push registration is not configured yet. Local notifications and in-app reminders are separate.",
    label: "Push deferred",
    status: "deferred",
  };
}

function groupUpcomingSections(items: HealthOSReminderDisplayItem[]) {
  const grouped = new Map<string, HealthOSReminderDisplayItem[]>();
  items.forEach((item) => {
    const label = dateSectionLabel(item.rawDueAt);
    grouped.set(label, [...(grouped.get(label) ?? []), item]);
  });
  return Array.from(grouped.entries()).map(([dateLabel, sectionItems]) => ({
    dateLabel,
    items: sectionItems,
  }));
}

function dateSectionLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Later";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    weekday: "short",
  });
}
