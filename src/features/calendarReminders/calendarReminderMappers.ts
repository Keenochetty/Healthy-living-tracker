import { getPrivacySafeNotificationBody, getPrivacySafeReminderTitle } from "./calendarReminderPrivacy";
import type {
  HealthOSCalendarEvent,
  HealthOSCalendarEventCreateInput,
  HealthOSCalendarEventLink,
  HealthOSCalendarEventLinkCreateInput,
  HealthOSCalendarEventUpdateInput,
  HealthOSNotificationEvent,
  HealthOSNotificationEventCreateInput,
  HealthOSReminder,
  HealthOSReminderCreateInput,
  HealthOSReminderHistory,
  HealthOSReminderHistoryCreateInput,
  HealthOSReminderUpdateInput,
} from "./calendarReminderTypes";

export type CalendarReminderRow = Record<string, unknown>;

export function mapCalendarEventRowToEvent(row: CalendarReminderRow): HealthOSCalendarEvent {
  return {
    allDay: booleanValue(row.all_day, false),
    cancelledAt: stringOrNull(row.cancelled_at),
    createdAt: stringOrNull(row.created_at),
    createdFromAiImportId: stringOrNull(row.created_from_ai_import_id),
    createdFromRecordId: stringOrNull(row.created_from_record_id),
    description: stringOrNull(row.description),
    endAt: stringOrNull(row.end_at ?? row.end_time),
    eventType: fromSnake(stringValue(row.event_type ?? row.calendar_type, "general")) as HealthOSCalendarEvent["eventType"],
    familyCircleId: stringOrNull(row.family_circle_id ?? row.family_id),
    id: stringOrUndefined(row.id),
    location: stringOrNull(row.location),
    ownerUserId: stringValue(row.owner_user_id ?? row.created_by ?? row.user_id, ""),
    privacyScope: fromSnake(stringValue(row.privacy_scope ?? row.privacy_level, "private")) as HealthOSCalendarEvent["privacyScope"],
    reviewStatus: fromSnake(stringValue(row.review_status, "saved")) as HealthOSCalendarEvent["reviewStatus"],
    sourceType: fromSnake(stringValue(row.source_type, "manual")) as HealthOSCalendarEvent["sourceType"],
    startAt: stringValue(row.start_at ?? row.start_time, ""),
    subjectCareProfileId: stringOrNull(row.subject_care_profile_id ?? row.profile_id ?? row.child_id),
    timezone: stringOrNull(row.timezone),
    title: stringValue(row.title, "Untitled event"),
    updatedAt: stringOrNull(row.updated_at),
  };
}

export function mapCalendarEventLinkRowToLink(row: CalendarReminderRow): HealthOSCalendarEventLink {
  return {
    calendarEventId: stringValue(row.calendar_event_id, ""),
    createdAt: stringOrNull(row.created_at),
    id: stringOrUndefined(row.id),
    linkedRealm: fromSnake(stringValue(row.linked_realm, "general")),
    linkedRowId: stringOrNull(row.linked_row_id),
    linkedTable: stringOrNull(row.linked_table),
    linkStatus: fromSnake(stringValue(row.link_status, "unknown")) as HealthOSCalendarEventLink["linkStatus"],
    ownerUserId: stringValue(row.owner_user_id, ""),
    updatedAt: stringOrNull(row.updated_at),
  };
}

export function mapReminderRowToReminder(row: CalendarReminderRow): HealthOSReminder {
  const category = fromSnake(stringValue(row.category ?? row.reminder_type, "general")) as HealthOSReminder["category"];
  const title = stringValue(row.title_privacy_safe ?? row.title, getPrivacySafeReminderTitle(category));
  return {
    aiImportId: stringOrNull(row.ai_import_id),
    calendarEventId: stringOrNull(row.calendar_event_id),
    cancelledAt: stringOrNull(row.cancelled_at),
    category,
    createdAt: stringOrNull(row.created_at),
    detailsPrivate: stringOrNull(row.details_private ?? row.notes),
    id: stringOrUndefined(row.id),
    localNotificationId: stringOrNull(row.local_notification_id),
    ownerUserId: stringValue(row.owner_user_id ?? row.created_by_user_id ?? row.user_id, ""),
    privacyScope: fromSnake(stringValue(row.privacy_scope, "private")) as HealthOSReminder["privacyScope"],
    pushNotificationStatus: fromSnake(stringValue(row.push_notification_status, "not_configured")) as HealthOSReminder["pushNotificationStatus"],
    quietHoursRespect: booleanValue(row.quiet_hours_respect, true),
    repeatRule: stringOrNull(row.repeat_rule),
    reviewRequired: booleanValue(row.review_required, true),
    reviewedAt: stringOrNull(row.reviewed_at),
    scheduledFor: stringOrNull(row.scheduled_for ?? row.due_at),
    sourceRealm: fromSnake(stringValue(row.source_realm, "general")),
    sourceRecordId: stringOrNull(row.source_record_id),
    sourceRowId: stringOrNull(row.source_row_id),
    sourceTable: stringOrNull(row.source_table),
    status: fromSnake(stringValue(row.status, "unknown")) as HealthOSReminder["status"],
    subjectCareProfileId: stringOrNull(row.subject_care_profile_id ?? row.family_member_id),
    timezone: stringOrNull(row.timezone),
    titlePrivacySafe: title,
    updatedAt: stringOrNull(row.updated_at),
    urgency: fromSnake(stringValue(row.urgency, "normal")) as HealthOSReminder["urgency"],
  };
}

export function mapReminderHistoryRowToHistory(row: CalendarReminderRow): HealthOSReminderHistory {
  return {
    createdAt: stringOrNull(row.created_at),
    eventNote: stringOrNull(row.event_note),
    eventType: fromSnake(stringValue(row.event_type, "unknown")) as HealthOSReminderHistory["eventType"],
    id: stringOrUndefined(row.id),
    occurredAt: stringValue(row.occurred_at, new Date().toISOString()),
    ownerUserId: stringValue(row.owner_user_id, ""),
    reminderId: stringValue(row.reminder_id, ""),
  };
}

export function mapNotificationEventRowToNotificationEvent(row: CalendarReminderRow): HealthOSNotificationEvent {
  return {
    bodyPrivacySafe: stringOrNull(row.body_privacy_safe),
    createdAt: stringOrNull(row.created_at),
    dismissedAt: stringOrNull(row.dismissed_at),
    id: stringOrUndefined(row.id),
    notificationType: fromSnake(stringValue(row.notification_type, "unknown")) as HealthOSNotificationEvent["notificationType"],
    ownerUserId: stringValue(row.owner_user_id, ""),
    readAt: stringOrNull(row.read_at),
    reminderId: stringOrNull(row.reminder_id),
    status: fromSnake(stringValue(row.status, "unknown")) as HealthOSNotificationEvent["status"],
    titlePrivacySafe: stringValue(row.title_privacy_safe, "Health reminder"),
  };
}

export function mapCalendarEventToInsert(ownerUserId: string, input: HealthOSCalendarEventCreateInput) {
  return {
    all_day: input.allDay,
    created_from_ai_import_id: input.createdFromAiImportId,
    created_from_record_id: input.createdFromRecordId,
    description: input.description,
    end_at: input.endAt,
    event_type: toSnake(input.eventType),
    family_circle_id: input.familyCircleId,
    location: input.location,
    owner_user_id: ownerUserId,
    privacy_scope: toSnake(input.privacyScope),
    review_status: toSnake(input.reviewStatus),
    source_type: toSnake(input.sourceType),
    start_at: input.startAt,
    subject_care_profile_id: input.subjectCareProfileId,
    timezone: input.timezone,
    title: input.title,
  };
}

export function mapCalendarEventToUpdate(input: HealthOSCalendarEventUpdateInput) {
  return {
    all_day: input.allDay,
    cancelled_at: input.cancelledAt,
    description: input.description,
    end_at: input.endAt,
    event_type: input.eventType ? toSnake(input.eventType) : undefined,
    location: input.location,
    privacy_scope: input.privacyScope ? toSnake(input.privacyScope) : undefined,
    review_status: input.reviewStatus ? toSnake(input.reviewStatus) : undefined,
    start_at: input.startAt,
    timezone: input.timezone,
    title: input.title,
    updated_at: new Date().toISOString(),
  };
}

export function mapCalendarEventLinkToInsert(ownerUserId: string, input: HealthOSCalendarEventLinkCreateInput) {
  return {
    calendar_event_id: input.calendarEventId,
    linked_realm: toSnake(input.linkedRealm),
    linked_row_id: input.linkedRowId,
    linked_table: input.linkedTable,
    link_status: toSnake(input.linkStatus ?? "active"),
    owner_user_id: ownerUserId,
  };
}

export function mapReminderToInsert(ownerUserId: string, input: HealthOSReminderCreateInput) {
  return {
    ai_import_id: input.aiImportId,
    calendar_event_id: input.calendarEventId,
    category: toSnake(input.category),
    details_private: input.detailsPrivate,
    local_notification_id: input.localNotificationId,
    owner_user_id: ownerUserId,
    privacy_scope: toSnake(input.privacyScope),
    push_notification_status: toSnake(input.pushNotificationStatus),
    quiet_hours_respect: input.quietHoursRespect,
    repeat_rule: input.repeatRule,
    review_required: input.reviewRequired,
    reviewed_at: input.reviewedAt,
    scheduled_for: input.scheduledFor,
    source_realm: toSnake(input.sourceRealm),
    source_record_id: input.sourceRecordId,
    source_row_id: input.sourceRowId,
    source_table: input.sourceTable,
    status: toSnake(input.status),
    subject_care_profile_id: input.subjectCareProfileId,
    timezone: input.timezone,
    title_privacy_safe: input.titlePrivacySafe || getPrivacySafeReminderTitle(input.category),
    urgency: toSnake(input.urgency),
  };
}

export function mapReminderToUpdate(input: HealthOSReminderUpdateInput) {
  return {
    cancelled_at: input.cancelledAt,
    details_private: input.detailsPrivate,
    local_notification_id: input.localNotificationId,
    privacy_scope: input.privacyScope ? toSnake(input.privacyScope) : undefined,
    push_notification_status: input.pushNotificationStatus ? toSnake(input.pushNotificationStatus) : undefined,
    quiet_hours_respect: input.quietHoursRespect,
    repeat_rule: input.repeatRule,
    review_required: input.reviewRequired,
    reviewed_at: input.reviewedAt,
    scheduled_for: input.scheduledFor,
    status: input.status ? toSnake(input.status) : undefined,
    timezone: input.timezone,
    title_privacy_safe: input.titlePrivacySafe,
    updated_at: new Date().toISOString(),
    urgency: input.urgency ? toSnake(input.urgency) : undefined,
  };
}

export function mapReminderHistoryToInsert(ownerUserId: string, input: HealthOSReminderHistoryCreateInput) {
  return {
    event_note: input.eventNote,
    event_type: toSnake(input.eventType),
    occurred_at: input.occurredAt ?? new Date().toISOString(),
    owner_user_id: ownerUserId,
    reminder_id: input.reminderId,
  };
}

export function mapNotificationEventToInsert(ownerUserId: string, input: HealthOSNotificationEventCreateInput) {
  return {
    body_privacy_safe: input.bodyPrivacySafe ?? getPrivacySafeNotificationBody(),
    notification_type: toSnake(input.notificationType),
    owner_user_id: ownerUserId,
    read_at: input.readAt,
    reminder_id: input.reminderId,
    status: toSnake(input.status),
    title_privacy_safe: input.titlePrivacySafe,
  };
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value ? value : fallback;
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function stringOrUndefined(value: unknown) {
  return typeof value === "string" && value ? value : undefined;
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

export function toSnake(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function fromSnake(value: string) {
  return value.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
