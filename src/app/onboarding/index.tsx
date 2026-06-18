import { Href, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import {
  HealthOSAuthButton,
  HealthOSAuthInput,
  HealthOSOnboardingGoalPillGrid,
  HealthOSOnboardingOptionCard,
  HealthOSOnboardingProgress,
  HealthOSOnboardingScreen,
} from "@/components/healthos";
import {
  applyDefaultModulesFromGoal,
  completeOnboarding,
  createInitialHealthProfile,
  getOnboardingState,
  getSuggestedWidgetsForModules,
  saveInitialAssistantConsent,
  saveInitialHealthWidgets,
  saveInitialNotificationChoice,
  updateOnboardingState,
} from "@/lib/onboardingStorage";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type {
  HealthModuleKey,
  MainHealthGoal,
  NotificationOnboardingChoice,
  OnboardingState,
  OnboardingStep,
} from "@/types/onboarding";

type OnboardingPhase =
  | "finish"
  | "goals"
  | "permissions"
  | "privacy"
  | "profile"
  | "purpose";

const PHASES: OnboardingPhase[] = [
  "purpose",
  "profile",
  "goals",
  "privacy",
  "permissions",
  "finish",
];

const STEP_TO_PHASE: Partial<Record<OnboardingStep, OnboardingPhase>> = {
  finish: "finish",
  module_selection: "goals",
  notifications: "permissions",
  privacy_promise: "privacy",
  profile_setup: "profile",
  welcome: "purpose",
  widget_selection: "goals",
  units_country: "profile",
  family_setup: "privacy",
  ai_consent: "permissions",
};

const PHASE_TO_STEP: Record<OnboardingPhase, OnboardingStep> = {
  finish: "finish",
  goals: "module_selection",
  permissions: "notifications",
  privacy: "privacy_promise",
  profile: "profile_setup",
  purpose: "welcome",
};

const SETUP_PURPOSES: Array<{
  description: string;
  goal: MainHealthGoal;
  key: string;
  label: string;
  modules: HealthModuleKey[];
}> = [
  {
    description: "A simple private health dashboard for you.",
    goal: "general_health",
    key: "just_me",
    label: "Just me",
    modules: ["calendar", "records"],
  },
  {
    description: "Plan routines and reminders with your partner.",
    goal: "family_care",
    key: "partner",
    label: "Me and my partner",
    modules: ["calendar", "records", "family_circles"],
  },
  {
    description: "Coordinate family health, records, and reminders.",
    goal: "family_care",
    key: "family",
    label: "My family",
    modules: ["calendar", "records", "family_circles"],
  },
  {
    description: "Prioritize baby/child logs, reminders, and records.",
    goal: "baby_child_care",
    key: "baby_child",
    label: "My baby or child",
    modules: ["calendar", "records", "baby_child", "family_circles"],
  },
  {
    description: "Track pregnancy weeks, appointments, and questions.",
    goal: "pregnancy",
    key: "pregnancy",
    label: "Pregnancy journey",
    modules: ["calendar", "records", "pregnancy", "womens_health"],
  },
  {
    description: "Support elder care routines and important records.",
    goal: "family_care",
    key: "elder",
    label: "Elder care",
    modules: ["calendar", "records", "family_circles"],
  },
  {
    description: "Prepare limited caregiver support and shared tasks.",
    goal: "family_care",
    key: "caregiver",
    label: "Caregiver support",
    modules: ["calendar", "records", "family_circles"],
  },
];

const GENDER_OPTIONS = [
  { key: "female", label: "Female" },
  { key: "male", label: "Male" },
  { key: "prefer_not_to_say", label: "Prefer not to say" },
];

const GOALS: Array<{ key: string; label: string; module: HealthModuleKey }> = [
  { key: "fitness", label: "Fitness", module: "workout" },
  { key: "nutrition", label: "Nutrition", module: "nutrition" },
  { key: "weight_loss", label: "Weight loss", module: "biometrics" },
  { key: "muscle_growth", label: "Muscle growth", module: "workout" },
  { key: "food_planning", label: "Food planning", module: "nutrition" },
  { key: "daily_planning", label: "Daily planning", module: "calendar" },
  { key: "medication", label: "Medication", module: "medication" },
  { key: "supplements", label: "Supplements", module: "supplements" },
  { key: "family_circle", label: "Family circle", module: "family_circles" },
  { key: "pregnancy", label: "Pregnancy", module: "pregnancy" },
  { key: "cycle_tracking", label: "Cycle tracking", module: "womens_health" },
  { key: "child_care", label: "Child care", module: "baby_child" },
  { key: "baby_care", label: "Baby care", module: "baby_child" },
  { key: "records", label: "Records", module: "records" },
  { key: "device_sync", label: "Device sync", module: "device_sync" },
  { key: "caregiver_support", label: "Caregiver support", module: "family_circles" },
  { key: "mood_tracking", label: "Mood tracking", module: "biometrics" },
  { key: "sleep", label: "Sleep", module: "biometrics" },
  { key: "general_health", label: "General health", module: "records" },
];

const PERMISSIONS: Array<{
  choice?: NotificationOnboardingChoice;
  description: string;
  key: string;
  title: string;
}> = [
  {
    choice: "device_notifications",
    description: "Medication, appointments, family reminders.",
    key: "notifications",
    title: "Notifications",
  },
  {
    description: "Scan food labels, scripts, and records later.",
    key: "camera",
    title: "Camera",
  },
  {
    description: "Plan health events and daily routines later.",
    key: "calendar",
    title: "Calendar",
  },
  {
    description: "Connect supported health data later.",
    key: "device_sync",
    title: "Health/device sync",
  },
  {
    description: "Only requested later when a feature needs it.",
    key: "location",
    title: "Location later when needed",
  },
];

export default function OnboardingScreen() {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const [state, setState] = useState<OnboardingState | null>(null);
  const [purposeKey, setPurposeKey] = useState("just_me");
  const [displayName, setDisplayName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sexOrGender, setSexOrGender] = useState("prefer_not_to_say");
  const [country] = useState("South Africa");
  const [unitSystem] = useState<"metric" | "imperial">("metric");
  const [mainGoal, setMainGoal] = useState<MainHealthGoal>("general_health");
  const [notificationChoice, setNotificationChoice] =
    useState<NotificationOnboardingChoice>("not_now");

  useEffect(() => {
    getOnboardingState().then((nextState) => {
      setState(nextState);
      setMainGoal("general_health");
    });
  }, []);

  const phase = STEP_TO_PHASE[state?.currentStep ?? "welcome"] ?? "purpose";
  const step = PHASES.indexOf(phase) + 1;
  const selectedModules = state?.selectedModules ?? ["calendar", "records"];
  const selectedLabels = useMemo(
    () =>
      GOALS.filter((goal) => selectedModules.includes(goal.module)).map(
        (goal) => goal.label,
      ),
    [selectedModules],
  );

  async function refresh(partial: Partial<OnboardingState>) {
    setState(await updateOnboardingState(partial));
  }

  async function goTo(nextPhase: OnboardingPhase) {
    await refresh({ currentStep: PHASE_TO_STEP[nextPhase] });
  }

  async function continuePurpose() {
    const purpose = SETUP_PURPOSES.find((item) => item.key === purposeKey);
    if (!purpose) return;
    setMainGoal(purpose.goal);
    const modules = unique([...selectedModules, ...purpose.modules]);
    await refresh({
      currentStep: "profile_setup",
      selectedModules: modules,
      selectedWidgetKeys: getSuggestedWidgetsForModules(modules),
    });
  }

  async function saveProfile() {
    const modules =
      sexOrGender === "male"
        ? selectedModules.filter(
            (module) => module !== "womens_health" && module !== "pregnancy",
          )
        : selectedModules;

    await createInitialHealthProfile({
      country,
      dateOfBirth: clean(dateOfBirth),
      displayName: displayName.trim() || "Friend",
      mainHealthGoal: mainGoal,
      sexOrGender,
      unitSystem,
    });
    await refresh({
      currentStep: "module_selection",
      selectedModules: modules,
      selectedWidgetKeys: getSuggestedWidgetsForModules(modules),
    });
  }

  async function toggleGoal(goalKey: string) {
    const goal = GOALS.find((item) => item.key === goalKey);
    if (!goal) return;
    const key = goal.module;
    const selected = selectedModules.includes(key)
      ? selectedModules.filter((item) => item !== key)
      : unique([...selectedModules, key]);
    await refresh({
      selectedModules: selected,
      selectedWidgetKeys: getSuggestedWidgetsForModules(selected),
    });
  }

  async function continueGoals() {
    await saveInitialHealthWidgets(getSuggestedWidgetsForModules(selectedModules));
    await goTo("privacy");
  }

  async function continuePermissions(choice = notificationChoice) {
    await saveInitialNotificationChoice(choice);
    await saveInitialAssistantConsent(false);
    await goTo("finish");
  }

  async function finishOnboarding() {
    await completeOnboarding();
    router.replace("/(tabs)/today" as Href);
  }

  if (!state) return null;

  return (
    <HealthOSOnboardingScreen
      subtitle="Your dashboard starts simple. You can add more later."
      title="Set up HealthOS"
    >
      <HealthOSOnboardingProgress step={step} total={PHASES.length} />

      {phase === "purpose" ? (
        <View style={styles.stack}>
          <Header
            subtitle="This helps HealthOS prioritize the right tools later."
            title="Who are you setting HealthOS up for?"
          />
          {SETUP_PURPOSES.map((purpose) => (
            <HealthOSOnboardingOptionCard
              description={purpose.description}
              key={purpose.key}
              onPress={() => setPurposeKey(purpose.key)}
              selected={purposeKey === purpose.key}
              title={purpose.label}
            />
          ))}
          <HealthOSAuthButton onPress={continuePurpose} title="Continue" />
        </View>
      ) : null}

      {phase === "profile" ? (
        <View style={styles.stack}>
          <Header
            subtitle="This helps us suggest the right health tools. You can change it later."
            title="Tell us the basics so the app can stay relevant."
          />
          <InlineInput
            label="Display name"
            onChangeText={setDisplayName}
            placeholder="Your name"
            value={displayName}
          />
          <InlineInput
            label="Date of birth"
            onChangeText={setDateOfBirth}
            placeholder="DD/MM/YYYY"
            value={dateOfBirth}
          />
          <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
            Gender
          </Text>
          <HealthOSOnboardingGoalPillGrid
            goals={GENDER_OPTIONS}
            onToggle={setSexOrGender}
            selectedKeys={[sexOrGender]}
          />
          <HealthOSAuthButton onPress={saveProfile} title="Continue" />
          <HealthOSAuthButton
            onPress={() => goTo("goals")}
            title="Skip optional details"
            variant="ghost"
          />
        </View>
      ) : null}

      {phase === "goals" ? (
        <View style={styles.stack}>
          <Header
            subtitle="Choose as many as you like. This will guide Home and Health later."
            title="What would you like help with?"
          />
          <HealthOSOnboardingGoalPillGrid
            goals={GOALS.map((goal) => ({
              key: goal.key,
              label: goal.label,
            }))}
            onToggle={toggleGoal}
            selectedKeys={GOALS.filter((goal) =>
              selectedModules.includes(goal.module),
            ).map((goal) => goal.key)}
          />
          <HealthOSAuthButton onPress={continueGoals} title="Continue" />
          <HealthOSAuthButton
            onPress={() => goTo("privacy")}
            title="Skip goals"
            variant="ghost"
          />
        </View>
      ) : null}

      {phase === "privacy" ? (
        <View style={styles.stack}>
          <Header
            subtitle="Family sharing is optional. Sensitive areas need explicit sharing."
            title="Your health data is private by default."
          />
          <HealthOSOnboardingOptionCard
            description="Your personal health information starts locked down."
            title="Private by default"
          />
          <HealthOSOnboardingOptionCard
            description="You decide what each person or caregiver can access."
            title="Share only what you choose"
          />
          <HealthOSOnboardingOptionCard
            description="Family and caregivers get limited access based on your choices."
            title="Family and caregivers get limited access"
          />
          <HealthOSAuthButton
            onPress={() => goTo("permissions")}
            title="Continue"
          />
        </View>
      ) : null}

      {phase === "permissions" ? (
        <View style={styles.stack}>
          <Header
            subtitle="Set up later is always okay. We only ask when a feature needs it."
            title="Choose permissions gently."
          />
          {PERMISSIONS.map((permission) => (
            <HealthOSOnboardingOptionCard
              description={permission.description}
              key={permission.key}
              onPress={() => {
                if (permission.choice) setNotificationChoice(permission.choice);
              }}
              selected={permission.choice === notificationChoice}
              title={permission.title}
            />
          ))}
          <HealthOSAuthButton
            onPress={() => continuePermissions()}
            title="Continue"
          />
          <HealthOSAuthButton
            onPress={() => continuePermissions("not_now")}
            title="Set up later"
            variant="ghost"
          />
        </View>
      ) : null}

      {phase === "finish" ? (
        <View style={styles.stack}>
          <Header
            subtitle="Your dashboard will start simple. You can add more widgets anytime."
            title="You are ready."
          />
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            Selected priorities:{" "}
            {selectedLabels.length ? selectedLabels.join(", ") : "General health"}
          </Text>
          <HealthOSAuthButton onPress={finishOnboarding} title="Enter HealthOS" />
          <HealthOSAuthButton
            onPress={() => router.push("/settings" as Href)}
            title="Adjust later in Settings"
            variant="secondary"
          />
        </View>
      ) : null}

      {phase !== "purpose" && phase !== "finish" ? (
        <HealthOSAuthButton
          onPress={() => goTo(PHASES[Math.max(0, PHASES.indexOf(phase) - 1)])}
          title="Back"
          variant="ghost"
        />
      ) : null}
    </HealthOSOnboardingScreen>
  );
}

function Header({ subtitle, title }: { subtitle: string; title: string }) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <View style={styles.header}>
      <Text style={[healthOSTypography.sectionTitle, { color: palette.inkText }]}>
        {title}
      </Text>
      <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
        {subtitle}
      </Text>
    </View>
  );
}

function InlineInput({
  label,
  onChangeText,
  placeholder,
  value,
}: {
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <HealthOSAuthInput
      label={label}
      onChangeText={onChangeText}
      placeholder={placeholder}
      value={value}
    />
  );
}

function clean(value: string) {
  return value.trim() || undefined;
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

const styles = StyleSheet.create({
  header: {
    gap: healthOSSpacing.xs,
  },
  stack: {
    gap: healthOSSpacing.md,
  },
});
