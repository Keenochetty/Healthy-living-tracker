import { getPrivacySafeReminderTitle, requiresReminderReview } from "./calendarReminderPrivacy";
import type {
  HealthOSCalendarEventCreateInput,
  HealthOSCalendarSourceType,
  HealthOSReminderCategory,
  HealthOSReminderCreateInput,
} from "./calendarReminderTypes";

export const EMPTY_CALENDAR_EVENTS = [];
export const EMPTY_REMINDERS = [];
export const EMPTY_REMINDER_HISTORY = [];
export const EMPTY_NOTIFICATION_EVENTS = [];

export function createCalendarEventDefaults(
  input: Partial<HealthOSCalendarEventCreateInput> & Pick<HealthOSCalendarEventCreateInput, "startAt" | "title">,
): HealthOSCalendarEventCreateInput {
  const sourceType = input.sourceType ?? "manual";
  return {
    allDay: input.allDay ?? false,
    createdFromAiImportId: input.createdFromAiImportId ?? null,
    createdFromRecordId: input.createdFromRecordId ?? null,
    description: input.description ?? null,
    endAt: input.endAt ?? null,
    eventType: input.eventType ?? "general",
    familyCircleId: input.familyCircleId ?? null,
    location: input.location ?? null,
    privacyScope: input.privacyScope ?? "private",
    reviewStatus: input.reviewStatus ?? defaultReviewStatusForSource(sourceType),
    sourceType,
    startAt: input.startAt,
    subjectCareProfileId: input.subjectCareProfileId ?? null,
    timezone: input.timezone ?? null,
    title: input.title.trim(),
  };
}

export function createReminderDefaults(
  input: Partial<HealthOSReminderCreateInput> & {
    category?: HealthOSReminderCategory;
    title?: string;
  },
): HealthOSReminderCreateInput {
  const category = input.category ?? "general";
  const sourceRealm = input.sourceRealm ?? "general";
  const reviewRequired = input.reviewRequired ?? requiresReminderReview(category, sourceRealm);
  return {
    aiImportId: input.aiImportId ?? null,
    calendarEventId: input.calendarEventId ?? null,
    cancelledAt: input.cancelledAt ?? null,
    category,
    detailsPrivate: input.detailsPrivate ?? null,
    localNotificationId: input.localNotificationId ?? null,
    privacyScope: input.privacyScope ?? "private",
    pushNotificationStatus: input.pushNotificationStatus ?? "notConfigured",
    quietHoursRespect: input.quietHoursRespect ?? true,
    repeatRule: input.repeatRule ?? null,
    reviewRequired,
    reviewedAt: input.reviewedAt ?? null,
    scheduledFor: input.scheduledFor ?? null,
    sourceRealm,
    sourceRecordId: input.sourceRecordId ?? null,
    sourceRowId: input.sourceRowId ?? null,
    sourceTable: input.sourceTable ?? null,
    status: input.status ?? (reviewRequired ? "needsReview" : "draft"),
    subjectCareProfileId: input.subjectCareProfileId ?? null,
    timezone: input.timezone ?? null,
    titlePrivacySafe: input.titlePrivacySafe ?? getPrivacySafeReminderTitle(category, input.title),
    urgency: input.urgency ?? (reviewRequired ? "needsReview" : "normal"),
  };
}

function defaultReviewStatusForSource(sourceType: HealthOSCalendarSourceType) {
  return sourceType === "aiImport" || sourceType === "scan" ? "needsReview" : "saved";
}
