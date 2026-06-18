import { RECORD_CATEGORY_LABELS, REVIEW_FIRST_SOURCES } from "./recordDefaults";
import type {
  HealthOSRecord,
  HealthOSRecordCategory,
  HealthOSRecordPrivacyScope,
  HealthOSRecordSourceType,
} from "./recordTypes";

const sensitiveCategories = new Set<HealthOSRecordCategory>([
  "babyChildDocument",
  "doctorNote",
  "labReport",
  "medicalAid",
  "medicationLabel",
  "pregnancyDocument",
  "prescription",
  "scanUpload",
  "supplementLabel",
  "vaccineCard",
]);

export function isSensitiveRecordCategory(category: HealthOSRecordCategory) {
  return sensitiveCategories.has(category) || category === "other";
}

export function requiresRecordReview(sourceType: HealthOSRecordSourceType) {
  return REVIEW_FIRST_SOURCES.has(sourceType);
}

export function canShareRecordWithPermission(permissionKey: string) {
  return permissionKey === "view_records_shared" || permissionKey === "emergency_packet_view";
}

export function getRecordPrivacyLabel(scope: HealthOSRecordPrivacyScope) {
  if (scope === "caregiverLimited") return "Caregiver limited";
  if (scope === "emergency") return "Emergency packet";
  if (scope === "selected") return "Shared with selected access";
  return "Private";
}

export function getSafeRecordDisplayTitle(record: Pick<HealthOSRecord, "category" | "privacyScope" | "title">) {
  if (record.privacyScope === "private") return record.title;
  if (isSensitiveRecordCategory(record.category)) return RECORD_CATEGORY_LABELS[record.category];
  return record.title;
}
