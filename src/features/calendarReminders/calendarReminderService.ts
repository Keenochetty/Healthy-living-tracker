import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

import { createCalendarEventDefaults, createReminderDefaults } from "./calendarReminderDefaults";
import {
  mapCalendarEventLinkRowToLink,
  mapCalendarEventLinkToInsert,
  mapCalendarEventRowToEvent,
  mapCalendarEventToInsert,
  mapCalendarEventToUpdate,
  mapNotificationEventRowToNotificationEvent,
  mapNotificationEventToInsert,
  mapReminderHistoryRowToHistory,
  mapReminderHistoryToInsert,
  mapReminderRowToReminder,
  mapReminderToInsert,
  mapReminderToUpdate,
  type CalendarReminderRow,
} from "./calendarReminderMappers";
import { getPrivacySafeReminderTitle } from "./calendarReminderPrivacy";
import { validateCalendarEventTimeRange, validateCalendarEventTitle, validateReminderReviewBeforeScheduling, validateReminderTitle } from "./calendarReminderValidation";
import type {
  HealthOSCalendarEvent,
  HealthOSCalendarEventCreateInput,
  HealthOSCalendarEventLink,
  HealthOSCalendarEventLinkCreateInput,
  HealthOSCalendarEventUpdateInput,
  HealthOSCalendarReminderServiceResult,
  HealthOSNotificationEvent,
  HealthOSReminder,
  HealthOSReminderCreateInput,
  HealthOSReminderHistory,
  HealthOSReminderHistoryCreateInput,
  HealthOSReminderUpdateInput,
} from "./calendarReminderTypes";

type TableName =
  | "calendar_event_links"
  | "calendar_events"
  | "notification_events"
  | "reminder_history"
  | "reminders";

export async function getCurrentAuthUser(): Promise<HealthOSCalendarReminderServiceResult<User>> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return fail("Could not load the signed-in user.", error);
  if (!data.user) return { data: null, error: null, status: "missingAuth" };
  return ok(data.user);
}

export async function getCalendarEvents(): Promise<HealthOSCalendarReminderServiceResult<HealthOSCalendarEvent[]>> {
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .is("cancelled_at", null)
    .order("start_at", { ascending: true });
  if (isMissingTable(error)) return missingTable("calendar_events", []);
  if (error) return fail("Could not load calendar events.", error);
  return ok(toRows(data).map(mapCalendarEventRowToEvent));
}

export async function getCalendarEventById(eventId: string): Promise<HealthOSCalendarReminderServiceResult<HealthOSCalendarEvent>> {
  const { data, error } = await supabase.from("calendar_events").select("*").eq("id", eventId).maybeSingle();
  if (isMissingTable(error)) return missingTable("calendar_events");
  if (error) return fail("Could not load the calendar event.", error);
  return { data: data ? mapCalendarEventRowToEvent(data as CalendarReminderRow) : null, error: null, status: "ready" };
}

export async function createCalendarEvent(input: HealthOSCalendarEventCreateInput) {
  const defaults = createCalendarEventDefaults(input);
  const title = validateCalendarEventTitle(defaults.title);
  if (!title.valid) return validationFail<HealthOSCalendarEvent>(title.error);
  const time = validateCalendarEventTimeRange(defaults.startAt, defaults.endAt);
  if (!time.valid) return validationFail<HealthOSCalendarEvent>(time.error);
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase
    .from("calendar_events")
    .insert(removeUndefined(mapCalendarEventToInsert(user.data.id, defaults)))
    .select("*")
    .single();
  if (isMissingTable(error)) return missingTable("calendar_events");
  if (error) return fail("Could not create the calendar event.", error);
  return ok(mapCalendarEventRowToEvent(data as CalendarReminderRow));
}

export async function updateCalendarEvent(eventId: string, input: HealthOSCalendarEventUpdateInput) {
  const { data, error } = await supabase
    .from("calendar_events")
    .update(removeUndefined(mapCalendarEventToUpdate(input)))
    .eq("id", eventId)
    .select("*")
    .single();
  if (isMissingTable(error)) return missingTable("calendar_events");
  if (error) return fail("Could not update the calendar event.", error);
  return ok(mapCalendarEventRowToEvent(data as CalendarReminderRow));
}

export function cancelCalendarEvent(eventId: string) {
  return updateCalendarEvent(eventId, { cancelledAt: new Date().toISOString(), reviewStatus: "cancelled" });
}

export async function getCalendarEventLinks(calendarEventId: string): Promise<HealthOSCalendarReminderServiceResult<HealthOSCalendarEventLink[]>> {
  const { data, error } = await supabase
    .from("calendar_event_links")
    .select("*")
    .eq("calendar_event_id", calendarEventId)
    .order("created_at", { ascending: false });
  if (isMissingTable(error)) return missingTable("calendar_event_links", []);
  if (error) return fail("Could not load calendar event links.", error);
  return ok(toRows(data).map(mapCalendarEventLinkRowToLink));
}

export async function createCalendarEventLink(input: HealthOSCalendarEventLinkCreateInput) {
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase
    .from("calendar_event_links")
    .insert(removeUndefined(mapCalendarEventLinkToInsert(user.data.id, input)))
    .select("*")
    .single();
  if (isMissingTable(error)) return missingTable("calendar_event_links");
  if (error) return fail("Could not create the calendar event link.", error);
  return ok(mapCalendarEventLinkRowToLink(data as CalendarReminderRow));
}

export async function getReminders(): Promise<HealthOSCalendarReminderServiceResult<HealthOSReminder[]>> {
  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .is("cancelled_at", null)
    .order("scheduled_for", { ascending: true, nullsFirst: false });
  if (isMissingTable(error)) return missingTable("reminders", []);
  if (error) return fail("Could not load reminders.", error);
  return ok(toRows(data).map(mapReminderRowToReminder));
}

export async function getReminderById(reminderId: string): Promise<HealthOSCalendarReminderServiceResult<HealthOSReminder>> {
  const { data, error } = await supabase.from("reminders").select("*").eq("id", reminderId).maybeSingle();
  if (isMissingTable(error)) return missingTable("reminders");
  if (error) return fail("Could not load the reminder.", error);
  return { data: data ? mapReminderRowToReminder(data as CalendarReminderRow) : null, error: null, status: "ready" };
}

export async function createReminderDraft(input: Partial<HealthOSReminderCreateInput> & { title?: string }) {
  const reminder = createReminderDefaults(input);
  const title = validateReminderTitle(reminder.titlePrivacySafe);
  if (!title.valid) return validationFail<HealthOSReminder>(title.error);
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase
    .from("reminders")
    .insert(removeUndefined(mapReminderToInsert(user.data.id, reminder)))
    .select("*")
    .single();
  if (isMissingTable(error)) return missingTable("reminders");
  if (error) return fail("Could not create the reminder draft.", error);
  return ok(mapReminderRowToReminder(data as CalendarReminderRow));
}

export function reviewReminder(reminderId: string) {
  return updateReminder(reminderId, { reviewedAt: new Date().toISOString(), reviewRequired: false, status: "scheduled" });
}

export async function scheduleReminderInApp(reminderId: string, scheduledFor: string) {
  const current = await getReminderById(reminderId);
  if (!current.data) return passStatus(current);
  const validation = validateReminderReviewBeforeScheduling({ ...current.data, scheduledFor, status: "scheduled" });
  if (!validation.valid) return validationFail<HealthOSReminder>(validation.error);
  return updateReminder(reminderId, { scheduledFor, status: "scheduled" });
}

export function markReminderCompleted(reminderId: string) {
  return updateReminder(reminderId, { status: "completed" });
}

export function snoozeReminder(reminderId: string, scheduledFor: string) {
  return updateReminder(reminderId, { scheduledFor, status: "snoozed" });
}

export function cancelReminder(reminderId: string) {
  return updateReminder(reminderId, { cancelledAt: new Date().toISOString(), status: "cancelled" });
}

export async function createReminderHistoryEvent(input: HealthOSReminderHistoryCreateInput): Promise<HealthOSCalendarReminderServiceResult<HealthOSReminderHistory>> {
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase
    .from("reminder_history")
    .insert(removeUndefined(mapReminderHistoryToInsert(user.data.id, input)))
    .select("*")
    .single();
  if (isMissingTable(error)) return missingTable("reminder_history");
  if (error) return fail("Could not create reminder history.", error);
  return ok(mapReminderHistoryRowToHistory(data as CalendarReminderRow));
}

export async function getReminderHistory(reminderId: string): Promise<HealthOSCalendarReminderServiceResult<HealthOSReminderHistory[]>> {
  const { data, error } = await supabase
    .from("reminder_history")
    .select("*")
    .eq("reminder_id", reminderId)
    .order("occurred_at", { ascending: false });
  if (isMissingTable(error)) return missingTable("reminder_history", []);
  if (error) return fail("Could not load reminder history.", error);
  return ok(toRows(data).map(mapReminderHistoryRowToHistory));
}

export async function getNotificationEvents(): Promise<HealthOSCalendarReminderServiceResult<HealthOSNotificationEvent[]>> {
  const { data, error } = await supabase.from("notification_events").select("*").order("created_at", { ascending: false });
  if (isMissingTable(error)) return missingTable("notification_events", []);
  if (error) return fail("Could not load notification events.", error);
  return ok(toRows(data).map(mapNotificationEventRowToNotificationEvent));
}

export async function markNotificationEventRead(notificationEventId: string) {
  const { data, error } = await supabase
    .from("notification_events")
    .update({ read_at: new Date().toISOString(), status: "read" })
    .eq("id", notificationEventId)
    .select("*")
    .single();
  if (isMissingTable(error)) return missingTable("notification_events");
  if (error) return fail("Could not mark notification as read.", error);
  return ok(mapNotificationEventRowToNotificationEvent(data as CalendarReminderRow));
}

export function createReminderFromCalendarEvent(event: HealthOSCalendarEvent) {
  return createReminderDraft({
    calendarEventId: event.id,
    category: "calendar",
    scheduledFor: event.startAt,
    sourceRealm: "calendar",
    sourceRowId: event.id,
    sourceTable: "calendar_events",
    titlePrivacySafe: getPrivacySafeReminderTitle("calendar", event.title),
  });
}

export function createReminderCandidateFromAI(input: Partial<HealthOSReminderCreateInput> & { title?: string }) {
  return createReminderDraft({
    ...input,
    category: input.category ?? "aiImport",
    reviewRequired: true,
    sourceRealm: "aiImport",
    status: "needsReview",
    urgency: "needsReview",
  });
}

export function createReminderCandidateFromRecord(recordId: string, title?: string) {
  return createReminderDraft({
    category: "records",
    reviewRequired: true,
    sourceRealm: "records",
    sourceRecordId: recordId,
    titlePrivacySafe: getPrivacySafeReminderTitle("records", title),
    status: "needsReview",
    urgency: "needsReview",
  });
}

async function updateReminder(reminderId: string, input: HealthOSReminderUpdateInput) {
  const { data, error } = await supabase
    .from("reminders")
    .update(removeUndefined(mapReminderToUpdate(input)))
    .eq("id", reminderId)
    .select("*")
    .single();
  if (isMissingTable(error)) return missingTable("reminders");
  if (error) return fail("Could not update the reminder.", error);
  return ok(mapReminderRowToReminder(data as CalendarReminderRow));
}

function ok<T>(data: T): HealthOSCalendarReminderServiceResult<T> {
  return { data, error: null, status: "ready" };
}

function validationFail<T>(error: string): HealthOSCalendarReminderServiceResult<T> {
  return { data: null, error, status: "error" };
}

function fail<T>(message: string, error?: unknown): HealthOSCalendarReminderServiceResult<T> {
  return { data: null, error: friendlyError(message, error), status: "error" };
}

function missingTable<T>(tableName: TableName, fallback: T | null = null): HealthOSCalendarReminderServiceResult<T> {
  return {
    data: fallback,
    error: `${tableName} is not available until the Batch 5 migration is applied and types are regenerated.`,
    status: "missingTable",
  };
}

function passStatus<T>(result: HealthOSCalendarReminderServiceResult<T>) {
  return {
    data: null,
    error: result.error,
    status: result.status,
  } satisfies HealthOSCalendarReminderServiceResult<never>;
}

function friendlyError(fallback: string, error?: unknown) {
  if (!error) return fallback;
  if (typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

function isMissingTable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; message?: string };
  return candidate.code === "42P01" || candidate.message?.includes("does not exist") === true || candidate.message?.includes("column") === true;
}

function removeUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));
}

function toRows(data: unknown) {
  return Array.isArray(data) ? (data as CalendarReminderRow[]) : [];
}
