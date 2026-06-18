export type HealthOSCalendarReminderBackendStatus =
  | "idle"
  | "loading"
  | "ready"
  | "missingAuth"
  | "missingTable"
  | "notificationDeferred"
  | "pushDeferred"
  | "deferred"
  | "error";

export type HealthOSCalendarReminderServiceResult<T> = {
  data: T | null;
  error: string | null;
  status: HealthOSCalendarReminderBackendStatus;
};

export type HealthOSCalendarEventType =
  | "general"
  | "appointment"
  | "medication"
  | "supplement"
  | "pregnancy"
  | "babyChild"
  | "womensHealth"
  | "fitness"
  | "nutrition"
  | "records"
  | "family"
  | "caregiver"
  | "aiImportReview"
  | "health"
  | "other";

export type HealthOSCalendarSourceType =
  | "manual"
  | "aiImport"
  | "scan"
  | "record"
  | "medication"
  | "supplement"
  | "pregnancy"
  | "babyChild"
  | "womensHealth"
  | "fitness"
  | "nutrition"
  | "family"
  | "external"
  | "unknown";

export type HealthOSCalendarReviewStatus =
  | "draft"
  | "needsReview"
  | "saved"
  | "scheduled"
  | "completed"
  | "cancelled"
  | "archived"
  | "unknown";

export type HealthOSReminderCategory =
  | "medication"
  | "supplements"
  | "calendar"
  | "pregnancy"
  | "babyChild"
  | "womensHealth"
  | "family"
  | "caregiver"
  | "records"
  | "aiImport"
  | "fitness"
  | "nutrition"
  | "security"
  | "general";

export type HealthOSReminderStatus =
  | "draft"
  | "needsReview"
  | "scheduled"
  | "localScheduled"
  | "pushPending"
  | "due"
  | "completed"
  | "missed"
  | "snoozed"
  | "skipped"
  | "dismissed"
  | "cancelled"
  | "failed"
  | "deferred"
  | "unknown";

export type HealthOSReminderUrgency =
  | "info"
  | "normal"
  | "dueSoon"
  | "important"
  | "urgent"
  | "critical"
  | "completed"
  | "missed"
  | "needsReview";

export type HealthOSCalendarPrivacyScope =
  | "private"
  | "selectedFamily"
  | "caregiverLimited"
  | "circle"
  | "unknown";

export type HealthOSPushNotificationStatus =
  | "notConfigured"
  | "deferred"
  | "pending"
  | "sent"
  | "failed";

export type HealthOSCalendarEvent = {
  id?: string;
  ownerUserId: string;
  subjectCareProfileId?: string | null;
  title: string;
  description?: string | null;
  eventType: HealthOSCalendarEventType;
  privacyScope: HealthOSCalendarPrivacyScope;
  startAt: string;
  endAt?: string | null;
  allDay: boolean;
  timezone?: string | null;
  location?: string | null;
  sourceType: HealthOSCalendarSourceType;
  reviewStatus: HealthOSCalendarReviewStatus;
  createdFromAiImportId?: string | null;
  createdFromRecordId?: string | null;
  familyCircleId?: string | null;
  cancelledAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type HealthOSCalendarEventLink = {
  id?: string;
  calendarEventId: string;
  ownerUserId: string;
  linkedRealm: string;
  linkedTable?: string | null;
  linkedRowId?: string | null;
  linkStatus: "active" | "inactive" | "removed" | "unknown";
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type HealthOSReminder = {
  id?: string;
  ownerUserId: string;
  subjectCareProfileId?: string | null;
  calendarEventId?: string | null;
  titlePrivacySafe: string;
  detailsPrivate?: string | null;
  category: HealthOSReminderCategory;
  sourceRealm: string;
  sourceTable?: string | null;
  sourceRowId?: string | null;
  sourceRecordId?: string | null;
  aiImportId?: string | null;
  privacyScope: HealthOSCalendarPrivacyScope;
  status: HealthOSReminderStatus;
  urgency: HealthOSReminderUrgency;
  scheduledFor?: string | null;
  timezone?: string | null;
  repeatRule?: string | null;
  quietHoursRespect: boolean;
  localNotificationId?: string | null;
  pushNotificationStatus: HealthOSPushNotificationStatus;
  reviewRequired: boolean;
  reviewedAt?: string | null;
  cancelledAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type HealthOSReminderHistoryEventType =
  | "created"
  | "reviewed"
  | "scheduled"
  | "localScheduled"
  | "pushDeferred"
  | "delivered"
  | "opened"
  | "snoozed"
  | "completed"
  | "missed"
  | "skipped"
  | "dismissed"
  | "cancelled"
  | "failed"
  | "permissionDenied"
  | "unknown";

export type HealthOSReminderHistory = {
  id?: string;
  reminderId: string;
  ownerUserId: string;
  eventType: HealthOSReminderHistoryEventType;
  eventNote?: string | null;
  occurredAt: string;
  createdAt?: string | null;
};

export type HealthOSNotificationEvent = {
  id?: string;
  ownerUserId: string;
  reminderId?: string | null;
  notificationType: "inApp" | "local" | "pushDeferred" | "unknown";
  titlePrivacySafe: string;
  bodyPrivacySafe?: string | null;
  status: "created" | "read" | "dismissed" | "failed" | "unknown";
  createdAt?: string | null;
  readAt?: string | null;
  dismissedAt?: string | null;
};

export type HealthOSCalendarEventCreateInput = Omit<
  HealthOSCalendarEvent,
  "createdAt" | "id" | "ownerUserId" | "updatedAt"
> & {
  ownerUserId?: string;
};

export type HealthOSCalendarEventUpdateInput = Partial<
  Omit<HealthOSCalendarEventCreateInput, "ownerUserId">
>;

export type HealthOSCalendarEventLinkCreateInput = Omit<
  HealthOSCalendarEventLink,
  "createdAt" | "id" | "linkStatus" | "ownerUserId" | "updatedAt"
> & {
  linkStatus?: HealthOSCalendarEventLink["linkStatus"];
  ownerUserId?: string;
};

export type HealthOSReminderCreateInput = Omit<
  HealthOSReminder,
  "createdAt" | "id" | "ownerUserId" | "updatedAt"
> & {
  ownerUserId?: string;
};

export type HealthOSReminderUpdateInput = Partial<
  Omit<HealthOSReminderCreateInput, "ownerUserId">
>;

export type HealthOSReminderHistoryCreateInput = Omit<
  HealthOSReminderHistory,
  "createdAt" | "id" | "ownerUserId" | "occurredAt"
> & {
  eventNote?: string | null;
  occurredAt?: string;
  ownerUserId?: string;
};

export type HealthOSNotificationEventCreateInput = Omit<
  HealthOSNotificationEvent,
  "createdAt" | "id" | "ownerUserId"
> & {
  ownerUserId?: string;
};
