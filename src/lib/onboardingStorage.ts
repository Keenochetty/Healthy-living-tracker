import AsyncStorage from "@react-native-async-storage/async-storage";

import { CORE_MODULE_KEYS } from "@/constants/modules";
import { getCountryByName } from "@/constants/countries";
import {
  getPinnedHealthWidgetsForProfile,
  reorderHealthWidgetsForProfile
} from "@/lib/healthWidgets";
import { updateAssistantSettings } from "@/lib/assistantStorage";
import {
  getReminderCategorySettings,
  requestNotificationPermission,
  updateNotificationSettings,
  updateReminderCategorySettings
} from "@/services/reminders/notificationService";
import { getUserPreferences, updateUserPreferences } from "@/lib/userPreferences";
import type { AppModuleKey, WidgetKey } from "@/types/app";
import type { UnitPreferences } from "@/types/profile";
import type {
  HealthModuleKey,
  HealthModuleOption,
  HomeLayoutPreference,
  InitialHealthProfileInput,
  MainHealthGoal,
  ModulePreference,
  NotificationOnboardingChoice,
  OnboardingState,
  OnboardingStep,
  PersonalizationPreferences
} from "@/types/onboarding";

const LOCAL_USER_ID = "local-user";
const LOCAL_PROFILE_ID = "local-profile";
const ONBOARDING_STATE_KEY = "family_health_phase20_onboarding_state";
const MODULE_PREFERENCES_KEY = "family_health_phase20_module_preferences";
const PERSONALIZATION_PREFERENCES_KEY = "family_health_phase20_personalization_preferences";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  "welcome",
  "privacy_promise",
  "profile_setup",
  "module_selection",
  "widget_selection",
  "units_country",
  "notifications",
  "family_setup",
  "ai_consent",
  "finish"
];

export const HEALTH_MODULE_OPTIONS: HealthModuleOption[] = [
  moduleOption("calendar", "Calendar / Timeline", "Reminders, appointments and health timeline.", ["planning"], true, "Private by default", ["today_reminders", "next_reminder", "upcoming_appointment"]),
  moduleOption("records", "Records", "Documents, visits, prescriptions and follow-ups.", ["personal_health"], true, "Private", ["recent_record", "upcoming_follow_up", "prescription_refill"]),
  moduleOption("nutrition", "Food / Nutrition", "Meals, water, targets and reports.", ["food"], false, "Optional", ["calories_progress", "protein_progress", "water_progress", "food_diary_status"]),
  moduleOption("workout", "Workout", "Plans, sessions and fitness progress.", ["fitness"], false, "Optional", ["workout", "steps_today", "workout_reminder"]),
  moduleOption("biometrics", "Biometrics", "Weight, sleep, mood, energy and vitals.", ["personal_health"], false, "Private", ["weight", "sleep", "energy"]),
  moduleOption("medication", "Medication", "Schedules, logs and private reminders.", ["personal_health"], false, "Private", ["medication_due", "next_medication", "medication_taken_today"]),
  moduleOption("supplements", "Supplements", "Supplement schedules, logs and labels.", ["personal_health"], false, "Private", ["supplement_due", "next_supplement"]),
  moduleOption("womens_health", "Women's Health", "Cycle, symptoms and contraception tracking.", ["pregnancy_cycle"], false, "Private", ["cycle_day", "period_expected", "contraception_reminder"], true),
  moduleOption("mens_health", "Men's Health", "Private check-ins, reminders and questions.", ["mens_health"], false, "Private", ["mens_health_check_in", "testicular_check_reminder", "mens_doctor_question"], true),
  moduleOption("pregnancy", "Pregnancy Mode", "Pregnancy weeks, appointments and questions.", ["pregnancy_cycle"], false, "Private", ["pregnancy_week", "pregnancy_next_appointment", "pregnancy_medication_review"], true),
  moduleOption("baby_child", "Baby / Child", "Feeding, sleep, diapers, milestones and care.", ["child_baby"], false, "Parent managed", ["next_feed", "last_diaper", "sleep_today", "next_vaccine"], true),
  moduleOption("device_sync", "Device Sync", "Prepare Apple Health or Health Connect imports.", ["personal_health"], false, "Off by default", ["sync_status", "steps_today", "sleep_last_night"]),
  moduleOption("ai_assistant", "AI Assistant", "Draft-first help with logging and questions.", ["ai_assistant"], false, "Consent required", ["ai_suggestion"]),
  moduleOption("family_circles", "Family Circles", "Optional sharing, caregivers and family permissions.", ["circle", "caregiver"], false, "Optional sharing", ["family_status", "caregiver_active"])
];

export async function getOnboardingState(): Promise<OnboardingState> {
  const stored = await readJson<OnboardingState>(ONBOARDING_STATE_KEY);
  if (stored) return normaliseOnboardingState(stored);
  return createOnboardingState();
}

export async function createOnboardingState(input: Partial<OnboardingState> = {}) {
  const now = new Date().toISOString();
  const state: OnboardingState = {
    aiConsentCompleted: false,
    completedSteps: [],
    createdAt: now,
    currentStep: "welcome",
    familySetupCompleted: false,
    id: createId("onboarding"),
    isComplete: false,
    notificationChoice: undefined,
    privacyChoices: {},
    profileId: LOCAL_PROFILE_ID,
    selectedModules: ["calendar", "records"],
    selectedWidgetKeys: ["today_reminders", "next_reminder", "recent_record", "water", "weight", "sleep"],
    skippedSteps: [],
    updatedAt: now,
    userId: LOCAL_USER_ID,
    ...input
  };

  await writeJson(ONBOARDING_STATE_KEY, state);
  return state;
}

export async function updateOnboardingState(partial: Partial<OnboardingState>) {
  const current = await getOnboardingState();
  const next = normaliseOnboardingState({
    ...current,
    ...partial,
    updatedAt: new Date().toISOString()
  });
  await writeJson(ONBOARDING_STATE_KEY, next);
  return next;
}

export async function updateOnboardingStep(step: OnboardingStep) {
  return updateOnboardingState({ currentStep: step });
}

export async function completeOnboardingStep(step: OnboardingStep, nextStep?: OnboardingStep) {
  const current = await getOnboardingState();
  return updateOnboardingState({
    completedSteps: unique([...current.completedSteps, step]),
    currentStep: nextStep ?? nextOnboardingStep(step),
    skippedSteps: current.skippedSteps.filter((item) => item !== step)
  });
}

export async function skipOnboardingStep(step: OnboardingStep, nextStep?: OnboardingStep) {
  const current = await getOnboardingState();
  return updateOnboardingState({
    currentStep: nextStep ?? nextOnboardingStep(step),
    skippedSteps: unique([...current.skippedSteps, step])
  });
}

export async function completeOnboarding() {
  const current = await getOnboardingState();
  await applySelectedModules(current.selectedModules);
  await saveInitialHealthWidgets(current.selectedWidgetKeys);
  await updateUserPreferences({ onboardingComplete: true });
  return updateOnboardingState({ completedSteps: ONBOARDING_STEPS, currentStep: "finish", isComplete: true });
}

export async function resetOnboarding() {
  return createOnboardingState();
}

export async function createInitialHealthProfile(input: InitialHealthProfileInput) {
  const country = getCountryByName(input.country ?? "South Africa");
  const unitSystem = input.unitSystem ?? "metric";
  const units = unitSystem === "imperial" ? imperialUnits() : country.defaultUnits;
  await updateUserPreferences({
    country: country.country,
    currency: country.currency,
    displayName: input.displayName.trim(),
    timezone: country.timezone,
    units
  });
  await updatePersonalizationPreferences({
    countryCode: country.code,
    homeLayoutPreference: "simple",
    lengthUnit: units.heightUnit,
    temperatureUnit: units.temperatureUnit,
    unitSystem,
    volumeUnit: units.liquidUnit,
    weightUnit: units.weightUnit
  });

  return {
    id: LOCAL_PROFILE_ID,
    primaryGoal: input.mainHealthGoal ?? "general_health",
    status: "ready"
  };
}

export const updateInitialHealthProfile = createInitialHealthProfile;

export async function getProfileSetupStatus() {
  const preferences = await getUserPreferences();
  return {
    displayNameSet: Boolean(preferences.displayName.trim()),
    onboardingComplete: preferences.onboardingComplete,
    profileId: LOCAL_PROFILE_ID
  };
}

export function getAvailableHealthModules() {
  return HEALTH_MODULE_OPTIONS;
}

export async function enableHealthModule(moduleKey: HealthModuleKey) {
  const state = await getOnboardingState();
  return updateOnboardingState({ selectedModules: unique([...state.selectedModules, moduleKey]) });
}

export async function disableHealthModule(moduleKey: HealthModuleKey) {
  const state = await getOnboardingState();
  return updateOnboardingState({ selectedModules: state.selectedModules.filter((item) => item !== moduleKey) });
}

export async function getEnabledModulesForProfile() {
  const state = await getOnboardingState();
  return state.selectedModules;
}

export function applyDefaultModulesFromGoal(goal?: MainHealthGoal): HealthModuleKey[] {
  switch (goal) {
    case "fitness":
      return ["calendar", "records", "workout", "biometrics"];
    case "food_nutrition":
      return ["calendar", "records", "nutrition"];
    case "medication_reminders":
      return ["calendar", "records", "medication", "supplements"];
    case "family_care":
      return ["calendar", "records", "family_circles"];
    case "baby_child_care":
      return ["calendar", "records", "baby_child", "family_circles"];
    case "pregnancy":
      return ["calendar", "records", "pregnancy", "womens_health"];
    case "womens_health":
      return ["calendar", "records", "womens_health"];
    case "mens_health":
      return ["calendar", "records", "mens_health"];
    case "records_organization":
      return ["calendar", "records"];
    default:
      return ["calendar", "records"];
  }
}

export function getSuggestedWidgetsForModules(modules: HealthModuleKey[], layout: HomeLayoutPreference = "simple") {
  const suggested = modules.flatMap((moduleKey) =>
    HEALTH_MODULE_OPTIONS.find((module) => module.key === moduleKey)?.suggestedWidgets ?? []
  );
  return applyHomeLayoutPreset(layout, unique(["today_reminders", "next_reminder", ...suggested]) as WidgetKey[]);
}

export async function saveInitialHealthWidgets(widgetKeys: string[]) {
  const widgets = widgetKeys.filter(Boolean) as WidgetKey[];
  await reorderHealthWidgetsForProfile(LOCAL_PROFILE_ID, widgets);
  await updateUserPreferences({ enabledWidgets: widgets });
  return getPinnedHealthWidgetsForProfile(LOCAL_PROFILE_ID);
}

export async function reorderInitialHealthWidgets(widgetKeys: string[]) {
  return saveInitialHealthWidgets(widgetKeys);
}

export function applyHomeLayoutPreset(layout: HomeLayoutPreference, widgets: WidgetKey[]) {
  const presets: Record<HomeLayoutPreference, WidgetKey[]> = {
    baby_focused: ["baby_reminder", "next_feed", "last_diaper", "sleep_today", "today_reminders"],
    custom: widgets,
    family: ["today_reminders", "upcoming_appointment", "recent_record", "family_status", "caregiver_task"],
    fitness: ["workout_reminder", "steps_today", "water_progress", "sleep", "weight"],
    medication_focused: ["medication_due", "next_medication", "supplement_due", "today_reminders", "prescription_refill"],
    simple: ["today_reminders", "next_reminder", "recent_record", "water", "weight", "sleep"]
  };
  return unique([...(presets[layout] ?? []), ...widgets]).slice(0, 12) as WidgetKey[];
}

export async function createUserPreferences(input: Partial<PersonalizationPreferences>) {
  return updatePersonalizationPreferences(input);
}

export async function updatePersonalizationPreferences(partial: Partial<PersonalizationPreferences>) {
  const current = await getPersonalizationPreferences();
  const next: PersonalizationPreferences = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString()
  };
  await writeJson(PERSONALIZATION_PREFERENCES_KEY, next);
  return next;
}

export async function getPersonalizationPreferences(): Promise<PersonalizationPreferences> {
  const stored = await readJson<PersonalizationPreferences>(PERSONALIZATION_PREFERENCES_KEY);
  if (stored) return stored;
  const now = new Date().toISOString();
  return {
    createdAt: now,
    homeLayoutPreference: "simple",
    id: createId("personalization"),
    lengthUnit: "cm",
    temperatureUnit: "celsius",
    unitSystem: "metric",
    updatedAt: now,
    userId: LOCAL_USER_ID,
    volumeUnit: "ml",
    weightUnit: "kg"
  };
}

export { getUserPreferences, updateUserPreferences };

export async function saveInitialNotificationChoice(choice: NotificationOnboardingChoice) {
  await updateOnboardingState({ notificationChoice: choice });
  await updateNotificationSettings({
    notificationsEnabled: choice === "device_notifications",
    permissionStatus: choice === "device_notifications" ? "not_requested" : "not_requested"
  });
  if (choice === "device_notifications") {
    await requestNotificationPermission();
  }
  return setupNotificationCategoriesFromOnboarding(choice);
}

export async function setupNotificationCategoriesFromOnboarding(choice: NotificationOnboardingChoice) {
  const categories = await getReminderCategorySettings();
  await Promise.all(categories.map((category) =>
    updateReminderCategorySettings(category.category, {
      enabled: true,
      notificationEnabled: choice === "device_notifications"
    })
  ));
  return getReminderCategorySettings();
}

export async function saveInitialAssistantConsent(enabled: boolean, categories: string[] = []) {
  await updateAssistantSettings({
    allowedDataCategories: enabled ? (["nutrition", "workout", "calendar", "records"].filter((category) => categories.includes(category)) as never) : [],
    assistantEnabled: enabled,
    quickLoggingEnabled: enabled,
    sensitiveCategoryConsent: {
      baby_child: categories.includes("baby_child"),
      biometrics: categories.includes("biometrics"),
      medication_supplements: categories.includes("medication_supplements"),
      mens_health: categories.includes("mens_health"),
      pregnancy: categories.includes("pregnancy"),
      records: categories.includes("records"),
      womens_health: categories.includes("womens_health")
    }
  });
  return updateOnboardingState({ aiConsentCompleted: true });
}

export async function createInitialFamilyCircle(name = "My Family Circle") {
  await updateOnboardingState({ familySetupCompleted: true });
  return { id: createId("family-circle"), name };
}

export async function createInitialChildProfile(displayName = "Child profile") {
  await enableHealthModule("baby_child");
  return { displayName, id: createId("child-profile") };
}

export async function skipFamilySetup() {
  return updateOnboardingState({ familySetupCompleted: false });
}

async function applySelectedModules(modules: HealthModuleKey[]) {
  const appModules = unique([...CORE_MODULE_KEYS, ...modules.flatMap((module) =>
    HEALTH_MODULE_OPTIONS.find((option) => option.key === module)?.appModuleKeys ?? []
  )]) as AppModuleKey[];
  const preferences = await getUserPreferences();
  await updateUserPreferences({ enabledModules: appModules, enabledWidgets: preferences.enabledWidgets });
  await saveModulePreferences(modules);
}

async function saveModulePreferences(modules: HealthModuleKey[]) {
  const now = new Date().toISOString();
  const preferences: ModulePreference[] = HEALTH_MODULE_OPTIONS.map((module) => ({
    createdAt: now,
    enabledAt: modules.includes(module.key) ? now : undefined,
    id: `module-pref-${LOCAL_PROFILE_ID}-${module.key}`,
    isEnabled: modules.includes(module.key),
    isPinnedToHome: modules.includes(module.key),
    moduleKey: module.key,
    profileId: LOCAL_PROFILE_ID,
    updatedAt: now,
    userId: LOCAL_USER_ID
  }));
  await writeJson(MODULE_PREFERENCES_KEY, preferences);
  return preferences;
}

function moduleOption(
  key: HealthModuleKey,
  label: string,
  description: string,
  appModuleKeys: AppModuleKey[],
  defaultEnabled: boolean,
  privacyBadge: string,
  suggestedWidgets: WidgetKey[],
  hiddenUntilSelected = false
): HealthModuleOption {
  return { appModuleKeys, defaultEnabled, description, hiddenUntilSelected, key, label, privacyBadge, suggestedWidgets };
}

function normaliseOnboardingState(state: OnboardingState): OnboardingState {
  return {
    ...state,
    completedSteps: unique(state.completedSteps),
    selectedModules: unique(state.selectedModules),
    selectedWidgetKeys: unique(state.selectedWidgetKeys),
    skippedSteps: unique(state.skippedSteps)
  };
}

function nextOnboardingStep(step: OnboardingStep) {
  const index = ONBOARDING_STEPS.indexOf(step);
  return ONBOARDING_STEPS[Math.min(index + 1, ONBOARDING_STEPS.length - 1)];
}

function imperialUnits(): UnitPreferences {
  return {
    dateFormat: "mm/dd/yyyy",
    distanceUnit: "miles",
    heightUnit: "in",
    liquidUnit: "oz",
    speedUnit: "mph",
    temperatureUnit: "fahrenheit",
    weightUnit: "lb"
  };
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readJson<T>(key: string) {
  try {
    const stored = await AsyncStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : null;
  } catch {
    return null;
  }
}

async function writeJson<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
  return value;
}
