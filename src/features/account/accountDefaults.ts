import type {
  HealthOSAccountProfile,
  HealthOSAppPreferences,
  HealthOSNotificationPreferences,
  HealthOSOnboardingPreferences,
} from "./accountTypes";

export function createDefaultAccountProfile(userId: string): HealthOSAccountProfile {
  return {
    avatarStoragePath: null,
    avatarUrl: null,
    country: null,
    displayName: null,
    email: null,
    fullName: null,
    locale: null,
    phone: null,
    profileCompleted: false,
    timezone: null,
    userId,
  };
}

export function createDefaultOnboardingPreferences(
  userId: string,
): HealthOSOnboardingPreferences {
  return {
    babyChildInterest: false,
    caregiverInterest: false,
    completedSteps: [],
    dailyPlanningInterest: false,
    familySetupIntent: null,
    fitnessGoal: null,
    genderContext: null,
    lifeStageContext: [],
    nutritionGoal: null,
    pregnancyInterest: false,
    selectedGoals: [],
    selectedModules: [],
    setupCompleted: false,
    skippedSteps: [],
    userId,
  };
}

export function createDefaultAppPreferences(userId: string): HealthOSAppPreferences {
  return {
    accentStyle: null,
    aiPrivateMode: true,
    hapticsEnabled: true,
    reducedMotion: false,
    startScreen: "home",
    themeMode: "system",
    timeFormat: "24h",
    unitsSystem: "metric",
    userId,
  };
}

export function createDefaultNotificationPreferences(
  userId: string,
): HealthOSNotificationPreferences {
  return {
    aiImportReviewEnabled: true,
    babyChildEnabled: false,
    calendarEnabled: true,
    caregiverEnabled: false,
    familyEnabled: true,
    fitnessEnabled: false,
    masterEnabled: false,
    medicationEnabled: false,
    nutritionEnabled: false,
    pregnancyEnabled: false,
    quietHoursEnabled: false,
    quietHoursEnd: null,
    quietHoursStart: null,
    recordsReviewEnabled: true,
    securityAlertsEnabled: true,
    supplementsEnabled: false,
    userId,
    womensHealthEnabled: false,
  };
}

