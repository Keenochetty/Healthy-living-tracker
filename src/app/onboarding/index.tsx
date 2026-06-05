import { Href, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

import { AppButton, AppCard, AppChip, AppSection } from "@/components/ui";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { getCountryByName } from "@/constants/countries";
import {
  HEALTH_MODULE_OPTIONS,
  ONBOARDING_STEPS,
  applyDefaultModulesFromGoal,
  applyHomeLayoutPreset,
  completeOnboarding,
  completeOnboardingStep,
  createInitialHealthProfile,
  createOnboardingState,
  getOnboardingState,
  getSuggestedWidgetsForModules,
  saveInitialAssistantConsent,
  saveInitialHealthWidgets,
  saveInitialNotificationChoice,
  skipFamilySetup,
  skipOnboardingStep,
  updateOnboardingState
} from "@/lib/onboardingStorage";
import type {
  HealthModuleKey,
  HomeLayoutPreference,
  MainHealthGoal,
  NotificationOnboardingChoice,
  OnboardingState,
  OnboardingStep
} from "@/types/onboarding";
import type { WidgetKey } from "@/types/app";

const GOALS: Array<{ key: MainHealthGoal; label: string }> = [
  { key: "general_health", label: "General health" },
  { key: "fitness", label: "Fitness" },
  { key: "food_nutrition", label: "Food/Nutrition" },
  { key: "medication_reminders", label: "Medication reminders" },
  { key: "family_care", label: "Family care" },
  { key: "baby_child_care", label: "Baby/child care" },
  { key: "pregnancy", label: "Pregnancy" },
  { key: "womens_health", label: "Women's health" },
  { key: "mens_health", label: "Men's health" },
  { key: "records_organization", label: "Records organization" },
  { key: "custom", label: "Custom" }
];

const LAYOUTS: Array<{ key: HomeLayoutPreference; label: string }> = [
  { key: "simple", label: "Simple" },
  { key: "family", label: "Family" },
  { key: "fitness", label: "Fitness" },
  { key: "baby_focused", label: "Baby focused" },
  { key: "medication_focused", label: "Medication focused" },
  { key: "custom", label: "Custom" }
];

const AI_CATEGORIES = [
  "nutrition",
  "workout",
  "records",
  "medication_supplements",
  "womens_health",
  "pregnancy",
  "baby_child",
  "mens_health",
  "biometrics",
  "family_caregiver"
];

const INPUT_STYLE = {
  backgroundColor: "#ffffff",
  borderColor: "#e2e8f0",
  borderRadius: 16,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 50,
  paddingHorizontal: 14
};

const DEFAULT_SELECTED_MODULES: HealthModuleKey[] = ["calendar", "records"];
const EMPTY_WIDGET_KEYS: WidgetKey[] = [];

export default function OnboardingScreen() {
  const [state, setState] = useState<OnboardingState | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sexOrGender, setSexOrGender] = useState("");
  const [country, setCountry] = useState("South Africa");
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");
  const [mainGoal, setMainGoal] = useState<MainHealthGoal>("general_health");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiCategories, setAiCategories] = useState<string[]>([]);

  useEffect(() => {
    getOnboardingState().then(setState);
  }, []);

  const step = state?.currentStep ?? "welcome";
  const progress = state ? ONBOARDING_STEPS.indexOf(step) + 1 : 1;
  const selectedModules = state?.selectedModules ?? DEFAULT_SELECTED_MODULES;
  const selectedWidgets = state?.selectedWidgetKeys ?? EMPTY_WIDGET_KEYS;

  const suggestedWidgets = useMemo(
    () => getSuggestedWidgetsForModules(selectedModules, state?.homeLayoutPreference ?? "simple"),
    [selectedModules, state?.homeLayoutPreference]
  );

  async function refresh(next?: OnboardingState) {
    setState(next ?? await getOnboardingState());
  }

  async function goTo(nextStep: OnboardingStep) {
    await refresh(await updateOnboardingState({ currentStep: nextStep }));
  }

  async function finishStep(nextStep?: OnboardingStep) {
    await refresh(await completeOnboardingStep(step, nextStep));
  }

  async function skipStep(nextStep?: OnboardingStep) {
    await refresh(await skipOnboardingStep(step, nextStep));
  }

  async function saveProfile() {
    await createInitialHealthProfile({
      country,
      dateOfBirth: clean(dateOfBirth),
      displayName: displayName || "Friend",
      mainHealthGoal: mainGoal,
      sexOrGender: clean(sexOrGender),
      unitSystem
    });
    await refresh(await updateOnboardingState({
      selectedModules: applyDefaultModulesFromGoal(mainGoal)
    }));
    await finishStep("module_selection");
  }

  async function toggleModule(moduleKey: HealthModuleKey) {
    if (!state) return;
    const selected = state.selectedModules.includes(moduleKey)
      ? state.selectedModules.filter((item) => item !== moduleKey)
      : [...state.selectedModules, moduleKey];
    await refresh(await updateOnboardingState({
      selectedModules: selected,
      selectedWidgetKeys: getSuggestedWidgetsForModules(selected, state.homeLayoutPreference ?? "simple")
    }));
  }

  async function toggleWidget(widgetKey: WidgetKey) {
    if (!state) return;
    const selected = state.selectedWidgetKeys.includes(widgetKey)
      ? state.selectedWidgetKeys.filter((item) => item !== widgetKey)
      : [...state.selectedWidgetKeys, widgetKey];
    await refresh(await updateOnboardingState({ selectedWidgetKeys: selected }));
  }

  async function chooseLayout(layout: HomeLayoutPreference) {
    if (!state) return;
    await refresh(await updateOnboardingState({
      homeLayoutPreference: layout,
      selectedWidgetKeys: applyHomeLayoutPreset(layout, state.selectedWidgetKeys as WidgetKey[])
    }));
  }

  async function saveWidgets() {
    await saveInitialHealthWidgets(selectedWidgets.length ? selectedWidgets : suggestedWidgets);
    await finishStep("units_country");
  }

  async function saveNotifications(choice: NotificationOnboardingChoice) {
    await saveInitialNotificationChoice(choice);
    await finishStep("family_setup");
  }

  async function saveAiConsent(enabled: boolean) {
    await saveInitialAssistantConsent(enabled, aiCategories);
    await finishStep("finish");
  }

  async function finishOnboarding() {
    await completeOnboarding();
    router.replace("/(tabs)/health" as Href);
  }

  if (!state) return null;

  return (
    <ScreenWrapper>
      <View style={{ gap: 8 }}>
        <Text style={{ color: "#64748b", fontWeight: "900" }}>Step {progress} of {ONBOARDING_STEPS.length}</Text>
        <View style={{ backgroundColor: "#e2e8f0", borderRadius: 999, height: 8, overflow: "hidden" }}>
          <View style={{ backgroundColor: "#7c3aed", height: 8, width: `${progress / ONBOARDING_STEPS.length * 100}%` }} />
        </View>
      </View>

      {step === "welcome" ? (
        <View style={{ gap: 16 }}>
          <AppCard backgroundColor="#f5f3ff">
            <Text style={styles.heroTitle}>Your health, family, and daily care in one place.</Text>
            <Text style={styles.muted}>Track what matters, keep records organized, and choose what you want to see at a glance.</Text>
          </AppCard>
          <AppButton onPress={() => finishStep("privacy_promise")} title="Get Started" />
          <AppButton onPress={finishOnboarding} title="I will set up later" variant="secondary" />
        </View>
      ) : null}

      {step === "privacy_promise" ? (
        <View style={{ gap: 14 }}>
          <Header subtitle="Your setup starts private. Sharing, AI, device sync, and sensitive modules stay optional." title="Privacy promise" />
          {["Private by default", "You choose what to share", "Family access is optional", "Sensitive health data stays protected", "AI suggestions require confirmation", "This app is not a doctor"].map((item) => (
            <AppCard key={item}><Text style={styles.cardTitle}>{item}</Text></AppCard>
          ))}
          <Text style={styles.footer}>This app helps with tracking, organization, reminders, and trusted education. It is not medical advice and does not replace a doctor, pharmacist, nurse, clinic, pediatrician, midwife, therapist, or healthcare professional.</Text>
          <AppButton onPress={() => finishStep("profile_setup")} title="Continue" />
        </View>
      ) : null}

      {step === "profile_setup" ? (
        <View style={{ gap: 14 }}>
          <Header subtitle="A basic personal profile is enough. Everything else can wait." title="Create personal profile" />
          <TextInput onChangeText={setDisplayName} placeholder="Display name" placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={displayName} />
          <TextInput onChangeText={setDateOfBirth} placeholder="Date of birth optional" placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={dateOfBirth} />
          <TextInput onChangeText={setSexOrGender} placeholder="Sex/gender optional" placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={sexOrGender} />
          <TextInput onChangeText={setCountry} placeholder="Country" placeholderTextColor="#94a3b8" style={INPUT_STYLE} value={country} />
          <ChipRow current={unitSystem} onSelect={(value) => setUnitSystem(value as "metric" | "imperial")} options={[["metric", "Metric"], ["imperial", "Imperial"]]} />
          <Text style={styles.sectionTitle}>Main health goal optional</Text>
          <ChipRow current={mainGoal} onSelect={(value) => setMainGoal(value as MainHealthGoal)} options={GOALS.map((goal) => [goal.key, goal.label])} />
          <AppButton onPress={saveProfile} title="Save Profile" />
          <AppButton onPress={() => skipStep("module_selection")} title="Skip profile details" variant="secondary" />
        </View>
      ) : null}

      {step === "module_selection" ? (
        <View style={{ gap: 14 }}>
          <Header subtitle="Turn on only what you want now. You can turn this on later." title="Choose health modules" />
          {HEALTH_MODULE_OPTIONS.map((module) => (
            <SelectableCard
              badge={module.privacyBadge}
              description={module.description}
              key={module.key}
              onPress={() => toggleModule(module.key)}
              selected={selectedModules.includes(module.key)}
              title={module.label}
            />
          ))}
          <AppButton onPress={() => finishStep("widget_selection")} title="Continue" />
        </View>
      ) : null}

      {step === "widget_selection" ? (
        <View style={{ gap: 14 }}>
          <Header subtitle="Choose what you want to see first. We added a simple default. You can customize it anytime." title="Choose quick-view widgets" />
          <Text style={styles.sectionTitle}>Home layout style</Text>
          <ChipRow current={state.homeLayoutPreference ?? "simple"} onSelect={(value) => chooseLayout(value as HomeLayoutPreference)} options={LAYOUTS.map((layout) => [layout.key, layout.label])} />
          <Text style={styles.sectionTitle}>Suggested widgets</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {suggestedWidgets.map((widget) => (
              <AppChip key={widget} label={formatValue(widget)} onPress={() => toggleWidget(widget)} selected={selectedWidgets.includes(widget)} variant="primary" />
            ))}
          </ScrollView>
          <Text style={styles.muted}>Selected: {selectedWidgets.length ? selectedWidgets.map(formatValue).join(", ") : "Simple default"}</Text>
          <AppButton onPress={saveWidgets} title="Save Widgets" />
          <AppButton onPress={() => skipStep("units_country")} title="Skip widgets" variant="secondary" />
        </View>
      ) : null}

      {step === "units_country" ? (
        <View style={{ gap: 14 }}>
          <Header subtitle="Default for South Africa/global is metric: kg, cm, ml, Celsius." title="Units and country" />
          <Text style={styles.cardTitle}>Country: {getCountryByName(country).country}</Text>
          <Text style={styles.muted}>Preferred units: {unitSystem === "metric" ? "kg, cm, ml, Celsius" : "lb, in, oz, Fahrenheit"}</Text>
          <AppButton onPress={() => finishStep("notifications")} title="Continue" />
        </View>
      ) : null}

      {step === "notifications" ? (
        <View style={{ gap: 14 }}>
          <Header subtitle="In-app reminders still appear if device notifications are off." title="Do you want reminders?" />
          <ChoiceButton label="Not now" onPress={() => saveNotifications("not_now")} />
          <ChoiceButton label="In-app reminders only" onPress={() => saveNotifications("in_app_only")} />
          <ChoiceButton label="Device notifications" onPress={() => saveNotifications("device_notifications")} />
          <Text style={styles.footer}>Sensitive notification privacy uses private lock-screen text by default.</Text>
        </View>
      ) : null}

      {step === "family_setup" ? (
        <View style={{ gap: 14 }}>
          <Header subtitle="Adult profiles control their own health information. Family members only see what is shared." title="Family setup optional" />
          <ChoiceButton label="Not now" onPress={() => skipFamilySetup().then(() => finishStep("ai_consent"))} />
          <ChoiceButton label="Create family circle later" onPress={() => finishStep("ai_consent")} />
          <ChoiceButton label="Add child profile later" onPress={() => updateOnboardingState({ selectedModules: [...selectedModules, "baby_child"] }).then(() => finishStep("ai_consent"))} />
          <Text style={styles.muted}>You can create a family circle later.</Text>
        </View>
      ) : null}

      {step === "ai_consent" ? (
        <View style={{ gap: 14 }}>
          <Header subtitle="The assistant can help with logging, summaries, reminders, and questions. It does not diagnose, prescribe, or replace healthcare professionals." title="AI Assistant consent" />
          <ToggleRow label="Enable assistant" onChange={setAiEnabled} value={aiEnabled} />
          {aiEnabled ? AI_CATEGORIES.map((category) => (
            <ToggleRow key={category} label={formatValue(category)} onChange={() => setAiCategories((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category])} value={aiCategories.includes(category)} />
          )) : <Text style={styles.muted}>You can turn on the assistant later.</Text>}
          <Text style={styles.footer}>AI suggestions are drafts. Review and confirm before saving. Sensitive categories are off by default.</Text>
          <AppButton onPress={() => saveAiConsent(aiEnabled)} title="Save AI Settings" />
          <AppButton onPress={() => saveAiConsent(false)} title="Skip AI" variant="secondary" />
        </View>
      ) : null}

      {step === "finish" ? (
        <View style={{ gap: 14 }}>
          <AppCard backgroundColor="#ecfdf5">
            <Text style={styles.heroTitle}>You are ready.</Text>
            <Text style={styles.muted}>You can add more health modules anytime.</Text>
          </AppCard>
          {state.skippedSteps.length ? <Text style={styles.muted}>Finish setup later: {state.skippedSteps.map(formatValue).join(", ")}</Text> : null}
          <AppButton onPress={finishOnboarding} title="Go to Health Overview" />
        </View>
      ) : null}

      {step !== "welcome" && step !== "finish" ? (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <AppButton onPress={() => goTo(ONBOARDING_STEPS[Math.max(0, ONBOARDING_STEPS.indexOf(step) - 1)])} title="Back" variant="ghost" />
          <AppButton onPress={() => skipStep()} title="Skip" variant="ghost" />
        </View>
      ) : null}
    </ScreenWrapper>
  );
}

function Header({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.muted}>{subtitle}</Text>
    </View>
  );
}

function SelectableCard({ badge, description, onPress, selected, title }: { badge: string; description: string; onPress: () => void; selected: boolean; title: string }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <AppCard backgroundColor={selected ? "#f5f3ff" : "#ffffff"}>
        <View style={{ flexDirection: "row", gap: 12, justifyContent: "space-between" }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.muted}>{description}</Text>
          </View>
          <AppChip label={badge} variant={selected ? "primary" : "muted"} />
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}

function ChoiceButton({ label, onPress }: { label: string; onPress: () => void }) {
  return <AppButton onPress={onPress} title={label} variant="secondary" />;
}

function ChipRow({ current, onSelect, options }: { current: string; onSelect: (value: string) => void; options: string[][] }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map(([key, label]) => (
        <AppChip key={key} label={label} onPress={() => onSelect(key)} selected={current === key} variant="primary" />
      ))}
    </View>
  );
}

function ToggleRow({ label, onChange, value }: { label: string; onChange: (value: boolean) => void; value: boolean }) {
  return (
    <View style={{ alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 16, flexDirection: "row", justifyContent: "space-between", padding: 12 }}>
      <Text style={{ color: "#0f172a", flex: 1, fontWeight: "900" }}>{label}</Text>
      <Switch onValueChange={onChange} value={value} />
    </View>
  );
}

function clean(value: string) {
  return value.trim() || undefined;
}

function formatValue(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const styles = {
  cardTitle: { color: "#0f172a", fontSize: 17, fontWeight: "900" as const },
  footer: { color: "#64748b", fontSize: 13, lineHeight: 20 },
  heroTitle: { color: "#0f172a", fontSize: 30, fontWeight: "900" as const, lineHeight: 36 },
  muted: { color: "#64748b", lineHeight: 21 },
  sectionTitle: { color: "#0f172a", fontSize: 18, fontWeight: "900" as const },
  title: { color: "#0f172a", fontSize: 28, fontWeight: "900" as const }
};
