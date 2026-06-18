import { HIGH_SENSITIVITY_AI_IMPORT_TARGETS } from "./aiImportDefaults";
import { getAIImportTargetRegistryItem } from "./aiImportTargets";
import type { HealthOSAIImportDetectedType, HealthOSAIImportEnvelope, HealthOSAIImportTarget } from "./aiImportTypes";

export function requiresHumanReview(envelopeOrType: HealthOSAIImportEnvelope | HealthOSAIImportDetectedType) {
  if (typeof envelopeOrType === "string") return true;
  return envelopeOrType.reviewStatus !== "imported";
}

export function isHighSensitivityTarget(target: HealthOSAIImportTarget) {
  return HIGH_SENSITIVITY_AI_IMPORT_TARGETS.includes(target);
}

export function getAIImportSafetyWarning(target: HealthOSAIImportTarget) {
  if (target === "none") return "No target selected. Nothing can be saved.";
  if (isHighSensitivityTarget(target)) return "Sensitive health or family data requires careful human review before saving.";
  return "Review AI output before saving. No data is saved automatically.";
}

export function getPrivacySafeImportTitle(envelope: Pick<HealthOSAIImportEnvelope, "title" | "detectedType"> | null) {
  if (!envelope?.title?.trim()) return "AI import candidate";
  return envelope.title.trim().slice(0, 120);
}

export function canImportToTarget(envelope: HealthOSAIImportEnvelope, target: HealthOSAIImportTarget) {
  const config = getAIImportTargetRegistryItem(target);
  return Boolean(
    target !== "none" &&
      config.supportedDetectedTypes.includes(envelope.detectedType) &&
      ["reviewed", "imported"].includes(envelope.reviewStatus),
  );
}

export function canAttachPrivateContextToAI(userConfirmedContext: boolean) {
  return userConfirmedContext === true;
}

export function shouldRedactInSharedContext(target: HealthOSAIImportTarget) {
  return isHighSensitivityTarget(target);
}

export function getAIProviderErrorSafeMessage(error: unknown) {
  if (!error) return "Could not process this with AI right now.";
  return "Could not process this with AI right now. No data was saved.";
}
