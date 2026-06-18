import type {
  ChildCareLog,
  ContraceptionLog,
  DiaperLog,
  FeedingLog,
  GrowthMeasurement,
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

export const EMPTY_LIFE_STAGE_ARRAY: never[] = [];

export function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function nowIso() {
  return new Date().toISOString();
}

export function createPregnancyProfileDefaults(input: Partial<PregnancyProfile> = {}): PregnancyProfile {
  return { privacyScope: "private", reviewStatus: input.reviewStatus ?? "userEntered", status: "draft", ...input };
}

export function createPregnancyLogDefaults(input: Partial<PregnancyLog> & { pregnancyProfileId: string }): PregnancyLog {
  return { logDate: todayDate(), logType: "note", privacyScope: "private", symptoms: [], ...input };
}

export function createPregnancyAppointmentDefaults(input: Partial<PregnancyAppointment> & { pregnancyProfileId: string; title: string }): PregnancyAppointment {
  return { status: "scheduled", ...input };
}

export function createPregnancyChecklistDefaults(input: Partial<PregnancyChecklist> & { pregnancyProfileId: string; title: string }): PregnancyChecklist {
  return { category: "general", status: "todo", ...input };
}

export function createPregnancyCareTeamDefaults(input: Partial<PregnancyCareTeamMember> & { pregnancyProfileId: string; displayName: string }): PregnancyCareTeamMember {
  return { accessStatus: "contactOnly", canAddNote: false, canViewSummary: false, ...input };
}

export function createWomenHealthLogDefaults(input: Partial<WomenHealthLog> = {}): WomenHealthLog {
  return { logDate: todayDate(), logType: "cycle", privacyScope: "private", sourceType: "manual", symptoms: [], ...input };
}

export function createContraceptionLogDefaults(input: Partial<ContraceptionLog> & { methodType: string }): ContraceptionLog {
  return { privacyScope: "private", status: "active", ...input };
}

export function createSexDayLogDefaults(input: Partial<SexDayLog> & { logDate?: string } = {}): SexDayLog {
  return { logDate: input.logDate ?? todayDate(), privacyScope: "private", ...input };
}

export function createChildCareLogDefaults(input: Partial<ChildCareLog> & { subjectCareProfileId: string; logType: string }): ChildCareLog {
  return { logTime: nowIso(), sourceType: "manual", ...input };
}

export function createFeedingLogDefaults(input: Partial<FeedingLog> & { subjectCareProfileId: string; feedingType: string }): FeedingLog {
  return { startedAt: nowIso(), ...input };
}

export function createSleepLogDefaults(input: Partial<SleepLog> & { subjectCareProfileId: string; startedAt?: string }): SleepLog {
  return { startedAt: input.startedAt ?? nowIso(), ...input };
}

export function createDiaperLogDefaults(input: Partial<DiaperLog> & { subjectCareProfileId: string; diaperType: string }): DiaperLog {
  return { loggedAt: nowIso(), ...input };
}

export function createGrowthMeasurementDefaults(input: Partial<GrowthMeasurement> & { subjectCareProfileId: string }): GrowthMeasurement {
  return { measuredAt: todayDate(), sourceType: "manual", ...input };
}

export function createVaccineRecordDefaults(input: Partial<VaccineRecord> & { subjectCareProfileId: string; vaccineName: string }): VaccineRecord {
  return { status: "needsReview", ...input };
}

export function createMilestoneLogDefaults(input: Partial<MilestoneLog> & { subjectCareProfileId: string; milestoneKey: string; milestoneLabel: string }): MilestoneLog {
  return { status: "observed", ...input };
}

export function createSolidsLogDefaults(input: Partial<SolidsLog> & { subjectCareProfileId: string; foodName: string }): SolidsLog {
  return { allergyFlag: false, introducedAt: todayDate(), sourceType: "manual", ...input };
}
