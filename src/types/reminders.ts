export type ReminderType =
  | "personal"
  | "work"
  | "medication"
  | "doctor_visit"
  | "family"
  | "fitness"
  | "food"
  | "child_baby"
  | "elder_care"
  | "caregiver"
  | "custom";

export type ReminderPriority = "low" | "normal" | "important" | "urgent";

export type ReminderStatus = "pending" | "completed" | "skipped" | "cancelled";

export type ReminderLinkedEntityType = "medication";

export type AppReminder = {
  createdAt: string;
  dueAt: string;
  id: string;
  linkedEntityId?: string;
  linkedEntityType?: ReminderLinkedEntityType;
  metadata?: Record<string, string | number | boolean | null>;
  notes?: string;
  notificationId?: string;
  notify: boolean;
  priority: ReminderPriority;
  status: ReminderStatus;
  title: string;
  type: ReminderType;
  updatedAt: string;
};

export type CalendarEvent = {
  createdAt: string;
  endsAt?: string;
  id: string;
  linkedReminderId?: string;
  notes?: string;
  startsAt: string;
  title: string;
  type: ReminderType;
  updatedAt: string;
};
