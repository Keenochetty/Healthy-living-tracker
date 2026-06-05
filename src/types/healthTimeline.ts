export type HealthEventType =
  | "medication"
  | "supplement"
  | "workout"
  | "water"
  | "meal"
  | "doctor_visit"
  | "vaccine"
  | "prescription_refill"
  | "lab_review"
  | "biometric_log"
  | "health_note"
  | "record"
  | "device_sync"
  | "womens_health"
  | "contraception"
  | "pregnancy"
  | "baby_child"
  | "mens_health"
  | "custom";

export type HealthReminderStatus =
  | "upcoming"
  | "due"
  | "completed"
  | "skipped"
  | "missed"
  | "snoozed"
  | "cancelled"
  | "paused";

export type RepeatFrequency = "none" | "daily" | "weekly" | "monthly" | "specific_days" | "every_x_hours" | "every_x_days" | "custom";

export type ReminderCategory =
  | "medication"
  | "supplement"
  | "contraception"
  | "baby_feeding"
  | "baby_sleep"
  | "baby_medicine"
  | "vaccine"
  | "appointment"
  | "prescription_refill"
  | "lab_follow_up"
  | "workout"
  | "food_meal"
  | "water"
  | "biometric_log"
  | "womens_health"
  | "pregnancy"
  | "mens_health"
  | "family_caregiver"
  | "records"
  | "custom";

export type NotificationDetailLevel = "private" | "category" | "detailed";

export type QuietHoursBehavior = "deliver" | "silent" | "delay";

export type NotificationPermissionStatus =
  | "not_requested"
  | "granted"
  | "denied"
  | "provisional"
  | "unavailable";

export type ReminderSnoozeOption = {
  label: string;
  minutes: number;
};

export type HealthReminderSource =
  | "manual"
  | "medication_schedule"
  | "supplement_schedule"
  | "health_record"
  | "doctor_visit"
  | "vaccine"
  | "prescription"
  | "lab"
  | "workout"
  | "water"
  | "womens_health"
  | "contraception"
  | "pregnancy"
  | "baby_child"
  | "mens_health"
  | "legacy";

export type HealthReminder = {
  allDay: boolean;
  category?: ReminderCategory;
  createdAt: string;
  detailLevel?: NotificationDetailLevel;
  dueAt: string;
  id: string;
  isPrivate: boolean;
  leadTimeMinutes?: number;
  linkedEntityId?: string;
  linkedEntityType?: HealthEventType;
  lockedPrivate: boolean;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  missedThresholdMinutes?: number;
  notes?: string;
  notificationRecordId?: string;
  notificationEnabled: boolean;
  notificationId?: string;
  params?: Record<string, string | number | boolean | null | undefined>;
  pausedUntil?: string;
  profileId: string;
  quietHoursBehavior?: QuietHoursBehavior;
  repeatFrequency: RepeatFrequency;
  repeatRule?: string;
  route?: string;
  sharedWithCaregiver: boolean;
  sharedWithFamily: boolean;
  sharedWithPartner: boolean;
  snoozedUntil?: string;
  source: HealthReminderSource;
  sourceId?: string;
  sourceRealm?: string;
  sourceType?: string;
  status: HealthReminderStatus;
  title: string;
  type: HealthEventType;
  updatedAt: string;
  userId: string;
};

export type CreateHealthReminderInput = {
  allDay?: boolean;
  category?: ReminderCategory;
  detailLevel?: NotificationDetailLevel;
  dueAt: string;
  leadTimeMinutes?: number;
  linkedEntityId?: string;
  linkedEntityType?: HealthEventType;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  missedThresholdMinutes?: number;
  notes?: string;
  notificationRecordId?: string;
  notificationEnabled?: boolean;
  notificationId?: string;
  params?: Record<string, string | number | boolean | null | undefined>;
  pausedUntil?: string;
  quietHoursBehavior?: QuietHoursBehavior;
  repeatFrequency?: RepeatFrequency;
  repeatRule?: string;
  route?: string;
  source?: HealthReminderSource;
  sourceId?: string;
  sourceRealm?: string;
  sourceType?: string;
  title: string;
  type: HealthEventType;
};

export type UpdateHealthReminderInput = Partial<
  Omit<HealthReminder, "createdAt" | "id" | "profileId" | "updatedAt" | "userId">
>;

export type HealthTimelineEvent = {
  createdAt: string;
  description?: string;
  eventAt: string;
  id: string;
  isPrivate: boolean;
  linkedEntityId?: string;
  linkedEntityType?: HealthEventType;
  lockedPrivate: boolean;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  profileId: string;
  source: string;
  sourceId?: string;
  title: string;
  type: HealthEventType;
  userId: string;
};

export type CalendarDaySummary = {
  completedCount: number;
  date: string;
  dueCount: number;
  eventCount: number;
  hasAppointment: boolean;
  hasMedication: boolean;
  hasSupplement: boolean;
  hasWorkout: boolean;
  missedCount: number;
  nextReminder?: HealthReminder;
  reminderCount: number;
};

export type TodayTimelineSummary = {
  latestEvent?: HealthTimelineEvent;
  totalEvents: number;
};

export type HealthCalendarWidgetKey =
  | "today_reminders"
  | "next_reminder"
  | "overdue_items"
  | "upcoming_appointment"
  | "medication_schedule"
  | "supplement_schedule"
  | "workout_plan"
  | "water_check"
  | "timeline_today"
  | "reminder_next"
  | "reminders_today"
  | "overdue_reminders"
  | "medication_due"
  | "supplement_due"
  | "contraception_next"
  | "baby_reminder"
  | "appointment_reminder"
  | "water_reminder"
  | "workout_reminder"
  | "caregiver_task";

export type ReminderCategorySettings = {
  category: ReminderCategory;
  createdAt: string;
  defaultLeadTimeMinutes?: number;
  detailLevel: NotificationDetailLevel;
  enabled: boolean;
  id: string;
  notificationEnabled: boolean;
  profileId?: string;
  quickActionsEnabled: boolean;
  quietHoursBehavior: QuietHoursBehavior;
  updatedAt: string;
  userId: string;
};

export type NotificationSettings = {
  createdAt: string;
  id: string;
  notificationsEnabled: boolean;
  permissionStatus: NotificationPermissionStatus;
  quietHoursEnabled: boolean;
  quietHoursEnd?: string;
  quietHoursStart?: string;
  sensitiveLockScreenPrivate: boolean;
  updatedAt: string;
  userId: string;
};

export type ScheduledNotificationRecord = {
  body: string;
  category: ReminderCategory;
  createdAt: string;
  detailLevel: NotificationDetailLevel;
  errorMessage?: string;
  id: string;
  notificationId?: string;
  params?: Record<string, unknown>;
  profileId?: string;
  reminderId: string;
  route?: string;
  scheduledFor: string;
  status: "scheduled" | "delivered" | "cancelled" | "failed" | "expired";
  title: string;
  updatedAt: string;
  userId: string;
};

export type ReminderActionLog = {
  action: "completed" | "taken" | "skipped" | "snoozed" | "opened" | "dismissed" | "rescheduled";
  actionSource: "in_app" | "notification" | "assistant" | "caregiver";
  createdAt: string;
  id: string;
  profileId?: string;
  reminderId: string;
  userId: string;
};
