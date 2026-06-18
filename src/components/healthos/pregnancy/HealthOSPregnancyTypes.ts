import type { Href } from "expo-router";

import type {
  PregnancyAppointment,
  PregnancyProfile,
  PregnancyQuestion,
  PregnancySymptomLog,
  PregnancyTrustedLearnCard,
  PregnancyWeekSummary,
} from "@/types/pregnancy";

export type HealthOSPregnancyPrivacyStatus =
  | "private"
  | "sharedSelected"
  | "unknown";

export type HealthOSPregnancyStatus =
  | "notStarted"
  | "setupNeeded"
  | "active"
  | "completed"
  | "unknown";

export type HealthOSTrimester = "first" | "second" | "third" | "unknown";

export type HealthOSPregnancyLogType =
  | "symptom"
  | "mood"
  | "pain"
  | "appointmentNote"
  | "babyMovement"
  | "note";

export type HealthOSBabyGenderOption =
  | "girl"
  | "boy"
  | "unknownUpdateLater"
  | "preferNotToSay";

export type HealthOSCareTeamRole =
  | "doctor"
  | "nursingSister"
  | "midwife"
  | "caregiver";

export type HealthOSPregnancySetupDraft = {
  babyGender: HealthOSBabyGenderOption;
  babyNickname?: string;
  estimatedDueDate?: string;
  lastMenstrualPeriodDate?: string;
};

export type HealthOSPregnancyQuickLogDraft = {
  logType: HealthOSPregnancyLogType;
  mood?: string;
  note?: string;
  painArea?: string;
  severityScore?: number;
  symptom?: string;
};

export type HealthOSChecklistItem = {
  completed: boolean;
  id: string;
  label: string;
};

export type HealthOSChecklistSection = {
  description: string;
  id: string;
  items: HealthOSChecklistItem[];
  persisted: boolean;
  title: string;
};

export type HealthOSPregnancyContentItem = {
  id: string;
  publishedAt?: string;
  routeTarget?: Href;
  sourceName: string;
  sourceUrl: string;
  summary: string;
  title: string;
  topic: string;
};

export type HealthOSPregnancyData = {
  afterBirthPlan: HealthOSChecklistSection;
  appointments: PregnancyAppointment[];
  babyGrowth: {
    content?: HealthOSPregnancyContentItem;
    status: string;
    weekLabel: string;
  };
  babyProfile: {
    dueDate?: string;
    genderStatus: string;
    status: string;
  };
  careTeamAccess: {
    roles: HealthOSCareTeamRole[];
    status: string;
  };
  contentPreview: HealthOSPregnancyContentItem[];
  currentTrimester: HealthOSTrimester;
  currentWeek?: number;
  dueDate?: string;
  emptyState: string | null;
  error: string | null;
  familyUpdates: {
    count: number;
    status: string;
  };
  hospitalBagChecklist: HealthOSChecklistSection;
  loading: boolean;
  momChecklist: HealthOSChecklistSection;
  motherHealthSummary: {
    appointmentStatus: string;
    latestSymptom?: PregnancySymptomLog;
    moodCheckIns: number;
    painCount: number;
    sleepWaterStatus: string;
    status: string;
    supplementStatus: string;
    symptomCount: number;
    weightTrendStatus: string;
  };
  partnerChecklist: HealthOSChecklistSection;
  pregnancyStatus: HealthOSPregnancyStatus;
  privacyStatus: HealthOSPregnancyPrivacyStatus;
  profile: PregnancyProfile | null;
  progress: {
    accessibleLabel: string;
    daysRemaining?: number;
    percent: number;
    status: string;
    weeksRemaining?: number;
  };
  questions: PregnancyQuestion[];
  quickLogOptions: Array<{ key: HealthOSPregnancyLogType; label: string }>;
  setupState: string;
  supplements: {
    medicationSummary: string;
    nutritionSummary: string;
    recordsSummary: string;
    supplementSummary: string;
    workoutSummary: string;
  };
  symptoms: PregnancySymptomLog[];
  trustedCards: PregnancyTrustedLearnCard[];
  week: PregnancyWeekSummary | null;
  weekOverview: {
    nextAppointment: string;
    nextChecklistItem: string;
    trimester: string;
    week: string;
  };
};
