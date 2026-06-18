import { createDefaultAIImportEnvelope } from "./aiImportDefaults";
import { isValidAIImportTarget } from "./aiImportTargets";
import type {
  HealthOSAIConfidenceLabel,
  HealthOSAIImportDetectedType,
  HealthOSAIImportEnvelope,
  HealthOSAIImportEvidence,
  HealthOSAIImportField,
  HealthOSAIImportTarget,
  HealthOSAIImportWarning,
} from "./aiImportTypes";

const DETECTED_TYPES = new Set<HealthOSAIImportDetectedType>([
  "foodLabel", "meal", "mealPlan", "recipe", "groceryList", "medication", "supplement", "prescription", "doctorNote", "medicalRecord", "labReport", "vaccineCard", "workoutPlan", "exercise", "gymMachine", "pregnancyDocument", "babyChildDocument", "cycleNote", "symptomNote", "calendarEvent", "reminder", "familyNote", "article", "generalNote", "unknown",
]);
const CONFIDENCE = new Set<HealthOSAIConfidenceLabel>(["high", "medium", "low", "unknown"]);

export function validateAIImportTarget(value: unknown): value is HealthOSAIImportTarget {
  return typeof value === "string" && isValidAIImportTarget(value);
}

export function validateAIImportDetectedType(value: unknown): value is HealthOSAIImportDetectedType {
  return typeof value === "string" && DETECTED_TYPES.has(value as HealthOSAIImportDetectedType);
}

export function validateAIImportEnvelopeShape(value: unknown) {
  if (!value || typeof value !== "object") return { valid: false, errors: ["Envelope must be an object."] };
  const envelope = value as Partial<HealthOSAIImportEnvelope>;
  const errors: string[] = [];
  if (!envelope.ownerUserId) errors.push("ownerUserId is required.");
  if (!validateAIImportDetectedType(envelope.detectedType)) errors.push("detectedType is invalid.");
  if (!validateAIImportTarget(envelope.primaryTarget)) errors.push("primaryTarget is invalid.");
  return { valid: errors.length === 0, errors };
}

export function normalizeAIImportEnvelope(value: unknown, ownerUserId: string): HealthOSAIImportEnvelope {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const detectedType = validateAIImportDetectedType(raw.detectedType) ? raw.detectedType : "unknown";
  const primaryTarget = validateAIImportTarget(raw.primaryTarget) ? raw.primaryTarget : "none";
  const secondaryTargets = Array.isArray(raw.secondaryTargets)
    ? raw.secondaryTargets.filter(validateAIImportTarget)
    : [];
  return createDefaultAIImportEnvelope(ownerUserId, {
    id: typeof raw.id === "string" ? raw.id : undefined,
    subjectCareProfileId: nullableString(raw.subjectCareProfileId),
    extractionJobId: nullableString(raw.extractionJobId),
    detectedType,
    primaryTarget,
    secondaryTargets,
    title: nullableString(raw.title),
    summaryPrivacySafe: nullableString(raw.summaryPrivacySafe),
    confidenceLabel: CONFIDENCE.has(raw.confidenceLabel as HealthOSAIConfidenceLabel) ? raw.confidenceLabel as HealthOSAIConfidenceLabel : "unknown",
    fields: Array.isArray(raw.fields) ? raw.fields.map(normalizeAIImportField) : [],
    warnings: Array.isArray(raw.warnings) ? raw.warnings.map(normalizeAIImportWarning) : [],
    sourceEvidence: Array.isArray(raw.sourceEvidence) ? raw.sourceEvidence.map(normalizeAIImportEvidence) : [],
    missingFields: Array.isArray(raw.missingFields) ? raw.missingFields.map(String) : [],
    nextActions: Array.isArray(raw.nextActions) ? raw.nextActions.map(String) : [],
  });
}

export function normalizeAIImportField(value: unknown): HealthOSAIImportField {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    key: typeof raw.key === "string" ? raw.key : "unknown",
    label: typeof raw.label === "string" ? raw.label : "Unknown field",
    value: raw.value ?? null,
    unit: nullableString(raw.unit),
    confidence: CONFIDENCE.has(raw.confidence as HealthOSAIConfidenceLabel) ? raw.confidence as HealthOSAIConfidenceLabel : "unknown",
    requiresReview: raw.requiresReview !== false,
    targetField: nullableString(raw.targetField),
  };
}

export function normalizeAIImportWarning(value: unknown): HealthOSAIImportWarning {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const severity = ["info", "normal", "important", "urgent", "critical"].includes(String(raw.severity))
    ? raw.severity as HealthOSAIImportWarning["severity"]
    : "important";
  return {
    type: typeof raw.type === "string" ? raw.type : "review_required",
    severity,
    message: typeof raw.message === "string" ? raw.message : "Review before importing.",
  };
}

export function normalizeAIImportEvidence(value: unknown): HealthOSAIImportEvidence {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    sourceType: typeof raw.sourceType === "string" ? raw.sourceType : "unknown",
    label: nullableString(raw.label),
    summary: nullableString(raw.summary),
    sourceRecordId: nullableString(raw.sourceRecordId),
  };
}

function nullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}
