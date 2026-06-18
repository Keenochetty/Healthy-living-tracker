import type {
  AdherenceSummary,
  DoseLog,
  HealthDocument,
  HealthScheduleReminder,
  Medication,
  MedicationSupplementNote,
  SafetyNotice,
  Supplement,
} from "@/types/medication";

export type HealthOSMedicationKind = "medication" | "supplement";

export type HealthOSMedicationStatus =
  | "due"
  | "upcoming"
  | "taken"
  | "skipped"
  | "missed"
  | "snoozed"
  | "needsReview"
  | "inactive";

export type HealthOSMedicationSource =
  | "manual"
  | "scan"
  | "prescription"
  | "doctorNote"
  | "pharmacyNote"
  | "aiExtracted"
  | "imported";

export type HealthOSMedicationCautionType =
  | "duplicate"
  | "ingredientOverlap"
  | "medicationSupplement"
  | "pregnancy"
  | "child"
  | "allergy"
  | "foodTiming"
  | "missingInstructions"
  | "needsProfessionalReview";

export type HealthOSMedicationPrivacyStatus =
  | "private"
  | "sharedSelected"
  | "caregiverLimited"
  | "unknown";

export type HealthOSMedicationDisplayItem = {
  doseText?: string;
  foodTiming?: string;
  id: string;
  instructions?: string;
  isActive: boolean;
  item: Medication | Supplement;
  kind: HealthOSMedicationKind;
  name: string;
  privacyStatus: HealthOSMedicationPrivacyStatus;
  scheduleTimes: string[];
  source: HealthOSMedicationSource;
  status: HealthOSMedicationStatus;
};

export type HealthOSMedicationCaution = {
  description: string;
  id: string;
  relatedName?: string;
  severity: "info" | "warning" | "danger";
  sourceNotice?: SafetyNotice;
  title: string;
  type: HealthOSMedicationCautionType;
};

export type HealthOSMedicationContentItem = {
  id: string;
  reviewedAt?: string;
  sourceName: string;
  sourceUrl: string;
  summary: string;
  title: string;
};

export type HealthOSMedicationRefillSummary = {
  items: Array<{ id: string; name: string; status: string }>;
  status: string;
};

export type HealthOSMedicationData = {
  activeFocus: HealthOSMedicationKind;
  adherence: {
    medication: AdherenceSummary;
    supplement: AdherenceSummary;
  };
  calendarStatus: string;
  cautions: HealthOSMedicationCaution[];
  contentPreview: HealthOSMedicationContentItem[];
  documents: HealthDocument[];
  error: string | null;
  extractionReviewStatus: string;
  foodTimingStatus: string;
  loading: boolean;
  medicationItems: HealthOSMedicationDisplayItem[];
  missedAndSideEffects: {
    latestNotes: Array<DoseLog | MedicationSupplementNote>;
    status: string;
  };
  nextReminder?: HealthScheduleReminder;
  privacyStatus: HealthOSMedicationPrivacyStatus;
  refillSummary: HealthOSMedicationRefillSummary;
  reminders: HealthScheduleReminder[];
  scanImportStatus: string;
  sharingStatus: string;
  supplementItems: HealthOSMedicationDisplayItem[];
  symptomSupportStatus: string;
  todaySummary: {
    dueCount: number;
    missedCount: number;
    takenCount: number;
    totalCount: number;
  };
};
