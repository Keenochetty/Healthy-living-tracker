export type HealthOSLifeStageBackendStatus =
  | "idle"
  | "loading"
  | "ready"
  | "missingAuth"
  | "missingTable"
  | "reviewRequired"
  | "permissionRequired"
  | "deferred"
  | "error";

export type HealthOSLifeStageServiceResult<T> = {
  data: T | null;
  error: string | null;
  status: HealthOSLifeStageBackendStatus;
};

export type LifeStagePrivacyScope = "private" | "selectedFamily" | "caregiverLimited";
export type LifeStageReviewStatus = "userEntered" | "needsReview" | "reviewed";
export type LifeStageSourceType = "manual" | "record" | "scan" | "aiImport";

export type PregnancyProfile = {
  aiImportId?: string;
  babyNickname?: string;
  babySex?: string;
  createdAt?: string;
  endedAt?: string;
  estimatedDueDate?: string;
  id?: string;
  lastMenstrualPeriodDate?: string;
  ownerUserId?: string;
  pregnancyStartSource?: string;
  privacyScope: LifeStagePrivacyScope;
  reviewStatus: LifeStageReviewStatus;
  sourceRecordId?: string;
  status: "draft" | "active" | "ended" | "archived";
  subjectCareProfileId?: string;
  updatedAt?: string;
};

export type PregnancyLog = {
  createdAt?: string;
  id?: string;
  logDate: string;
  logType: string;
  mood?: string;
  note?: string;
  ownerUserId?: string;
  pregnancyProfileId: string;
  privacyScope: LifeStagePrivacyScope;
  severity?: string;
  symptoms: string[];
  updatedAt?: string;
};

export type PregnancyAppointment = {
  appointmentAt?: string;
  createdAt?: string;
  id?: string;
  linkedCalendarEventId?: string;
  linkedReminderId?: string;
  location?: string;
  notes?: string;
  ownerUserId?: string;
  pregnancyProfileId: string;
  providerName?: string;
  sourceRecordId?: string;
  status: "scheduled" | "completed" | "cancelled" | "draft";
  title: string;
  updatedAt?: string;
};

export type PregnancyChecklist = {
  category: string;
  createdAt?: string;
  dueAt?: string;
  id?: string;
  linkedReminderId?: string;
  ownerUserId?: string;
  pregnancyProfileId: string;
  status: "todo" | "done" | "deferred";
  title: string;
  updatedAt?: string;
};

export type PregnancyCareTeamMember = {
  accessStatus: "contactOnly" | "invited" | "inactive";
  canAddNote: boolean;
  canViewSummary: boolean;
  createdAt?: string;
  displayName: string;
  email?: string;
  id?: string;
  ownerUserId?: string;
  phone?: string;
  pregnancyProfileId: string;
  role?: string;
  updatedAt?: string;
};

export type WomenHealthLog = {
  bleedingLevel?: string;
  createdAt?: string;
  cycleDay?: number;
  id?: string;
  logDate: string;
  logType: string;
  mood?: string;
  note?: string;
  ownerUserId?: string;
  painLevel?: number;
  privacyScope: LifeStagePrivacyScope;
  sourceType: LifeStageSourceType;
  subjectCareProfileId?: string;
  symptoms: string[];
  temperatureText?: string;
  updatedAt?: string;
};

export type ContraceptionLog = {
  createdAt?: string;
  id?: string;
  methodName?: string;
  methodType: string;
  notes?: string;
  ownerUserId?: string;
  privacyScope: LifeStagePrivacyScope;
  reminderId?: string;
  renewalDueDate?: string;
  startDate?: string;
  status: "active" | "inactive" | "draft";
  subjectCareProfileId?: string;
  updatedAt?: string;
};

export type SexDayLog = {
  createdAt?: string;
  id?: string;
  logDate: string;
  note?: string;
  ownerUserId?: string;
  privacyScope: "private";
  protectedStatus?: string;
  subjectCareProfileId?: string;
  updatedAt?: string;
};

export type ChildCareLog = {
  createdAt?: string;
  createdBy?: string;
  id?: string;
  logTime: string;
  logType: string;
  notes?: string;
  ownerUserId?: string;
  sourceType: LifeStageSourceType;
  subjectCareProfileId: string;
  summaryPrivacySafe?: string;
  updatedAt?: string;
};

export type FeedingLog = {
  amountText?: string;
  createdAt?: string;
  createdBy?: string;
  endedAt?: string;
  feedingType: string;
  id?: string;
  notes?: string;
  ownerUserId?: string;
  side?: string;
  startedAt: string;
  subjectCareProfileId: string;
  updatedAt?: string;
};

export type SleepLog = {
  createdAt?: string;
  createdBy?: string;
  endedAt?: string;
  id?: string;
  ownerUserId?: string;
  qualityNote?: string;
  sleepLocation?: string;
  startedAt: string;
  subjectCareProfileId: string;
  updatedAt?: string;
};

export type DiaperLog = {
  createdAt?: string;
  createdBy?: string;
  diaperType: string;
  id?: string;
  loggedAt: string;
  notes?: string;
  ownerUserId?: string;
  subjectCareProfileId: string;
};

export type GrowthMeasurement = {
  createdAt?: string;
  headCircumferenceCm?: number;
  id?: string;
  lengthCm?: number;
  measuredAt: string;
  notes?: string;
  ownerUserId?: string;
  sourceRecordId?: string;
  sourceType: LifeStageSourceType;
  subjectCareProfileId: string;
  updatedAt?: string;
  weightKg?: number;
};

export type VaccineRecord = {
  createdAt?: string;
  doseLabel?: string;
  givenAt?: string;
  id?: string;
  linkedReminderId?: string;
  notes?: string;
  ownerUserId?: string;
  providerName?: string;
  sourceRecordId?: string;
  status: "recorded" | "planned" | "needsReview";
  subjectCareProfileId: string;
  updatedAt?: string;
  vaccineName: string;
};

export type MilestoneLog = {
  category?: string;
  createdAt?: string;
  id?: string;
  milestoneKey: string;
  milestoneLabel: string;
  notes?: string;
  observedAt?: string;
  ownerUserId?: string;
  sourceReference?: string;
  status: "observed" | "notYet" | "unsure" | "askProfessional";
  subjectCareProfileId: string;
  updatedAt?: string;
};

export type SolidsLog = {
  allergyFlag: boolean;
  createdAt?: string;
  foodName: string;
  id?: string;
  introducedAt: string;
  notes?: string;
  ownerUserId?: string;
  reactionNote?: string;
  sourceType: LifeStageSourceType;
  subjectCareProfileId: string;
  updatedAt?: string;
};

export type ChildMedicationNote = {
  createdAt?: string;
  id?: string;
  linkedMedicationId?: string;
  noteText: string;
  ownerUserId?: string;
  sourceRecordId?: string;
  subjectCareProfileId: string;
  updatedAt?: string;
};

export type CaregiverNote = {
  createdAt?: string;
  createdBy?: string;
  id?: string;
  noteText: string;
  noteType: string;
  ownerUserId?: string;
  subjectCareProfileId: string;
  updatedAt?: string;
  visibilityScope: "guardianOnly" | "careTeam";
};

export type LifeStageRecordLinkCandidate = {
  recordId: string;
  sourceTable: string;
  targetRowId?: string;
  targetTable: string;
};

export type LifeStageReminderCandidate = {
  sourceRowId?: string;
  sourceTable: string;
  titlePrivacySafe: string;
};
