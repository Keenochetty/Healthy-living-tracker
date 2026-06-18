export type HealthOSMedicationBackendStatus =
  | "idle"
  | "loading"
  | "ready"
  | "missingAuth"
  | "missingTable"
  | "reviewRequired"
  | "deferred"
  | "error";

export type HealthOSMedicationServiceResult<T> = {
  data: T | null;
  error: string | null;
  status: HealthOSMedicationBackendStatus;
};

export type HealthOSMedicationStatus = "draft" | "active" | "paused" | "completed" | "archived" | "unknown";
export type HealthOSMedicationReviewStatus = "needsReview" | "reviewed" | "rejected" | "needsProfessionalReview" | "unknown";
export type HealthOSMedicationSourceType =
  | "manual"
  | "scan"
  | "aiImport"
  | "prescriptionRecord"
  | "medicationLabelRecord"
  | "supplementLabelRecord"
  | "doctorNoteRecord"
  | "pharmacyNote"
  | "external"
  | "unknown";
export type HealthOSMedicationPrivacyScope = "private" | "selectedFamily" | "caregiverLimited" | "emergencyOnly" | "unknown";
export type HealthOSMedicationLogEvent = "taken" | "skipped" | "missed" | "snoozed" | "paused" | "resumed" | "stopped" | "note" | "unknown";
export type HealthOSMedicationReviewFlagType =
  | "needsReview"
  | "missingInstructions"
  | "duplicateNamePossible"
  | "medicationSupplementCaution"
  | "pregnancyReview"
  | "childReview"
  | "allergyReview"
  | "foodTimingReview"
  | "professionalReviewRecommended"
  | "unknown";

export type HealthOSMedication = {
  id?: string;
  ownerUserId: string;
  subjectCareProfileId?: string | null;
  displayName: string;
  genericName?: string | null;
  brandName?: string | null;
  form?: string | null;
  strengthText?: string | null;
  routeText?: string | null;
  instructionsText?: string | null;
  prescriberName?: string | null;
  pharmacyName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: HealthOSMedicationStatus;
  reviewStatus: HealthOSMedicationReviewStatus;
  sourceType: HealthOSMedicationSourceType;
  sourceRecordId?: string | null;
  aiImportId?: string | null;
  privacyScope: HealthOSMedicationPrivacyScope;
  notes?: string | null;
  archivedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type HealthOSMedicationSchedule = {
  id?: string;
  medicationId: string;
  ownerUserId: string;
  subjectCareProfileId?: string | null;
  scheduleLabel?: string | null;
  doseText?: string | null;
  frequencyText?: string | null;
  timeOfDay: string[];
  startAt?: string | null;
  endAt?: string | null;
  repeatRule?: string | null;
  withFood?: string | null;
  status: HealthOSMedicationStatus;
  reviewStatus: HealthOSMedicationReviewStatus;
  linkedReminderId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type HealthOSMedicationLog = {
  id?: string;
  medicationId: string;
  scheduleId?: string | null;
  ownerUserId: string;
  subjectCareProfileId?: string | null;
  eventType: HealthOSMedicationLogEvent;
  eventTime: string;
  note?: string | null;
  sourceReminderId?: string | null;
  createdAt?: string | null;
};

export type HealthOSMedicationSideEffectNote = {
  id?: string;
  medicationId?: string | null;
  ownerUserId: string;
  subjectCareProfileId?: string | null;
  noteText: string;
  severity?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  reviewStatus: "userNote" | "needsProfessionalReview" | "unknown";
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type HealthOSMedicationRefillReminder = {
  id?: string;
  medicationId: string;
  ownerUserId: string;
  subjectCareProfileId?: string | null;
  refillDueAt?: string | null;
  remainingQuantityText?: string | null;
  status: HealthOSMedicationStatus;
  linkedReminderId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type HealthOSSupplement = Omit<HealthOSMedication, "genericName" | "pharmacyName" | "prescriberName" | "routeText"> & {
  ingredientSummary?: string | null;
};

export type HealthOSSupplementSchedule = Omit<HealthOSMedicationSchedule, "medicationId"> & {
  supplementId: string;
};

export type HealthOSSupplementLog = Omit<HealthOSMedicationLog, "medicationId"> & {
  supplementId: string;
};

export type HealthOSMedicationReviewFlag = {
  id?: string;
  ownerUserId: string;
  subjectCareProfileId?: string | null;
  medicationId?: string | null;
  supplementId?: string | null;
  flagType: HealthOSMedicationReviewFlagType;
  messagePrivacySafe: string;
  sourceType: "system" | "user" | "aiImport" | "record" | "unknown";
  status: "active" | "dismissed" | "resolved" | "unknown";
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type HealthOSMedicationCreateInput = Omit<HealthOSMedication, "createdAt" | "id" | "ownerUserId" | "updatedAt"> & { ownerUserId?: string };
export type HealthOSMedicationUpdateInput = Partial<Omit<HealthOSMedicationCreateInput, "ownerUserId">>;
export type HealthOSMedicationScheduleCreateInput = Omit<HealthOSMedicationSchedule, "createdAt" | "id" | "ownerUserId" | "updatedAt"> & { ownerUserId?: string };
export type HealthOSMedicationLogCreateInput = Omit<HealthOSMedicationLog, "createdAt" | "eventTime" | "id" | "ownerUserId"> & { eventTime?: string; ownerUserId?: string };
export type HealthOSMedicationSideEffectCreateInput = Omit<HealthOSMedicationSideEffectNote, "createdAt" | "id" | "ownerUserId" | "updatedAt"> & { ownerUserId?: string };
export type HealthOSMedicationRefillCreateInput = Omit<HealthOSMedicationRefillReminder, "createdAt" | "id" | "ownerUserId" | "updatedAt"> & { ownerUserId?: string };
export type HealthOSSupplementCreateInput = Omit<HealthOSSupplement, "createdAt" | "id" | "ownerUserId" | "updatedAt"> & { ownerUserId?: string };
export type HealthOSSupplementUpdateInput = Partial<Omit<HealthOSSupplementCreateInput, "ownerUserId">>;
export type HealthOSSupplementScheduleCreateInput = Omit<HealthOSSupplementSchedule, "createdAt" | "id" | "ownerUserId" | "updatedAt"> & { ownerUserId?: string };
export type HealthOSSupplementLogCreateInput = Omit<HealthOSSupplementLog, "createdAt" | "eventTime" | "id" | "ownerUserId"> & { eventTime?: string; ownerUserId?: string };
export type HealthOSMedicationReviewFlagCreateInput = Omit<HealthOSMedicationReviewFlag, "createdAt" | "id" | "ownerUserId" | "updatedAt"> & { ownerUserId?: string };
