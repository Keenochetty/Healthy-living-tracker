import type { AppAIImportPayload, AppAIInputType } from "@/types/appAI";

import { getAllowedTargetsForImportType } from "./importTargets";
import { createSafetySummary, buildSafetyWarnings } from "./safetyRules";
import type {
  HealthOSAIConfidence,
  HealthOSAIImportEnvelope,
  HealthOSAIImportField,
  HealthOSAIImportSource,
  HealthOSAIImportTarget,
  HealthOSAIImportType,
} from "./types";

export function createEmptyAIImportEnvelope(partial: Partial<HealthOSAIImportEnvelope> = {}): HealthOSAIImportEnvelope {
  const importId = partial.importId ?? createId("ai-import");
  const detectedType = partial.detectedType ?? "unknown";
  const source = partial.source ?? makeSource("unknown");
  const suggestedTargets = partial.suggestedTargets ?? ["none"];
  const envelope: HealthOSAIImportEnvelope = {
    candidateTypes: partial.candidateTypes ?? [detectedType],
    confidence: partial.confidence ?? confidence(0, "unknown", "No extraction has run."),
    createdAt: partial.createdAt ?? new Date().toISOString(),
    detectedType,
    evidence: partial.evidence ?? [],
    importId,
    items: partial.items ?? [],
    missingFields: partial.missingFields ?? [],
    nextActions: partial.nextActions ?? [
      { actionId: `${importId}-discard`, actionType: "discard", enabled: true, label: "Discard", requiresConfirmation: true, target: "none" },
    ],
    primaryTarget: partial.primaryTarget ?? suggestedTargets[0],
    rawBackendJobId: partial.rawBackendJobId,
    rawModelResponseId: partial.rawModelResponseId,
    safety: partial.safety ?? createSafetySummary(detectedType),
    schemaVersion: "1.0",
    source,
    suggestedTargets,
    summary: partial.summary,
    title: partial.title ?? "AI import review",
    warnings: partial.warnings ?? [],
  };
  return { ...envelope, warnings: partial.warnings ?? buildSafetyWarnings(envelope) };
}

export function normalizeAIExtractionToEnvelope(value: unknown, source?: Partial<HealthOSAIImportSource>) {
  return normalizeUnknownAIResultToEnvelope(value, { ...source, sourceType: source?.sourceType ?? "unknown" });
}

export function normalizeScanResultToEnvelope(value: unknown, source?: Partial<HealthOSAIImportSource>) {
  return normalizeUnknownAIResultToEnvelope(value, { ...source, sourceType: source?.sourceType ?? "camera" });
}

export function normalizeChatResultToEnvelope(value: unknown, source?: Partial<HealthOSAIImportSource>) {
  if (isAppAIImportPayload(value)) return normalizeAppAIImportPayload(value, source);
  return normalizeUnknownAIResultToEnvelope(value, { ...source, sourceType: "ai_chat" });
}

export function normalizeRecordExtractionToEnvelope(value: unknown, source?: Partial<HealthOSAIImportSource>) {
  return normalizeUnknownAIResultToEnvelope(value, { ...source, sourceType: "record" });
}

export function normalizeUnknownAIResultToEnvelope(value: unknown, source?: Partial<HealthOSAIImportSource>) {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  const evidenceId = createId("evidence");
  return createEmptyAIImportEnvelope({
    evidence: text
      ? [{ evidenceId, kind: "model_inference", sourceId: source?.sourceId ?? "unknown-source", text: text.slice(0, 500) }]
      : [],
    source: makeSource(source?.sourceType ?? "unknown", source),
    summary: text ? text.slice(0, 160) : undefined,
    title: "Unsupported AI result",
  });
}

export function normalizeAppAIImportPayload(payload: AppAIImportPayload, source?: Partial<HealthOSAIImportSource>) {
  const detectedType = mapIntent(payload.intent.primary);
  const targets = mapTargets(payload.import_targets);
  const evidenceId = createId("evidence");
  const fields = fieldsFromPayload(payload, detectedType, targets, evidenceId);
  return createEmptyAIImportEnvelope({
    confidence: confidence(payload.source.confidence, labelFromScore(payload.source.confidence), "Backend structured import payload."),
    detectedType,
    evidence: [{
      confidence: payload.source.confidence,
      evidenceId,
      kind: payload.source.query ? "user_input" : "model_inference",
      sourceId: "app-ai-payload",
      text: payload.source.query || payload.summary.short_description,
    }],
    items: [{
      alternativeTargets: targets.filter((target) => target !== targets[0]),
      confidence: confidence(payload.source.confidence, labelFromScore(payload.source.confidence)),
      evidenceIds: [evidenceId],
      fields,
      itemId: createId("item"),
      itemType: detectedType,
      reviewStatus: "pendingReview",
      suggestedTarget: targets[0] ?? "records",
      title: payload.summary.title,
      warnings: [],
    }],
    primaryTarget: targets[0],
    safety: createSafetySummary(detectedType),
    source: makeSource(mapSourceType(payload.source.input_type), source),
    suggestedTargets: targets.length ? targets : getAllowedTargetsForImportType(detectedType).map((target) => target.key),
    summary: payload.summary.short_description,
    title: payload.summary.title,
  });
}

function fieldsFromPayload(
  payload: AppAIImportPayload,
  importType: HealthOSAIImportType,
  targets: HealthOSAIImportTarget[],
  evidenceId: string,
): HealthOSAIImportField[] {
  const base: Array<[string, string, unknown]> = [
    ["title", "Title", payload.summary.title],
    ["summary", "Summary", payload.summary.short_description],
  ];
  if (importType === "medication" || importType === "prescription") {
    base.push(["medicationName", "Medication name", payload.medication.name]);
    base.push(["doseInstructions", "Dose instructions", payload.medication.dosage]);
    base.push(["frequency", "Frequency", payload.medication.frequency]);
  }
  if (importType === "meal" || importType === "meal_plan" || importType === "food_label") {
    base.push(["ingredients", "Ingredients", payload.nutrition.ingredients]);
    base.push(["allergens", "Allergens", payload.nutrition.allergens]);
  }
  if (importType === "workout_plan") {
    base.push(["exercises", "Exercises", payload.fitness.exercises]);
    base.push(["safetyNotes", "Safety notes", payload.fitness.safety_notes]);
  }
  return base.map(([key, label, value]) => ({
    confidence: confidence(payload.source.confidence, labelFromScore(payload.source.confidence)),
    editable: true,
    evidenceIds: [evidenceId],
    fieldId: createId("field"),
    key,
    label,
    medicalRisk: ["medicationName", "doseInstructions", "frequency", "allergens"].includes(key) ? "high" : "low",
    requiredForTargets: targets,
    reviewStatus: value === null || value === undefined || (Array.isArray(value) && !value.length) ? "missing" : "pending",
    sensitive: ["medicationName", "doseInstructions", "frequency"].includes(key),
    value: toFieldValue(value),
  }));
}

function toFieldValue(value: unknown): string | number | boolean | string[] | null {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map(String);
  return null;
}

function mapIntent(intent: AppAIImportPayload["intent"]["primary"]): HealthOSAIImportType {
  if (intent === "nutrition") return "meal";
  if (intent === "fitness") return "workout_plan";
  if (intent === "medication") return "medication";
  if (intent === "supplement") return "supplement";
  if (intent === "calendar" || intent === "reminder") return "calendar_event";
  if (intent === "baby_child") return "baby_child_document";
  if (intent === "pregnancy") return "pregnancy_document";
  if (intent === "cycle") return "cycle_note";
  if (intent === "family") return "family_note";
  if (intent === "record" || intent === "general_health") return "medical_record";
  return "unknown";
}

function mapTargets(targets: AppAIImportPayload["import_targets"]): HealthOSAIImportTarget[] {
  return targets.map((target) => {
    if (target === "baby_child") return "babyChild";
    if (target === "cycle") return "womensHealth";
    if (target === "shopping_list") return "nutrition";
    return target;
  });
}

function mapSourceType(inputType: AppAIInputType): HealthOSAIImportSource["sourceType"] {
  if (inputType === "photo" || inputType === "barcode") return "camera";
  if (inputType === "document") return "document";
  if (inputType === "text" || inputType === "manual" || inputType === "voice") return "text";
  return "unknown";
}

function makeSource(sourceType: HealthOSAIImportSource["sourceType"], partial?: Partial<HealthOSAIImportSource>): HealthOSAIImportSource {
  return {
    sourceId: partial?.sourceId ?? createId("source"),
    sourceType,
    ...partial,
  };
}

function confidence(score: number, label: HealthOSAIConfidence["label"], reason?: string): HealthOSAIConfidence {
  return { label, reason, score };
}

function labelFromScore(score: number): HealthOSAIConfidence["label"] {
  if (score >= 0.8) return "high";
  if (score >= 0.5) return "medium";
  if (score > 0) return "low";
  return "unknown";
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isAppAIImportPayload(value: unknown): value is AppAIImportPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<AppAIImportPayload>;
  return Boolean(payload.source && payload.intent && payload.summary && Array.isArray(payload.import_targets));
}
