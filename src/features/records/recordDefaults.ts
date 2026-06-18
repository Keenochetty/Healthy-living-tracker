import type {
  HealthOSRecordCategory,
  HealthOSRecordFileStatus,
  HealthOSRecordPrivacyScope,
  HealthOSRecordReviewStatus,
  HealthOSRecordSourceType,
} from "./recordTypes";

export const DEFAULT_RECORD_CATEGORY: HealthOSRecordCategory = "generalHealth";
export const DEFAULT_RECORD_SOURCE_TYPE: HealthOSRecordSourceType = "manual";
export const DEFAULT_RECORD_REVIEW_STATUS: HealthOSRecordReviewStatus = "saved";
export const DEFAULT_RECORD_PRIVACY_SCOPE: HealthOSRecordPrivacyScope = "private";
export const DEFAULT_RECORD_FILE_STATUS: HealthOSRecordFileStatus = "metadataOnly";

export const RECORD_CATEGORY_LABELS: Record<HealthOSRecordCategory, string> = {
  babyChildDocument: "Baby / Child document",
  doctorNote: "Doctor note",
  generalHealth: "General health",
  labReport: "Lab report",
  medicalAid: "Medical aid",
  medicationLabel: "Medication label",
  other: "Other",
  pregnancyDocument: "Pregnancy document",
  prescription: "Prescription",
  scanUpload: "Scan or upload",
  supplementLabel: "Supplement label",
  vaccineCard: "Vaccine card",
};

export const REVIEW_FIRST_SOURCES = new Set<HealthOSRecordSourceType>([
  "aiImport",
  "documentPicker",
  "gallery",
  "scan",
]);
