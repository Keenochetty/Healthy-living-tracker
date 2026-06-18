import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

import { createMedicationDefaults, createMedicationScheduleDefaults, createSupplementDefaults, createSupplementScheduleDefaults } from "./medicationDefaults";
import {
  mapMedicationLogRowToLog,
  mapMedicationLogToInsert,
  mapMedicationRefillRowToReminder,
  mapMedicationRowToMedication,
  mapMedicationScheduleRowToSchedule,
  mapMedicationSideEffectRowToNote,
  mapMedicationToInsert,
  mapMedicationToUpdate,
  mapRefillReminderToInsert,
  mapReviewFlagRowToFlag,
  mapReviewFlagToInsert,
  mapScheduleToInsert,
  mapSideEffectNoteToInsert,
  mapSupplementLogRowToLog,
  mapSupplementLogToInsert,
  mapSupplementRowToSupplement,
  mapSupplementScheduleRowToSchedule,
  mapSupplementScheduleToInsert,
  mapSupplementToInsert,
  mapSupplementToUpdate,
  type MedicationSafetyRow,
} from "./medicationMappers";
import { getPrivacySafeMedicationTitle, getPrivacySafeSupplementTitle } from "./medicationPrivacy";
import { validateMedicationDisplayName, validateMedicationLog, validateMedicationSchedule, validateRefillReminder, validateSideEffectNote, validateSupplementDisplayName, validateSupplementSchedule } from "./medicationValidation";
import type {
  HealthOSMedication,
  HealthOSMedicationCreateInput,
  HealthOSMedicationLog,
  HealthOSMedicationLogCreateInput,
  HealthOSMedicationRefillCreateInput,
  HealthOSMedicationRefillReminder,
  HealthOSMedicationReviewFlag,
  HealthOSMedicationReviewFlagCreateInput,
  HealthOSMedicationSchedule,
  HealthOSMedicationScheduleCreateInput,
  HealthOSMedicationServiceResult,
  HealthOSMedicationSideEffectCreateInput,
  HealthOSMedicationSideEffectNote,
  HealthOSMedicationUpdateInput,
  HealthOSSupplement,
  HealthOSSupplementCreateInput,
  HealthOSSupplementLog,
  HealthOSSupplementLogCreateInput,
  HealthOSSupplementSchedule,
  HealthOSSupplementScheduleCreateInput,
  HealthOSSupplementUpdateInput,
} from "./medicationTypes";

type TableName =
  | "medication_logs"
  | "medication_refill_reminders"
  | "medication_review_flags"
  | "medication_schedules"
  | "medication_side_effect_notes"
  | "medications"
  | "supplement_logs"
  | "supplement_schedules"
  | "supplements";

export async function getCurrentAuthUser(): Promise<HealthOSMedicationServiceResult<User>> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return fail("Could not load the signed-in user.", error);
  if (!data.user) return { data: null, error: null, status: "missingAuth" };
  return ok(data.user);
}

export async function getMedications(): Promise<HealthOSMedicationServiceResult<HealthOSMedication[]>> {
  const { data, error } = await supabase.from("medications").select("*").is("archived_at", null).order("updated_at", { ascending: false });
  if (isMissingTable(error)) return missingTable("medications", []);
  if (error) return fail("Could not load medications.", error);
  return ok(toRows(data).map(mapMedicationRowToMedication));
}

export async function getMedicationById(id: string): Promise<HealthOSMedicationServiceResult<HealthOSMedication>> {
  const { data, error } = await supabase.from("medications").select("*").eq("id", id).maybeSingle();
  if (isMissingTable(error)) return missingTable("medications");
  if (error) return fail("Could not load medication.", error);
  return { data: data ? mapMedicationRowToMedication(data as MedicationSafetyRow) : null, error: null, status: "ready" };
}

export async function createMedicationDraft(input: Partial<HealthOSMedicationCreateInput> & { displayName: string }) {
  const draft = createMedicationDefaults(input);
  const validation = validateMedicationDisplayName(draft.displayName);
  if (!validation.valid) return validationFail<HealthOSMedication>(validation.error);
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase.from("medications").insert(removeUndefined(mapMedicationToInsert(user.data.id, draft))).select("*").single();
  if (isMissingTable(error)) return missingTable("medications");
  if (error) return fail("Could not create medication draft.", error);
  return ok(mapMedicationRowToMedication(data as MedicationSafetyRow));
}

export async function updateMedication(id: string, input: HealthOSMedicationUpdateInput) {
  const { data, error } = await supabase.from("medications").update(removeUndefined(mapMedicationToUpdate(input))).eq("id", id).select("*").single();
  if (isMissingTable(error)) return missingTable("medications");
  if (error) return fail("Could not update medication.", error);
  return ok(mapMedicationRowToMedication(data as MedicationSafetyRow));
}

export function reviewMedication(id: string) {
  return updateMedication(id, { reviewStatus: "reviewed", status: "active" });
}

export function archiveMedication(id: string) {
  return updateMedication(id, { archivedAt: new Date().toISOString(), status: "archived" });
}

export async function getMedicationSchedules(medicationId: string): Promise<HealthOSMedicationServiceResult<HealthOSMedicationSchedule[]>> {
  const { data, error } = await supabase.from("medication_schedules").select("*").eq("medication_id", medicationId).order("created_at", { ascending: false });
  if (isMissingTable(error)) return missingTable("medication_schedules", []);
  if (error) return fail("Could not load medication schedules.", error);
  return ok(toRows(data).map(mapMedicationScheduleRowToSchedule));
}

export async function createMedicationScheduleDraft(input: Partial<HealthOSMedicationScheduleCreateInput> & { medicationId: string }) {
  const draft = createMedicationScheduleDefaults(input);
  const validation = validateMedicationSchedule(draft);
  if (!validation.valid) return validationFail<HealthOSMedicationSchedule>(validation.error);
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase.from("medication_schedules").insert(removeUndefined(mapScheduleToInsert(user.data.id, draft))).select("*").single();
  if (isMissingTable(error)) return missingTable("medication_schedules");
  if (error) return fail("Could not create medication schedule.", error);
  return ok(mapMedicationScheduleRowToSchedule(data as MedicationSafetyRow));
}

export async function reviewMedicationSchedule(scheduleId: string) {
  const { data, error } = await supabase.from("medication_schedules").update({ review_status: "reviewed", status: "active", updated_at: new Date().toISOString() }).eq("id", scheduleId).select("*").single();
  if (isMissingTable(error)) return missingTable("medication_schedules");
  if (error) return fail("Could not review medication schedule.", error);
  return ok(mapMedicationScheduleRowToSchedule(data as MedicationSafetyRow));
}

export async function linkMedicationScheduleToReminder(scheduleId: string, reminderId: string) {
  const { data, error } = await supabase.from("medication_schedules").update({ linked_reminder_id: reminderId, updated_at: new Date().toISOString() }).eq("id", scheduleId).eq("review_status", "reviewed").select("*").single();
  if (isMissingTable(error)) return missingTable("medication_schedules");
  if (error) return fail("Could not link reminder. Review the schedule first.", error);
  return ok(mapMedicationScheduleRowToSchedule(data as MedicationSafetyRow));
}

export async function getMedicationLogs(medicationId: string): Promise<HealthOSMedicationServiceResult<HealthOSMedicationLog[]>> {
  const { data, error } = await supabase.from("medication_logs").select("*").eq("medication_id", medicationId).order("event_time", { ascending: false });
  if (isMissingTable(error)) return missingTable("medication_logs", []);
  if (error) return fail("Could not load medication logs.", error);
  return ok(toRows(data).map(mapMedicationLogRowToLog));
}

export async function createMedicationLog(input: HealthOSMedicationLogCreateInput) {
  const validation = validateMedicationLog(input);
  if (!validation.valid) return validationFail<HealthOSMedicationLog>(validation.error);
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase.from("medication_logs").insert(removeUndefined(mapMedicationLogToInsert(user.data.id, input))).select("*").single();
  if (isMissingTable(error)) return missingTable("medication_logs");
  if (error) return fail("Could not create medication log.", error);
  return ok(mapMedicationLogRowToLog(data as MedicationSafetyRow));
}

export async function getMedicationSideEffectNotes(medicationId: string): Promise<HealthOSMedicationServiceResult<HealthOSMedicationSideEffectNote[]>> {
  const { data, error } = await supabase.from("medication_side_effect_notes").select("*").eq("medication_id", medicationId).order("created_at", { ascending: false });
  if (isMissingTable(error)) return missingTable("medication_side_effect_notes", []);
  if (error) return fail("Could not load side-effect notes.", error);
  return ok(toRows(data).map(mapMedicationSideEffectRowToNote));
}

export async function createMedicationSideEffectNote(input: HealthOSMedicationSideEffectCreateInput) {
  const validation = validateSideEffectNote(input);
  if (!validation.valid) return validationFail<HealthOSMedicationSideEffectNote>(validation.error);
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase.from("medication_side_effect_notes").insert(removeUndefined(mapSideEffectNoteToInsert(user.data.id, input))).select("*").single();
  if (isMissingTable(error)) return missingTable("medication_side_effect_notes");
  if (error) return fail("Could not create side-effect note.", error);
  return ok(mapMedicationSideEffectRowToNote(data as MedicationSafetyRow));
}

export async function getMedicationRefillReminders(medicationId: string): Promise<HealthOSMedicationServiceResult<HealthOSMedicationRefillReminder[]>> {
  const { data, error } = await supabase.from("medication_refill_reminders").select("*").eq("medication_id", medicationId).order("refill_due_at", { ascending: true, nullsFirst: false });
  if (isMissingTable(error)) return missingTable("medication_refill_reminders", []);
  if (error) return fail("Could not load refill reminders.", error);
  return ok(toRows(data).map(mapMedicationRefillRowToReminder));
}

export async function createMedicationRefillReminder(input: HealthOSMedicationRefillCreateInput) {
  const validation = validateRefillReminder(input);
  if (!validation.valid) return validationFail<HealthOSMedicationRefillReminder>(validation.error);
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase.from("medication_refill_reminders").insert(removeUndefined(mapRefillReminderToInsert(user.data.id, input))).select("*").single();
  if (isMissingTable(error)) return missingTable("medication_refill_reminders");
  if (error) return fail("Could not create refill reminder.", error);
  return ok(mapMedicationRefillRowToReminder(data as MedicationSafetyRow));
}

export async function getSupplements(): Promise<HealthOSMedicationServiceResult<HealthOSSupplement[]>> {
  const { data, error } = await supabase.from("supplements").select("*").is("archived_at", null).order("updated_at", { ascending: false });
  if (isMissingTable(error)) return missingTable("supplements", []);
  if (error) return fail("Could not load supplements.", error);
  return ok(toRows(data).map(mapSupplementRowToSupplement));
}

export async function getSupplementById(id: string): Promise<HealthOSMedicationServiceResult<HealthOSSupplement>> {
  const { data, error } = await supabase.from("supplements").select("*").eq("id", id).maybeSingle();
  if (isMissingTable(error)) return missingTable("supplements");
  if (error) return fail("Could not load supplement.", error);
  return { data: data ? mapSupplementRowToSupplement(data as MedicationSafetyRow) : null, error: null, status: "ready" };
}

export async function createSupplementDraft(input: Partial<HealthOSSupplementCreateInput> & { displayName: string }) {
  const draft = createSupplementDefaults(input);
  const validation = validateSupplementDisplayName(draft.displayName);
  if (!validation.valid) return validationFail<HealthOSSupplement>(validation.error);
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase.from("supplements").insert(removeUndefined(mapSupplementToInsert(user.data.id, draft))).select("*").single();
  if (isMissingTable(error)) return missingTable("supplements");
  if (error) return fail("Could not create supplement draft.", error);
  return ok(mapSupplementRowToSupplement(data as MedicationSafetyRow));
}

export async function updateSupplement(id: string, input: HealthOSSupplementUpdateInput) {
  const { data, error } = await supabase.from("supplements").update(removeUndefined(mapSupplementToUpdate(input))).eq("id", id).select("*").single();
  if (isMissingTable(error)) return missingTable("supplements");
  if (error) return fail("Could not update supplement.", error);
  return ok(mapSupplementRowToSupplement(data as MedicationSafetyRow));
}

export function reviewSupplement(id: string) {
  return updateSupplement(id, { reviewStatus: "reviewed", status: "active" });
}

export function archiveSupplement(id: string) {
  return updateSupplement(id, { archivedAt: new Date().toISOString(), status: "archived" });
}

export async function getSupplementSchedules(supplementId: string): Promise<HealthOSMedicationServiceResult<HealthOSSupplementSchedule[]>> {
  const { data, error } = await supabase.from("supplement_schedules").select("*").eq("supplement_id", supplementId).order("created_at", { ascending: false });
  if (isMissingTable(error)) return missingTable("supplement_schedules", []);
  if (error) return fail("Could not load supplement schedules.", error);
  return ok(toRows(data).map(mapSupplementScheduleRowToSchedule));
}

export async function createSupplementScheduleDraft(input: Partial<HealthOSSupplementScheduleCreateInput> & { supplementId: string }) {
  const draft = createSupplementScheduleDefaults(input);
  const validation = validateSupplementSchedule(draft);
  if (!validation.valid) return validationFail<HealthOSSupplementSchedule>(validation.error);
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase.from("supplement_schedules").insert(removeUndefined(mapSupplementScheduleToInsert(user.data.id, draft))).select("*").single();
  if (isMissingTable(error)) return missingTable("supplement_schedules");
  if (error) return fail("Could not create supplement schedule.", error);
  return ok(mapSupplementScheduleRowToSchedule(data as MedicationSafetyRow));
}

export async function reviewSupplementSchedule(scheduleId: string) {
  const { data, error } = await supabase.from("supplement_schedules").update({ review_status: "reviewed", status: "active", updated_at: new Date().toISOString() }).eq("id", scheduleId).select("*").single();
  if (isMissingTable(error)) return missingTable("supplement_schedules");
  if (error) return fail("Could not review supplement schedule.", error);
  return ok(mapSupplementScheduleRowToSchedule(data as MedicationSafetyRow));
}

export async function getSupplementLogs(supplementId: string): Promise<HealthOSMedicationServiceResult<HealthOSSupplementLog[]>> {
  const { data, error } = await supabase.from("supplement_logs").select("*").eq("supplement_id", supplementId).order("event_time", { ascending: false });
  if (isMissingTable(error)) return missingTable("supplement_logs", []);
  if (error) return fail("Could not load supplement logs.", error);
  return ok(toRows(data).map(mapSupplementLogRowToLog));
}

export async function createSupplementLog(input: HealthOSSupplementLogCreateInput) {
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase.from("supplement_logs").insert(removeUndefined(mapSupplementLogToInsert(user.data.id, input))).select("*").single();
  if (isMissingTable(error)) return missingTable("supplement_logs");
  if (error) return fail("Could not create supplement log.", error);
  return ok(mapSupplementLogRowToLog(data as MedicationSafetyRow));
}

export async function getMedicationReviewFlags(): Promise<HealthOSMedicationServiceResult<HealthOSMedicationReviewFlag[]>> {
  const { data, error } = await supabase.from("medication_review_flags").select("*").eq("status", "active").order("created_at", { ascending: false });
  if (isMissingTable(error)) return missingTable("medication_review_flags", []);
  if (error) return fail("Could not load review flags.", error);
  return ok(toRows(data).map(mapReviewFlagRowToFlag));
}

export async function createMedicationReviewFlag(input: HealthOSMedicationReviewFlagCreateInput) {
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase.from("medication_review_flags").insert(removeUndefined(mapReviewFlagToInsert(user.data.id, input))).select("*").single();
  if (isMissingTable(error)) return missingTable("medication_review_flags");
  if (error) return fail("Could not create review flag.", error);
  return ok(mapReviewFlagRowToFlag(data as MedicationSafetyRow));
}

export function createMedicationCandidateFromRecord(recordId: string, displayName = "Review medication") {
  return createMedicationDraft({ displayName, reviewStatus: "needsReview", sourceRecordId: recordId, sourceType: "prescriptionRecord", status: "draft" });
}

export function createMedicationCandidateFromAI(aiImportId: string, displayName = "Review medication") {
  return createMedicationDraft({ aiImportId, displayName, reviewStatus: "needsReview", sourceType: "aiImport", status: "draft" });
}

export function createSupplementCandidateFromRecord(recordId: string, displayName = "Review supplement") {
  return createSupplementDraft({ displayName, reviewStatus: "needsReview", sourceRecordId: recordId, sourceType: "supplementLabelRecord", status: "draft" });
}

export function createSupplementCandidateFromAI(aiImportId: string, displayName = "Review supplement") {
  return createSupplementDraft({ aiImportId, displayName, reviewStatus: "needsReview", sourceType: "aiImport", status: "draft" });
}

export { getPrivacySafeMedicationTitle, getPrivacySafeSupplementTitle };

function ok<T>(data: T): HealthOSMedicationServiceResult<T> {
  return { data, error: null, status: "ready" };
}

function validationFail<T>(error: string): HealthOSMedicationServiceResult<T> {
  return { data: null, error, status: "error" };
}

function fail<T>(message: string, error?: unknown): HealthOSMedicationServiceResult<T> {
  return { data: null, error: friendlyError(message, error), status: "error" };
}

function missingTable<T>(tableName: TableName, fallback: T | null = null): HealthOSMedicationServiceResult<T> {
  return { data: fallback, error: `${tableName} is not available until the Batch 6 migration is applied and types are regenerated.`, status: "missingTable" };
}

function passStatus<T>(result: HealthOSMedicationServiceResult<T>) {
  return { data: null, error: result.error, status: result.status } satisfies HealthOSMedicationServiceResult<never>;
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
  return Array.isArray(data) ? (data as MedicationSafetyRow[]) : [];
}
