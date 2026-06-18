export type HealthOSAIImportType =
  | "food_label"
  | "meal"
  | "meal_plan"
  | "recipe"
  | "grocery_list"
  | "medication"
  | "supplement"
  | "prescription"
  | "doctor_note"
  | "medical_record"
  | "lab_report"
  | "vaccine_card"
  | "workout_plan"
  | "exercise"
  | "gym_machine"
  | "pregnancy_document"
  | "baby_child_document"
  | "cycle_note"
  | "symptom_note"
  | "calendar_event"
  | "family_note"
  | "article"
  | "general_note"
  | "unknown";

export type HealthOSAIImportTarget =
  | "nutrition"
  | "medication"
  | "supplements"
  | "records"
  | "fitness"
  | "calendar"
  | "pregnancy"
  | "babyChild"
  | "womensHealth"
  | "family"
  | "health"
  | "home"
  | "none";

export type HealthOSAIFieldReviewStatus =
  | "pending"
  | "confirmed"
  | "edited"
  | "rejected"
  | "missing"
  | "uncertain"
  | "notApplicable";

export type HealthOSAIReviewStatus =
  | "pendingReview"
  | "inReview"
  | "needsMoreInfo"
  | "readyToImport"
  | "partiallyImported"
  | "imported"
  | "dismissed"
  | "failed";

export type HealthOSAIConfidence = {
  label: "low" | "medium" | "high" | "unknown";
  reason?: string;
  score: number;
};

export type HealthOSAIImportSource = {
  capturedAt?: string;
  fileName?: string;
  imageUri?: string;
  localUri?: string;
  mimeType?: string;
  recordId?: string;
  sourceId: string;
  sourceName?: string;
  sourceType: "camera" | "gallery" | "document" | "pdf" | "text" | "ai_chat" | "record" | "url" | "unknown";
  sourceUrl?: string;
  storagePath?: string;
  thumbnailUri?: string;
};

export type HealthOSAIImportEvidence = {
  boundingBox?: { height: number; width: number; x: number; y: number };
  confidence?: number;
  evidenceId: string;
  imageUrl?: string;
  kind: "text_snippet" | "image_region" | "document_page" | "source_link" | "user_input" | "model_inference";
  pageNumber?: number;
  sourceId: string;
  sourceName?: string;
  sourceUrl?: string;
  text?: string;
};

export type HealthOSAIImportField = {
  confidence: HealthOSAIConfidence;
  editable: boolean;
  evidenceIds: string[];
  fieldId: string;
  key: string;
  label: string;
  medicalRisk?: "none" | "low" | "medium" | "high";
  normalizedValue?: unknown;
  rawText?: string;
  requiredForTargets: HealthOSAIImportTarget[];
  reviewStatus: HealthOSAIFieldReviewStatus;
  sensitive?: boolean;
  unit?: string;
  validationMessage?: string;
  value: string | number | boolean | string[] | null;
};

export type HealthOSMissingField = {
  fieldId: string;
  key: string;
  label: string;
  reason: string;
  requiredForTargets: HealthOSAIImportTarget[];
  severity: "info" | "warning" | "blocking";
};

export type HealthOSAIImportWarning = {
  blocking: boolean;
  message: string;
  relatedFieldIds?: string[];
  severity: "info" | "warning" | "danger";
  title: string;
  type:
    | "medical_review_required"
    | "ai_may_be_wrong"
    | "missing_required_field"
    | "low_confidence"
    | "possible_allergy"
    | "diabetic_caution"
    | "pregnancy_caution"
    | "child_caution"
    | "medication_caution"
    | "supplement_caution"
    | "interaction_review"
    | "privacy_sensitive"
    | "sharing_requires_permission"
    | "source_missing"
    | "unsupported_import";
  warningId: string;
};

export type HealthOSAISafetySummary = {
  canAutoSave: false;
  containsChildData: boolean;
  containsFamilySharingData: boolean;
  containsMedicalData: boolean;
  containsMedicationData: boolean;
  containsPregnancyData: boolean;
  containsWomenHealthData: boolean;
  requiresHumanReview: boolean;
  safetyNotes: string[];
};

export type HealthOSAIImportNextAction = {
  actionId: string;
  actionType: "review" | "edit" | "save" | "saveToRecords" | "createReminder" | "addToCalendar" | "openRealm" | "askAI" | "discard";
  enabled: boolean;
  label: string;
  reasonDisabled?: string;
  requiresConfirmation: boolean;
  target: HealthOSAIImportTarget;
};

export type HealthOSAIImportItem = {
  alternativeTargets: HealthOSAIImportTarget[];
  confidence: HealthOSAIConfidence;
  evidenceIds: string[];
  fields: HealthOSAIImportField[];
  itemId: string;
  itemType: HealthOSAIImportType;
  reviewStatus: HealthOSAIReviewStatus;
  subtitle?: string;
  suggestedTarget: HealthOSAIImportTarget;
  title: string;
  warnings: HealthOSAIImportWarning[];
};

export type HealthOSAIImportEnvelope = {
  candidateTypes: HealthOSAIImportType[];
  confidence: HealthOSAIConfidence;
  createdAt: string;
  detectedType: HealthOSAIImportType;
  evidence: HealthOSAIImportEvidence[];
  importId: string;
  items: HealthOSAIImportItem[];
  language?: string;
  missingFields: HealthOSMissingField[];
  nextActions: HealthOSAIImportNextAction[];
  primaryTarget?: HealthOSAIImportTarget;
  rawBackendJobId?: string;
  rawModelResponseId?: string;
  safety: HealthOSAISafetySummary;
  schemaVersion: "1.0";
  source: HealthOSAIImportSource;
  suggestedTargets: HealthOSAIImportTarget[];
  summary?: string;
  title: string;
  warnings: HealthOSAIImportWarning[];
};

export type HealthOSAIImportTargetConfig = {
  accent?: string;
  allowedImportTypes: HealthOSAIImportType[];
  description: string;
  icon?: string;
  key: HealthOSAIImportTarget;
  label: string;
  requiresReview: true;
  routeTarget?: string;
  saveHandlerKey?: string;
  sensitive: boolean;
};
