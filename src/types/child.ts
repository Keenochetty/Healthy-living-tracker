export type ChildProfileType = "newborn" | "infant" | "toddler" | "preschool" | "child" | "baby" | "teen";

export type ChildGender = "boy" | "girl" | "female" | "male" | "intersex" | "other" | "prefer_not_to_say";

export type BabyFeedingType =
  | "breastfeeding"
  | "bottle_formula"
  | "bottle_breast_milk"
  | "mixed"
  | "pumping"
  | "solids"
  | "other";

export type DiaperType =
  | "wet"
  | "dirty"
  | "mixed"
  | "dry"
  | "other";

export type MilestoneCategory =
  | "social_emotional"
  | "language_communication"
  | "cognitive"
  | "movement_physical"
  | "movement"
  | "speech"
  | "social"
  | "feeding"
  | "sleep"
  | "firsts"
  | "custom";

export type MilestoneStatus =
  | "observed"
  | "not_yet"
  | "unsure";

export type BabyCalendarEventType =
  | "feeding"
  | "sleep"
  | "diaper"
  | "growth"
  | "milestone"
  | "solid_food"
  | "medicine"
  | "vaccine"
  | "appointment"
  | "record"
  | "note"
  | "custom";

export type BabyWidgetKey =
  | "next_feed"
  | "last_feed"
  | "sleep_today"
  | "last_sleep"
  | "last_diaper"
  | "weight_latest"
  | "growth_check"
  | "next_vaccine"
  | "baby_medicine_due"
  | "solid_food_tried"
  | "milestone_check"
  | "baby_note"
  | "baby_today"
  | "baby_feed";

export type ChildProfile = {
  adultHandoverAtAge18: boolean;
  allergies?: string[];
  avatarEmoji?: string;
  birthHeadCircumferenceCm?: number;
  birthLengthCm?: number;
  birthWeightKg?: number;
  childAccessPaused: boolean;
  clinicName?: string;
  createdAt: string;
  createdByProfileId?: string;
  dateOfBirth?: string;
  displayName: string;
  dueDate?: string;
  feedingType?: BabyFeedingType;
  gender?: ChildGender;
  id: string;
  medicalNotes?: string;
  parentControlled: boolean;
  parentGuardianUserId?: string;
  pediatricianName?: string;
  privacy?: "private" | "shared_selected";
  profileType: ChildProfileType;
  profileId?: string;
  transitionAtAge13: boolean;
  updatedAt: string;
  userId?: string;
};

export type FeedType =
  | "formula"
  | "breast"
  | "expressed_milk"
  | "solids"
  | "water"
  | "other"
  | BabyFeedingType;

export type BabyFeedLog = {
  childId: string;
  childProfileId?: string;
  createdAt: string;
  durationMinutes?: number;
  endedAt?: string;
  extraAmountMl?: number;
  feedType: FeedType;
  feedingType?: BabyFeedingType;
  finishedAmountMl?: number;
  foodName?: string;
  id: string;
  loggedAt: string;
  notes?: string;
  offeredAmountMl?: number;
  profileId?: string;
  reactionNote?: string;
  side?: "left" | "right" | "both" | "not_applicable";
  startedAt?: string;
  texture?: string;
  updatedAt?: string;
  userId?: string;
};

export type BabySleepLog = {
  childId: string;
  childProfileId?: string;
  createdAt: string;
  durationMinutes: number;
  id: string;
  loggedAt: string;
  notes?: string;
  quality?: "poor" | "okay" | "good" | "great";
  sleepEnd?: string;
  sleepStart?: string;
  sleepType?: "nap" | "night" | "unknown";
  sleepLocation?: string;
  profileId?: string;
  updatedAt?: string;
  userId?: string;
};

export type DiaperLog = {
  childId: string;
  childProfileId?: string;
  color?: string;
  createdAt: string;
  diaperType: DiaperType;
  id: string;
  loggedAt: string;
  notes?: string;
  photoUri?: string;
  profileId?: string;
  texture?: string;
  updatedAt?: string;
  userId?: string;
};

export type GrowthMeasurement = {
  childId: string;
  childProfileId?: string;
  createdAt: string;
  headCircumference?: number;
  headCircumferenceUnit: "cm" | "in";
  height?: number;
  heightUnit: "cm" | "in";
  id: string;
  loggedAt: string;
  measurementSource?: "home" | "clinic" | "pediatrician" | "other";
  notes?: string;
  profileId?: string;
  updatedAt?: string;
  userId?: string;
  weight?: number;
  weightUnit: "kg" | "lb";
};

export type ChildMilestone = {
  ageCheckpointMonths?: number;
  achievedAt?: string;
  category: MilestoneCategory;
  childId: string;
  createdAt: string;
  id: string;
  notes?: string;
  sourceOrganization?: string;
  sourceUrl?: string;
  status?: MilestoneStatus;
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
  batchNumber?: string;
  clinicLocation?: string;
  dateReceived?: string;
  documentId?: string;
  doseNumber?: string;
  id: string;
  nextDoseDate?: string;
  notes?: string;
  scheduledDate?: string;
  status: VaccinationStatus;
  updatedAt: string;
  vaccineName: string;
};

export type BabyChildProfile = ChildProfile & {
  parentGuardianUserId: string;
  profileId: string;
  privacy: "private" | "shared_selected";
  userId?: string;
};

export type BabyFeedingLog = BabyFeedLog;
export type BabySleepLogPhase15C = BabySleepLog;
export type BabyDiaperLog = DiaperLog;
export type BabyGrowthLog = GrowthMeasurement;

export interface BabyMilestone {
  ageCheckpointMonths: number;
  category: MilestoneCategory;
  childProfileId: string;
  createdAt: string;
  id: string;
  sourceOrganization: string;
  sourceUrl: string;
  title: string;
  updatedAt: string;
}

export interface BabyMilestoneLog {
  childProfileId: string;
  createdAt: string;
  id: string;
  milestoneId: string;
  notes?: string;
  observedDate?: string;
  profileId: string;
  status: MilestoneStatus;
  updatedAt: string;
  userId: string;
}

export interface BabySolidFoodLog {
  allergenCategory?: string;
  childProfileId: string;
  createdAt: string;
  foodName: string;
  id: string;
  likedStatus?: "liked" | "neutral" | "disliked" | "unknown";
  notes?: string;
  preparationNotes?: string;
  profileId: string;
  reactionNote?: string;
  texture?: string;
  triedAt: string;
  updatedAt: string;
  userId: string;
}

export interface BabyMedicineLog {
  childProfileId: string;
  createdAt: string;
  doseInstruction?: string;
  expiryDate?: string;
  id: string;
  loggedAt: string;
  medicineName: string;
  notes?: string;
  prescribedBy?: string;
  profileId: string;
  status: "due" | "taken" | "skipped" | "missed" | "snoozed" | "noted";
  updatedAt: string;
  userId: string;
}

export type BabyVaccineRecord = VaccinationRecord;

export interface BabyLearnCard {
  category: "safe_sleep" | "milestones" | "growth" | "feeding" | "solids" | "allergens" | "vaccines" | "care" | "emergency";
  disclaimer: string;
  id: string;
  lastCheckedAt: string;
  publishedAt?: string;
  reviewer?: string;
  sourceOrganization: string;
  sourceUrl: string;
  summary: string;
  title: string;
}

export interface BabyCalendarEvent {
  childProfileId: string;
  color: string;
  date: string;
  eventAt: string;
  id: string;
  label: string;
  relatedId?: string;
  type: BabyCalendarEventType;
}

export interface BabyReportSummary {
  childProfileId: string;
  diaperCount?: number;
  feedingCount?: number;
  generatedAt: string;
  latestWeightKg?: number;
  medicineLogsCount?: number;
  range: "today" | "7_days" | "30_days";
  solidsTriedCount?: number;
  totalSleepMinutes?: number;
  vaccineRecordsCount?: number;
}

export type ChildSummary = {
  child: ChildProfile;
  latestDiaper?: DiaperLog;
  latestFeed?: BabyFeedLog;
  latestGrowth?: GrowthMeasurement;
  latestSleep?: BabySleepLog;
  milestonesCount: number;
  vaccinationRecordsCount: number;
};
