import {
  DEFAULT_RECORD_CATEGORY,
  DEFAULT_RECORD_FILE_STATUS,
  DEFAULT_RECORD_PRIVACY_SCOPE,
  DEFAULT_RECORD_REVIEW_STATUS,
  DEFAULT_RECORD_SOURCE_TYPE,
} from "./recordDefaults";
import type {
  HealthOSEmergencyPacketItem,
  HealthOSEmergencyPacketItemCreateInput,
  HealthOSRecord,
  HealthOSRecordCategory,
  HealthOSRecordCreateInput,
  HealthOSRecordExtraction,
  HealthOSRecordExtractionCreateInput,
  HealthOSRecordFile,
  HealthOSRecordFileCreateInput,
  HealthOSRecordFileStatus,
  HealthOSRecordLink,
  HealthOSRecordLinkCreateInput,
  HealthOSRecordLinkedRealm,
  HealthOSRecordPrivacyScope,
  HealthOSRecordReviewStatus,
  HealthOSRecordSourceType,
  HealthOSRecordUpdateInput,
} from "./recordTypes";

type Row = Record<string, unknown>;

const categoryToDb: Record<HealthOSRecordCategory, string> = {
  babyChildDocument: "baby_child_document",
  doctorNote: "doctor_note",
  generalHealth: "general_health",
  labReport: "lab_report",
  medicalAid: "medical_aid",
  medicationLabel: "medication_label",
  other: "other",
  pregnancyDocument: "pregnancy_document",
  prescription: "prescription",
  scanUpload: "scan_upload",
  supplementLabel: "supplement_label",
  vaccineCard: "vaccine_card",
};

const sourceToDb: Record<HealthOSRecordSourceType, string> = {
  aiImport: "ai_import",
  documentPicker: "document_picker",
  gallery: "gallery",
  linkedRealm: "linked_realm",
  manual: "manual",
  scan: "scan",
};

const reviewToDb: Record<HealthOSRecordReviewStatus, string> = {
  archived: "archived",
  draft: "draft",
  needsReview: "needs_review",
  rejected: "rejected",
  reviewed: "reviewed",
  saved: "saved",
};

const privacyToDb: Record<HealthOSRecordPrivacyScope, string> = {
  caregiverLimited: "caregiver_limited",
  emergency: "emergency",
  private: "private",
  selected: "selected",
};

const fileStatusToDb: Record<HealthOSRecordFileStatus, string> = {
  archived: "archived",
  failed: "failed",
  metadataOnly: "metadata_only",
  pendingUpload: "pending_upload",
  uploaded: "uploaded",
};

const realmToDb: Record<HealthOSRecordLinkedRealm, string> = {
  aiImport: "ai_import",
  babyChild: "baby_child",
  calendar: "calendar",
  health: "health",
  medication: "medication",
  pregnancy: "pregnancy",
  records: "records",
  supplements: "supplements",
  womensHealth: "womens_health",
};

export function mapRecordRow(row: Row): HealthOSRecord {
  return {
    category: fromDb(categoryToDb, text(row.category), DEFAULT_RECORD_CATEGORY),
    createdAt: nullableText(row.created_at),
    documentDate: nullableText(row.document_date),
    expiresAt: nullableText(row.expires_at),
    id: nullableText(row.id) ?? undefined,
    metadata: object(row.metadata),
    notes: nullableText(row.notes),
    ownerUserId: text(row.owner_user_id),
    privacyScope: fromDb(privacyToDb, text(row.privacy_scope), DEFAULT_RECORD_PRIVACY_SCOPE),
    reviewStatus: fromDb(reviewToDb, text(row.review_status), DEFAULT_RECORD_REVIEW_STATUS),
    sourceType: fromDb(sourceToDb, text(row.source_type), DEFAULT_RECORD_SOURCE_TYPE),
    subjectCareProfileId: nullableText(row.subject_care_profile_id),
    tags: arrayOfText(row.tags),
    title: text(row.title),
    updatedAt: nullableText(row.updated_at),
  };
}

export function mapRecordToInsert(ownerUserId: string, input: HealthOSRecordCreateInput) {
  return {
    category: categoryToDb[input.category ?? DEFAULT_RECORD_CATEGORY],
    document_date: input.documentDate,
    expires_at: input.expiresAt,
    metadata: input.metadata ?? {},
    notes: input.notes,
    owner_user_id: ownerUserId,
    privacy_scope: privacyToDb[input.privacyScope ?? DEFAULT_RECORD_PRIVACY_SCOPE],
    review_status: reviewToDb[input.reviewStatus ?? DEFAULT_RECORD_REVIEW_STATUS],
    source_type: sourceToDb[input.sourceType ?? DEFAULT_RECORD_SOURCE_TYPE],
    subject_care_profile_id: input.subjectCareProfileId,
    tags: input.tags ?? [],
    title: input.title.trim(),
  };
}

export function mapRecordToUpdate(input: HealthOSRecordUpdateInput) {
  return {
    category: input.category ? categoryToDb[input.category] : undefined,
    document_date: input.documentDate,
    expires_at: input.expiresAt,
    metadata: input.metadata,
    notes: input.notes,
    privacy_scope: input.privacyScope ? privacyToDb[input.privacyScope] : undefined,
    review_status: input.reviewStatus ? reviewToDb[input.reviewStatus] : undefined,
    subject_care_profile_id: input.subjectCareProfileId,
    tags: input.tags,
    title: input.title?.trim(),
  };
}

export function mapRecordFileRow(row: Row): HealthOSRecordFile {
  return {
    bucketId: text(row.bucket_id),
    checksumSha256: nullableText(row.checksum_sha256),
    contentType: nullableText(row.content_type),
    createdAt: nullableText(row.created_at),
    displayName: nullableText(row.display_name),
    fileSizeBytes: nullableNumber(row.file_size_bytes),
    id: nullableText(row.id) ?? undefined,
    metadata: object(row.metadata),
    originalFileName: nullableText(row.original_file_name),
    ownerUserId: text(row.owner_user_id),
    recordId: text(row.record_id),
    storagePath: nullableText(row.storage_path),
    uploadStatus: fromDb(fileStatusToDb, text(row.upload_status), DEFAULT_RECORD_FILE_STATUS),
    uploadedAt: nullableText(row.uploaded_at),
    updatedAt: nullableText(row.updated_at),
  };
}

export function mapRecordFileToInsert(ownerUserId: string, input: HealthOSRecordFileCreateInput) {
  return {
    bucket_id: input.bucketId,
    checksum_sha256: input.checksumSha256,
    content_type: input.contentType,
    display_name: input.displayName,
    file_size_bytes: input.fileSizeBytes,
    metadata: input.metadata ?? {},
    original_file_name: input.originalFileName,
    owner_user_id: ownerUserId,
    record_id: input.recordId,
    storage_path: input.storagePath,
    upload_status: fileStatusToDb[input.uploadStatus ?? DEFAULT_RECORD_FILE_STATUS],
    uploaded_at: input.uploadStatus === "uploaded" ? new Date().toISOString() : undefined,
  };
}

export function mapRecordLinkRow(row: Row): HealthOSRecordLink {
  return {
    createdAt: nullableText(row.created_at),
    id: nullableText(row.id) ?? undefined,
    linkLabel: nullableText(row.link_label),
    linkedEntityId: nullableText(row.linked_entity_id),
    linkedRealm: fromDb(realmToDb, text(row.linked_realm), "records"),
    metadata: object(row.metadata),
    ownerUserId: text(row.owner_user_id),
    recordId: text(row.record_id),
    updatedAt: nullableText(row.updated_at),
  };
}

export function mapRecordLinkToInsert(ownerUserId: string, input: HealthOSRecordLinkCreateInput) {
  return {
    link_label: input.linkLabel,
    linked_entity_id: input.linkedEntityId,
    linked_realm: realmToDb[input.linkedRealm],
    metadata: input.metadata ?? {},
    owner_user_id: ownerUserId,
    record_id: input.recordId,
  };
}

export function mapRecordExtractionRow(row: Row): HealthOSRecordExtraction {
  return {
    confidence: nullableNumber(row.confidence),
    createdAt: nullableText(row.created_at),
    extractedFields: object(row.extracted_fields),
    id: nullableText(row.id) ?? undefined,
    modelLabel: nullableText(row.model_label),
    ownerUserId: text(row.owner_user_id),
    recordFileId: nullableText(row.record_file_id),
    recordId: text(row.record_id),
    reviewStatus: fromDb(reviewToDb, text(row.review_status), "needsReview"),
    sourceType: fromDb(sourceToDb, text(row.source_type), "aiImport"),
    updatedAt: nullableText(row.updated_at),
    warnings: arrayOfText(row.warnings),
  };
}

export function mapRecordExtractionToInsert(ownerUserId: string, input: HealthOSRecordExtractionCreateInput) {
  return {
    confidence: input.confidence,
    extracted_fields: input.extractedFields ?? {},
    model_label: input.modelLabel,
    owner_user_id: ownerUserId,
    record_file_id: input.recordFileId,
    record_id: input.recordId,
    review_status: reviewToDb[input.reviewStatus ?? "needsReview"],
    source_type: sourceToDb[input.sourceType ?? "aiImport"],
    warnings: input.warnings ?? [],
  };
}

export function mapEmergencyPacketItemRow(row: Row): HealthOSEmergencyPacketItem {
  return {
    createdAt: nullableText(row.created_at),
    id: nullableText(row.id) ?? undefined,
    isEnabled: boolean(row.is_enabled, true),
    itemType: text(row.item_type),
    label: nullableText(row.label),
    metadata: object(row.metadata),
    ownerUserId: text(row.owner_user_id),
    recordId: nullableText(row.record_id),
    sortOrder: number(row.sort_order, 0),
    subjectCareProfileId: nullableText(row.subject_care_profile_id),
    updatedAt: nullableText(row.updated_at),
  };
}

export function mapEmergencyPacketItemToInsert(ownerUserId: string, input: HealthOSEmergencyPacketItemCreateInput) {
  return {
    is_enabled: input.isEnabled ?? true,
    item_type: input.itemType ?? "record",
    label: input.label,
    metadata: input.metadata ?? {},
    owner_user_id: ownerUserId,
    record_id: input.recordId,
    sort_order: input.sortOrder ?? 0,
    subject_care_profile_id: input.subjectCareProfileId,
  };
}

function fromDb<T extends string>(map: Record<T, string>, value: string, fallback: T): T {
  return (Object.entries(map).find(([, dbValue]) => dbValue === value)?.[0] as T | undefined) ?? fallback;
}

function nullableText(value: unknown) {
  return typeof value === "string" ? value : null;
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function nullableNumber(value: unknown) {
  return typeof value === "number" ? value : null;
}

function number(value: unknown, fallback: number) {
  return typeof value === "number" ? value : fallback;
}

function boolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function arrayOfText(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
