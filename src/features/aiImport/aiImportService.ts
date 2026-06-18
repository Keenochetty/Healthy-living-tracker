import { supabase } from "@/lib/supabase";

import { createDefaultAIImportEnvelope } from "./aiImportDefaults";
import {
  mapAIExtractionJobRowToJob,
  mapAIImportEnvelopeRowToEnvelope,
  mapAIReviewEventRowToEvent,
  mapAISourceEvidenceRowToEvidence,
  mapEnvelopeToInsert,
  mapEnvelopeToUpdate,
  mapExtractionJobToInsert,
  mapReviewEventToInsert,
  mapSourceEvidenceToInsert,
} from "./aiImportMappers";
import { getAIProviderErrorSafeMessage } from "./aiImportSafety";
import {
  validateCreateExtractionJob,
  validateCreateImportEnvelope,
  validateReviewStatusTransition,
} from "./aiImportValidation";
import type {
  HealthOSAIExtractionJob,
  HealthOSAIExtractionJobStatus,
  HealthOSAIImportEnvelope,
  HealthOSAIImportResult,
  HealthOSAIImportTarget,
  HealthOSAIReviewEvent,
  HealthOSAISourceEvidence,
} from "./aiImportTypes";

const MISSING_TABLE_CODES = new Set(["42P01", "PGRST205", "PGRST204"]);

export async function getCurrentAuthUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return result(null, "missingAuth", "Sign in required.");
  return result(data.user, "ready");
}

export async function getAIImportQueue() {
  const user = await getCurrentAuthUser();
  if (!user.data) return result<HealthOSAIImportEnvelope[]>([], user.status, user.error ?? undefined);
  const { data, error } = await fromTable("ai_import_envelopes")
    .select("*")
    .eq("owner_user_id", user.data.id)
    .order("created_at", { ascending: false });
  if (error) return dbError<HealthOSAIImportEnvelope[]>(error, []);
  return result((data ?? []).map((row) => mapAIImportEnvelopeRowToEnvelope(row)), "ready");
}

export async function getAIImportEnvelopeById(id: string) {
  const user = await getCurrentAuthUser();
  if (!user.data) return result<HealthOSAIImportEnvelope>(null, user.status, user.error ?? undefined);
  const { data, error } = await fromTable("ai_import_envelopes")
    .select("*")
    .eq("id", id)
    .eq("owner_user_id", user.data.id)
    .maybeSingle();
  if (error) return dbError<HealthOSAIImportEnvelope>(error, null);
  return result(data ? mapAIImportEnvelopeRowToEnvelope(data) : null, "ready");
}

export async function createExtractionJob(job: HealthOSAIExtractionJob) {
  const validation = validateCreateExtractionJob(job);
  if (!validation.valid) return result<HealthOSAIExtractionJob>(null, "error", validation.errors[0]);
  const { data, error } = await fromTable("ai_extraction_jobs")
    .insert(mapExtractionJobToInsert(job))
    .select("*")
    .single();
  if (error) return dbError<HealthOSAIExtractionJob>(error, null);
  return result(mapAIExtractionJobRowToJob(data), "ready");
}

export async function updateExtractionJobStatus(id: string, status: HealthOSAIExtractionJobStatus, errorMessagePrivacySafe?: string) {
  const { data, error } = await fromTable("ai_extraction_jobs")
    .update({
      status: status === "needsReview" ? "needs_review" : status,
      error_message_privacy_safe: errorMessagePrivacySafe ?? null,
      completed_at: ["completed", "failed", "cancelled"].includes(status) ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return dbError<HealthOSAIExtractionJob>(error, null);
  return result(mapAIExtractionJobRowToJob(data), "ready");
}

export async function createAIImportEnvelope(envelope: HealthOSAIImportEnvelope) {
  const validation = validateCreateImportEnvelope(envelope);
  if (!validation.valid) return result<HealthOSAIImportEnvelope>(null, "error", validation.errors[0]);
  const { data, error } = await fromTable("ai_import_envelopes")
    .insert(mapEnvelopeToInsert(envelope))
    .select("*")
    .single();
  if (error) return dbError<HealthOSAIImportEnvelope>(error, null);
  return result(mapAIImportEnvelopeRowToEnvelope(data), "ready");
}

export async function updateAIImportEnvelope(id: string, updates: Partial<HealthOSAIImportEnvelope>) {
  const { data, error } = await fromTable("ai_import_envelopes")
    .update(mapEnvelopeToUpdate(updates))
    .eq("id", id)
    .select("*")
    .single();
  if (error) return dbError<HealthOSAIImportEnvelope>(error, null);
  return result(mapAIImportEnvelopeRowToEnvelope(data), "ready");
}

export function markAIImportInReview(id: string) {
  return updateAIImportEnvelope(id, { reviewStatus: "inReview" });
}

export function markAIImportReviewed(id: string) {
  return updateAIImportEnvelope(id, { reviewStatus: "reviewed", reviewedAt: new Date().toISOString() });
}

export function markAIImportDismissed(id: string) {
  return updateAIImportEnvelope(id, { reviewStatus: "dismissed", dismissedAt: new Date().toISOString() });
}

export async function markAIImportImported(envelope: HealthOSAIImportEnvelope) {
  const validation = validateReviewStatusTransition(envelope.reviewStatus, "imported");
  if (!validation.valid || !envelope.id) return result<HealthOSAIImportEnvelope>(null, "reviewRequired", validation.errors[0]);
  return updateAIImportEnvelope(envelope.id, { reviewStatus: "imported", importedAt: new Date().toISOString() });
}

export async function getAIReviewEvents(importEnvelopeId: string) {
  const { data, error } = await fromTable("ai_review_events")
    .select("*")
    .eq("import_envelope_id", importEnvelopeId)
    .order("created_at", { ascending: false });
  if (error) return dbError<HealthOSAIReviewEvent[]>(error, []);
  return result((data ?? []).map((row) => mapAIReviewEventRowToEvent(row)), "ready");
}

export async function createAIReviewEvent(event: HealthOSAIReviewEvent) {
  const { data, error } = await fromTable("ai_review_events")
    .insert(mapReviewEventToInsert(event))
    .select("*")
    .single();
  if (error) return dbError<HealthOSAIReviewEvent>(error, null);
  return result(mapAIReviewEventRowToEvent(data), "ready");
}

export async function getAISourceEvidence(importEnvelopeId: string) {
  const { data, error } = await fromTable("ai_source_evidence")
    .select("*")
    .eq("import_envelope_id", importEnvelopeId)
    .order("created_at", { ascending: false });
  if (error) return dbError<HealthOSAISourceEvidence[]>(error, []);
  return result((data ?? []).map((row) => mapAISourceEvidenceRowToEvidence(row)), "ready");
}

export async function createAISourceEvidence(evidence: HealthOSAISourceEvidence) {
  const { data, error } = await fromTable("ai_source_evidence")
    .insert(mapSourceEvidenceToInsert(evidence))
    .select("*")
    .single();
  if (error) return dbError<HealthOSAISourceEvidence>(error, null);
  return result(mapAISourceEvidenceRowToEvidence(data), "ready");
}

export async function createImportCandidateFromScan(params: {
  ownerUserId: string;
  sourceType: string;
  requestedTarget?: HealthOSAIImportTarget;
  subjectCareProfileId?: string | null;
  sourceRecordId?: string | null;
}) {
  const job = await createExtractionJob({
    ownerUserId: params.ownerUserId,
    subjectCareProfileId: params.subjectCareProfileId,
    sourceType: params.sourceType,
    sourceRecordId: params.sourceRecordId,
    status: "needsReview",
    requestedTarget: params.requestedTarget ?? "records",
  });
  if (!job.data) return result<HealthOSAIImportEnvelope>(null, job.status, job.error ?? undefined);
  return createAIImportEnvelope(createDefaultAIImportEnvelope(params.ownerUserId, {
    extractionJobId: job.data.id,
    primaryTarget: params.requestedTarget ?? "records",
    createdFrom: "scan",
    title: "Scan import candidate",
  }));
}

export function createImportCandidateFromRecord(ownerUserId: string, sourceRecordId: string) {
  return createImportCandidateFromScan({
    ownerUserId,
    sourceRecordId,
    sourceType: "record",
    requestedTarget: "records",
  });
}

export function createImportCandidateFromChat(ownerUserId: string, target: HealthOSAIImportTarget) {
  return createAIImportEnvelope(createDefaultAIImportEnvelope(ownerUserId, {
    primaryTarget: target,
    createdFrom: "chat",
    title: "Chat import candidate",
  }));
}

export async function invokeAIExtractFunction(payload: Record<string, unknown>) {
  return invokeFunction("healthos-ai-import", payload);
}

export async function invokeAIChatFunction(payload: Record<string, unknown>) {
  return invokeFunction("ai-chat", payload);
}

async function invokeFunction(name: string, payload: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke(name, { body: payload });
  if (error) {
    return result<unknown>(null, "edgeFunctionMissing", getAIProviderErrorSafeMessage(error), "Edge Function is not available or returned an error.");
  }
  return result(data, "ready");
}

function fromTable(name: string) {
  return supabase.from(name as never);
}

function dbError<T>(error: { code?: string; message?: string }, fallback: T | null): HealthOSAIImportResult<T> {
  if (error.code && MISSING_TABLE_CODES.has(error.code)) {
    return result(fallback, "missingTable", "AI import persistence table is not available yet.", error.message);
  }
  return result(fallback, "error", "AI import data is not available right now.", error.message);
}

function result<T>(
  data: T | null,
  status: HealthOSAIImportResult<T>["status"],
  error: string | null = null,
  deferredReason?: string,
): HealthOSAIImportResult<T> {
  return { data, error, status, deferredReason };
}
