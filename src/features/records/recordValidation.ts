import type {
  HealthOSEmergencyPacketItemCreateInput,
  HealthOSRecordCreateInput,
  HealthOSRecordExtractionCreateInput,
  HealthOSRecordFileCreateInput,
  HealthOSRecordLinkCreateInput,
} from "./recordTypes";

const MAX_TITLE_LENGTH = 140;
const MAX_TAGS = 20;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export type ValidationResult = { valid: true } | { error: string; valid: false };

export function validateRecordCreate(input: HealthOSRecordCreateInput): ValidationResult {
  const title = input.title.trim();
  if (!title) return invalid("Record title is required.");
  if (title.length > MAX_TITLE_LENGTH) return invalid("Record title is too long.");
  if ((input.tags?.length ?? 0) > MAX_TAGS) return invalid("Too many record tags.");
  return { valid: true };
}

export function validateRecordFileCreate(input: HealthOSRecordFileCreateInput): ValidationResult {
  if (!input.recordId) return invalid("Record id is required for file metadata.");
  if (input.fileSizeBytes !== undefined && input.fileSizeBytes !== null && input.fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    return invalid("Record file is too large. Maximum size is 10MB.");
  }
  if (input.contentType && !ALLOWED_CONTENT_TYPES.has(input.contentType)) {
    return invalid("Unsupported record file content type.");
  }
  return { valid: true };
}

export function validateRecordLinkCreate(input: HealthOSRecordLinkCreateInput): ValidationResult {
  if (!input.recordId) return invalid("Record id is required for linking.");
  return { valid: true };
}

export function validateRecordExtractionCreate(input: HealthOSRecordExtractionCreateInput): ValidationResult {
  if (!input.recordId) return invalid("Record id is required for extraction metadata.");
  if (input.confidence !== undefined && input.confidence !== null && (input.confidence < 0 || input.confidence > 1)) {
    return invalid("Extraction confidence must be between 0 and 1.");
  }
  return { valid: true };
}

export function validateEmergencyPacketItemCreate(input: HealthOSEmergencyPacketItemCreateInput): ValidationResult {
  if (!input.recordId && !input.subjectCareProfileId) {
    return invalid("Emergency packet item must reference a record or care profile.");
  }
  return { valid: true };
}

function invalid(error: string): ValidationResult {
  return { error, valid: false };
}
