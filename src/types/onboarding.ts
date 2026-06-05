import type { AppModuleKey, WidgetKey } from "@/types/app";
import type { UnitPreferences } from "@/types/profile";

export type OnboardingStep =
  | "welcome"
  | "privacy_promise"
  | "profile_setup"
  | "module_selection"
  | "widget_selection"
  | "units_country"
  | "notifications"
  | "family_setup"
  | "ai_consent"
  | "finish";

export type HealthModuleKey =
  | "nutrition"
  | "workout"
  | "biometrics"
  | "medication"
  | "supplements"
  | "records"
  | "calendar"
  | "womens_health"
  | "mens_health"
  | "pregnancy"
  | "baby_child"
  | "device_sync"
  | "ai_assistant"
  | "family_circles";

export type HomeLayoutPreference =
  | "simple"
  | "family"
  | "fitness"
  | "baby_focused"
  | "medication_focused"
  | "custom";

export type NotificationOnboardingChoice = "not_now" | "in_app_only" | "device_notifications";

export type MainHealthGoal =
  | "general_health"
  | "fitness"
  | "food_nutrition"
  | "medication_reminders"
  | "family_care"
  | "baby_child_care"
  | "pregnancy"
  | "womens_health"
  | "mens_health"
  | "records_organization"
  | "custom";

export type OnboardingState = {
  aiConsentCompleted: boolean;
  completedSteps: OnboardingStep[];
  createdAt: string;
  currentStep: OnboardingStep;
  familySetupCompleted: boolean;
  homeLayoutPreference?: HomeLayoutPreference;
  id: string;
  isComplete: boolean;
  notificationChoice?: NotificationOnboardingChoice;
  privacyChoices?: Record<string, boolean>;
  profileId?: string;
  selectedModules: HealthModuleKey[];
  selectedWidgetKeys: string[];
  skippedSteps: OnboardingStep[];
  updatedAt: string;
  userId: string;
};

export type InitialHealthProfileInput = {
  avatarLabel?: string;
  country?: string;
  dateOfBirth?: string;
  displayName: string;
  mainHealthGoal?: MainHealthGoal;
  sexOrGender?: string;
  unitSystem?: "metric" | "imperial";
};

export type ModulePreference = {
  createdAt: string;
  enabledAt?: string;
  id: string;
  isEnabled: boolean;
  isPinnedToHome: boolean;
  moduleKey: HealthModuleKey;
  profileId: string;
  updatedAt: string;
  userId: string;
};

export type PersonalizationPreferences = {
  countryCode?: string;
  createdAt: string;
  homeLayoutPreference: HomeLayoutPreference;
  id: string;
  lengthUnit: "cm" | "in";
  temperatureUnit?: "celsius" | "fahrenheit";
  unitSystem: "metric" | "imperial";
  updatedAt: string;
  userId: string;
  volumeUnit: "ml" | "oz";
  weightUnit: "kg" | "lb";
};

export type HealthModuleOption = {
  appModuleKeys: AppModuleKey[];
  defaultEnabled: boolean;
  description: string;
  hiddenUntilSelected?: boolean;
  key: HealthModuleKey;
  label: string;
  privacyBadge: string;
  suggestedWidgets: WidgetKey[];
};

export type OnboardingUnitSelection = {
  country: string;
  units: UnitPreferences;
};
