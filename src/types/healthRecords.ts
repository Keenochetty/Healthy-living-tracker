export type HealthRecordType =
  | "prescription"
  | "medication_label"
  | "supplement_label"
  | "doctor_note"
  | "lab_result"
  | "imaging"
  | "vaccine_record"
  | "birth_record"
  | "child_clinic_card"
  | "pregnancy_record"
  | "insurance"
  | "general_document"
  | "health_note"
  | "other";

export type HealthRecordReminderType =
  | "follow_up_visit"
  | "prescription_refill"
  | "next_vaccine_dose"
  | "lab_review"
  | "document_expiry"
  | "general";

export type HealthRecordFileType = "image" | "pdf" | "note" | "unknown";
export type HealthRecordReminderStatus = "upcoming" | "done" | "dismissed" | "missed";

export type HealthRecord = {
  allowedViewerIds: string[];
  createdAt: string;
  documentDate?: string;
  expiryDate?: string;
  fileType?: HealthRecordFileType;
  fileUrl?: string;
  folderId?: string;
  id: string;
  isPinned: boolean;
  isPrivate: boolean;
  lockedPrivate: boolean;
  notes?: string;
  profileId: string;
  relatedMedicationId?: string;
  relatedSupplementId?: string;
  relatedVisitId?: string;
  reminderDate?: string;
  sharedWithCaregiver: boolean;
  sharedWithFamily: boolean;
  sharedWithPartner: boolean;
  tags: string[];
  title: string;
  type: HealthRecordType;
  updatedAt: string;
  userId: string;
};

export type DoctorVisit = {
  allowedViewerIds: string[];
  clinicName?: string;
  createdAt: string;
  followUpDate?: string;
  followUpRequired: boolean;
  id: string;
  instructions?: string;
  isPrivate: boolean;
  location?: string;
  lockedPrivate: boolean;
  practitionerName?: string;
  profileId: string;
  questionsAsked?: string;
  reason?: string;
  relatedDocumentIds: string[];
  relatedMedicationIds: string[];
  relatedSupplementIds: string[];
  sharedWithCaregiver: boolean;
  sharedWithFamily: boolean;
  sharedWithPartner: boolean;
  specialty?: string;
  summaryNotes?: string;
  title: string;
  updatedAt: string;
  userId: string;
  visitDate: string;
};

export type VaccineRecord = {
  allowedViewerIds: string[];
  batchNumber?: string;
  createdAt: string;
  dateReceived: string;
  documentId?: string;
  doseNumber?: string;
  id: string;
  isPrivate: boolean;
  location?: string;
  lockedPrivate: boolean;
  nextDoseDate?: string;
  notes?: string;
  profileId: string;
  sharedWithCaregiver: boolean;
  sharedWithFamily: boolean;
  sharedWithPartner: boolean;
  updatedAt: string;
  userId: string;
  vaccineName: string;
};

export type LabResultRecord = {
  allowedViewerIds: string[];
  createdAt: string;
  documentId?: string;
  followUpDate?: string;
  id: string;
  isPrivate: boolean;
  lockedPrivate: boolean;
  notes?: string;
  profileId: string;
  provider?: string;
  referenceRange?: string;
  resultValue?: string;
  sharedWithCaregiver: boolean;
  sharedWithFamily: boolean;
  sharedWithPartner: boolean;
  testDate: string;
  testName: string;
  unit?: string;
  updatedAt: string;
  userId: string;
};

export type PrescriptionRecord = {
  allowedViewerIds: string[];
  createdAt: string;
  dateIssued?: string;
  documentId?: string;
  expiryDate?: string;
  id: string;
  isPrivate: boolean;
  lockedPrivate: boolean;
  notes?: string;
  profileId: string;
  provider?: string;
  refillReminderDate?: string;
  relatedMedicationId?: string;
  repeatPrescription: boolean;
  sharedWithCaregiver: boolean;
  sharedWithFamily: boolean;
  sharedWithPartner: boolean;
  title: string;
  updatedAt: string;
  userId: string;
};

export type HealthRecordFolder = {
  color?: string;
  createdAt: string;
  icon?: string;
  id: string;
  isDefault: boolean;
  name: string;
  profileId: string;
  updatedAt: string;
  userId: string;
};

export type HealthRecordReminder = {
  createdAt: string;
  id: string;
  notes?: string;
  profileId: string;
  relatedRecordId?: string;
  relatedVisitId?: string;
  reminderDate: string;
  status: HealthRecordReminderStatus;
  title: string;
  type: HealthRecordReminderType;
  updatedAt: string;
  userId: string;
};

export type HealthNoteCategory =
  | "general"
  | "symptom"
  | "doctor_instruction"
  | "food_note"
  | "workout_note"
  | "medication_note"
  | "supplement_note"
  | "child_note"
  | "pregnancy_note"
  | "elder_care_note";

export type HealthRecordFilters = {
  dateFrom?: string;
  dateTo?: string;
  documentType?: HealthRecordType;
  folderId?: string;
  hasFile?: boolean;
  hasReminder?: boolean;
  isPinned?: boolean;
  needsFollowUp?: boolean;
  profileId?: string;
};

export type RecordsOverviewSummary = {
  labFollowUps: LabResultRecord[];
  nextVaccine?: VaccineRecord;
  pinnedRecords: HealthRecord[];
  prescriptionRefills: PrescriptionRecord[];
  recentRecords: HealthRecord[];
  recentVisits: DoctorVisit[];
  recordsNeedingAttention: number;
  upcomingReminders: HealthRecordReminder[];
};

export type RecordWidgetKey =
  | "recent_record"
  | "upcoming_follow_up"
  | "prescription_refill"
  | "next_vaccine"
  | "lab_follow_up"
  | "pinned_health_record"
  | "records_needing_attention";

