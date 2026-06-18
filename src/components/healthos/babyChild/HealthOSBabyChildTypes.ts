import type { Href } from "expo-router";

import type {
  BabyCalendarEvent,
  BabyChildProfile,
  BabyDiaperLog,
  BabyFeedingLog,
  BabyGrowthLog,
  BabyLearnCard,
  BabyMedicineLog,
  BabyMilestone,
  BabyReportSummary,
  BabySleepLogPhase15C,
  BabySolidFoodLog,
  BabyVaccineRecord,
  ChildMilestone,
} from "@/types/child";

export type HealthOSChildProfileType =
  | "baby"
  | "toddler"
  | "child"
  | "teen"
  | "adultChild"
  | "unknown";

export type HealthOSChildCareLogType =
  | "feed"
  | "sleep"
  | "diaper"
  | "medicine"
  | "symptom"
  | "temperature"
  | "milestone"
  | "solidFood"
  | "note"
  | "appointment";

export type HealthOSFeedingType =
  | "breast"
  | "formula"
  | "bottle"
  | "pumpedMilk"
  | "solidFood"
  | "mixed"
  | "unknown";

export type HealthOSDiaperType = "wet" | "dirty" | "both" | "unknown";

export type HealthOSMilestoneCategory =
  | "socialEmotional"
  | "languageCommunication"
  | "cognitiveLearning"
  | "movementPhysical"
  | "feedingSelfCare"
  | "other";

export type HealthOSChildControlState =
  | "parentControlled"
  | "teenParticipation"
  | "adultOwned"
  | "sharedBack"
  | "unknown";

export type HealthOSBabyChildQuickLogDraft = {
  amountMl?: number;
  childProfileId?: string;
  diaperType?: HealthOSDiaperType;
  foodName?: string;
  logType: HealthOSChildCareLogType;
  medicineName?: string;
  note?: string;
  sleepEnd?: string;
  sleepStart?: string;
  symptom?: string;
  temperature?: string;
};

export type HealthOSChildSetupDraft = {
  dateOfBirth?: string;
  displayName: string;
};

export type HealthOSChildContentItem = {
  id: string;
  publishedAt?: string;
  routeTarget?: Href;
  sourceName: string;
  sourceUrl: string;
  summary: string;
  title: string;
  topic: string;
};

export type HealthOSBabyChildData = {
  activeChild: BabyChildProfile | null;
  caregiverNotes: {
    count: number;
    status: string;
  };
  careTimeline: BabyCalendarEvent[];
  childProfiles: BabyChildProfile[];
  contentPreview: HealthOSChildContentItem[];
  diaperSummary: {
    countToday: number;
    latest?: BabyDiaperLog;
    status: string;
  };
  emptyState: string | null;
  error: string | null;
  familySharing: {
    sharedCount: number;
    status: string;
  };
  feedingSummary: {
    countToday: number;
    latest?: BabyFeedingLog;
    status: string;
    totalAmountMl: number;
  };
  growthSummary: {
    latest?: BabyGrowthLog;
    sourceStatus: string;
    status: string;
    totalCount: number;
  };
  loading: boolean;
  medicationSymptomsSummary: {
    medicineDueCount: number;
    recentMedicine?: BabyMedicineLog;
    status: string;
    temperatureStatus: string;
  };
  milestoneSummary: {
    checklist: BabyMilestone[];
    logs: ChildMilestone[];
    observedCount: number;
    status: string;
    totalCount: number;
  };
  parentControls: {
    controlState: HealthOSChildControlState;
    status: string;
  };
  pregnancyConnection: {
    dueDate?: string;
    status: string;
  };
  profileState: {
    ageLabel: string;
    privacyLabel: string;
    profileType: HealthOSChildProfileType;
    relationshipLabel: string;
  };
  quickLogOptions: Array<{ key: HealthOSChildCareLogType; label: string }>;
  recordsSummary: {
    status: string;
  };
  report: BabyReportSummary | null;
  selectedProfileId?: string;
  sleepSummary: {
    latest?: BabySleepLogPhase15C;
    napCount: number;
    status: string;
    totalMinutes: number;
  };
  solidsSummary: {
    logs: BabySolidFoodLog[];
    reactionCount: number;
    status: string;
    triedCount: number;
  };
  todaySummary: {
    caregiverUpdate: string;
    lastDiaper: string;
    lastFeed: string;
    lastSleep: string;
    medicationDue: string;
    milestonePrompt: string;
    vaccineOrAppointment: string;
  };
  trustedCards: BabyLearnCard[];
  vaccineTimeline: {
    records: BabyVaccineRecord[];
    status: string;
  };
};
