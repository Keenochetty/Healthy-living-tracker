import { canAttachPrivateContextToAI, canImportToTarget } from "./aiImportSafety";
import type {
  HealthOSAIExtractionJob,
  HealthOSAIImportEnvelope,
  HealthOSAIImportReviewStatus,
  HealthOSAIImportTarget,
  HealthOSAISourceEvidence,
} from "./aiImportTypes";

export function validateCreateExtractionJob(job: HealthOSAIExtractionJob) {
  const errors: string[] = [];
  if (!job.ownerUserId) errors.push("Owner is required.");
  if (!job.sourceType) errors.push("Source type is required.");
  return result(errors);
}

export function validateCreateImportEnvelope(envelope: HealthOSAIImportEnvelope) {
  const errors: string[] = [];
  if (!envelope.ownerUserId) errors.push("Owner is required.");
  if (envelope.reviewStatus === "imported") errors.push("New AI envelopes cannot start as imported.");
  if (envelope.primaryTarget === "none" && envelope.reviewStatus === "reviewed") errors.push("Known target is required before review completion.");
  return result(errors);
}

export function validateReviewStatusTransition(
  current: HealthOSAIImportReviewStatus,
  next: HealthOSAIImportReviewStatus,
) {
  if (next === "imported" && current !== "reviewed" && current !== "imported") {
    return result(["Imported status requires reviewed status first."]);
  }
  if (current === "dismissed" && next === "imported") {
    return result(["Dismissed imports cannot be marked imported."]);
  }
  return result([]);
}

export function validateImportTargetBeforeReview(envelope: HealthOSAIImportEnvelope, target: HealthOSAIImportTarget) {
  if (!canImportToTarget(envelope, target)) {
    return result(["This import needs review before saving to the target realm."]);
  }
  return result([]);
}

export function validateContextAttachment(userConfirmedContext: boolean) {
  return canAttachPrivateContextToAI(userConfirmedContext)
    ? result([])
    : result(["Private context requires explicit user confirmation."]);
}

export function validateEvidenceReference(evidence: HealthOSAISourceEvidence) {
  if (!evidence.importEnvelopeId && !evidence.extractionJobId) {
    return result(["Evidence must link to an import envelope or extraction job."]);
  }
  return result([]);
}

function result(errors: string[]) {
  return { valid: errors.length === 0, errors };
}
