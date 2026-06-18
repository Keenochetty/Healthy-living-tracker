import type { User } from "@supabase/supabase-js";

export type HealthOSAccountBackendStatus =
  | "idle"
  | "loading"
  | "ready"
  | "missingAuth"
  | "missingTable"
  | "deferred"
  | "error";

export type HealthOSAccountServiceResult<T> = {
  data: T | null;
  error: string | null;
  status: HealthOSAccountBackendStatus;
};

export type HealthOSAccountProfile = {
  id?: string;
  userId: string;
  displayName?: string | null;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  avatarStoragePath?: string | null;
  country?: string | null;
  locale?: string | null;
  timezone?: string | null;
  profileCompleted: boolean;
};

export type HealthOSOnboardingPreferences = {
  userId: string;
  setupCompleted: boolean;
  selectedGoals: string[];
  selectedModules: string[];
  genderContext?: string | null;
  lifeStageContext: string[];
  familySetupIntent?: string | null;
  fitnessGoal?: string | null;
  nutritionGoal?: string | null;
  pregnancyInterest: boolean;
  babyChildInterest: boolean;
  caregiverInterest: boolean;
  dailyPlanningInterest: boolean;
  skippedSteps: string[];
  completedSteps: string[];
};

export type HealthOSAppPreferences = {
  userId: string;
  themeMode: "system" | "light" | "dark";
  accentStyle?: string | null;
  reducedMotion: boolean;
  hapticsEnabled: boolean;
  unitsSystem: "metric" | "imperial";
  timeFormat: "12h" | "24h";
  startScreen: string;
  aiPrivateMode: boolean;
};

export type HealthOSNotificationPreferences = {
  userId: string;
  masterEnabled: boolean;
  medicationEnabled: boolean;
  supplementsEnabled: boolean;
  calendarEnabled: boolean;
  pregnancyEnabled: boolean;
  babyChildEnabled: boolean;
  womensHealthEnabled: boolean;
  familyEnabled: boolean;
  caregiverEnabled: boolean;
  recordsReviewEnabled: boolean;
  aiImportReviewEnabled: boolean;
  fitnessEnabled: boolean;
  nutritionEnabled: boolean;
  securityAlertsEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
};

export type HealthOSAccountProfileUpdate = Partial<
  Omit<HealthOSAccountProfile, "id" | "userId">
>;

export type HealthOSOnboardingPreferencesUpdate = Partial<
  Omit<HealthOSOnboardingPreferences, "userId">
>;

export type HealthOSAppPreferencesUpdate = Partial<
  Omit<HealthOSAppPreferences, "userId">
>;

export type HealthOSNotificationPreferencesUpdate = Partial<
  Omit<HealthOSNotificationPreferences, "userId">
>;

export type HealthOSAuthUser = Pick<User, "email" | "id" | "phone">;

