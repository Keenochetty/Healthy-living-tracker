import type {
  HealthOSAIImportEnvelope,
  HealthOSAIImportType,
  HealthOSAIImportWarning,
  HealthOSAISafetySummary,
} from "./types";

const MEDICAL_TYPES: HealthOSAIImportType[] = [
  "medication",
  "supplement",
  "prescription",
  "doctor_note",
  "medical_record",
  "lab_report",
  "vaccine_card",
  "pregnancy_document",
  "baby_child_document",
  "cycle_note",
  "symptom_note",
];

export function createSafetySummary(importType: HealthOSAIImportType): HealthOSAISafetySummary {
  return {
    canAutoSave: false,
    containsChildData: importType === "baby_child_document" || importType === "vaccine_card",
    containsFamilySharingData: importType === "family_note",
    containsMedicalData: MEDICAL_TYPES.includes(importType),
    containsMedicationData: importType === "medication" || importType === "prescription" || importType === "supplement",
    containsPregnancyData: importType === "pregnancy_document",
    containsWomenHealthData: importType === "cycle_note",
    requiresHumanReview: true,
    safetyNotes: getSafetyNotes(importType),
  };
}

export function getSafetyNotes(importType: HealthOSAIImportType) {
  const notes = [
    "Review extracted information before saving.",
    "AI extraction can make mistakes.",
    "This does not replace medical advice.",
  ];
  if (importType === "medication" || importType === "prescription") {
    notes.push("Confirm medication instructions with your healthcare professional.");
  }
  if (importType === "family_note") notes.push("You choose what family or caregivers can see.");
  return notes;
}

export function buildSafetyWarnings(envelope: HealthOSAIImportEnvelope): HealthOSAIImportWarning[] {
  const warnings: HealthOSAIImportWarning[] = [
    {
      blocking: false,
      message: "AI can suggest. The user confirms before anything is saved.",
      severity: "info",
      title: "Review required",
      type: "ai_may_be_wrong",
      warningId: `${envelope.importId}-ai-review`,
    },
  ];

  if (envelope.safety.containsMedicalData) {
    warnings.push({
      blocking: false,
      message: "Health-related imports should be reviewed with appropriate care.",
      severity: "warning",
      title: "Medical review required",
      type: "medical_review_required",
      warningId: `${envelope.importId}-medical-review`,
    });
  }
  if (!envelope.evidence.length) {
    warnings.push({
      blocking: false,
      message: "No source evidence is attached. Treat this as unsupported until reviewed.",
      severity: "warning",
      title: "Source missing",
      type: "source_missing",
      warningId: `${envelope.importId}-source-missing`,
    });
  }
  if (envelope.confidence.label === "low" || envelope.confidence.label === "unknown") {
    warnings.push({
      blocking: false,
      message: "Confidence is not truth. Check every field before importing.",
      severity: "warning",
      title: "Low confidence",
      type: "low_confidence",
      warningId: `${envelope.importId}-low-confidence`,
    });
  }
  return warnings;
}
