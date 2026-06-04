import type { WidgetKey } from "@/types/app";

export type BiometricType =
  | "weight"
  | "body_measurement"
  | "sleep"
  | "heart_rate"
  | "blood_pressure"
  | "blood_glucose"
  | "energy"
  | "mood"
  | "digestion"
  | "symptom";

export type BiometricVisibility = "private" | "shared";

export type BiometricPrivacy = {
  lockedPrivate: boolean;
  sharedWithCaregiver: boolean;
  sharedWithFamily: boolean;
  sharedWithPartner: boolean;
  visibility: BiometricVisibility;
};

export type BiometricLog = BiometricPrivacy & {
  createdAt: string;
  id: string;
  label?: string;
  loggedAt: string;
  metadata?: Record<string, unknown>;
  notes?: string;
  profileId: string;
  quality?: string;
  secondaryUnit?: string;
  secondaryValue?: number;
  severity?: number;
  type: BiometricType;
  unit?: string;
  updatedAt: string;
  userId: string;
  value?: number;
};

export type WeightLog = BiometricPrivacy & {
  createdAt: string;
  id: string;
  loggedAt: string;
  notes?: string;
  profileId: string;
  updatedAt: string;
  userId: string;
  weightKg: number;
};

export type BodyMeasurementLog = BiometricPrivacy & {
  armCm?: number;
  bodyFatPercentage?: number;
  chestCm?: number;
  createdAt: string;
  hipCm?: number;
  id: string;
  loggedAt: string;
  notes?: string;
  photoUrl?: string;
  profileId: string;
  thighCm?: number;
  updatedAt: string;
  userId: string;
  waistCm?: number;
};

export type SleepQuality = "poor" | "okay" | "good" | "great";

export type SleepLog = BiometricPrivacy & {
  bedtime?: string;
  createdAt: string;
  durationMinutes: number;
  id: string;
  loggedAt: string;
  notes?: string;
  profileId: string;
  sleepQuality?: SleepQuality;
  updatedAt: string;
  userId: string;
  wakeTime?: string;
};

export type BloodPressureLog = BiometricPrivacy & {
  createdAt: string;
  diastolic: number;
  id: string;
  loggedAt: string;
  notes?: string;
  profileId: string;
  pulse?: number;
  systolic: number;
  updatedAt: string;
  userId: string;
};

export type BloodGlucoseTiming = "fasting" | "before_meal" | "after_meal" | "bedtime" | "other";

export type BloodGlucoseLog = BiometricPrivacy & {
  createdAt: string;
  glucoseValue: number;
  id: string;
  loggedAt: string;
  notes?: string;
  profileId: string;
  timing: BloodGlucoseTiming;
  unit: "mmol/L" | "mg/dL";
  updatedAt: string;
  userId: string;
};

export type BiometricTrend = {
  changeSinceLastLog?: number;
  direction?: "up" | "down" | "same" | "unknown";
  highestValue?: number;
  latestLabel?: string;
  latestLoggedAt?: string;
  latestValue?: number;
  lowestValue?: number;
  message?: string;
  sevenDayAverage?: number;
  thirtyDayAverage?: number;
  type: BiometricType;
  unit?: string;
};

export type BiometricDashboardItem = {
  addLabel: string;
  emptyText: string;
  latestDisplay: string;
  latestLoggedAt?: string;
  title: string;
  trendMessage?: string;
  type: BiometricType;
};

export type BiometricDashboardSummary = {
  items: BiometricDashboardItem[];
  updatedAt: string;
};

export type BiometricWidgetKey = Extract<
  WidgetKey,
  | "weight"
  | "biometric_goal_weight"
  | "sleep"
  | "energy"
  | "mood"
  | "resting_heart_rate"
  | "blood_pressure"
  | "blood_glucose"
  | "digestion"
  | "symptoms"
>;

export type BiometricWidgetSummary = {
  routeType?: BiometricType;
  title: string;
  value: string;
  widgetKey: BiometricWidgetKey;
};

export type BiometricLogInput = {
  label?: string;
  loggedAt?: string;
  metadata?: Record<string, unknown>;
  notes?: string;
  quality?: string;
  secondaryUnit?: string;
  secondaryValue?: number;
  severity?: number;
  type: BiometricType;
  unit?: string;
  value?: number;
};

export type WeightLogInput = {
  loggedAt?: string;
  notes?: string;
  weightKg: number;
};

export type BodyMeasurementLogInput = {
  armCm?: number;
  bodyFatPercentage?: number;
  chestCm?: number;
  hipCm?: number;
  loggedAt?: string;
  notes?: string;
  photoUrl?: string;
  thighCm?: number;
  waistCm?: number;
};

export type SleepLogInput = {
  bedtime?: string;
  durationMinutes: number;
  loggedAt?: string;
  notes?: string;
  sleepQuality?: SleepQuality;
  wakeTime?: string;
};

export type BloodPressureLogInput = {
  diastolic: number;
  loggedAt?: string;
  notes?: string;
  pulse?: number;
  systolic: number;
};

export type BloodGlucoseLogInput = {
  glucoseValue: number;
  loggedAt?: string;
  notes?: string;
  timing: BloodGlucoseTiming;
  unit: "mmol/L" | "mg/dL";
};

export type BiometricsInsight = {
  message: string;
  title: string;
  type: BiometricType | "general";
};

export type WorkoutReadinessSummary = {
  energyLabel?: string;
  message: string;
  sleepDurationMinutes?: number;
  title: string;
};

export type TrainingBodyProgressSummary = {
  bodyMeasurementMessage?: string;
  weightMessage?: string;
};
