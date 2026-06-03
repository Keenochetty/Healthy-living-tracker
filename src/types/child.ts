export type ChildProfileType = "baby" | "toddler" | "child" | "teen";

export type ChildGender = "boy" | "girl" | "other" | "prefer_not_to_say";

export type ChildProfile = {
  adultHandoverAtAge18: boolean;
  allergies?: string[];
  avatarEmoji?: string;
  childAccessPaused: boolean;
  createdAt: string;
  createdByProfileId?: string;
  dateOfBirth?: string;
  displayName: string;
  gender?: ChildGender;
  id: string;
  medicalNotes?: string;
  parentControlled: boolean;
  profileType: ChildProfileType;
  transitionAtAge13: boolean;
  updatedAt: string;
};

export type FeedType =
  | "formula"
  | "breast"
  | "expressed_milk"
  | "solids"
  | "water"
  | "other";

export type BabyFeedLog = {
  childId: string;
  createdAt: string;
  durationMinutes?: number;
  extraAmountMl?: number;
  feedType: FeedType;
  finishedAmountMl?: number;
  id: string;
  loggedAt: string;
  notes?: string;
  offeredAmountMl?: number;
};

export type BabySleepLog = {
  childId: string;
  createdAt: string;
  durationMinutes: number;
  id: string;
  loggedAt: string;
  notes?: string;
  quality?: "poor" | "okay" | "good" | "great";
  sleepEnd?: string;
  sleepStart?: string;
};

export type DiaperType = "wet" | "dirty" | "mixed" | "dry" | "other";

export type DiaperLog = {
  childId: string;
  createdAt: string;
  diaperType: DiaperType;
  id: string;
  loggedAt: string;
  notes?: string;
};

export type GrowthMeasurement = {
  childId: string;
  createdAt: string;
  headCircumference?: number;
  headCircumferenceUnit: "cm" | "in";
  height?: number;
  heightUnit: "cm" | "in";
  id: string;
  loggedAt: string;
  notes?: string;
  weight?: number;
  weightUnit: "kg" | "lb";
};

export type MilestoneCategory =
  | "movement"
  | "speech"
  | "social"
  | "feeding"
  | "sleep"
  | "firsts"
  | "custom";

export type ChildMilestone = {
  achievedAt?: string;
  category: MilestoneCategory;
  childId: string;
  createdAt: string;
  id: string;
  notes?: string;
  title: string;
  updatedAt: string;
};

export type VaccinationStatus =
  | "planned"
  | "completed"
  | "postponed"
  | "skipped"
  | "not_sure";

export type VaccinationRecord = {
  childId: string;
  completedDate?: string;
  countryCode?: string;
  createdAt: string;
  id: string;
  notes?: string;
  scheduledDate?: string;
  status: VaccinationStatus;
  updatedAt: string;
  vaccineName: string;
};

export type ChildSummary = {
  child: ChildProfile;
  latestDiaper?: DiaperLog;
  latestFeed?: BabyFeedLog;
  latestGrowth?: GrowthMeasurement;
  latestSleep?: BabySleepLog;
  milestonesCount: number;
  vaccinationRecordsCount: number;
};
