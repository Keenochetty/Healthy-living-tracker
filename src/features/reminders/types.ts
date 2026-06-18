import type {
  HealthReminderStatus,
  NotificationPermissionStatus,
  QuietHoursBehavior,
  ReminderActionLog,
  ReminderCategory,
  ReminderCategorySettings,
  ScheduledNotificationRecord,
} from "@/types/healthTimeline";

export type HealthOSReminderFilterKey =
  | "all"
  | "due"
  | "today"
  | "upcoming"
  | "needs_review"
  | "scheduled"
  | "history";

export type HealthOSReminderCategoryConfig = {
  accentColor: string;
  category: ReminderCategory;
  description: string;
  label: string;
  routeTarget: string;
  sensitive: boolean;
};

export type HealthOSReminderDisplayItem = {
  category: ReminderCategory;
  categoryLabel: string;
  dueLabel: string;
  id: string;
  isPrivate: boolean;
  notes?: string;
  notificationEnabled: boolean;
  rawDueAt: string;
  routeTarget?: string;
  sourceLabel: string;
  status: HealthReminderStatus;
  statusLabel: string;
  title: string;
};

export type HealthOSTodayReminderSummary = {
  completedCount: number;
  dueCount: number;
  nextItem?: HealthOSReminderDisplayItem;
  overdueCount: number;
  totalCount: number;
};

export type HealthOSReminderReviewCandidate = {
  category: ReminderCategory;
  id: string;
  reason: string;
  source: "ai_import" | "assistant" | "manual" | "unknown";
  suggestedDueAt?: string;
  title: string;
};

export type HealthOSReminderHistoryItem = {
  action: ReminderActionLog["action"] | ScheduledNotificationRecord["status"];
  createdAt: string;
  id: string;
  reminderId: string;
  source: "action" | "notification";
  title: string;
};

export type HealthOSNotificationPermissionDisplay = {
  description: string;
  label: string;
  status: NotificationPermissionStatus;
  tone: "danger" | "neutral" | "success" | "warning";
};

export type HealthOSCategoryPreference = {
  config: HealthOSReminderCategoryConfig;
  settings: ReminderCategorySettings;
};

export type HealthOSQuietHoursDisplay = {
  behavior: QuietHoursBehavior;
  enabled: boolean;
  end?: string;
  start?: string;
};

export type HealthOSDevicePushStatus = {
  description: string;
  label: string;
  status: "deferred" | "disabled" | "enabled" | "unavailable";
};
