export type AiJobType =
  | "doctor_report_scan"
  | "prescription_scan"
  | "medication_label_scan"
  | "food_photo_scan"
  | "formula_label_scan"
  | "vaccination_card_scan"
  | "symptom_summary"
  | "care_note_summary"
  | "general_note_organise";

export type AiJobStatus =
  | "draft"
  | "processing"
  | "needs_review"
  | "approved"
  | "discarded"
  | "failed";

export type AiInputType = "image" | "document" | "text";
export type AiConfidence = "low" | "medium" | "high";
export type AiSafetyLevel = "normal" | "caution" | "urgent_review";

export type AiReminderDraft = {
  dueAt?: string;
  id: string;
  notes?: string;
  reminderType?: string;
  requiresUserConfirmation: true;
  title: string;
};

export type AiDoctorVisitDraft = {
  doctorName?: string;
  followUpDate?: string;
  instructions?: string;
  medicationsMentioned?: string[];
  reason?: string;
  summary?: string;
  visitDate?: string;
  warnings: string[];
};

export type AiMedicationScheduleDraft = {
  dosageText?: string;
  frequencyText?: string;
  instructionsText?: string;
  medicationName?: string;
  reminderTimes?: string[];
  takeWithFood?: boolean;
  warnings: string[];
};

export type AiFoodLogDraft = {
  caloriesEstimate?: number;
  carbsEstimate?: number;
  estimateOnly: true;
  fatEstimate?: number;
  foodName?: string;
  mealType?: string;
  portionEstimate?: string;
  proteinEstimate?: number;
  warnings: string[];
};

export type AiFormulaInfoDraft = {
  allergensMentioned?: string[];
  formulaName?: string;
  preparationInstructions?: string;
  servingInfo?: string;
  warnings: string[];
};

export type AiVaccinationDraft = {
  batchNumber?: string;
  clinic?: string;
  date?: string;
  status?: string;
  vaccineName?: string;
  warnings: string[];
};

export type AiExtractedDraft = {
  confidence: AiConfidence;
  draftType:
    | "doctor_visit"
    | "medication_schedule"
    | "food_log"
    | "formula_info"
    | "vaccination_record"
    | "symptom_note"
    | "care_note"
    | "general_note";
  fields:
    | AiDoctorVisitDraft
    | AiMedicationScheduleDraft
    | AiFoodLogDraft
    | AiFormulaInfoDraft
    | AiVaccinationDraft
    | Record<string, unknown>;
  remindersDraft?: AiReminderDraft[];
  suggestedActions?: string[];
  summary?: string;
  title: string;
  warnings: string[];
};

export type AiJob = {
  approvedAt?: string;
  confidence: AiConfidence;
  createdAt: string;
  discardedAt?: string;
  extractedDraft?: AiExtractedDraft;
  extractionMode?: "real" | "mock";
  fileName?: string;
  id: string;
  inputType: AiInputType;
  jobType: AiJobType;
  localUri?: string;
  mimeType?: string;
  reviewedAt?: string;
  safetyLevel: AiSafetyLevel;
  status: AiJobStatus;
  textInput?: string;
  title: string;
  updatedAt: string;
  warnings: string[];
};
