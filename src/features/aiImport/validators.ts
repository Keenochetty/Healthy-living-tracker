import { z } from "zod";

import { getFieldDefinitions } from "./fieldDefinitions";
import type { HealthOSAIImportEnvelope, HealthOSAIImportTarget } from "./types";

const importTypeSchema = z.enum([
  "food_label",
  "meal",
  "meal_plan",
  "recipe",
  "grocery_list",
  "medication",
  "supplement",
  "prescription",
  "doctor_note",
  "medical_record",
  "lab_report",
  "vaccine_card",
  "workout_plan",
  "exercise",
  "gym_machine",
  "pregnancy_document",
  "baby_child_document",
  "cycle_note",
  "symptom_note",
  "calendar_event",
  "family_note",
  "article",
  "general_note",
  "unknown",
]);

const targetSchema = z.enum([
  "nutrition",
  "medication",
  "supplements",
  "records",
  "fitness",
  "calendar",
  "pregnancy",
  "babyChild",
  "womensHealth",
  "family",
  "health",
  "home",
  "none",
]);

const confidenceSchema = z.object({
  label: z.enum(["low", "medium", "high", "unknown"]),
  reason: z.string().optional(),
  score: z.number(),
});

const warningSchema = z.object({
  blocking: z.boolean(),
  message: z.string(),
  relatedFieldIds: z.array(z.string()).optional(),
  severity: z.enum(["info", "warning", "danger"]),
  title: z.string(),
  type: z.string(),
  warningId: z.string(),
});

const fieldSchema = z.object({
  confidence: confidenceSchema,
  editable: z.boolean(),
  evidenceIds: z.array(z.string()),
  fieldId: z.string(),
  key: z.string(),
  label: z.string(),
  medicalRisk: z.enum(["none", "low", "medium", "high"]).optional(),
  normalizedValue: z.unknown().optional(),
  rawText: z.string().optional(),
  requiredForTargets: z.array(targetSchema),
  reviewStatus: z.enum(["pending", "confirmed", "edited", "rejected", "missing", "uncertain", "notApplicable"]),
  sensitive: z.boolean().optional(),
  unit: z.string().optional(),
  validationMessage: z.string().optional(),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.null()]),
});

export const healthOSAIImportEnvelopeSchema = z.object({
  candidateTypes: z.array(importTypeSchema),
  confidence: confidenceSchema,
  createdAt: z.string(),
  detectedType: importTypeSchema,
  evidence: z.array(z.object({
    confidence: z.number().optional(),
    evidenceId: z.string(),
    kind: z.enum(["text_snippet", "image_region", "document_page", "source_link", "user_input", "model_inference"]),
    pageNumber: z.number().optional(),
    sourceId: z.string(),
    sourceName: z.string().optional(),
    sourceUrl: z.string().optional(),
    text: z.string().optional(),
  }).passthrough()),
  importId: z.string(),
  items: z.array(z.object({
    alternativeTargets: z.array(targetSchema),
    confidence: confidenceSchema,
    evidenceIds: z.array(z.string()),
    fields: z.array(fieldSchema),
    itemId: z.string(),
    itemType: importTypeSchema,
    reviewStatus: z.enum(["pendingReview", "inReview", "needsMoreInfo", "readyToImport", "partiallyImported", "imported", "dismissed", "failed"]),
    subtitle: z.string().optional(),
    suggestedTarget: targetSchema,
    title: z.string(),
    warnings: z.array(warningSchema),
  })),
  language: z.string().optional(),
  missingFields: z.array(z.object({
    fieldId: z.string(),
    key: z.string(),
    label: z.string(),
    reason: z.string(),
    requiredForTargets: z.array(targetSchema),
    severity: z.enum(["info", "warning", "blocking"]),
  })),
  nextActions: z.array(z.object({
    actionId: z.string(),
    actionType: z.string(),
    enabled: z.boolean(),
    label: z.string(),
    reasonDisabled: z.string().optional(),
    requiresConfirmation: z.boolean(),
    target: targetSchema,
  })),
  primaryTarget: targetSchema.optional(),
  rawBackendJobId: z.string().optional(),
  rawModelResponseId: z.string().optional(),
  safety: z.object({
    canAutoSave: z.literal(false),
    containsChildData: z.boolean(),
    containsFamilySharingData: z.boolean(),
    containsMedicalData: z.boolean(),
    containsMedicationData: z.boolean(),
    containsPregnancyData: z.boolean(),
    containsWomenHealthData: z.boolean(),
    requiresHumanReview: z.boolean(),
    safetyNotes: z.array(z.string()),
  }),
  schemaVersion: z.literal("1.0"),
  source: z.object({
    capturedAt: z.string().optional(),
    fileName: z.string().optional(),
    imageUri: z.string().optional(),
    localUri: z.string().optional(),
    mimeType: z.string().optional(),
    recordId: z.string().optional(),
    sourceId: z.string(),
    sourceName: z.string().optional(),
    sourceType: z.enum(["camera", "gallery", "document", "pdf", "text", "ai_chat", "record", "url", "unknown"]),
    sourceUrl: z.string().optional(),
    storagePath: z.string().optional(),
    thumbnailUri: z.string().optional(),
  }),
  suggestedTargets: z.array(targetSchema),
  summary: z.string().optional(),
  title: z.string(),
  warnings: z.array(warningSchema),
});

export function isHealthOSAIImportEnvelope(value: unknown): value is HealthOSAIImportEnvelope {
  return healthOSAIImportEnvelopeSchema.safeParse(value).success;
}

export function validateHealthOSAIImportEnvelope(value: unknown) {
  const result = healthOSAIImportEnvelopeSchema.safeParse(value);
  if (result.success) return { envelope: result.data as HealthOSAIImportEnvelope, errors: [] };
  return { envelope: null, errors: result.error.issues.map((issue) => issue.message) };
}

export function getMissingRequiredFields(envelope: HealthOSAIImportEnvelope, target: HealthOSAIImportTarget) {
  const requiredKeys = new Set(
    getFieldDefinitions(envelope.detectedType)
      .filter((field) => field.requiredForTargets.includes(target))
      .map((field) => field.key),
  );
  const fields = envelope.items.flatMap((item) => item.fields);
  return [...requiredKeys].filter((key) => {
    const field = fields.find((item) => item.key === key);
    return !field || field.value === null || field.reviewStatus === "missing" || field.reviewStatus === "rejected";
  });
}

export function getAIImportBlockingReasons(envelope: HealthOSAIImportEnvelope, target: HealthOSAIImportTarget) {
  const reasons = envelope.warnings.filter((warning) => warning.blocking).map((warning) => warning.title);
  const missing = getMissingRequiredFields(envelope, target);
  if (missing.length) reasons.push(`Missing required fields: ${missing.join(", ")}`);
  const riskyUnconfirmed = envelope.items
    .flatMap((item) => item.fields)
    .filter((field) => field.medicalRisk === "high" && !["confirmed", "edited"].includes(field.reviewStatus));
  if (riskyUnconfirmed.length) reasons.push("High-risk fields must be confirmed.");
  if (envelope.safety.canAutoSave !== false) reasons.push("Auto-save is not allowed.");
  return reasons;
}

export function canImportToTarget(envelope: HealthOSAIImportEnvelope, target: HealthOSAIImportTarget) {
  return getAIImportBlockingReasons(envelope, target).length === 0;
}
