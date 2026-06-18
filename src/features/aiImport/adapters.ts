import { importAppAIData, SUPPORTED_APP_AI_IMPORT_TARGETS } from "@/lib/appAIImport";

import { getAIImportTargetConfig, HEALTHOS_AI_IMPORT_TARGETS } from "./importTargets";
import { getFieldDefinitions } from "./fieldDefinitions";
import type { HealthOSAIImportEnvelope, HealthOSAIImportTarget, HealthOSAIImportType } from "./types";

export type HealthOSAIRealmAdapter = {
  hasSaveHandler: boolean;
  optionalFields: string[];
  requiredFields: string[];
  routeTarget?: string;
  safetyNotes: string[];
  supportedImportTypes: HealthOSAIImportType[];
  target: HealthOSAIImportTarget;
  transform: (envelope: HealthOSAIImportEnvelope) => { deferred: boolean; payload: unknown; reason?: string };
};

export const HEALTHOS_AI_REALM_ADAPTERS: HealthOSAIRealmAdapter[] = HEALTHOS_AI_IMPORT_TARGETS.map((target) => ({
  hasSaveHandler: SUPPORTED_APP_AI_IMPORT_TARGETS.includes(toLegacyTarget(target.key) as never),
  optionalFields: [],
  requiredFields: [],
  routeTarget: target.routeTarget,
  safetyNotes: target.sensitive
    ? ["Sensitive target. Human review and explicit confirmation required."]
    : ["Human review required before import."],
  supportedImportTypes: target.allowedImportTypes,
  target: target.key,
  transform: (envelope) => ({
    deferred: !SUPPORTED_APP_AI_IMPORT_TARGETS.includes(toLegacyTarget(target.key) as never),
    payload: envelope,
    reason: SUPPORTED_APP_AI_IMPORT_TARGETS.includes(toLegacyTarget(target.key) as never)
      ? undefined
      : "No safe save handler is connected for this target yet.",
  }),
}));

export function getAdapterForTarget(target: HealthOSAIImportTarget) {
  return HEALTHOS_AI_REALM_ADAPTERS.find((adapter) => adapter.target === target) ?? null;
}

export function getSupportedTargetsForImportType(importType: HealthOSAIImportType) {
  return HEALTHOS_AI_REALM_ADAPTERS.filter((adapter) => adapter.supportedImportTypes.includes(importType));
}

export function transformEnvelopeForTarget(
  envelope: HealthOSAIImportEnvelope,
  target: HealthOSAIImportTarget,
) {
  const adapter = getAdapterForTarget(target);
  if (!adapter) return { deferred: true, payload: envelope, reason: "No adapter found." };
  const definitions = getFieldDefinitions(envelope.detectedType);
  return {
    ...adapter.transform(envelope),
    requiredFields: definitions.filter((field) => field.requiredForTargets.includes(target)).map((field) => field.key),
  };
}

export async function saveEnvelopeWithExistingHandler(
  envelope: HealthOSAIImportEnvelope,
  target: HealthOSAIImportTarget,
) {
  const config = getAIImportTargetConfig(target);
  if (!config?.saveHandlerKey) {
    return { deferred: true, message: "Save handler missing for this target." };
  }
  return {
    deferred: true,
    message: "Existing AppAI save handlers require legacy payloads. This contract keeps import deferred until a reviewed adapter maps the envelope safely.",
    unusedExistingHandler: importAppAIData.name,
  };
}

function toLegacyTarget(target: HealthOSAIImportTarget) {
  if (target === "babyChild") return "baby_child";
  if (target === "womensHealth") return "cycle";
  return target;
}
