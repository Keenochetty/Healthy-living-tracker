import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

import {
  createChildCareLogDefaults,
  createContraceptionLogDefaults,
  createDiaperLogDefaults,
  createFeedingLogDefaults,
  createGrowthMeasurementDefaults,
  createMilestoneLogDefaults,
  createPregnancyAppointmentDefaults,
  createPregnancyCareTeamDefaults,
  createPregnancyChecklistDefaults,
  createPregnancyLogDefaults,
  createPregnancyProfileDefaults,
  createSexDayLogDefaults,
  createSleepLogDefaults,
  createSolidsLogDefaults,
  createVaccineRecordDefaults,
  createWomenHealthLogDefaults,
} from "./lifeStageDefaults";
import {
  mapCaregiverNoteRow,
  mapChildCareLogRow,
  mapChildMedicationNoteRow,
  mapContraceptionLogRow,
  mapDiaperLogRow,
  mapFeedingLogRow,
  mapGrowthMeasurementRow,
  mapMilestoneLogRow,
  mapPregnancyAppointmentRow,
  mapPregnancyCareTeamRow,
  mapPregnancyChecklistRow,
  mapPregnancyLogRow,
  mapPregnancyProfileRow,
  mapSexDayLogRow,
  mapSleepLogRow,
  mapSolidsLogRow,
  mapVaccineRecordRow,
  mapWomenHealthLogRow,
  toSnakeInsert,
  type LifeStageRow,
} from "./lifeStageMappers";
import { getPrivacySafeLifeStageTitle } from "./lifeStagePrivacy";
import {
  validateCaregiverNote,
  validateChildCareLog,
  validateChildMedicationNote,
  validateContraceptionLog,
  validateDiaperLog,
  validateFeedingLog,
  validateGrowthMeasurement,
  validateMilestoneLog,
  validatePregnancyAppointment,
  validatePregnancyChecklist,
  validatePregnancyLog,
  validatePregnancyProfile,
  validateSexDayLog,
  validateSleepLog,
  validateSolidsLog,
  validateVaccineRecord,
  validateWomenHealthLog,
} from "./lifeStageValidation";
import type {
  CaregiverNote,
  ChildCareLog,
  ChildMedicationNote,
  ContraceptionLog,
  DiaperLog,
  FeedingLog,
  GrowthMeasurement,
  HealthOSLifeStageServiceResult,
  LifeStageRecordLinkCandidate,
  LifeStageReminderCandidate,
  MilestoneLog,
  PregnancyAppointment,
  PregnancyCareTeamMember,
  PregnancyChecklist,
  PregnancyLog,
  PregnancyProfile,
  SexDayLog,
  SleepLog,
  SolidsLog,
  VaccineRecord,
  WomenHealthLog,
} from "./lifeStageTypes";

type TableName =
  | "caregiver_notes"
  | "child_care_logs"
  | "child_medication_notes"
  | "contraception_logs"
  | "diaper_logs"
  | "feeding_logs"
  | "growth_measurements"
  | "milestone_logs"
  | "pregnancy_appointments"
  | "pregnancy_care_team"
  | "pregnancy_checklists"
  | "pregnancy_logs"
  | "pregnancy_profiles"
  | "record_links"
  | "reminders"
  | "sex_day_logs"
  | "sleep_logs"
  | "solids_logs"
  | "vaccine_records"
  | "women_health_logs";

export async function getCurrentLifeStageAuthUser(): Promise<HealthOSLifeStageServiceResult<User>> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return fail("Could not load the signed-in user.", error);
  if (!data.user) return { data: null, error: null, status: "missingAuth" };
  return ok(data.user);
}

export function getPregnancyProfile() {
  return list("pregnancy_profiles", mapPregnancyProfileRow);
}

export function createPregnancyProfileDraft(input: Partial<PregnancyProfile> = {}) {
  const draft = createPregnancyProfileDefaults(input);
  const validation = validatePregnancyProfile(draft);
  return validation.valid ? createOne("pregnancy_profiles", draft, mapPregnancyProfileRow) : validationFail<PregnancyProfile>(validation.error);
}

export function updatePregnancyProfile(id: string, input: Partial<PregnancyProfile>) {
  return updateOne("pregnancy_profiles", id, input, mapPregnancyProfileRow);
}

export function endPregnancyProfile(id: string) {
  return updatePregnancyProfile(id, { endedAt: new Date().toISOString(), status: "ended" });
}

export function getPregnancyLogs(pregnancyProfileId: string) {
  return list("pregnancy_logs", mapPregnancyLogRow, "pregnancy_profile_id", pregnancyProfileId, "log_date");
}

export function createPregnancyLog(input: Partial<PregnancyLog> & { pregnancyProfileId: string }) {
  const draft = createPregnancyLogDefaults(input);
  const validation = validatePregnancyLog(draft);
  return validation.valid ? createOne("pregnancy_logs", draft, mapPregnancyLogRow) : validationFail<PregnancyLog>(validation.error);
}

export function getPregnancyAppointments(pregnancyProfileId: string) {
  return list("pregnancy_appointments", mapPregnancyAppointmentRow, "pregnancy_profile_id", pregnancyProfileId, "appointment_at");
}

export function createPregnancyAppointment(input: Partial<PregnancyAppointment> & { pregnancyProfileId: string; title: string }) {
  const draft = createPregnancyAppointmentDefaults(input);
  const validation = validatePregnancyAppointment(draft);
  return validation.valid ? createOne("pregnancy_appointments", draft, mapPregnancyAppointmentRow) : validationFail<PregnancyAppointment>(validation.error);
}

export function getPregnancyChecklists(pregnancyProfileId: string) {
  return list("pregnancy_checklists", mapPregnancyChecklistRow, "pregnancy_profile_id", pregnancyProfileId);
}

export function createPregnancyChecklist(input: Partial<PregnancyChecklist> & { pregnancyProfileId: string; title: string }) {
  const draft = createPregnancyChecklistDefaults(input);
  const validation = validatePregnancyChecklist(draft);
  return validation.valid ? createOne("pregnancy_checklists", draft, mapPregnancyChecklistRow) : validationFail<PregnancyChecklist>(validation.error);
}

export function updatePregnancyChecklist(id: string, input: Partial<PregnancyChecklist>) {
  return updateOne("pregnancy_checklists", id, input, mapPregnancyChecklistRow);
}

export function getPregnancyCareTeam(pregnancyProfileId: string) {
  return list("pregnancy_care_team", mapPregnancyCareTeamRow, "pregnancy_profile_id", pregnancyProfileId);
}

export function createPregnancyCareTeamContact(input: Partial<PregnancyCareTeamMember> & { pregnancyProfileId: string; displayName: string }) {
  return createOne("pregnancy_care_team", createPregnancyCareTeamDefaults(input), mapPregnancyCareTeamRow);
}

export function getWomenHealthLogs(subjectCareProfileId?: string) {
  return list("women_health_logs", mapWomenHealthLogRow, subjectCareProfileId ? "subject_care_profile_id" : undefined, subjectCareProfileId, "log_date");
}

export function createWomenHealthLog(input: Partial<WomenHealthLog> = {}) {
  const draft = createWomenHealthLogDefaults(input);
  const validation = validateWomenHealthLog(draft);
  return validation.valid ? createOne("women_health_logs", draft, mapWomenHealthLogRow) : validationFail<WomenHealthLog>(validation.error);
}

export function getContraceptionLogs(subjectCareProfileId?: string) {
  return list("contraception_logs", mapContraceptionLogRow, subjectCareProfileId ? "subject_care_profile_id" : undefined, subjectCareProfileId);
}

export function createContraceptionLog(input: Partial<ContraceptionLog> & { methodType: string }) {
  const draft = createContraceptionLogDefaults(input);
  const validation = validateContraceptionLog(draft);
  return validation.valid ? createOne("contraception_logs", draft, mapContraceptionLogRow) : validationFail<ContraceptionLog>(validation.error);
}

export function getSexDayLogs(subjectCareProfileId?: string) {
  return list("sex_day_logs", mapSexDayLogRow, subjectCareProfileId ? "subject_care_profile_id" : undefined, subjectCareProfileId, "log_date");
}

export function createSexDayLog(input: Partial<SexDayLog> = {}) {
  const draft = createSexDayLogDefaults(input);
  const validation = validateSexDayLog(draft);
  return validation.valid ? createOne("sex_day_logs", draft, mapSexDayLogRow) : validationFail<SexDayLog>(validation.error);
}

export function getChildCareLogs(subjectCareProfileId: string) {
  return list("child_care_logs", mapChildCareLogRow, "subject_care_profile_id", subjectCareProfileId, "log_time");
}

export function createChildCareLog(input: Partial<ChildCareLog> & { subjectCareProfileId: string; logType: string }) {
  const draft = createChildCareLogDefaults(input);
  const validation = validateChildCareLog(draft);
  return validation.valid ? createOne("child_care_logs", draft, mapChildCareLogRow) : validationFail<ChildCareLog>(validation.error);
}

export function getFeedingLogs(subjectCareProfileId: string) {
  return list("feeding_logs", mapFeedingLogRow, "subject_care_profile_id", subjectCareProfileId, "started_at");
}

export function createFeedingLog(input: Partial<FeedingLog> & { subjectCareProfileId: string; feedingType: string }) {
  const draft = createFeedingLogDefaults(input);
  const validation = validateFeedingLog(draft);
  return validation.valid ? createOne("feeding_logs", draft, mapFeedingLogRow) : validationFail<FeedingLog>(validation.error);
}

export function getSleepLogs(subjectCareProfileId: string) {
  return list("sleep_logs", mapSleepLogRow, "subject_care_profile_id", subjectCareProfileId, "started_at");
}

export function createSleepLog(input: Partial<SleepLog> & { subjectCareProfileId: string }) {
  const draft = createSleepLogDefaults(input);
  const validation = validateSleepLog(draft);
  return validation.valid ? createOne("sleep_logs", draft, mapSleepLogRow) : validationFail<SleepLog>(validation.error);
}

export function getDiaperLogs(subjectCareProfileId: string) {
  return list("diaper_logs", mapDiaperLogRow, "subject_care_profile_id", subjectCareProfileId, "logged_at");
}

export function createDiaperLog(input: Partial<DiaperLog> & { subjectCareProfileId: string; diaperType: string }) {
  const draft = createDiaperLogDefaults(input);
  const validation = validateDiaperLog(draft);
  return validation.valid ? createOne("diaper_logs", draft, mapDiaperLogRow) : validationFail<DiaperLog>(validation.error);
}

export function getGrowthMeasurements(subjectCareProfileId: string) {
  return list("growth_measurements", mapGrowthMeasurementRow, "subject_care_profile_id", subjectCareProfileId, "measured_at");
}

export function createGrowthMeasurement(input: Partial<GrowthMeasurement> & { subjectCareProfileId: string }) {
  const draft = createGrowthMeasurementDefaults(input);
  const validation = validateGrowthMeasurement(draft);
  return validation.valid ? createOne("growth_measurements", draft, mapGrowthMeasurementRow) : validationFail<GrowthMeasurement>(validation.error);
}

export function getVaccineRecords(subjectCareProfileId: string) {
  return list("vaccine_records", mapVaccineRecordRow, "subject_care_profile_id", subjectCareProfileId);
}

export function createVaccineRecord(input: Partial<VaccineRecord> & { subjectCareProfileId: string; vaccineName: string }) {
  const draft = createVaccineRecordDefaults(input);
  const validation = validateVaccineRecord(draft);
  return validation.valid ? createOne("vaccine_records", draft, mapVaccineRecordRow) : validationFail<VaccineRecord>(validation.error);
}

export function getMilestoneLogs(subjectCareProfileId: string) {
  return list("milestone_logs", mapMilestoneLogRow, "subject_care_profile_id", subjectCareProfileId);
}

export function createMilestoneLog(input: Partial<MilestoneLog> & { subjectCareProfileId: string; milestoneKey: string; milestoneLabel: string }) {
  const draft = createMilestoneLogDefaults(input);
  const validation = validateMilestoneLog(draft);
  return validation.valid ? createOne("milestone_logs", draft, mapMilestoneLogRow) : validationFail<MilestoneLog>(validation.error);
}

export function getSolidsLogs(subjectCareProfileId: string) {
  return list("solids_logs", mapSolidsLogRow, "subject_care_profile_id", subjectCareProfileId, "introduced_at");
}

export function createSolidsLog(input: Partial<SolidsLog> & { subjectCareProfileId: string; foodName: string }) {
  const draft = createSolidsLogDefaults(input);
  const validation = validateSolidsLog(draft);
  return validation.valid ? createOne("solids_logs", draft, mapSolidsLogRow) : validationFail<SolidsLog>(validation.error);
}

export function getChildMedicationNotes(subjectCareProfileId: string) {
  return list("child_medication_notes", mapChildMedicationNoteRow, "subject_care_profile_id", subjectCareProfileId);
}

export function createChildMedicationNote(input: Partial<ChildMedicationNote> & { subjectCareProfileId: string; noteText: string }) {
  const validation = validateChildMedicationNote(input);
  return validation.valid ? createOne("child_medication_notes", input, mapChildMedicationNoteRow) : validationFail<ChildMedicationNote>(validation.error);
}

export function getCaregiverNotes(subjectCareProfileId: string) {
  return list("caregiver_notes", mapCaregiverNoteRow, "subject_care_profile_id", subjectCareProfileId);
}

export function createCaregiverNote(input: Partial<CaregiverNote> & { subjectCareProfileId: string; noteText: string }) {
  const validation = validateCaregiverNote(input);
  return validation.valid ? createOne("caregiver_notes", { noteType: "general", visibilityScope: "guardianOnly", ...input }, mapCaregiverNoteRow) : validationFail<CaregiverNote>(validation.error);
}

export async function createLifeStageRecordLinkCandidate(input: LifeStageRecordLinkCandidate) {
  return createOne("record_links", { ...input, linkType: "life_stage_candidate", reviewStatus: "needsReview" }, (row) => row);
}

export async function createLifeStageReminderCandidate(input: LifeStageReminderCandidate) {
  return createOne("reminders", { ...input, reviewRequired: true, status: "needsReview", titlePrivacySafe: input.titlePrivacySafe }, (row) => row);
}

export function createPregnancyReminderCandidate(sourceRowId?: string) {
  return createLifeStageReminderCandidate({ sourceRowId, sourceTable: "pregnancy_appointments", titlePrivacySafe: getPrivacySafeLifeStageTitle("pregnancy") });
}

export function createWomenHealthReminderCandidate(sourceRowId?: string) {
  return createLifeStageReminderCandidate({ sourceRowId, sourceTable: "contraception_logs", titlePrivacySafe: getPrivacySafeLifeStageTitle("womenHealth") });
}

export function createChildCareReminderCandidate(sourceTable = "child_care_logs", sourceRowId?: string) {
  return createLifeStageReminderCandidate({ sourceRowId, sourceTable, titlePrivacySafe: getPrivacySafeLifeStageTitle(sourceTable === "vaccine_records" ? "vaccine" : "childCare") });
}

async function list<T>(tableName: TableName, mapper: (row: LifeStageRow) => T, filterColumn?: string, filterValue?: string, orderColumn = "created_at"): Promise<HealthOSLifeStageServiceResult<T[]>> {
  let query = supabase.from(tableName).select("*").order(orderColumn, { ascending: false, nullsFirst: false });
  if (filterColumn && filterValue) query = query.eq(filterColumn, filterValue);
  const { data, error } = await query;
  if (isMissingTable(error)) return missingTable(tableName, []);
  if (error) return fail(`Could not load ${tableName}.`, error);
  return ok(toRows(data).map(mapper));
}

async function createOne<T>(tableName: TableName, input: Record<string, unknown>, mapper: (row: LifeStageRow) => T): Promise<HealthOSLifeStageServiceResult<T>> {
  const user = await getCurrentLifeStageAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase.from(tableName).insert(removeUndefined(toSnakeInsert(user.data.id, input))).select("*").single();
  if (isMissingTable(error)) return missingTable(tableName);
  if (error) return fail(`Could not create ${tableName}.`, error);
  return ok(mapper(data as LifeStageRow));
}

async function updateOne<T>(tableName: TableName, id: string, input: Record<string, unknown>, mapper: (row: LifeStageRow) => T): Promise<HealthOSLifeStageServiceResult<T>> {
  const { data, error } = await supabase.from(tableName).update(removeUndefined(toSnakeInsert("", input))).eq("id", id).select("*").single();
  if (isMissingTable(error)) return missingTable(tableName);
  if (error) return fail(`Could not update ${tableName}.`, error);
  return ok(mapper(data as LifeStageRow));
}

function ok<T>(data: T): HealthOSLifeStageServiceResult<T> {
  return { data, error: null, status: "ready" };
}

function validationFail<T>(error: string): HealthOSLifeStageServiceResult<T> {
  return { data: null, error, status: "error" };
}

function fail<T>(message: string, error?: unknown): HealthOSLifeStageServiceResult<T> {
  return { data: null, error: friendlyError(message, error), status: "error" };
}

function missingTable<T>(tableName: TableName, fallback: T | null = null): HealthOSLifeStageServiceResult<T> {
  return { data: fallback, error: `${tableName} is not available until the Batch 7 migration is applied and Supabase types are regenerated.`, status: "missingTable" };
}

function passStatus<T>(result: HealthOSLifeStageServiceResult<T>) {
  return { data: null, error: result.error, status: result.status } satisfies HealthOSLifeStageServiceResult<never>;
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
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== ""));
}

function toRows(data: unknown) {
  return Array.isArray(data) ? (data as LifeStageRow[]) : [];
}
