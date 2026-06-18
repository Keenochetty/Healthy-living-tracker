import type {
  CaregiverNote,
  ChildCareLog,
  ChildMedicationNote,
  ContraceptionLog,
  DiaperLog,
  FeedingLog,
  GrowthMeasurement,
  LifeStagePrivacyScope,
  LifeStageReviewStatus,
  LifeStageSourceType,
  MilestoneLog,
  PregnancyAppointment,
  PregnancyCareTeamMember,
  PregnancyChecklist,
  PregnancyLog,
  PregnancyProfile,
  SexDayLog,
  SleepLog,
  SolidsLog,
  VaccineRecord,
  WomenHealthLog,
} from "./lifeStageTypes";

export type LifeStageRow = Record<string, unknown>;

const privacy = (value: unknown): LifeStagePrivacyScope => {
  if (value === "selected_family" || value === "selectedFamily") return "selectedFamily";
  if (value === "caregiver_limited" || value === "caregiverLimited") return "caregiverLimited";
  return "private";
};

const source = (value: unknown): LifeStageSourceType => {
  if (value === "record" || value === "scan" || value === "aiImport" || value === "ai_import") {
    return value === "ai_import" ? "aiImport" : value;
  }
  return "manual";
};

const review = (value: unknown): LifeStageReviewStatus => {
  if (value === "needs_review" || value === "needsReview") return "needsReview";
  if (value === "reviewed") return "reviewed";
  return "userEntered";
};

const str = (value: unknown) => (typeof value === "string" && value ? value : undefined);
const strArray = (value: unknown) => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : undefined);
const bool = (value: unknown) => value === true;

export function mapPregnancyProfileRow(row: LifeStageRow): PregnancyProfile {
  return {
    aiImportId: str(row.ai_import_id),
    babyNickname: str(row.baby_nickname),
    babySex: str(row.baby_sex),
    createdAt: str(row.created_at),
    endedAt: str(row.ended_at),
    estimatedDueDate: str(row.estimated_due_date),
    id: str(row.id),
    lastMenstrualPeriodDate: str(row.last_menstrual_period_date),
    ownerUserId: str(row.owner_user_id),
    pregnancyStartSource: str(row.pregnancy_start_source),
    privacyScope: privacy(row.privacy_scope),
    reviewStatus: review(row.review_status),
    sourceRecordId: str(row.source_record_id),
    status: (str(row.status) as PregnancyProfile["status"]) ?? "draft",
    subjectCareProfileId: str(row.subject_care_profile_id),
    updatedAt: str(row.updated_at),
  };
}

export function mapPregnancyLogRow(row: LifeStageRow): PregnancyLog {
  return {
    createdAt: str(row.created_at),
    id: str(row.id),
    logDate: str(row.log_date) ?? "",
    logType: str(row.log_type) ?? "note",
    mood: str(row.mood),
    note: str(row.note),
    ownerUserId: str(row.owner_user_id),
    pregnancyProfileId: str(row.pregnancy_profile_id) ?? "",
    privacyScope: privacy(row.privacy_scope),
    severity: str(row.severity),
    symptoms: strArray(row.symptoms),
    updatedAt: str(row.updated_at),
  };
}

export function mapPregnancyAppointmentRow(row: LifeStageRow): PregnancyAppointment {
  return {
    appointmentAt: str(row.appointment_at),
    createdAt: str(row.created_at),
    id: str(row.id),
    linkedCalendarEventId: str(row.linked_calendar_event_id),
    linkedReminderId: str(row.linked_reminder_id),
    location: str(row.location),
    notes: str(row.notes),
    ownerUserId: str(row.owner_user_id),
    pregnancyProfileId: str(row.pregnancy_profile_id) ?? "",
    providerName: str(row.provider_name),
    sourceRecordId: str(row.source_record_id),
    status: (str(row.status) as PregnancyAppointment["status"]) ?? "scheduled",
    title: str(row.title) ?? "",
    updatedAt: str(row.updated_at),
  };
}

export function mapPregnancyChecklistRow(row: LifeStageRow): PregnancyChecklist {
  return {
    category: str(row.category) ?? "general",
    createdAt: str(row.created_at),
    dueAt: str(row.due_at),
    id: str(row.id),
    linkedReminderId: str(row.linked_reminder_id),
    ownerUserId: str(row.owner_user_id),
    pregnancyProfileId: str(row.pregnancy_profile_id) ?? "",
    status: (str(row.status) as PregnancyChecklist["status"]) ?? "todo",
    title: str(row.title) ?? "",
    updatedAt: str(row.updated_at),
  };
}

export function mapPregnancyCareTeamRow(row: LifeStageRow): PregnancyCareTeamMember {
  return {
    accessStatus: row.access_status === "invited" ? "invited" : row.access_status === "inactive" ? "inactive" : "contactOnly",
    canAddNote: bool(row.can_add_note),
    canViewSummary: bool(row.can_view_summary),
    createdAt: str(row.created_at),
    displayName: str(row.display_name) ?? "",
    email: str(row.email),
    id: str(row.id),
    ownerUserId: str(row.owner_user_id),
    phone: str(row.phone),
    pregnancyProfileId: str(row.pregnancy_profile_id) ?? "",
    role: str(row.role),
    updatedAt: str(row.updated_at),
  };
}

export function mapWomenHealthLogRow(row: LifeStageRow): WomenHealthLog {
  return {
    bleedingLevel: str(row.bleeding_level),
    createdAt: str(row.created_at),
    cycleDay: num(row.cycle_day),
    id: str(row.id),
    logDate: str(row.log_date) ?? "",
    logType: str(row.log_type) ?? "cycle",
    mood: str(row.mood),
    note: str(row.note),
    ownerUserId: str(row.owner_user_id),
    painLevel: num(row.pain_level),
    privacyScope: privacy(row.privacy_scope),
    sourceType: source(row.source_type),
    subjectCareProfileId: str(row.subject_care_profile_id),
    symptoms: strArray(row.symptoms),
    temperatureText: str(row.temperature_text),
    updatedAt: str(row.updated_at),
  };
}

export function mapContraceptionLogRow(row: LifeStageRow): ContraceptionLog {
  return {
    createdAt: str(row.created_at),
    id: str(row.id),
    methodName: str(row.method_name),
    methodType: str(row.method_type) ?? "",
    notes: str(row.notes),
    ownerUserId: str(row.owner_user_id),
    privacyScope: privacy(row.privacy_scope),
    reminderId: str(row.reminder_id),
    renewalDueDate: str(row.renewal_due_date),
    startDate: str(row.start_date),
    status: (str(row.status) as ContraceptionLog["status"]) ?? "active",
    subjectCareProfileId: str(row.subject_care_profile_id),
    updatedAt: str(row.updated_at),
  };
}

export function mapSexDayLogRow(row: LifeStageRow): SexDayLog {
  return {
    createdAt: str(row.created_at),
    id: str(row.id),
    logDate: str(row.log_date) ?? "",
    note: str(row.note),
    ownerUserId: str(row.owner_user_id),
    privacyScope: "private",
    protectedStatus: str(row.protected_status),
    subjectCareProfileId: str(row.subject_care_profile_id),
    updatedAt: str(row.updated_at),
  };
}

export function mapChildCareLogRow(row: LifeStageRow): ChildCareLog {
  return {
    createdAt: str(row.created_at),
    createdBy: str(row.created_by),
    id: str(row.id),
    logTime: str(row.log_time) ?? "",
    logType: str(row.log_type) ?? "general",
    notes: str(row.notes),
    ownerUserId: str(row.owner_user_id),
    sourceType: source(row.source_type),
    subjectCareProfileId: str(row.subject_care_profile_id) ?? "",
    summaryPrivacySafe: str(row.summary_privacy_safe),
    updatedAt: str(row.updated_at),
  };
}

export function mapFeedingLogRow(row: LifeStageRow): FeedingLog {
  return { amountText: str(row.amount_text), createdAt: str(row.created_at), createdBy: str(row.created_by), endedAt: str(row.ended_at), feedingType: str(row.feeding_type) ?? "", id: str(row.id), notes: str(row.notes), ownerUserId: str(row.owner_user_id), side: str(row.side), startedAt: str(row.started_at) ?? "", subjectCareProfileId: str(row.subject_care_profile_id) ?? "", updatedAt: str(row.updated_at) };
}

export function mapSleepLogRow(row: LifeStageRow): SleepLog {
  return { createdAt: str(row.created_at), createdBy: str(row.created_by), endedAt: str(row.ended_at), id: str(row.id), ownerUserId: str(row.owner_user_id), qualityNote: str(row.quality_note), sleepLocation: str(row.sleep_location), startedAt: str(row.started_at) ?? "", subjectCareProfileId: str(row.subject_care_profile_id) ?? "", updatedAt: str(row.updated_at) };
}

export function mapDiaperLogRow(row: LifeStageRow): DiaperLog {
  return { createdAt: str(row.created_at), createdBy: str(row.created_by), diaperType: str(row.diaper_type) ?? "", id: str(row.id), loggedAt: str(row.logged_at) ?? "", notes: str(row.notes), ownerUserId: str(row.owner_user_id), subjectCareProfileId: str(row.subject_care_profile_id) ?? "" };
}

export function mapGrowthMeasurementRow(row: LifeStageRow): GrowthMeasurement {
  return { createdAt: str(row.created_at), headCircumferenceCm: num(row.head_circumference_cm), id: str(row.id), lengthCm: num(row.length_cm), measuredAt: str(row.measured_at) ?? "", notes: str(row.notes), ownerUserId: str(row.owner_user_id), sourceRecordId: str(row.source_record_id), sourceType: source(row.source_type), subjectCareProfileId: str(row.subject_care_profile_id) ?? "", updatedAt: str(row.updated_at), weightKg: num(row.weight_kg) };
}

export function mapVaccineRecordRow(row: LifeStageRow): VaccineRecord {
  return { createdAt: str(row.created_at), doseLabel: str(row.dose_label), givenAt: str(row.given_at), id: str(row.id), linkedReminderId: str(row.linked_reminder_id), notes: str(row.notes), ownerUserId: str(row.owner_user_id), providerName: str(row.provider_name), sourceRecordId: str(row.source_record_id), status: (str(row.status) as VaccineRecord["status"]) ?? "recorded", subjectCareProfileId: str(row.subject_care_profile_id) ?? "", updatedAt: str(row.updated_at), vaccineName: str(row.vaccine_name) ?? "" };
}

export function mapMilestoneLogRow(row: LifeStageRow): MilestoneLog {
  return { category: str(row.category), createdAt: str(row.created_at), id: str(row.id), milestoneKey: str(row.milestone_key) ?? "", milestoneLabel: str(row.milestone_label) ?? "", notes: str(row.notes), observedAt: str(row.observed_at), ownerUserId: str(row.owner_user_id), sourceReference: str(row.source_reference), status: (str(row.status) as MilestoneLog["status"]) ?? "observed", subjectCareProfileId: str(row.subject_care_profile_id) ?? "", updatedAt: str(row.updated_at) };
}

export function mapSolidsLogRow(row: LifeStageRow): SolidsLog {
  return { allergyFlag: bool(row.allergy_flag), createdAt: str(row.created_at), foodName: str(row.food_name) ?? "", id: str(row.id), introducedAt: str(row.introduced_at) ?? "", notes: str(row.notes), ownerUserId: str(row.owner_user_id), reactionNote: str(row.reaction_note), sourceType: source(row.source_type), subjectCareProfileId: str(row.subject_care_profile_id) ?? "", updatedAt: str(row.updated_at) };
}

export function mapChildMedicationNoteRow(row: LifeStageRow) {
  return { createdAt: str(row.created_at), id: str(row.id), linkedMedicationId: str(row.linked_medication_id), noteText: str(row.note_text) ?? "", ownerUserId: str(row.owner_user_id), sourceRecordId: str(row.source_record_id), subjectCareProfileId: str(row.subject_care_profile_id) ?? "", updatedAt: str(row.updated_at) };
}

export function mapCaregiverNoteRow(row: LifeStageRow): CaregiverNote {
  return { createdAt: str(row.created_at), createdBy: str(row.created_by), id: str(row.id), noteText: str(row.note_text) ?? "", noteType: str(row.note_type) ?? "general", ownerUserId: str(row.owner_user_id), subjectCareProfileId: str(row.subject_care_profile_id) ?? "", updatedAt: str(row.updated_at), visibilityScope: row.visibility_scope === "care_team" ? "careTeam" : "guardianOnly" };
}

export function toSnakeInsert(ownerUserId: string, input: Record<string, unknown>) {
  const output: Record<string, unknown> = { owner_user_id: ownerUserId };
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || key === "id" || key === "createdAt" || key === "updatedAt" || key === "ownerUserId") continue;
    output[key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)] = value;
  }
  if (output.privacy_scope === "selectedFamily") output.privacy_scope = "selected_family";
  if (output.privacy_scope === "caregiverLimited") output.privacy_scope = "caregiver_limited";
  if (output.review_status === "needsReview") output.review_status = "needs_review";
  if (output.review_status === "userEntered") output.review_status = "user_entered";
  if (output.source_type === "aiImport") output.source_type = "ai_import";
  if (output.access_status === "contactOnly") output.access_status = "contact_only";
  if (output.visibility_scope === "guardianOnly") output.visibility_scope = "guardian_only";
  if (output.visibility_scope === "careTeam") output.visibility_scope = "care_team";
  return output;
}
