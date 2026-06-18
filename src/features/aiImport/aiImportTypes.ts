export type HealthOSAIImportDetectedType =
  | "foodLabel"
  | "meal"
  | "mealPlan"
  | "recipe"
  | "groceryList"
  | "medication"
  | "supplement"
  | "prescription"
  | "doctorNote"
  | "medicalRecord"
  | "labReport"
  | "vaccineCard"
  | "workoutPlan"
  | "exercise"
  | "gymMachine"
  | "pregnancyDocument"
  | "babyChildDocument"
  | "cycleNote"
  | "symptomNote"
  | "calendarEvent"
  | "reminder"
  | "familyNote"
  | "article"
  | "generalNote"
  | "unknown";

export type HealthOSAIImportTarget =
  | "nutrition"
  | "medication"
  | "supplements"
  | "records"
  | "fitness"
  | "calendar"
  | "reminders"
  | "pregnancy"
  | "babyChild"
  | "womensHealth"
  | "family"
  | "health"
  | "trustedContent"
  | "home"
  | "none";

export type HealthOSAIImportReviewStatus =
  | "needsReview"
  | "inReview"
  | "reviewed"
  | "imported"
  | "dismissed"
  | "failed"
  | "expired"
  | "unknown";

export type HealthOSAIConfidenceLabel = "high" | "medium" | "low" | "unknown";

export type HealthOSAIImportField = {
  key: string;
  label: string;
  value: unknown;
  unit?: string | null;
  confidence: HealthOSAIConfidenceLabel;
  requiresReview: boolean;
  targetField?: string | null;
};

export type HealthOSAIImportWarning = {
  type: string;
  severity: "info" | "normal" | "important" | "urgent" | "critical";
  message: string;
};

export type HealthOSAIImportEvidence = {
  sourceType: string;
  label?: string | null;
  summary?: string | null;
  sourceRecordId?: string | null;
};

export type HealthOSAIImportEnvelope = {
  id?: string;
  ownerUserId: string;
  subjectCareProfileId?: string | null;
  extractionJobId?: string | null;
  detectedType: HealthOSAIImportDetectedType;
  primaryTarget: HealthOSAIImportTarget;
  secondaryTargets: HealthOSAIImportTarget[];
  title?: string | null;
  summaryPrivacySafe?: string | null;
  reviewStatus: HealthOSAIImportReviewStatus;
  confidenceLabel: HealthOSAIConfidenceLabel;
  fields: HealthOSAIImportField[];
  warnings: HealthOSAIImportWarning[];
  sourceEvidence: HealthOSAIImportEvidence[];
  missingFields: string[];
  nextActions: string[];
  createdFrom: "ai" | "scan" | "record" | "chat" | "manual" | "unknown";
  createdAt?: string | null;
  updatedAt?: string | null;
  reviewedAt?: string | null;
  dismissedAt?: string | null;
  importedAt?: string | null;
};

export type HealthOSAIExtractionJobStatus =
  | "queued"
  | "processing"
  | "needsReview"
  | "completed"
  | "failed"
  | "cancelled"
  | "deferred"
  | "unknown";

export type HealthOSAIExtractionJob = {
  id?: string;
  ownerUserId: string;
  subjectCareProfileId?: string | null;
  sourceType: string;
  sourceRecordId?: string | null;
  sourceFileId?: string | null;
  sourceStoragePath?: string | null;
  inputSummary?: string | null;
  status: HealthOSAIExtractionJobStatus;
  requestedTarget?: HealthOSAIImportTarget | null;
  modelLabel?: string | null;
  errorMessagePrivacySafe?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  completedAt?: string | null;
};

export type HealthOSAIReviewEvent = {
  id?: string;
  importEnvelopeId: string;
  ownerUserId: string;
  eventType:
    | "created"
    | "opened"
    | "fieldEdited"
    | "warningAcknowledged"
    | "reviewed"
    | "imported"
    | "dismissed"
    | "failed"
    | "linkedRecord"
    | "linkedReminder"
    | "cancelled"
    | "unknown";
  targetRealm?: HealthOSAIImportTarget | null;
  targetRowId?: string | null;
  notePrivacySafe?: string | null;
  createdAt?: string | null;
};

export type HealthOSAISourceEvidence = {
  id?: string;
  ownerUserId: string;
  importEnvelopeId?: string | null;
  extractionJobId?: string | null;
  sourceType: string;
  sourceRecordId?: string | null;
  sourceFileId?: string | null;
  evidenceLabel?: string | null;
  evidenceSummary?: string | null;
  storageBucket?: string | null;
  storagePath?: string | null;
  createdAt?: string | null;
};

export type HealthOSAIImportBackendStatus =
  | "idle"
  | "loading"
  | "ready"
  | "missingAuth"
  | "missingTable"
  | "edgeFunctionMissing"
  | "reviewRequired"
  | "deferred"
  | "error";

export type HealthOSAIImportResult<T> = {
  data: T | null;
  error: string | null;
  status: HealthOSAIImportBackendStatus;
  deferredReason?: string;
};
