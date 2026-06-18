import type {
  HealthOSAIConfidenceLabel,
  HealthOSAIImportDetectedType,
  HealthOSAIImportEnvelope,
  HealthOSAIImportReviewStatus,
  HealthOSAIImportTarget,
  HealthOSAIImportWarning,
} from "./aiImportTypes";

export const DEFAULT_AI_CONFIDENCE: HealthOSAIConfidenceLabel = "unknown";
export const DEFAULT_AI_TARGET: HealthOSAIImportTarget = "none";
export const DEFAULT_AI_REVIEW_STATUS: HealthOSAIImportReviewStatus = "needsReview";

export const HIGH_SENSITIVITY_AI_IMPORT_TARGETS: HealthOSAIImportTarget[] = [
  "medication",
  "supplements",
  "pregnancy",
  "babyChild",
  "womensHealth",
  "records",
  "reminders",
  "family",
  "health",
];

export function createDefaultAIImportEnvelope(
  ownerUserId: string,
  partial: Partial<HealthOSAIImportEnvelope> = {},
): HealthOSAIImportEnvelope {
  const detectedType = partial.detectedType ?? "unknown";
  const primaryTarget = partial.primaryTarget ?? DEFAULT_AI_TARGET;
  return {
    ownerUserId,
    subjectCareProfileId: partial.subjectCareProfileId ?? null,
    extractionJobId: partial.extractionJobId ?? null,
    detectedType,
    primaryTarget,
    secondaryTargets: partial.secondaryTargets ?? [],
    title: partial.title ?? getDefaultImportTitle(detectedType),
    summaryPrivacySafe: partial.summaryPrivacySafe ?? null,
    reviewStatus: partial.reviewStatus ?? DEFAULT_AI_REVIEW_STATUS,
    confidenceLabel: partial.confidenceLabel ?? DEFAULT_AI_CONFIDENCE,
    fields: partial.fields ?? [],
    warnings: partial.warnings ?? getDefaultWarnings(primaryTarget),
    sourceEvidence: partial.sourceEvidence ?? [],
    missingFields: partial.missingFields ?? [],
    nextActions: partial.nextActions ?? ["Review each field before saving."],
    createdFrom: partial.createdFrom ?? "unknown",
    reviewedAt: partial.reviewedAt ?? null,
    dismissedAt: partial.dismissedAt ?? null,
    importedAt: partial.importedAt ?? null,
  };
}

export function getDefaultImportTitle(detectedType: HealthOSAIImportDetectedType) {
  if (detectedType === "unknown") return "AI import needs review";
  return "AI import candidate";
}

export function getDefaultWarnings(target: HealthOSAIImportTarget): HealthOSAIImportWarning[] {
  const warnings: HealthOSAIImportWarning[] = [
    {
      type: "review_required",
      severity: "important",
      message: "AI can make mistakes. Review before importing.",
    },
  ];
  if (HIGH_SENSITIVITY_AI_IMPORT_TARGETS.includes(target)) {
    warnings.push({
      type: "high_sensitivity",
      severity: "important",
      message: "This target contains private health or family data and requires careful review.",
    });
  }
  return warnings;
}
