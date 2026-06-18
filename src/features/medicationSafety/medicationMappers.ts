import type {
  HealthOSMedication,
  HealthOSMedicationCreateInput,
  HealthOSMedicationLog,
  HealthOSMedicationLogCreateInput,
  HealthOSMedicationRefillCreateInput,
  HealthOSMedicationRefillReminder,
  HealthOSMedicationReviewFlag,
  HealthOSMedicationReviewFlagCreateInput,
  HealthOSMedicationSchedule,
  HealthOSMedicationScheduleCreateInput,
  HealthOSMedicationSideEffectCreateInput,
  HealthOSMedicationSideEffectNote,
  HealthOSMedicationUpdateInput,
  HealthOSSupplement,
  HealthOSSupplementCreateInput,
  HealthOSSupplementLog,
  HealthOSSupplementLogCreateInput,
  HealthOSSupplementSchedule,
  HealthOSSupplementScheduleCreateInput,
  HealthOSSupplementUpdateInput,
} from "./medicationTypes";

export type MedicationSafetyRow = Record<string, unknown>;

export function mapMedicationRowToMedication(row: MedicationSafetyRow): HealthOSMedication {
  return {
    aiImportId: stringOrNull(row.ai_import_id),
    archivedAt: stringOrNull(row.archived_at),
    brandName: stringOrNull(row.brand_name),
    createdAt: stringOrNull(row.created_at),
    displayName: stringValue(row.display_name ?? row.name, "Medication"),
    endDate: stringOrNull(row.end_date),
    form: stringOrNull(row.form),
    genericName: stringOrNull(row.generic_name),
    id: stringOrUndefined(row.id),
    instructionsText: stringOrNull(row.instructions_text ?? row.schedule_notes),
    notes: stringOrNull(row.notes),
    ownerUserId: stringValue(row.owner_user_id, ""),
    pharmacyName: stringOrNull(row.pharmacy_name),
    prescriberName: stringOrNull(row.prescriber_name),
    privacyScope: fromSnake(stringValue(row.privacy_scope ?? row.privacy_level, "private")) as HealthOSMedication["privacyScope"],
    reviewStatus: fromSnake(stringValue(row.review_status, "needs_review")) as HealthOSMedication["reviewStatus"],
    routeText: stringOrNull(row.route_text),
    sourceRecordId: stringOrNull(row.source_record_id),
    sourceType: fromSnake(stringValue(row.source_type, "manual")) as HealthOSMedication["sourceType"],
    startDate: stringOrNull(row.start_date),
    status: fromSnake(stringValue(row.status, booleanValue(row.active, true) ? "active" : "archived")) as HealthOSMedication["status"],
    strengthText: stringOrNull(row.strength_text ?? row.dosage),
    subjectCareProfileId: stringOrNull(row.subject_care_profile_id ?? row.family_member_id),
    updatedAt: stringOrNull(row.updated_at),
  };
}

export function mapMedicationScheduleRowToSchedule(row: MedicationSafetyRow): HealthOSMedicationSchedule {
  return {
    createdAt: stringOrNull(row.created_at),
    doseText: stringOrNull(row.dose_text),
    endAt: stringOrNull(row.end_at),
    frequencyText: stringOrNull(row.frequency_text),
    id: stringOrUndefined(row.id),
    linkedReminderId: stringOrNull(row.linked_reminder_id),
    medicationId: stringValue(row.medication_id, ""),
    ownerUserId: stringValue(row.owner_user_id, ""),
    repeatRule: stringOrNull(row.repeat_rule),
    reviewStatus: fromSnake(stringValue(row.review_status, "needs_review")) as HealthOSMedicationSchedule["reviewStatus"],
    scheduleLabel: stringOrNull(row.schedule_label),
    startAt: stringOrNull(row.start_at),
    status: fromSnake(stringValue(row.status, "draft")) as HealthOSMedicationSchedule["status"],
    subjectCareProfileId: stringOrNull(row.subject_care_profile_id),
    timeOfDay: arrayOfStrings(row.time_of_day),
    updatedAt: stringOrNull(row.updated_at),
    withFood: stringOrNull(row.with_food),
  };
}

export function mapMedicationLogRowToLog(row: MedicationSafetyRow): HealthOSMedicationLog {
  return {
    createdAt: stringOrNull(row.created_at),
    eventTime: stringValue(row.event_time, new Date().toISOString()),
    eventType: fromSnake(stringValue(row.event_type, "unknown")) as HealthOSMedicationLog["eventType"],
    id: stringOrUndefined(row.id),
    medicationId: stringValue(row.medication_id, ""),
    note: stringOrNull(row.note),
    ownerUserId: stringValue(row.owner_user_id, ""),
    scheduleId: stringOrNull(row.schedule_id),
    sourceReminderId: stringOrNull(row.source_reminder_id),
    subjectCareProfileId: stringOrNull(row.subject_care_profile_id),
  };
}

export function mapMedicationSideEffectRowToNote(row: MedicationSafetyRow): HealthOSMedicationSideEffectNote {
  return {
    createdAt: stringOrNull(row.created_at),
    endedAt: stringOrNull(row.ended_at),
    id: stringOrUndefined(row.id),
    medicationId: stringOrNull(row.medication_id),
    noteText: stringValue(row.note_text, ""),
    ownerUserId: stringValue(row.owner_user_id, ""),
    reviewStatus: fromSnake(stringValue(row.review_status, "user_note")) as HealthOSMedicationSideEffectNote["reviewStatus"],
    severity: stringOrNull(row.severity),
    startedAt: stringOrNull(row.started_at),
    subjectCareProfileId: stringOrNull(row.subject_care_profile_id),
    updatedAt: stringOrNull(row.updated_at),
  };
}

export function mapMedicationRefillRowToReminder(row: MedicationSafetyRow): HealthOSMedicationRefillReminder {
  return {
    createdAt: stringOrNull(row.created_at),
    id: stringOrUndefined(row.id),
    linkedReminderId: stringOrNull(row.linked_reminder_id),
    medicationId: stringValue(row.medication_id, ""),
    ownerUserId: stringValue(row.owner_user_id, ""),
    refillDueAt: stringOrNull(row.refill_due_at),
    remainingQuantityText: stringOrNull(row.remaining_quantity_text),
    status: fromSnake(stringValue(row.status, "draft")) as HealthOSMedicationRefillReminder["status"],
    subjectCareProfileId: stringOrNull(row.subject_care_profile_id),
    updatedAt: stringOrNull(row.updated_at),
  };
}

export function mapSupplementRowToSupplement(row: MedicationSafetyRow): HealthOSSupplement {
  return {
    aiImportId: stringOrNull(row.ai_import_id),
    archivedAt: stringOrNull(row.archived_at),
    brandName: stringOrNull(row.brand_name),
    createdAt: stringOrNull(row.created_at),
    displayName: stringValue(row.display_name, "Supplement"),
    endDate: stringOrNull(row.end_date),
    form: stringOrNull(row.form),
    id: stringOrUndefined(row.id),
    ingredientSummary: stringOrNull(row.ingredient_summary),
    instructionsText: stringOrNull(row.instructions_text),
    notes: stringOrNull(row.notes),
    ownerUserId: stringValue(row.owner_user_id, ""),
    privacyScope: fromSnake(stringValue(row.privacy_scope, "private")) as HealthOSSupplement["privacyScope"],
    reviewStatus: fromSnake(stringValue(row.review_status, "needs_review")) as HealthOSSupplement["reviewStatus"],
    sourceRecordId: stringOrNull(row.source_record_id),
    sourceType: fromSnake(stringValue(row.source_type, "manual")) as HealthOSSupplement["sourceType"],
    startDate: stringOrNull(row.start_date),
    status: fromSnake(stringValue(row.status, "draft")) as HealthOSSupplement["status"],
    strengthText: stringOrNull(row.strength_text),
    subjectCareProfileId: stringOrNull(row.subject_care_profile_id),
    updatedAt: stringOrNull(row.updated_at),
  };
}

export function mapSupplementScheduleRowToSchedule(row: MedicationSafetyRow): HealthOSSupplementSchedule {
  return {
    ...mapMedicationScheduleRowToSchedule(row),
    supplementId: stringValue(row.supplement_id, ""),
  };
}

export function mapSupplementLogRowToLog(row: MedicationSafetyRow): HealthOSSupplementLog {
  return {
    ...mapMedicationLogRowToLog(row),
    supplementId: stringValue(row.supplement_id, ""),
  };
}

export function mapReviewFlagRowToFlag(row: MedicationSafetyRow): HealthOSMedicationReviewFlag {
  return {
    createdAt: stringOrNull(row.created_at),
    flagType: fromSnake(stringValue(row.flag_type, "unknown")) as HealthOSMedicationReviewFlag["flagType"],
    id: stringOrUndefined(row.id),
    medicationId: stringOrNull(row.medication_id),
    messagePrivacySafe: stringValue(row.message_privacy_safe, "Review needed."),
    ownerUserId: stringValue(row.owner_user_id, ""),
    sourceType: fromSnake(stringValue(row.source_type, "unknown")) as HealthOSMedicationReviewFlag["sourceType"],
    status: fromSnake(stringValue(row.status, "unknown")) as HealthOSMedicationReviewFlag["status"],
    subjectCareProfileId: stringOrNull(row.subject_care_profile_id),
    supplementId: stringOrNull(row.supplement_id),
    updatedAt: stringOrNull(row.updated_at),
  };
}

export function mapMedicationToInsert(ownerUserId: string, input: HealthOSMedicationCreateInput) {
  return {
    ai_import_id: input.aiImportId,
    archived_at: input.archivedAt,
    brand_name: input.brandName,
    display_name: input.displayName,
    form: input.form,
    generic_name: input.genericName,
    instructions_text: input.instructionsText,
    name: input.displayName,
    notes: input.notes,
    owner_user_id: ownerUserId,
    pharmacy_name: input.pharmacyName,
    prescriber_name: input.prescriberName,
    privacy_scope: toSnake(input.privacyScope),
    review_status: toSnake(input.reviewStatus),
    route_text: input.routeText,
    source_record_id: input.sourceRecordId,
    source_type: toSnake(input.sourceType),
    start_date: input.startDate,
    end_date: input.endDate,
    status: toSnake(input.status),
    strength_text: input.strengthText,
    subject_care_profile_id: input.subjectCareProfileId,
  };
}

export function mapMedicationToUpdate(input: HealthOSMedicationUpdateInput) {
  return {
    archived_at: input.archivedAt,
    display_name: input.displayName,
    instructions_text: input.instructionsText,
    name: input.displayName,
    notes: input.notes,
    review_status: input.reviewStatus ? toSnake(input.reviewStatus) : undefined,
    status: input.status ? toSnake(input.status) : undefined,
    updated_at: new Date().toISOString(),
  };
}

export function mapScheduleToInsert(ownerUserId: string, input: HealthOSMedicationScheduleCreateInput) {
  return {
    dose_text: input.doseText,
    end_at: input.endAt,
    frequency_text: input.frequencyText,
    linked_reminder_id: input.linkedReminderId,
    medication_id: input.medicationId,
    owner_user_id: ownerUserId,
    repeat_rule: input.repeatRule,
    review_status: toSnake(input.reviewStatus),
    schedule_label: input.scheduleLabel,
    start_at: input.startAt,
    status: toSnake(input.status),
    subject_care_profile_id: input.subjectCareProfileId,
    time_of_day: input.timeOfDay,
    with_food: input.withFood,
  };
}

export function mapMedicationLogToInsert(ownerUserId: string, input: HealthOSMedicationLogCreateInput) {
  return {
    event_time: input.eventTime ?? new Date().toISOString(),
    event_type: toSnake(input.eventType),
    medication_id: input.medicationId,
    note: input.note,
    owner_user_id: ownerUserId,
    schedule_id: input.scheduleId,
    source_reminder_id: input.sourceReminderId,
    subject_care_profile_id: input.subjectCareProfileId,
  };
}

export function mapSideEffectNoteToInsert(ownerUserId: string, input: HealthOSMedicationSideEffectCreateInput) {
  return {
    ended_at: input.endedAt,
    medication_id: input.medicationId,
    note_text: input.noteText,
    owner_user_id: ownerUserId,
    review_status: toSnake(input.reviewStatus),
    severity: input.severity,
    started_at: input.startedAt,
    subject_care_profile_id: input.subjectCareProfileId,
  };
}

export function mapRefillReminderToInsert(ownerUserId: string, input: HealthOSMedicationRefillCreateInput) {
  return {
    linked_reminder_id: input.linkedReminderId,
    medication_id: input.medicationId,
    owner_user_id: ownerUserId,
    refill_due_at: input.refillDueAt,
    remaining_quantity_text: input.remainingQuantityText,
    status: toSnake(input.status),
    subject_care_profile_id: input.subjectCareProfileId,
  };
}

export function mapSupplementToInsert(ownerUserId: string, input: HealthOSSupplementCreateInput) {
  return {
    ai_import_id: input.aiImportId,
    archived_at: input.archivedAt,
    brand_name: input.brandName,
    display_name: input.displayName,
    form: input.form,
    ingredient_summary: input.ingredientSummary,
    instructions_text: input.instructionsText,
    notes: input.notes,
    owner_user_id: ownerUserId,
    privacy_scope: toSnake(input.privacyScope),
    review_status: toSnake(input.reviewStatus),
    source_record_id: input.sourceRecordId,
    source_type: toSnake(input.sourceType),
    start_date: input.startDate,
    end_date: input.endDate,
    status: toSnake(input.status),
    strength_text: input.strengthText,
    subject_care_profile_id: input.subjectCareProfileId,
  };
}

export function mapSupplementToUpdate(input: HealthOSSupplementUpdateInput) {
  return {
    archived_at: input.archivedAt,
    display_name: input.displayName,
    instructions_text: input.instructionsText,
    notes: input.notes,
    review_status: input.reviewStatus ? toSnake(input.reviewStatus) : undefined,
    status: input.status ? toSnake(input.status) : undefined,
    updated_at: new Date().toISOString(),
  };
}

export function mapSupplementScheduleToInsert(ownerUserId: string, input: HealthOSSupplementScheduleCreateInput) {
  return {
    ...mapScheduleToInsert(ownerUserId, { ...input, medicationId: "" }),
    medication_id: undefined,
    supplement_id: input.supplementId,
  };
}

export function mapSupplementLogToInsert(ownerUserId: string, input: HealthOSSupplementLogCreateInput) {
  return {
    event_time: input.eventTime ?? new Date().toISOString(),
    event_type: toSnake(input.eventType),
    note: input.note,
    owner_user_id: ownerUserId,
    schedule_id: input.scheduleId,
    source_reminder_id: input.sourceReminderId,
    subject_care_profile_id: input.subjectCareProfileId,
    supplement_id: input.supplementId,
  };
}

export function mapReviewFlagToInsert(ownerUserId: string, input: HealthOSMedicationReviewFlagCreateInput) {
  return {
    flag_type: toSnake(input.flagType),
    medication_id: input.medicationId,
    message_privacy_safe: input.messagePrivacySafe,
    owner_user_id: ownerUserId,
    source_type: toSnake(input.sourceType),
    status: toSnake(input.status),
    subject_care_profile_id: input.subjectCareProfileId,
    supplement_id: input.supplementId,
  };
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value ? value : fallback;
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function stringOrUndefined(value: unknown) {
  return typeof value === "string" && value ? value : undefined;
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function arrayOfStrings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function toSnake(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function fromSnake(value: string) {
  return value.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
