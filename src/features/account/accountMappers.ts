import {
  createDefaultAccountProfile,
  createDefaultAppPreferences,
  createDefaultNotificationPreferences,
  createDefaultOnboardingPreferences,
} from "./accountDefaults";
import { isValidThemeMode, isValidTimeFormat, isValidUnitsSystem } from "./accountValidation";
import type {
  HealthOSAccountProfile,
  HealthOSAccountProfileUpdate,
  HealthOSAppPreferences,
  HealthOSAppPreferencesUpdate,
  HealthOSNotificationPreferences,
  HealthOSNotificationPreferencesUpdate,
  HealthOSOnboardingPreferences,
  HealthOSOnboardingPreferencesUpdate,
} from "./accountTypes";

type Row = Record<string, unknown>;

export function mapProfileRowToAccountProfile(
  row: Row | null | undefined,
  userId: string,
): HealthOSAccountProfile {
  const fallback = createDefaultAccountProfile(userId);
  if (!row) return fallback;
  return {
    ...fallback,
    avatarStoragePath: text(row.avatar_storage_path),
    avatarUrl: text(row.avatar_url),
    country: text(row.country),
    displayName: text(row.display_name),
    email: text(row.email),
    fullName: text(row.full_name),
    id: text(row.id) ?? userId,
    locale: text(row.locale) ?? text(row.language),
    phone: text(row.phone),
    profileCompleted: bool(row.profile_completed) ?? bool(row.is_onboarding_complete) ?? false,
    timezone: text(row.timezone),
  };
}

export function mapOnboardingRowToPreferences(
  row: Row | null | undefined,
  userId: string,
): HealthOSOnboardingPreferences {
  const fallback = createDefaultOnboardingPreferences(userId);
  if (!row) return fallback;
  return {
    ...fallback,
    babyChildInterest: bool(row.baby_child_interest) ?? false,
    caregiverInterest: bool(row.caregiver_interest) ?? false,
    completedSteps: strings(row.completed_steps),
    dailyPlanningInterest: bool(row.daily_planning_interest) ?? false,
    familySetupIntent: text(row.family_setup_intent),
    fitnessGoal: text(row.fitness_goal),
    genderContext: text(row.gender_context),
    lifeStageContext: strings(row.life_stage_context),
    nutritionGoal: text(row.nutrition_goal),
    pregnancyInterest: bool(row.pregnancy_interest) ?? false,
    selectedGoals: strings(row.selected_goals),
    selectedModules: strings(row.selected_modules),
    setupCompleted: bool(row.setup_completed) ?? false,
    skippedSteps: strings(row.skipped_steps),
  };
}

export function mapSettingsRowToAppPreferences(
  row: Row | null | undefined,
  userId: string,
): HealthOSAppPreferences {
  const fallback = createDefaultAppPreferences(userId);
  if (!row) return fallback;
  const themeMode = text(row.theme_mode);
  const unitsSystem = text(row.units_system);
  const timeFormat = text(row.time_format);
  return {
    ...fallback,
    accentStyle: text(row.accent_style),
    aiPrivateMode: bool(row.ai_private_mode) ?? fallback.aiPrivateMode,
    hapticsEnabled: bool(row.haptics_enabled) ?? fallback.hapticsEnabled,
    reducedMotion: bool(row.reduced_motion) ?? fallback.reducedMotion,
    startScreen: text(row.start_screen) ?? fallback.startScreen,
    themeMode: isValidThemeMode(themeMode) ? themeMode : fallback.themeMode,
    timeFormat: isValidTimeFormat(timeFormat) ? timeFormat : fallback.timeFormat,
    unitsSystem: isValidUnitsSystem(unitsSystem) ? unitsSystem : fallback.unitsSystem,
  };
}

export function mapNotificationRowToPreferences(
  row: Row | null | undefined,
  userId: string,
): HealthOSNotificationPreferences {
  const fallback = createDefaultNotificationPreferences(userId);
  if (!row) return fallback;
  return {
    ...fallback,
    aiImportReviewEnabled: bool(row.ai_import_review_enabled) ?? fallback.aiImportReviewEnabled,
    babyChildEnabled: bool(row.baby_child_enabled) ?? fallback.babyChildEnabled,
    calendarEnabled: bool(row.calendar_enabled) ?? fallback.calendarEnabled,
    caregiverEnabled: bool(row.caregiver_enabled) ?? fallback.caregiverEnabled,
    familyEnabled: bool(row.family_enabled) ?? fallback.familyEnabled,
    fitnessEnabled: bool(row.fitness_enabled) ?? fallback.fitnessEnabled,
    masterEnabled: bool(row.master_enabled) ?? fallback.masterEnabled,
    medicationEnabled: bool(row.medication_enabled) ?? fallback.medicationEnabled,
    nutritionEnabled: bool(row.nutrition_enabled) ?? fallback.nutritionEnabled,
    pregnancyEnabled: bool(row.pregnancy_enabled) ?? fallback.pregnancyEnabled,
    quietHoursEnabled: bool(row.quiet_hours_enabled) ?? fallback.quietHoursEnabled,
    quietHoursEnd: text(row.quiet_hours_end),
    quietHoursStart: text(row.quiet_hours_start),
    recordsReviewEnabled: bool(row.records_review_enabled) ?? fallback.recordsReviewEnabled,
    securityAlertsEnabled: bool(row.security_alerts_enabled) ?? fallback.securityAlertsEnabled,
    supplementsEnabled: bool(row.supplements_enabled) ?? fallback.supplementsEnabled,
    womensHealthEnabled: bool(row.womens_health_enabled) ?? fallback.womensHealthEnabled,
  };
}

export function mapAccountProfileToUpsert(
  userId: string,
  profile: HealthOSAccountProfileUpdate,
) {
  return {
    avatar_url: profile.avatarUrl,
    country: profile.country,
    display_name: profile.displayName,
    email: profile.email,
    full_name: profile.fullName,
    id: userId,
    language: profile.locale,
    phone: profile.phone,
    timezone: profile.timezone,
    updated_at: new Date().toISOString(),
  };
}

export function mapOnboardingPreferencesToUpsert(
  userId: string,
  preferences: HealthOSOnboardingPreferencesUpdate,
) {
  return {
    baby_child_interest: preferences.babyChildInterest,
    caregiver_interest: preferences.caregiverInterest,
    completed_steps: preferences.completedSteps,
    daily_planning_interest: preferences.dailyPlanningInterest,
    family_setup_intent: preferences.familySetupIntent,
    fitness_goal: preferences.fitnessGoal,
    gender_context: preferences.genderContext,
    life_stage_context: preferences.lifeStageContext,
    nutrition_goal: preferences.nutritionGoal,
    pregnancy_interest: preferences.pregnancyInterest,
    selected_goals: preferences.selectedGoals,
    selected_modules: preferences.selectedModules,
    setup_completed: preferences.setupCompleted,
    skipped_steps: preferences.skippedSteps,
    updated_at: new Date().toISOString(),
    user_id: userId,
  };
}

export function mapAppPreferencesToUpsert(
  userId: string,
  preferences: HealthOSAppPreferencesUpdate,
) {
  return {
    accent_style: preferences.accentStyle,
    ai_private_mode: preferences.aiPrivateMode,
    haptics_enabled: preferences.hapticsEnabled,
    reduced_motion: preferences.reducedMotion,
    start_screen: preferences.startScreen,
    theme_mode: preferences.themeMode,
    time_format: preferences.timeFormat,
    units_system: preferences.unitsSystem,
    updated_at: new Date().toISOString(),
    user_id: userId,
  };
}

export function mapNotificationPreferencesToUpsert(
  userId: string,
  preferences: HealthOSNotificationPreferencesUpdate,
) {
  return {
    ai_import_review_enabled: preferences.aiImportReviewEnabled,
    baby_child_enabled: preferences.babyChildEnabled,
    calendar_enabled: preferences.calendarEnabled,
    caregiver_enabled: preferences.caregiverEnabled,
    family_enabled: preferences.familyEnabled,
    fitness_enabled: preferences.fitnessEnabled,
    master_enabled: preferences.masterEnabled,
    medication_enabled: preferences.medicationEnabled,
    nutrition_enabled: preferences.nutritionEnabled,
    pregnancy_enabled: preferences.pregnancyEnabled,
    quiet_hours_enabled: preferences.quietHoursEnabled,
    quiet_hours_end: preferences.quietHoursEnd,
    quiet_hours_start: preferences.quietHoursStart,
    records_review_enabled: preferences.recordsReviewEnabled,
    security_alerts_enabled: preferences.securityAlertsEnabled,
    supplements_enabled: preferences.supplementsEnabled,
    updated_at: new Date().toISOString(),
    user_id: userId,
    womens_health_enabled: preferences.womensHealthEnabled,
  };
}

function text(value: unknown) {
  return typeof value === "string" ? value : null;
}

function bool(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function strings(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

