type ValidationResult = { error: string; valid: false } | { error?: undefined; valid: true };

function required(value: unknown, message: string): ValidationResult {
  return typeof value === "string" && value.trim() ? { valid: true } : { error: message, valid: false };
}

function validDate(value: unknown, message: string): ValidationResult {
  if (!value) return { valid: true };
  return typeof value === "string" && !Number.isNaN(new Date(value).getTime()) ? { valid: true } : { error: message, valid: false };
}

export function validatePregnancyProfile(input: { estimatedDueDate?: string; lastMenstrualPeriodDate?: string }) {
  return validDate(input.estimatedDueDate ?? input.lastMenstrualPeriodDate, "Pregnancy date is not valid.");
}

export function validatePregnancyLog(input: { pregnancyProfileId?: string; logDate?: string }) {
  const profile = required(input.pregnancyProfileId, "Pregnancy profile is required.");
  return profile.valid ? validDate(input.logDate, "Log date is not valid.") : profile;
}

export function validatePregnancyAppointment(input: { pregnancyProfileId?: string; title?: string; appointmentAt?: string }) {
  const profile = required(input.pregnancyProfileId, "Pregnancy profile is required.");
  if (!profile.valid) return profile;
  const title = required(input.title, "Appointment title is required.");
  if (!title.valid) return title;
  return validDate(input.appointmentAt, "Appointment date is not valid.");
}

export function validatePregnancyChecklist(input: { pregnancyProfileId?: string; title?: string }) {
  const profile = required(input.pregnancyProfileId, "Pregnancy profile is required.");
  return profile.valid ? required(input.title, "Checklist title is required.") : profile;
}

export function validateWomenHealthLog(input: { logDate?: string }) {
  return validDate(input.logDate, "Women's health log date is not valid.");
}

export function validateContraceptionLog(input: { methodType?: string }) {
  return required(input.methodType, "Contraception method type is required.");
}

export function validateSexDayLog(input: { logDate?: string }) {
  return validDate(input.logDate, "Sex-day log date is not valid.");
}

export function validateChildCareLog(input: { subjectCareProfileId?: string; logType?: string }) {
  const subject = required(input.subjectCareProfileId, "Child care profile is required.");
  return subject.valid ? required(input.logType, "Child care log type is required.") : subject;
}

export function validateFeedingLog(input: { feedingType?: string; subjectCareProfileId?: string }) {
  const child = required(input.subjectCareProfileId, "Child care profile is required.");
  return child.valid ? required(input.feedingType, "Feeding type is required.") : child;
}

export function validateSleepLog(input: { startedAt?: string; subjectCareProfileId?: string }) {
  const child = required(input.subjectCareProfileId, "Child care profile is required.");
  return child.valid ? validDate(input.startedAt, "Sleep start time is not valid.") : child;
}

export function validateDiaperLog(input: { diaperType?: string; subjectCareProfileId?: string }) {
  const child = required(input.subjectCareProfileId, "Child care profile is required.");
  return child.valid ? required(input.diaperType, "Diaper type is required.") : child;
}

export function validateGrowthMeasurement(input: { subjectCareProfileId?: string }) {
  return required(input.subjectCareProfileId, "Child care profile is required.");
}

export function validateVaccineRecord(input: { subjectCareProfileId?: string; vaccineName?: string }) {
  const child = required(input.subjectCareProfileId, "Child care profile is required.");
  return child.valid ? required(input.vaccineName, "Vaccine name is required.") : child;
}

export function validateMilestoneLog(input: { milestoneKey?: string; milestoneLabel?: string; subjectCareProfileId?: string }) {
  const child = required(input.subjectCareProfileId, "Child care profile is required.");
  if (!child.valid) return child;
  const key = required(input.milestoneKey, "Milestone key is required.");
  return key.valid ? required(input.milestoneLabel, "Milestone label is required.") : key;
}

export function validateSolidsLog(input: { foodName?: string; subjectCareProfileId?: string }) {
  const child = required(input.subjectCareProfileId, "Child care profile is required.");
  return child.valid ? required(input.foodName, "Food name is required.") : child;
}

export function validateChildMedicationNote(input: { noteText?: string; subjectCareProfileId?: string }) {
  const child = required(input.subjectCareProfileId, "Child care profile is required.");
  return child.valid ? required(input.noteText, "Medication note is required.") : child;
}

export function validateCaregiverNote(input: { noteText?: string; subjectCareProfileId?: string }) {
  const child = required(input.subjectCareProfileId, "Child care profile is required.");
  return child.valid ? required(input.noteText, "Caregiver note is required.") : child;
}
