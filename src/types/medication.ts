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
  sharedWithCaregiver: boolean;
  sharedWithFamily: boolean;
  sharedWithPartner: boolean;
  startDate?: string;
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
  instructions?: string;
  isActive: boolean;
  isPrivate: boolean;
  lockedPrivate: boolean;
  mainIngredient?: string;
  name: string;
  notes?: string;
  profileId: string;
  reason?: string;
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
