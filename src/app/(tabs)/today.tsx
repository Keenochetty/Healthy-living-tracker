import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import {
  AppCard,
  AppIcon,
  AppSection,
  DashboardHeroScoreCard,
  MoodEmojiSelector,
  type MoodKey,
  PremiumStatCard
} from "@/components/ui";
import { CORE_MODULE_KEYS } from "@/constants/modules";
import {
  formatReminderTime,
  getUpcomingReminders,
  subscribeToReminders
} from "@/lib/reminderStorage";
import {
  getTodayNutritionSummary,
  subscribeToNutrition
} from "@/lib/nutritionStorage";
import {
  getTodayFitnessSummary,
  subscribeToFitness
} from "@/lib/fitnessStorage";
import {
  getAllChildSummaries,
  subscribeToChildren
} from "@/lib/childStorage";
import {
  calculateCyclePrediction,
  subscribeToCycle
} from "@/lib/cycleStorage";
import {
  getAllCaregiverSummaries,
  subscribeToCaregivers
} from "@/lib/caregiverStorage";
import {
  getPendingReviewJobs,
  subscribeToAiJobs
} from "@/lib/aiStorage";
import {
  getAllElderSummaries,
  subscribeToElders
} from "@/lib/elderStorage";
import {
  getUserPreferences,
  subscribeToUserPreferences
} from "@/lib/userPreferences";
import type { AppModuleKey } from "@/types/app";
import type { UserPreferences } from "@/types/profile";
import type { AppReminder } from "@/types/reminders";
import type { FitnessSummary } from "@/types/fitness";
import type { DailyNutritionSummary } from "@/types/nutrition";
import type { ChildSummary } from "@/types/child";
import type { CaregiverSummary } from "@/types/caregiver";
import type { CyclePrediction } from "@/types/cycle";
import type { ElderSummary } from "@/types/elder";
import type { AiJob } from "@/types/ai";
import { useAppTheme } from "@/theme/ThemeProvider";

export default function TodayScreen() {
  const [childSummaries, setChildSummaries] = useState<ChildSummary[]>([]);
  const [caregiverSummaries, setCaregiverSummaries] = useState<CaregiverSummary[]>([]);
  const [pendingAiJobs, setPendingAiJobs] = useState<AiJob[]>([]);
  const [cyclePrediction, setCyclePrediction] = useState<CyclePrediction | null>(null);
  const [elderSummaries, setElderSummaries] = useState<ElderSummary[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [upcomingReminders, setUpcomingReminders] = useState<AppReminder[]>([]);
  const [selectedMood, setSelectedMood] = useState<MoodKey>("good");
  const [nutritionSummary, setNutritionSummary] =
    useState<DailyNutritionSummary | null>(null);
  const [fitnessSummary, setFitnessSummary] = useState<FitnessSummary | null>(null);
  const enabledModules: AppModuleKey[] = preferences?.enabledModules ?? CORE_MODULE_KEYS;
  const { theme } = useAppTheme();

  useEffect(() => {
    getUserPreferences().then(setPreferences);
    getUpcomingReminders().then(setUpcomingReminders);
    getTodayNutritionSummary().then(setNutritionSummary);
    getTodayFitnessSummary().then(setFitnessSummary);
    getAllChildSummaries().then(setChildSummaries);
    getAllCaregiverSummaries().then(setCaregiverSummaries);
    getPendingReviewJobs().then(setPendingAiJobs);
    calculateCyclePrediction().then(setCyclePrediction);
    getAllElderSummaries().then(setElderSummaries);

    const unsubscribePreferences = subscribeToUserPreferences(setPreferences);
    const unsubscribeReminders = subscribeToReminders(() => {
      getUpcomingReminders().then(setUpcomingReminders);
    });
    const unsubscribeNutrition = subscribeToNutrition(() => {
      getTodayNutritionSummary().then(setNutritionSummary);
    });
    const unsubscribeFitness = subscribeToFitness(() => {
      getTodayFitnessSummary().then(setFitnessSummary);
    });
    const unsubscribeChildren = subscribeToChildren(() => {
      getAllChildSummaries().then(setChildSummaries);
    });
    const unsubscribeCaregivers = subscribeToCaregivers(() => {
      getAllCaregiverSummaries().then(setCaregiverSummaries);
    });
    const unsubscribeAi = subscribeToAiJobs(() => {
      getPendingReviewJobs().then(setPendingAiJobs);
    });
    const unsubscribeCycle = subscribeToCycle(() => {
      calculateCyclePrediction().then(setCyclePrediction);
    });
    const unsubscribeElders = subscribeToElders(() => {
      getAllElderSummaries().then(setElderSummaries);
    });

    return () => {
      unsubscribeChildren();
      unsubscribeCaregivers();
      unsubscribeAi();
      unsubscribeCycle();
      unsubscribeElders();
      unsubscribePreferences();
      unsubscribeReminders();
      unsubscribeNutrition();
      unsubscribeFitness();
    };
  }, []);

  return (
    <AppMainLayout subtitle="How are you feeling today?">
      <DashboardHeroScoreCard
        helper="Great job. Keep it steady."
        score={90}
        subtitle="4/7 tasks completed"
        title="Daily Score"
      />

      <AppSection title="Choose your mood for today">
        <MoodEmojiSelector onSelect={setSelectedMood} selectedMood={selectedMood} />
      </AppSection>

      <AppSection subtitle="A compact snapshot of what matters now." title="Today at a glance">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" }}>
          <PremiumStatCard
            accentColor={theme.accentBlue}
            helper="good recovery"
            iconName="sleep"
            progress={0.78}
            title="Sleep"
            value="7h 30m"
          />
          <PremiumStatCard
            accentColor={theme.accentOrange}
            helper="light and movement"
            iconName="vitals"
            progress={0.55}
            title="Sunlight"
            value="3h"
          />
          <PremiumStatCard
            accentColor={theme.accentPink}
            helper="take with food"
            iconName="medication"
            progress={0.42}
            title="Medication"
            value="1 due"
          />
          <PremiumStatCard
            accentColor={theme.accentBlue}
            helper={`${nutritionSummary?.waterMl ?? 0} ml logged`}
            iconName="water"
            progress={Math.min((nutritionSummary?.waterMl ?? 0) / 2000, 1)}
            title="Water"
            value={nutritionSummary?.waterMl ? `${nutritionSummary.waterMl} ml` : "Start"}
          />
          {enabledModules.includes("fitness") ? (
            <PremiumStatCard
              accentColor={theme.accentGreen}
              helper={`${fitnessSummary?.activeMinutesToday ?? 0} active min`}
              iconName="fitness"
              progress={Math.min((fitnessSummary?.stepsToday ?? 0) / 8000, 1)}
              title="Steps"
              value={`${fitnessSummary?.stepsToday ?? 0}`}
            />
          ) : null}
          {enabledModules.includes("food") ? (
            <PremiumStatCard
              accentColor={theme.accentGreen}
              helper={nutritionSummary?.foodLogCount ? `${nutritionSummary.foodLogCount} meals logged` : "Log your first meal"}
              iconName="food"
              title="Food"
              value={nutritionSummary?.foodLogCount ? `${Math.round(nutritionSummary.calories)} kcal` : "Start today"}
            />
          ) : null}
        </View>
      </AppSection>

      {enabledModules.includes("child_baby") || enabledModules.includes("caregiver") || enabledModules.includes("elder_care") ? (
        <AppSection title="Family care">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" }}>
            {enabledModules.includes("child_baby") ? (
              <PremiumStatCard
                accentColor={theme.accentPink}
                helper={childSummaries[0] ? "Feeds, sleep, diapers" : "Set up when ready"}
                iconName="child_baby"
                title="Child & Baby"
                value={childSummaries[0] ? `${childSummaries[0].child.displayName}'s care` : "Set up care"}
              />
            ) : null}
            {enabledModules.includes("caregiver") ? (
              <PremiumStatCard
                accentColor={theme.accentOrange}
                helper={caregiverSummaries[0]?.caregiver.displayName ?? "Add trusted helpers"}
                iconName="caregiver"
                title="Caregiver"
                value={caregiverSummaries[0]?.latestCheckIn?.status ?? "Set up care help"}
              />
            ) : null}
            {enabledModules.includes("elder_care") ? (
              <PremiumStatCard
                accentColor={theme.accentGreen}
                helper={elderSummaries[0]?.elder.displayName ?? "Track care tasks"}
                iconName="elder_care"
                title="Elder Care"
                value={elderSummaries[0]?.latestCheckIn?.status ?? "Support a loved one"}
              />
            ) : null}
          </View>
        </AppSection>
      ) : null}

      {enabledModules.includes("pregnancy_cycle") ? (
        <AppCard backgroundColor={theme.card ?? theme.surface}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <AppIcon name="privacy" size={20} variant="private" />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.text, fontSize: 17, fontWeight: "900" }}>
                Private cycle
              </Text>
              <Text style={{ color: theme.mutedText, lineHeight: 20, marginTop: 4 }}>
                Private tracker is enabled. Details stay out of the public dashboard.
              </Text>
            </View>
          </View>
        </AppCard>
      ) : null}

      <AppSection title="Coming up" subtitle="Your next important reminders.">
        <AppCard backgroundColor={theme.card ?? theme.surface}>
          <View style={{ gap: 10 }}>
            {upcomingReminders.length ? (
              upcomingReminders.slice(0, 3).map((reminder) => (
                <View
                  key={reminder.id}
                  style={{
                    alignItems: "center",
                    backgroundColor: theme.surfaceSoft ?? theme.background,
                    borderRadius: 18,
                    flexDirection: "row",
                    gap: 12,
                    justifyContent: "space-between",
                    padding: 14
                  }}
                >
                  <AppIcon name={reminder.type === "medication" ? "medication" : "calendar"} size={18} variant="primary" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.text, fontWeight: "800" }}>{reminder.title}</Text>
                    <Text style={{ color: theme.mutedText, marginTop: 3 }}>{reminder.status}</Text>
                  </View>
                  <Text style={{ color: theme.mutedText }}>{formatReminderTime(reminder.dueAt)}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: theme.mutedText, lineHeight: 21 }}>
                Your day is clear. Add a reminder when you are ready.
              </Text>
            )}
          </View>
        </AppCard>
      </AppSection>
    </AppMainLayout>
  );
}
