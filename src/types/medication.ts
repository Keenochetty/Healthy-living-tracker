export type MedicationFrequency =
  | "once"
  | "daily"
  | "twice_daily"
  | "three_times_daily"
  | "custom";

export type MedicationForm =
  | "tablet"
  | "capsule"
  | "syrup"
  | "injection"
  | "cream"
  | "drops"
  | "inhaler"
  | "other";

export type SupplementForm =
  | "tablet"
  | "capsule"
  | "powder"
  | "liquid"
  | "gummy"
  | "drops"
  | "other";

export type ScheduleTiming =
  | "once_daily"
  | "twice_daily"
  | "three_times_daily"
  | "specific_times"
  | "every_x_hours"
  | "specific_days"
  | "as_needed";

export type FoodTiming =
  | "none"
  | "with_food"
  | "without_food"
  | "before_meal"
  | "after_meal";

export type DoseLogStatus =
  | "upcoming"
  | "due"
  | "taken"
  | "skipped"
  | "missed"
  | "snoozed";

export type SafetyStatus =
  | "not_checked"
  | "name_matched"
  | "needs_review"
  | "professional_confirmation_recommended"
  | "user_confirmed_label";

export type SafetyNoticeType =
  | "info"
  | "review"
  | "confirm"
  | "urgent_professional_help";

export type SafetyNoticeCategory =
  | "name_match"
  | "duplicate_ingredient"
  | "food_timing"
  | "allergy"
  | "profile_caution"
  | "data_source"
  | "general";

export type Medication = {
  brandName?: string;
  createdAt: string;
  doseAmount?: number;
  doseUnit?: string;
  endDate?: string;
  form: MedicationForm;
  genericName?: string;
  id: string;
  instructions?: string;
  isActive: boolean;
  isPrivate: boolean;
  lockedPrivate: boolean;
  name: string;
  notes?: string;
  pharmacy?: string;
  prescribedBy?: string;
  profileId: string;
  reason?: string;
  safetyStatus?: SafetyStatus;
  sharedWithCaregiver: boolean;
  sharedWithFamily: boolean;
  sharedWithPartner: boolean;
  startDate?: string;
  standardMatchId?: string;
  strength?: string;
  updatedAt: string;
  userId: string;
};

export type Supplement = {
  brand?: string;
  createdAt: string;
  endDate?: string;
  form: SupplementForm;
  id: string;
  ingredientMatchId?: string;
  instructions?: string;
  isActive: boolean;
  isPrivate: boolean;
  lockedPrivate: boolean;
  mainIngredient?: string;
  name: string;
  notes?: string;
  profileId: string;
  reason?: string;
  safetyStatus?: SafetyStatus;
  servingAmount?: number;
  servingUnit?: string;
  sharedWithCaregiver: boolean;
  sharedWithFamily: boolean;
  sharedWithPartner: boolean;
  startDate?: string;
  strength?: string;
  updatedAt: string;
  userId: string;
};

export type MedicationStandardMatch = {
  confidence?: number;
  confirmedByUser: boolean;
  displayName: string;
  form?: string;
  id: string;
  ingredientName?: string;
  matchedAt: string;
  medicationId: string;
  source: "rxnorm" | "manual" | "unknown";
  sourceConceptId?: string;
  strength?: string;
};

export type SupplementIngredientMatch = {
  confidence?: number;
  confirmedByUser: boolean;
  displayName: string;
  id: string;
  ingredientName: string;
  matchedAt: string;
  source: "ods" | "dsld" | "manual" | "unknown";
  sourceId?: string;
  supplementId: string;
};

export type SafetyNotice = {
  actionLabel?: string;
  actionTarget?: string;
  category: SafetyNoticeCategory;
  createdAt: string;
  id: string;
  isDismissed: boolean;
  message: string;
  profileId: string;
  relatedId?: string;
  relatedType: "medication" | "supplement" | "food" | "profile" | "general";
  title: string;
  type: SafetyNoticeType;
  updatedAt: string;
  userId: string;
};

export type SafetyChecklistItem = {
  checklistKey: string;
  completedAt?: string;
  createdAt: string;
  id: string;
  isCompleted: boolean;
  label: string;
  profileId: string;
  relatedId: string;
  relatedType: "medication" | "supplement";
  updatedAt: string;
  userId: string;
};

export type AllergySensitivityNote = {
  allergyName: string;
  allergyType:
    | "medication"
    | "food"
    | "supplement"
    | "environmental"
    | "unknown";
  confirmedByProfessional?: boolean;
  createdAt: string;
  id: string;
  lockedPrivate: boolean;
  notes?: string;
  profileId: string;
  severity?: "mild" | "moderate" | "severe" | "unknown";
  sharedWithCaregiver: boolean;
  sharedWithFamily: boolean;
  sharedWithPartner: boolean;
  updatedAt: string;
  userId: string;
  visibility: "private" | "shared";
};

export type HealthSchedule = {
  createdAt: string;
  customInstructions?: string;
  daysOfWeek?: number[];
  endDate?: string;
  everyXHours?: number;
  foodTiming: FoodTiming;
  id: string;
  itemId: string;
  itemType: "medication" | "supplement";
  profileId: string;
  reminderEnabled: boolean;
  startDate?: string;
  timing: ScheduleTiming;
  times: string[];
  updatedAt: string;
  userId: string;
};

export type DoseLog = {
  amount?: number;
  createdAt: string;
  foodTimingNote?: string;
  id: string;
  itemId: string;
  itemType: "medication" | "supplement";
  notes?: string;
  profileId: string;
  scheduleId?: string;
  scheduledAt?: string;
  sideEffectNote?: string;
  status: DoseLogStatus;
  takenAt?: string;
  unit?: string;
  updatedAt: string;
  userId: string;
};

export type HealthDocument = {
  createdAt: string;
  fileType?: "image" | "pdf" | "note";
  fileUrl?: string;
  id: string;
  isPrivate: boolean;
  lockedPrivate: boolean;
  noteText?: string;
  profileId: string;
  relatedId?: string;
  relatedType:
    | "medication"
    | "supplement"
    | "prescription"
    | "label"
    | "doctor_note"
    | "pharmacy_note";
  sharedWithCaregiver: boolean;
  sharedWithFamily: boolean;
  sharedWithPartner: boolean;
  title: string;
  updatedAt: string;
  userId: string;
};

export type MedicationSupplementNote = {
  createdAt: string;
  id: string;
  isPrivate: boolean;
  lockedPrivate: boolean;
  loggedAt: string;
  note: string;
  profileId: string;
  relatedId?: string;
  relatedType: "medication" | "supplement" | "general";
  sharedWithCaregiver: boolean;
  sharedWithFamily: boolean;
  sharedWithPartner: boolean;
  updatedAt: string;
  userId: string;
};

export type HealthScheduleReminder = {
  itemId: string;
  itemName: string;
  itemType: "medication" | "supplement";
  scheduleId?: string;
  scheduledAt?: string;
  status: DoseLogStatus;
  subtitle?: string;
};

export type MedicationSupplementTodaySummary = {
  dueCount: number;
  missedCount: number;
  nextItem?: HealthScheduleReminder;
  reminders: HealthScheduleReminder[];
  takenCount: number;
  totalCount: number;
};

export type AdherenceSummary = {
  missed: number;
  skipped: number;
  taken: number;
  total: number;
};

export type MedicationReminderTime = {
  enabled: boolean;
  id: string;
  notificationId?: string;
  time: string;
};

export type MedicationItem = {
  active: boolean;
  createdAt: string;
  dosage?: string;
  id: string;
  instructions?: string;
  name: string;
  updatedAt: string;
};

export type MedicationTakenLog = {
  id: string;
  medicationId: string;
  note?: string;
  takenAt: string;
};

export type MedicationSchedule = {
  active: boolean;
  createdAt: string;
  endDate?: string;
  frequency: MedicationFrequency;
  id: string;
  instructions?: string;
  medicationId: string;
  reminderTimes: MedicationReminderTime[];
  startDate?: string;
  takeWithFood?: boolean;
  updatedAt: string;
};

export type MedicationDetail = {
  medication: MedicationItem;
  schedule?: MedicationSchedule;
  takenLogs: MedicationTakenLog[];
};
