import type { HealthOSMedication, HealthOSMedicationReviewStatus, HealthOSMedicationStatus, HealthOSSupplement } from "./medicationTypes";

export function isMedicationPrivate(medication?: Pick<HealthOSMedication, "privacyScope"> | null) {
  return medication?.privacyScope !== "selectedFamily" && medication?.privacyScope !== "caregiverLimited";
}

export function isSupplementPrivate(supplement?: Pick<HealthOSSupplement, "privacyScope"> | null) {
  return supplement?.privacyScope !== "selectedFamily" && supplement?.privacyScope !== "caregiverLimited";
}

export function getPrivacySafeMedicationTitle() {
  return "Medication reminder";
}

export function getPrivacySafeSupplementTitle() {
  return "Supplement reminder";
}

export function canShowMedicationDetailsInSharedContext(hasExplicitPermission: boolean) {
  return hasExplicitPermission === true;
}

export function canShowSupplementDetailsInSharedContext(hasExplicitPermission: boolean) {
  return hasExplicitPermission === true;
}

export function getMedicationPrivacyLabel(scope?: string | null) {
  switch (scope) {
    case "selectedFamily":
      return "Selected family";
    case "caregiverLimited":
      return "Caregiver limited";
    case "emergencyOnly":
      return "Emergency only";
    default:
      return "Private";
  }
}

export function getMedicationStatusLabel(status?: HealthOSMedicationStatus | null) {
  return label(status ?? "unknown");
}

export function getMedicationReviewStatusLabel(status?: HealthOSMedicationReviewStatus | null) {
  switch (status) {
    case "needsReview":
      return "Needs review";
    case "needsProfessionalReview":
      return "Professional review recommended";
    default:
      return label(status ?? "unknown");
  }
}

function label(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/\b\w/g, (letter) => letter.toUpperCase()).trim();
}
