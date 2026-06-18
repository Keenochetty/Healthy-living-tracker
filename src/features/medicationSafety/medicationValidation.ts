import type {
  HealthOSMedication,
  HealthOSMedicationLogCreateInput,
  HealthOSMedicationRefillCreateInput,
  HealthOSMedicationReviewStatus,
  HealthOSMedicationScheduleCreateInput,
  HealthOSMedicationSideEffectCreateInput,
  HealthOSMedicationStatus,
  HealthOSSupplement,
  HealthOSSupplementScheduleCreateInput,
} from "./medicationTypes";

export type ValidationResult = { error: string; valid: false } | { error: null; valid: true };

const STATUSES: HealthOSMedicationStatus[] = ["draft", "active", "paused", "completed", "archived", "unknown"];
const REVIEW_STATUSES: HealthOSMedicationReviewStatus[] = ["needsReview", "reviewed", "rejected", "needsProfessionalReview", "unknown"];

export function validateMedicationDisplayName(value?: string | null): ValidationResult {
  return value?.trim() ? valid() : invalid("Medication display name is required.");
}

export function validateSupplementDisplayName(value?: string | null): ValidationResult {
  return value?.trim() ? valid() : invalid("Supplement display name is required.");
}

export function validateMedicationStatus(value?: string | null): ValidationResult {
  return STATUSES.includes(value as HealthOSMedicationStatus) ? valid() : invalid("Medication status is not supported.");
}

export function validateMedicationReviewStatus(value?: string | null): ValidationResult {
  return REVIEW_STATUSES.includes(value as HealthOSMedicationReviewStatus) ? valid() : invalid("Medication review status is not supported.");
}

export function validateMedicationSchedule(input: HealthOSMedicationScheduleCreateInput): ValidationResult {
  if (!input.medicationId) return invalid("Medication schedule needs a medication ID.");
  if (input.status === "active" && input.reviewStatus !== "reviewed") return invalid("Active medication schedules require review.");
  return valid();
}

export function validateSupplementSchedule(input: HealthOSSupplementScheduleCreateInput): ValidationResult {
  if (!input.supplementId) return invalid("Supplement schedule needs a supplement ID.");
  if (input.status === "active" && input.reviewStatus !== "reviewed") return invalid("Active supplement schedules require review.");
  return valid();
}

export function validateMedicationLog(input: HealthOSMedicationLogCreateInput): ValidationResult {
  return input.medicationId ? valid() : invalid("Medication log needs a medication ID.");
}

export function validateSideEffectNote(input: HealthOSMedicationSideEffectCreateInput): ValidationResult {
  return input.noteText?.trim() ? valid() : invalid("Side-effect or symptom note text is required.");
}

export function validateRefillReminder(input: HealthOSMedicationRefillCreateInput): ValidationResult {
  return input.medicationId ? valid() : invalid("Refill reminder needs a medication ID.");
}

export function validateReviewBeforeActivation(item: Pick<HealthOSMedication | HealthOSSupplement, "reviewStatus" | "status">): ValidationResult {
  return item.status === "active" && item.reviewStatus !== "reviewed"
    ? invalid("Review is required before activation.")
    : valid();
}

export function validateReviewBeforeReminderLink(input: { linkedReminderId?: string | null; reviewStatus: HealthOSMedicationReviewStatus }): ValidationResult {
  return input.linkedReminderId && input.reviewStatus !== "reviewed"
    ? invalid("Review is required before linking a reminder.")
    : valid();
}

function valid(): ValidationResult {
  return { error: null, valid: true };
}

function invalid(error: string): ValidationResult {
  return { error, valid: false };
}
