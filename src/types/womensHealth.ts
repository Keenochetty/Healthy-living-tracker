export type WomensHealthFeatureStatus =
  | "disabled"
  | "enabled"
  | "shared_view"
  | "locked";

export type CycleOverlayType =
  | "period_logged"
  | "period_predicted"
  | "fertile_window_estimate"
  | "ovulation_estimate"
  | "symptom_logged"
  | "mood_logged"
  | "contraception_due"
  | "contraception_caution"
  | "pregnancy_test"
  | "ovulation_test";

export type FlowLevel =
  | "none"
  | "spotting"
  | "light"
  | "medium"
  | "heavy"
  | "very_heavy";
export type SymptomSeverity = "mild" | "moderate" | "strong";

export type ContraceptionMethodType =
  | "combined_pill"
  | "progestogen_only_pill"
  | "patch"
  | "vaginal_ring"
  | "injection"
  | "implant"
  | "copper_iud"
  | "hormonal_ius"
  | "emergency_contraception_note"
  | "barrier"
  | "other";

export type ContraceptionEventType =
  | "taken"
  | "missed"
  | "late"
  | "due"
  | "replaced"
  | "removed"
  | "inserted"
  | "user_noted";

export type WomensHealthSettings = {
  createdAt: string;
  featureStatus: WomensHealthFeatureStatus;
  id: string;
  isPrivate: boolean;
  lockedPrivate: boolean;
  overlayEnabled: boolean;
  profileId: string;
  sharedWithCaregiver: boolean;
  sharedWithFamily: boolean;
  sharedWithPartner: boolean;
  trackingEnabled: boolean;
  updatedAt: string;
  userId: string;
};

export type CycleProfile = {
  contraceptionTrackingEnabled: boolean;
  createdAt: string;
  fertilityEstimatesEnabled: boolean;
  id: string;
  isCycleRegular?: boolean | null;
  lastPeriodStartDate?: string;
  ovulationTestTrackingEnabled: boolean;
  periodLengthDays: number;
  pregnancyTestTrackingEnabled: boolean;
  profileId: string;
  cycleLengthDays: number;
  updatedAt: string;
  userId: string;
};

export type PeriodLog = {
  clotsNote?: string;
  createdAt: string;
  crampsLevel?: number;
  date: string;
  energyLevel?: number;
  flowLevel: FlowLevel;
  id: string;
  medicationNote?: string;
  mood?: string;
  notes?: string;
  painLevel?: number;
  profileId: string;
  updatedAt: string;
  userId: string;
};

export type WomensSymptomLog = {
  createdAt: string;
  date: string;
  id: string;
  notes?: string;
  profileId: string;
  severity: SymptomSeverity;
  symptom: string;
  updatedAt: string;
  userId: string;
};

export type MoodEnergyLog = {
  createdAt: string;
  date: string;
  energyLevel?: number;
  id: string;
  mood?: string;
  notes?: string;
  profileId: string;
  updatedAt: string;
  userId: string;
};

export type CycleEstimate = {
  confidence: "low" | "medium";
  createdAt: string;
  cycleDay?: number;
  estimatedOvulationDate?: string;
  estimateOnly: true;
  fertileWindowEnd?: string;
  fertileWindowStart?: string;
  id: string;
  nextPeriodEnd?: string;
  nextPeriodStart?: string;
  profileId: string;
  updatedAt: string;
  userId: string;
};

export type ContraceptionMethod = {
  createdAt: string;
  foodTimingNote?: string;
  id: string;
  isActive: boolean;
  methodType: ContraceptionMethodType;
  name: string;
  nextDueAt?: string;
  notes?: string;
  profileId: string;
  reminderEnabled: boolean;
  reminderTime?: string;
  startedAt?: string;
  updatedAt: string;
  userId: string;
};

export type ContraceptionLog = {
  createdAt: string;
  eventAt: string;
  eventType: ContraceptionEventType;
  id: string;
  methodId?: string;
  notes?: string;
  profileId: string;
  updatedAt: string;
  userId: string;
};

export type WomensHealthSharePermission = {
  category:
    | "summary"
    | "calendar_overlay"
    | "period_logs"
    | "symptoms"
    | "mood_energy"
    | "contraception"
    | "reports";
  createdAt: string;
  id: string;
  permissionLevel: "none" | "view" | "add" | "edit" | "manage";
  profileId: string;
  updatedAt: string;
  viewerType: "partner" | "family" | "caregiver" | "selected" | "emergency";
};

export type CalendarHaloOverlay = {
  color: string;
  date: string;
  id: string;
  isShared: boolean;
  label: string;
  profileAvatarLabel?: string;
  profileId: string;
  profileName?: string;
  relatedId?: string;
  type: CycleOverlayType;
};

export type TrustedHealthContentCard = {
  authorOrReviewer?: string;
  id: string;
  lastCheckedAt: string;
  sourceName: string;
  summary: string;
  title: string;
  url: string;
};

export type WomensHealthTodaySummary = {
  activePeriod: boolean;
  contraceptionReminder?: string;
  contraceptionStatus: string;
  cycleDay?: number;
  estimate: CycleEstimate;
  latestMood?: MoodEnergyLog;
  latestPeriodLog?: PeriodLog;
  nextPeriodText: string;
  privacyStatus: string;
  symptomCountToday: number;
};
