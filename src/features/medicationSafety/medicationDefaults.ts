import { getPrivacySafeMedicationTitle, getPrivacySafeSupplementTitle } from "./medicationPrivacy";
import type {
  HealthOSMedicationCreateInput,
  HealthOSMedicationReviewStatus,
  HealthOSMedicationScheduleCreateInput,
  HealthOSMedicationSourceType,
  HealthOSSupplementCreateInput,
  HealthOSSupplementScheduleCreateInput,
} from "./medicationTypes";

export const EMPTY_MEDICATIONS = [];
export const EMPTY_SUPPLEMENTS = [];
export const EMPTY_MEDICATION_SCHEDULES = [];
export const EMPTY_SUPPLEMENT_SCHEDULES = [];
export const EMPTY_MEDICATION_LOGS = [];
export const EMPTY_REVIEW_FLAGS = [];

export function createMedicationDefaults(
  input: Partial<HealthOSMedicationCreateInput> & { displayName: string },
): HealthOSMedicationCreateInput {
  const sourceType = input.sourceType ?? "manual";
  return {
    aiImportId: input.aiImportId ?? null,
    archivedAt: input.archivedAt ?? null,
    brandName: input.brandName ?? null,
    displayName: input.displayName.trim(),
    endDate: input.endDate ?? null,
    form: input.form ?? null,
    genericName: input.genericName ?? null,
    instructionsText: input.instructionsText ?? null,
    notes: input.notes ?? null,
    pharmacyName: input.pharmacyName ?? null,
    prescriberName: input.prescriberName ?? null,
    privacyScope: input.privacyScope ?? "private",
    reviewStatus: input.reviewStatus ?? defaultReviewStatus(sourceType),
    routeText: input.routeText ?? null,
    sourceRecordId: input.sourceRecordId ?? null,
    sourceType,
    startDate: input.startDate ?? null,
    status: input.status ?? "draft",
    strengthText: input.strengthText ?? null,
    subjectCareProfileId: input.subjectCareProfileId ?? null,
  };
}

export function createSupplementDefaults(
  input: Partial<HealthOSSupplementCreateInput> & { displayName: string },
): HealthOSSupplementCreateInput {
  const sourceType = input.sourceType ?? "manual";
  return {
    aiImportId: input.aiImportId ?? null,
    archivedAt: input.archivedAt ?? null,
    brandName: input.brandName ?? null,
    displayName: input.displayName.trim(),
    endDate: input.endDate ?? null,
    form: input.form ?? null,
    ingredientSummary: input.ingredientSummary ?? null,
    instructionsText: input.instructionsText ?? null,
    notes: input.notes ?? null,
    privacyScope: input.privacyScope ?? "private",
    reviewStatus: input.reviewStatus ?? defaultReviewStatus(sourceType),
    sourceRecordId: input.sourceRecordId ?? null,
    sourceType,
    startDate: input.startDate ?? null,
    status: input.status ?? "draft",
    strengthText: input.strengthText ?? null,
    subjectCareProfileId: input.subjectCareProfileId ?? null,
  };
}

export function createMedicationScheduleDefaults(input: Partial<HealthOSMedicationScheduleCreateInput> & { medicationId: string }): HealthOSMedicationScheduleCreateInput {
  return {
    doseText: input.doseText ?? null,
    endAt: input.endAt ?? null,
    frequencyText: input.frequencyText ?? null,
    linkedReminderId: input.linkedReminderId ?? null,
    medicationId: input.medicationId,
    repeatRule: input.repeatRule ?? null,
    reviewStatus: input.reviewStatus ?? "needsReview",
    scheduleLabel: input.scheduleLabel ?? getPrivacySafeMedicationTitle(),
    startAt: input.startAt ?? null,
    status: input.status ?? "draft",
    subjectCareProfileId: input.subjectCareProfileId ?? null,
    timeOfDay: input.timeOfDay ?? [],
    withFood: input.withFood ?? null,
  };
}

export function createSupplementScheduleDefaults(input: Partial<HealthOSSupplementScheduleCreateInput> & { supplementId: string }): HealthOSSupplementScheduleCreateInput {
  return {
    doseText: input.doseText ?? null,
    endAt: input.endAt ?? null,
    frequencyText: input.frequencyText ?? null,
    linkedReminderId: input.linkedReminderId ?? null,
    repeatRule: input.repeatRule ?? null,
    reviewStatus: input.reviewStatus ?? "needsReview",
    scheduleLabel: input.scheduleLabel ?? getPrivacySafeSupplementTitle(),
    startAt: input.startAt ?? null,
    status: input.status ?? "draft",
    subjectCareProfileId: input.subjectCareProfileId ?? null,
    supplementId: input.supplementId,
    timeOfDay: input.timeOfDay ?? [],
    withFood: input.withFood ?? null,
  };
}

function defaultReviewStatus(sourceType: HealthOSMedicationSourceType): HealthOSMedicationReviewStatus {
  return sourceType === "manual" ? "needsReview" : "needsReview";
}
