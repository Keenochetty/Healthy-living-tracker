import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

import {
  mapEmergencyPacketItemRow,
  mapEmergencyPacketItemToInsert,
  mapRecordExtractionRow,
  mapRecordExtractionToInsert,
  mapRecordFileRow,
  mapRecordFileToInsert,
  mapRecordLinkRow,
  mapRecordLinkToInsert,
  mapRecordRow,
  mapRecordToInsert,
  mapRecordToUpdate,
} from "./recordMappers";
import {
  HEALTH_RECORDS_PRIVATE_BUCKET_ID,
  SIGNED_RECORD_FILE_URL_SECONDS,
  isRecordStoragePathOwnerScoped,
} from "./recordStoragePaths";
import {
  validateEmergencyPacketItemCreate,
  validateRecordCreate,
  validateRecordExtractionCreate,
  validateRecordFileCreate,
  validateRecordLinkCreate,
} from "./recordValidation";
import type {
  HealthOSEmergencyPacketItem,
  HealthOSEmergencyPacketItemCreateInput,
  HealthOSRecord,
  HealthOSRecordCreateInput,
  HealthOSRecordExtraction,
  HealthOSRecordExtractionCreateInput,
  HealthOSRecordFile,
  HealthOSRecordFileCreateInput,
  HealthOSRecordLink,
  HealthOSRecordLinkCreateInput,
  HealthOSRecordUpdateInput,
  HealthOSRecordsServiceResult,
} from "./recordTypes";

type Row = Record<string, unknown>;
type TableName =
  | "emergency_packet_items"
  | "record_extractions"
  | "record_files"
  | "record_links"
  | "records";

export async function getCurrentRecordsAuthUser(): Promise<HealthOSRecordsServiceResult<User>> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return fail("Could not load the signed-in user.", error);
  if (!data.user) return { data: null, error: null, status: "missingAuth" };
  return ok(data.user);
}

export async function getRecords(): Promise<HealthOSRecordsServiceResult<HealthOSRecord[]>> {
  const { data, error } = await supabase
    .from("records")
    .select("*")
    .neq("review_status", "archived")
    .order("updated_at", { ascending: false });
  if (isMissingTable(error)) return missingTable("records", []);
  if (error) return fail("Could not load records.", error);
  return ok(toRows(data).map(mapRecordRow));
}

export async function getRecordById(recordId: string): Promise<HealthOSRecordsServiceResult<HealthOSRecord>> {
  const { data, error } = await supabase
    .from("records")
    .select("*")
    .eq("id", recordId)
    .maybeSingle();
  if (isMissingTable(error)) return missingTable("records");
  if (error) return fail("Could not load the record.", error);
  return { data: data ? mapRecordRow(data as Row) : null, error: null, status: "ready" };
}

export async function createRecord(input: HealthOSRecordCreateInput): Promise<HealthOSRecordsServiceResult<HealthOSRecord>> {
  const validation = validateRecordCreate(input);
  if (!validation.valid) return validationFail(validation.error);
  const user = await getCurrentRecordsAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase
    .from("records")
    .insert(removeUndefined(mapRecordToInsert(user.data.id, input)))
    .select("*")
    .single();
  if (isMissingTable(error)) return missingTable("records");
  if (error) return fail("Could not create the record.", error);
  return ok(mapRecordRow(data as Row));
}

export async function updateRecord(
  recordId: string,
  input: HealthOSRecordUpdateInput,
): Promise<HealthOSRecordsServiceResult<HealthOSRecord>> {
  const { data, error } = await supabase
    .from("records")
    .update(removeUndefined(mapRecordToUpdate(input)))
    .eq("id", recordId)
    .select("*")
    .single();
  if (isMissingTable(error)) return missingTable("records");
  if (error) return fail("Could not update the record.", error);
  return ok(mapRecordRow(data as Row));
}

export function archiveRecord(recordId: string) {
  return updateRecord(recordId, { reviewStatus: "archived" });
}

export async function getRecordFiles(recordId: string): Promise<HealthOSRecordsServiceResult<HealthOSRecordFile[]>> {
  const { data, error } = await supabase
    .from("record_files")
    .select("*")
    .eq("record_id", recordId)
    .order("created_at", { ascending: false });
  if (isMissingTable(error)) return missingTable("record_files", []);
  if (error) return fail("Could not load record files.", error);
  return ok(toRows(data).map(mapRecordFileRow));
}

export async function createRecordFileMetadata(
  input: HealthOSRecordFileCreateInput,
): Promise<HealthOSRecordsServiceResult<HealthOSRecordFile>> {
  const validation = validateRecordFileCreate(input);
  if (!validation.valid) return validationFail(validation.error);
  const user = await getCurrentRecordsAuthUser();
  if (!user.data) return passStatus(user);
  if (input.storagePath && !isRecordStoragePathOwnerScoped(input.storagePath, user.data.id)) {
    return validationFail("Record storage path must be owner scoped.");
  }
  const { data, error } = await supabase
    .from("record_files")
    .insert(removeUndefined(mapRecordFileToInsert(user.data.id, input)))
    .select("*")
    .single();
  if (isMissingTable(error)) return missingTable("record_files");
  if (error) return fail("Could not create record file metadata.", error);
  return ok(mapRecordFileRow(data as Row));
}

export async function getRecordLinks(recordId: string): Promise<HealthOSRecordsServiceResult<HealthOSRecordLink[]>> {
  const { data, error } = await supabase
    .from("record_links")
    .select("*")
    .eq("record_id", recordId)
    .order("created_at", { ascending: false });
  if (isMissingTable(error)) return missingTable("record_links", []);
  if (error) return fail("Could not load record links.", error);
  return ok(toRows(data).map(mapRecordLinkRow));
}

export async function createRecordLink(input: HealthOSRecordLinkCreateInput): Promise<HealthOSRecordsServiceResult<HealthOSRecordLink>> {
  const validation = validateRecordLinkCreate(input);
  if (!validation.valid) return validationFail(validation.error);
  const user = await getCurrentRecordsAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase
    .from("record_links")
    .insert(removeUndefined(mapRecordLinkToInsert(user.data.id, input)))
    .select("*")
    .single();
  if (isMissingTable(error)) return missingTable("record_links");
  if (error) return fail("Could not create the record link.", error);
  return ok(mapRecordLinkRow(data as Row));
}

export async function getRecordExtractions(recordId: string): Promise<HealthOSRecordsServiceResult<HealthOSRecordExtraction[]>> {
  const { data, error } = await supabase
    .from("record_extractions")
    .select("*")
    .eq("record_id", recordId)
    .order("created_at", { ascending: false });
  if (isMissingTable(error)) return missingTable("record_extractions", []);
  if (error) return fail("Could not load record extraction metadata.", error);
  return ok(toRows(data).map(mapRecordExtractionRow));
}

export async function createRecordExtraction(
  input: HealthOSRecordExtractionCreateInput,
): Promise<HealthOSRecordsServiceResult<HealthOSRecordExtraction>> {
  const validation = validateRecordExtractionCreate(input);
  if (!validation.valid) return validationFail(validation.error);
  const user = await getCurrentRecordsAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase
    .from("record_extractions")
    .insert(removeUndefined(mapRecordExtractionToInsert(user.data.id, input)))
    .select("*")
    .single();
  if (isMissingTable(error)) return missingTable("record_extractions");
  if (error) return fail("Could not create extraction metadata.", error);
  return ok(mapRecordExtractionRow(data as Row));
}

export async function getEmergencyPacketItems(
  subjectCareProfileId?: string,
): Promise<HealthOSRecordsServiceResult<HealthOSEmergencyPacketItem[]>> {
  let query = supabase
    .from("emergency_packet_items")
    .select("*")
    .eq("is_enabled", true)
    .order("sort_order", { ascending: true });
  if (subjectCareProfileId) query = query.eq("subject_care_profile_id", subjectCareProfileId);
  const { data, error } = await query;
  if (isMissingTable(error)) return missingTable("emergency_packet_items", []);
  if (error) return fail("Could not load emergency packet items.", error);
  return ok(toRows(data).map(mapEmergencyPacketItemRow));
}

export async function addEmergencyPacketItem(
  input: HealthOSEmergencyPacketItemCreateInput,
): Promise<HealthOSRecordsServiceResult<HealthOSEmergencyPacketItem>> {
  const validation = validateEmergencyPacketItemCreate(input);
  if (!validation.valid) return validationFail(validation.error);
  const user = await getCurrentRecordsAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase
    .from("emergency_packet_items")
    .insert(removeUndefined(mapEmergencyPacketItemToInsert(user.data.id, input)))
    .select("*")
    .single();
  if (isMissingTable(error)) return missingTable("emergency_packet_items");
  if (error) return fail("Could not add the emergency packet item.", error);
  return ok(mapEmergencyPacketItemRow(data as Row));
}

export async function createSignedRecordFileUrl(
  file: HealthOSRecordFile,
): Promise<HealthOSRecordsServiceResult<string>> {
  if (file.bucketId !== HEALTH_RECORDS_PRIVATE_BUCKET_ID || !file.storagePath) {
    return {
      data: null,
      error: "Signed URL generation is deferred until private record storage is configured.",
      status: "storageDeferred",
    };
  }
  if (!isRecordStoragePathOwnerScoped(file.storagePath, file.ownerUserId)) {
    return validationFail("Record storage path is not owner scoped.");
  }
  const { data, error } = await supabase.storage
    .from(file.bucketId)
    .createSignedUrl(file.storagePath, SIGNED_RECORD_FILE_URL_SECONDS);
  if (error) return fail("Could not create a private record file URL.", error);
  return ok(data.signedUrl);
}

export function createRecordDraftFromScan(input: Omit<HealthOSRecordCreateInput, "reviewStatus" | "sourceType">) {
  return createRecord({
    ...input,
    reviewStatus: "needsReview",
    sourceType: "scan",
  });
}

function ok<T>(data: T): HealthOSRecordsServiceResult<T> {
  return { data, error: null, status: "ready" };
}

function validationFail<T>(error: string): HealthOSRecordsServiceResult<T> {
  return { data: null, error, status: "error" };
}

function fail<T>(message: string, error?: unknown): HealthOSRecordsServiceResult<T> {
  return { data: null, error: friendlyError(message, error), status: "error" };
}

function missingTable<T>(tableName: TableName, fallback: T | null = null): HealthOSRecordsServiceResult<T> {
  return {
    data: fallback,
    error: `${tableName} is not available until the Batch 4 migration is applied.`,
    status: "missingTable",
  };
}

function passStatus<T>(result: HealthOSRecordsServiceResult<T>) {
  return {
    data: null,
    error: result.error,
    status: result.status,
  } satisfies HealthOSRecordsServiceResult<never>;
}

function friendlyError(fallback: string, error?: unknown) {
  return fallback;
}

function isMissingTable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; message?: string };
  return candidate.code === "42P01" || candidate.message?.includes("does not exist") === true;
}

function removeUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  );
}

function toRows(data: unknown) {
  return Array.isArray(data) ? (data as Row[]) : [];
}
