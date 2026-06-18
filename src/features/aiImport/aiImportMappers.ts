import { normalizeAIImportEnvelope } from "./aiImportSchema";
import type {
  HealthOSAIExtractionJob,
  HealthOSAIExtractionJobStatus,
  HealthOSAIImportEnvelope,
  HealthOSAIImportReviewStatus,
  HealthOSAIImportTarget,
  HealthOSAIReviewEvent,
  HealthOSAISourceEvidence,
} from "./aiImportTypes";

type Row = Record<string, unknown>;

export function mapAIExtractionJobRowToJob(row: Row): HealthOSAIExtractionJob {
  return {
    id: stringOrUndefined(row.id),
    ownerUserId: stringOrEmpty(row.owner_user_id),
    subjectCareProfileId: stringOrNull(row.subject_care_profile_id),
    sourceType: stringOrEmpty(row.source_type) || "unknown",
    sourceRecordId: stringOrNull(row.source_record_id),
    sourceFileId: stringOrNull(row.source_file_id),
    sourceStoragePath: stringOrNull(row.source_storage_path),
    inputSummary: stringOrNull(row.input_summary),
    status: fromDbJobStatus(row.status),
    requestedTarget: fromDbTarget(row.requested_target),
    modelLabel: stringOrNull(row.model_label),
    errorMessagePrivacySafe: stringOrNull(row.error_message_privacy_safe),
    createdAt: stringOrNull(row.created_at),
    updatedAt: stringOrNull(row.updated_at),
    completedAt: stringOrNull(row.completed_at),
  };
}

export function mapAIImportEnvelopeRowToEnvelope(row: Row): HealthOSAIImportEnvelope {
  const envelopeJson = objectOrEmpty(row.envelope_json);
  return normalizeAIImportEnvelope(
    {
      ...envelopeJson,
      id: row.id,
      ownerUserId: row.owner_user_id,
      subjectCareProfileId: row.subject_care_profile_id,
      extractionJobId: row.extraction_job_id,
      detectedType: fromDbDetectedType(row.detected_type),
      primaryTarget: fromDbTarget(row.primary_target) ?? "none",
      secondaryTargets: Array.isArray(row.secondary_targets) ? row.secondary_targets.map(fromDbTarget).filter(Boolean) : [],
      title: row.title,
      summaryPrivacySafe: row.summary_privacy_safe,
      reviewStatus: fromDbReviewStatus(row.review_status),
      confidenceLabel: row.confidence_label,
      fields: row.normalized_fields ?? envelopeJson.fields,
      warnings: row.warnings_json ?? envelopeJson.warnings,
      sourceEvidence: row.source_evidence_json ?? envelopeJson.sourceEvidence,
    },
    stringOrEmpty(row.owner_user_id),
  );
}

export function mapAIReviewEventRowToEvent(row: Row): HealthOSAIReviewEvent {
  return {
    id: stringOrUndefined(row.id),
    importEnvelopeId: stringOrEmpty(row.import_envelope_id),
    ownerUserId: stringOrEmpty(row.owner_user_id),
    eventType: fromDbEventType(row.event_type),
    targetRealm: fromDbTarget(row.target_realm),
    targetRowId: stringOrNull(row.target_row_id),
    notePrivacySafe: stringOrNull(row.note_privacy_safe),
    createdAt: stringOrNull(row.created_at),
  };
}

export function mapAISourceEvidenceRowToEvidence(row: Row): HealthOSAISourceEvidence {
  return {
    id: stringOrUndefined(row.id),
    ownerUserId: stringOrEmpty(row.owner_user_id),
    importEnvelopeId: stringOrNull(row.import_envelope_id),
    extractionJobId: stringOrNull(row.extraction_job_id),
    sourceType: stringOrEmpty(row.source_type) || "unknown",
    sourceRecordId: stringOrNull(row.source_record_id),
    sourceFileId: stringOrNull(row.source_file_id),
    evidenceLabel: stringOrNull(row.evidence_label),
    evidenceSummary: stringOrNull(row.evidence_summary),
    storageBucket: stringOrNull(row.storage_bucket),
    storagePath: stringOrNull(row.storage_path),
    createdAt: stringOrNull(row.created_at),
  };
}

export function mapEnvelopeToInsert(envelope: HealthOSAIImportEnvelope) {
  return {
    owner_user_id: envelope.ownerUserId,
    subject_care_profile_id: envelope.subjectCareProfileId ?? null,
    extraction_job_id: envelope.extractionJobId ?? null,
    detected_type: toDbDetectedType(envelope.detectedType),
    primary_target: toDbTarget(envelope.primaryTarget),
    secondary_targets: envelope.secondaryTargets.map(toDbTarget),
    title: envelope.title ?? null,
    summary_privacy_safe: envelope.summaryPrivacySafe ?? null,
    review_status: toDbReviewStatus(envelope.reviewStatus),
    confidence_label: envelope.confidenceLabel,
    envelope_json: {
      fields: envelope.fields,
      missingFields: envelope.missingFields,
      nextActions: envelope.nextActions,
    },
    normalized_fields: envelope.fields,
    warnings_json: envelope.warnings,
    source_evidence_json: envelope.sourceEvidence,
    created_from: envelope.createdFrom,
  };
}

export function mapEnvelopeToUpdate(envelope: Partial<HealthOSAIImportEnvelope>) {
  const update: Row = {};
  if (envelope.reviewStatus) update.review_status = toDbReviewStatus(envelope.reviewStatus);
  if (envelope.title !== undefined) update.title = envelope.title;
  if (envelope.summaryPrivacySafe !== undefined) update.summary_privacy_safe = envelope.summaryPrivacySafe;
  if (envelope.fields) update.normalized_fields = envelope.fields;
  if (envelope.warnings) update.warnings_json = envelope.warnings;
  if (envelope.sourceEvidence) update.source_evidence_json = envelope.sourceEvidence;
  if (envelope.reviewedAt !== undefined) update.reviewed_at = envelope.reviewedAt;
  if (envelope.dismissedAt !== undefined) update.dismissed_at = envelope.dismissedAt;
  if (envelope.importedAt !== undefined) update.imported_at = envelope.importedAt;
  return update;
}

export function mapReviewEventToInsert(event: HealthOSAIReviewEvent) {
  return {
    import_envelope_id: event.importEnvelopeId,
    owner_user_id: event.ownerUserId,
    event_type: toDbEventType(event.eventType),
    target_realm: event.targetRealm ? toDbTarget(event.targetRealm) : null,
    target_row_id: event.targetRowId ?? null,
    note_privacy_safe: event.notePrivacySafe ?? null,
  };
}

export function mapExtractionJobToInsert(job: HealthOSAIExtractionJob) {
  return {
    owner_user_id: job.ownerUserId,
    subject_care_profile_id: job.subjectCareProfileId ?? null,
    source_type: job.sourceType,
    source_record_id: job.sourceRecordId ?? null,
    source_file_id: job.sourceFileId ?? null,
    source_storage_path: job.sourceStoragePath ?? null,
    input_summary: job.inputSummary ?? null,
    status: toDbJobStatus(job.status),
    requested_target: job.requestedTarget ? toDbTarget(job.requestedTarget) : null,
    model_label: job.modelLabel ?? null,
    error_message_privacy_safe: job.errorMessagePrivacySafe ?? null,
    completed_at: job.completedAt ?? null,
  };
}

export function mapSourceEvidenceToInsert(evidence: HealthOSAISourceEvidence) {
  return {
    owner_user_id: evidence.ownerUserId,
    import_envelope_id: evidence.importEnvelopeId ?? null,
    extraction_job_id: evidence.extractionJobId ?? null,
    source_type: evidence.sourceType,
    source_record_id: evidence.sourceRecordId ?? null,
    source_file_id: evidence.sourceFileId ?? null,
    evidence_label: evidence.evidenceLabel ?? null,
    evidence_summary: evidence.evidenceSummary ?? null,
    storage_bucket: evidence.storageBucket ?? null,
    storage_path: evidence.storagePath ?? null,
  };
}

export function toDbTarget(target: HealthOSAIImportTarget) {
  if (target === "babyChild") return "baby_child";
  if (target === "womensHealth") return "womens_health";
  if (target === "trustedContent") return "trusted_content";
  return target;
}

function fromDbTarget(value: unknown): HealthOSAIImportTarget | null {
  if (value === "baby_child") return "babyChild";
  if (value === "womens_health" || value === "cycle") return "womensHealth";
  if (value === "trusted_content") return "trustedContent";
  if (typeof value === "string") return value as HealthOSAIImportTarget;
  return null;
}

function toDbDetectedType(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function fromDbDetectedType(value: unknown) {
  if (typeof value !== "string") return "unknown";
  return value.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function toDbReviewStatus(status: HealthOSAIImportReviewStatus) {
  if (status === "needsReview") return "needs_review";
  if (status === "inReview") return "in_review";
  return status;
}

function fromDbReviewStatus(value: unknown): HealthOSAIImportReviewStatus {
  if (value === "needs_review") return "needsReview";
  if (value === "in_review") return "inReview";
  return (typeof value === "string" ? value : "unknown") as HealthOSAIImportReviewStatus;
}

function toDbJobStatus(status: HealthOSAIExtractionJobStatus) {
  if (status === "needsReview") return "needs_review";
  return status;
}

function fromDbJobStatus(value: unknown): HealthOSAIExtractionJobStatus {
  if (value === "needs_review") return "needsReview";
  return (typeof value === "string" ? value : "unknown") as HealthOSAIExtractionJobStatus;
}

function toDbEventType(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function fromDbEventType(value: unknown): HealthOSAIReviewEvent["eventType"] {
  if (typeof value !== "string") return "unknown";
  return value.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase()) as HealthOSAIReviewEvent["eventType"];
}

function objectOrEmpty(value: unknown): Row {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Row : {};
}

function stringOrEmpty(value: unknown) {
  return typeof value === "string" ? value : "";
}

function stringOrNull(value: unknown) {
  return typeof value === "string" ? value : null;
}

function stringOrUndefined(value: unknown) {
  return typeof value === "string" ? value : undefined;
}
