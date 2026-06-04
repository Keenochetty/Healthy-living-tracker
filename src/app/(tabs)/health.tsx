import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { FitnessSummaryCard } from "@/components/fitness/FitnessSummaryCard";
import { DailyNutritionSummaryCard } from "@/components/nutrition/DailyNutritionSummaryCard";
import { ChildProfileCard } from "@/components/child/ChildProfileCard";
import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppAlertCard, AppButton, AppCard, AppChip, AppIcon, AppSection, PremiumStatCard } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import {
  getAvailableHealthWidgets,
  getBiometricWidgetRouteType,
  calculateWidgetValue,
  getPinnedHealthWidgets,
  isBiometricWidget,
  isMedicationWidget,
  isNutritionWidget,
  isSupplementWidget,
  pinHealthWidget,
  unpinHealthWidget
} from "@/lib/healthWidgets";
import {
  calculateTodayMedicationSchedule,
  calculateTodaySupplementSchedule,
  markDoseTaken
} from "@/lib/medicationSupplementStorage";
import {
  getDeviceSyncWidgetRoute,
  isDeviceSyncWidget
} from "@/services/healthSync/healthSyncService";
import { getTodayNutritionSummary } from "@/lib/nutritionStorage";
import { getTodayFitnessSummary } from "@/lib/fitnessStorage";
import { getAllChildSummaries } from "@/lib/childStorage";
import {
  calculateCyclePrediction,
  getPregnancySummary
} from "@/lib/cycleStorage";
import { getAllCaregiverSummaries } from "@/lib/caregiverStorage";
import { getAllElderSummaries } from "@/lib/elderStorage";
import { getPendingReviewJobs, getRecentAiJobs } from "@/lib/aiStorage";
import { getUserPreferences } from "@/lib/userPreferences";
import type { FitnessSummary } from "@/types/fitness";
import type { DailyNutritionSummary } from "@/types/nutrition";
import type { ChildSummary } from "@/types/child";
import type { CyclePrediction, PregnancySummary } from "@/types/cycle";
import type { CaregiverSummary } from "@/types/caregiver";
import type { ElderSummary } from "@/types/elder";
import type { AiJob } from "@/types/ai";
import type { WidgetKey } from "@/types/app";
import type { HealthQuickWidget } from "@/types/nutrition";
import type { MedicationSupplementTodaySummary } from "@/types/medication";
import { useAppTheme } from "@/theme/ThemeProvider";

export default function HealthScreen() {
  const { theme } = useAppTheme();
  const [childEnabled, setChildEnabled] = useState(false);
  const [caregiverEnabled, setCaregiverEnabled] = useState(false);
  const [caregiverSummaries, setCaregiverSummaries] = useState<CaregiverSummary[]>([]);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [pendingAiJobs, setPendingAiJobs] = useState<AiJob[]>([]);
  const [recentAiJobs, setRecentAiJobs] = useState<AiJob[]>([]);
  const [childSummaries, setChildSummaries] = useState<ChildSummary[]>([]);
  const [foodEnabled, setFoodEnabled] = useState(false);
  const [fitnessEnabled, setFitnessEnabled] = useState(false);
  const [elderCareEnabled, setElderCareEnabled] = useState(false);
  const [elderSummaries, setElderSummaries] = useState<ElderSummary[]>([]);
  const [pregnancyCycleEnabled, setPregnancyCycleEnabled] = useState(false);
  const [cyclePrediction, setCyclePrediction] = useState<CyclePrediction | null>(null);
  const [pregnancySummary, setPregnancySummary] =
    useState<PregnancySummary | null>(null);
  const [nutritionSummary, setNutritionSummary] =
    useState<DailyNutritionSummary | null>(null);
  const [fitnessSummary, setFitnessSummary] = useState<FitnessSummary | null>(null);
  const [pinnedHealthWidgets, setPinnedHealthWidgets] = useState<HealthQuickWidget[]>([]);
  const [availableHealthWidgets, setAvailableHealthWidgets] = useState<HealthQuickWidget[]>([]);
  const [healthWidgetValues, setHealthWidgetValues] = useState<Record<string, string>>({});
  const [medicationSummary, setMedicationSummary] = useState<MedicationSupplementTodaySummary | null>(null);
  const [supplementSummary, setSupplementSummary] = useState<MedicationSupplementTodaySummary | null>(null);

  const loadHealthAddOns = useCallback(async () => {
    const [
      preferences,
      summary,
      nextFitnessSummary,
      nextChildSummaries,
      nextCyclePrediction,
      nextPregnancySummary,
      nextCaregiverSummaries,
      nextElderSummaries,
      nextPendingAiJobs,
      nextRecentAiJobs,
      nextPinnedHealthWidgets,
      nextAvailableHealthWidgets,
      nextMedicationSummary,
      nextSupplementSummary
    ] = await Promise.all([
      getUserPreferences(),
      getTodayNutritionSummary(),
      getTodayFitnessSummary(),
      getAllChildSummaries(),
      calculateCyclePrediction(),
      getPregnancySummary(),
      getAllCaregiverSummaries(),
      getAllElderSummaries(),
      getPendingReviewJobs(),
      getRecentAiJobs(),
      getPinnedHealthWidgets(),
      getAvailableHealthWidgets(),
      calculateTodayMedicationSchedule(),
      calculateTodaySupplementSchedule()
    ]);

    setChildEnabled(preferences.enabledModules.includes("child_baby"));
    setCaregiverEnabled(preferences.enabledModules.includes("caregiver"));
    setCaregiverSummaries(nextCaregiverSummaries);
    setAiEnabled(preferences.enabledModules.includes("ai_assistant"));
    setPendingAiJobs(nextPendingAiJobs);
    setRecentAiJobs(nextRecentAiJobs);
    setChildSummaries(nextChildSummaries);
    setFoodEnabled(preferences.enabledModules.includes("food"));
    setFitnessEnabled(preferences.enabledModules.includes("fitness"));
    setElderCareEnabled(preferences.enabledModules.includes("elder_care"));
    setElderSummaries(nextElderSummaries);
    setPregnancyCycleEnabled(preferences.enabledModules.includes("pregnancy_cycle"));
    setCyclePrediction(nextCyclePrediction);
    setPregnancySummary(nextPregnancySummary);
    setNutritionSummary(summary);
    setFitnessSummary(nextFitnessSummary);
    setPinnedHealthWidgets(nextPinnedHealthWidgets);
    setAvailableHealthWidgets(nextAvailableHealthWidgets);
    setMedicationSummary(nextMedicationSummary);
    setSupplementSummary(nextSupplementSummary);
    setHealthWidgetValues(
      Object.fromEntries(
        await Promise.all(
          nextPinnedHealthWidgets.map(async (widget) => [
            widget.widgetKey,
            await calculateWidgetValue(widget.widgetKey)
          ])
        )
      )
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHealthAddOns();
    }, [loadHealthAddOns])
  );

  async function toggleHealthWidget(widget: HealthQuickWidget) {
    if (widget.isPinned) {
      await unpinHealthWidget(widget.widgetKey);
    } else {
      await pinHealthWidget(widget.widgetKey);
    }

    await loadHealthAddOns();
  }

  return (
    <AppMainLayout subtitle="Personal health" title="Health">
      <AppAlertCard
        message="This app helps organise medication reminders. It does not replace advice from a doctor, pharmacist or healthcare professional."
        title="Medication safety"
        variant="medical"
      />

      <AppSection title="Quick View" subtitle="Pinned health widgets at a glance.">
        <HealthQuickViewBar
          fitnessSummary={fitnessSummary}
          widgetValues={healthWidgetValues}
          nutritionSummary={nutritionSummary}
          widgets={pinnedHealthWidgets}
        />
        <HealthWidgetPicker
          onToggle={toggleHealthWidget}
          widgets={availableHealthWidgets}
        />
      </AppSection>

      <AppSection title="Your Health Realms" subtitle="Open a focused health space.">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          <HealthRealmCard
            accentColor="#22c55e"
            description="Movement, plans and workout sessions."
            iconName="fitness"
            onPress={() => router.push("/fitness" as Href)}
            title="Workout"
          />
          <HealthRealmCard
            accentColor="#f59e0b"
            description="Meals, macros, water and daily notes."
            iconName="food"
            onPress={() => router.push("/food" as Href)}
            title="Food / Nutrition"
          />
          <HealthRealmCard
            accentColor="#3b82f6"
            description="Weight, sleep, energy, mood and vitals."
            iconName="vitals"
            onPress={() => router.push("/biometrics" as Href)}
            title="Biometrics"
          />
          <HealthRealmCard
            accentColor="#6366f1"
            description="Prepare Apple Health, Health Connect and device data."
            iconName="sync"
            onPress={() => router.push("/device-sync" as Href)}
            title="Device Sync"
          />
          <HealthRealmCard
            accentColor="#ef4444"
            description="Medication reminders and history."
            iconName="medication"
            onPress={() => router.push("/medication" as Href)}
            title="Medication"
          />
          <HealthRealmCard
            accentColor="#14b8a6"
            description="Supplement logging foundation."
            iconName="health"
            onPress={() => router.push("/supplements" as Href)}
            title="Supplements"
          />
          <HealthRealmCard
            accentColor="#3b82f6"
            description="Health records and documents."
            iconName="documents"
            title="Records"
          />
        </View>
      </AppSection>

      <AppSection title="Health areas" subtitle="Choose a focused view without crowding the dashboard.">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <AppChip label="Overview" selected variant="primary" />
          <AppChip label="Eating" variant="muted" />
          <AppChip label="Exercise" variant="muted" />
          {pregnancyCycleEnabled ? <AppChip label="Women" variant="private" /> : null}
          <AppChip label="Medication" variant="muted" />
          <AppChip label="Vitals" variant="muted" />
        </View>
      </AppSection>

      <AppSection title="Eating" subtitle="Food, protein and water tracking for today.">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" }}>
          <PremiumStatCard
            accentColor={theme.accentGreen}
            helper={`${Math.round(nutritionSummary?.proteinGrams ?? 0)}g protein`}
            iconName="food"
            title="Nutrition"
            value={nutritionSummary?.foodLogCount ? `${Math.round(nutritionSummary.calories)} kcal` : "No logs"}
          />
          <PremiumStatCard
            accentColor={theme.accentBlue}
            helper="today"
            iconName="water"
            title="Water"
            value={`${Math.round(nutritionSummary?.waterMl ?? 0)}ml`}
          />
        </View>
      </AppSection>

      <AppSection title="Exercise" subtitle="Energy, intensity, and workout cards will follow the fitness direction.">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" }}>
          <PremiumStatCard
            accentColor={theme.accentGreen}
            helper={`${fitnessSummary?.activeMinutesToday ?? 0} active minutes`}
            iconName="fitness"
            title="Movement"
            value={`${fitnessSummary?.stepsToday ?? 0} steps`}
          />
          <PremiumStatCard
            accentColor={theme.accentOrange}
            helper="timer-ready"
            iconName="vitals"
            title="Intensity"
            value="Moderate"
          />
        </View>
      </AppSection>

      <AppSection title="Medication & Supplements" subtitle="Private schedule tracking and reminder history.">
        <View style={{ gap: 12 }}>
          <MedicationSupplementOverviewCard
            accentColor="#ef4444"
            emptyText="No medication reminders due today."
            onMarkTaken={loadHealthAddOns}
            route="/medication"
            summary={medicationSummary}
            title="Medication"
          />
          <MedicationSupplementOverviewCard
            accentColor="#14b8a6"
            emptyText="No supplement reminders due today."
            onMarkTaken={loadHealthAddOns}
            route="/supplements"
            summary={supplementSummary}
            title="Supplements"
          />
        </View>
      </AppSection>

      {aiEnabled ? (
        <View style={{ gap: 12 }}>
          <AppSection
            subtitle="Draft summaries and scans for review. AI does not diagnose or save records automatically."
            title="AI Assistant"
          />

          <AppCard backgroundColor="#f5f3ff">
            <Text style={{ color: "#7c3aed", fontWeight: "900" }}>
              {pendingAiJobs.length} pending review
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 8 }}>
              {recentAiJobs.length} recent AI job{recentAiJobs.length === 1 ? "" : "s"}.
              Review drafts before saving.
            </Text>
          </AppCard>

          <AppButton
            onPress={() => router.push("/ai" as Href)}
            title="Open AI Assistant"
          />
        </View>
      ) : null}

      {caregiverEnabled ? (
        <View style={{ gap: 12 }}>
          <View>
            <Text style={{ color: "#0f172a", fontSize: 22, fontWeight: "900" }}>
              Caregiver
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
              Parent-controlled caregiver profiles, bookings and updates.
            </Text>
          </View>

          <AppCard backgroundColor="#eef2ff">
            <Text style={{ color: "#4f46e5", fontWeight: "900" }}>
              {caregiverSummaries.length} caregiver profile{caregiverSummaries.length === 1 ? "" : "s"}
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 8 }}>
              {caregiverSummaries[0]?.latestCheckIn
                ? `${caregiverSummaries[0].caregiver.displayName}: latest check-in ${caregiverSummaries[0].latestCheckIn.status}.`
                : caregiverSummaries[0]?.latestBooking
                  ? `${caregiverSummaries[0].caregiver.displayName}: latest booking ${caregiverSummaries[0].latestBooking.status}.`
                  : "Add a caregiver only if this helps your care circle."}
            </Text>
          </AppCard>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/caregiver" as Href)}
            style={{
              alignItems: "center",
              backgroundColor: "#4f46e5",
              borderRadius: 18,
              justifyContent: "center",
              minHeight: 52
            }}
          >
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
              Open Caregiver
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {elderCareEnabled ? (
        <View style={{ gap: 12 }}>
          <View>
            <Text style={{ color: "#0f172a", fontSize: 22, fontWeight: "900" }}>
              Elder Care
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
              Consent-first check-ins, notes and reminders for older loved ones.
            </Text>
          </View>

          <AppCard backgroundColor="#ecfdf5">
            <Text style={{ color: "#047857", fontWeight: "900" }}>
              {elderSummaries.length} elder profile{elderSummaries.length === 1 ? "" : "s"}
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 8 }}>
              {elderSummaries[0]?.latestCheckIn
                ? `${elderSummaries[0].elder.displayName}: latest check-in ${elderSummaries[0].latestCheckIn.status}.`
                : elderSummaries[0]
                  ? `${elderSummaries[0].elder.displayName} has no check-ins yet.`
                  : "Add an elder profile only if this helps your family."}
            </Text>
          </AppCard>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/elder" as Href)}
            style={{
              alignItems: "center",
              backgroundColor: "#059669",
              borderRadius: 18,
              justifyContent: "center",
              minHeight: 52
            }}
          >
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
              Open Elder Care
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {pregnancyCycleEnabled ? (
        <View style={{ gap: 12 }}>
          <View>
            <Text style={{ color: "#0f172a", fontSize: 22, fontWeight: "900" }}>
              Pregnancy & Cycle
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
              Private tracker. Circle members and caregivers cannot see this data.
            </Text>
          </View>

          <AppCard backgroundColor="#fdf2f8">
            <Text style={{ color: "#be185d", fontWeight: "900" }}>
              Private and locked
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 8 }}>
              {cyclePrediction?.nextPeriodStart
                ? `Next estimated period may start ${cyclePrediction.nextPeriodStart}.`
                : "Add your last period date in the private tracker to see estimates."}
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
              Pregnancy status:{" "}
              {pregnancySummary?.profile?.status
                ? pregnancySummary.profile.status
                : "not tracking"}
            </Text>
          </AppCard>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/cycle" as Href)}
            style={{
              alignItems: "center",
              backgroundColor: "#db2777",
              borderRadius: 18,
              justifyContent: "center",
              minHeight: 52
            }}
          >
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
              Open Pregnancy & Cycle
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {childEnabled ? (
        <View style={{ gap: 12 }}>
          <View>
            <Text style={{ color: "#0f172a", fontSize: 22, fontWeight: "900" }}>
              Child & Baby
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
              Parent-controlled child and baby care, only because you enabled it.
            </Text>
          </View>

          {childSummaries.length ? (
            childSummaries.slice(0, 2).map((summary) => (
              <ChildProfileCard
                key={summary.child.id}
                onOpen={() => router.push(`/child/${summary.child.id}` as Href)}
                summary={summary}
              />
            ))
          ) : (
            <AppCard backgroundColor="#faf5ff">
              <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
                No child profile yet
              </Text>
              <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
                Add a child profile only if it helps your family. Nothing is created
                automatically.
              </Text>
            </AppCard>
          )}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/child" as Href)}
            style={{
              alignItems: "center",
              backgroundColor: "#a855f7",
              borderRadius: 18,
              justifyContent: "center",
              minHeight: 52
            }}
          >
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
              Open Child & Baby
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {foodEnabled && nutritionSummary ? (
        <View style={{ gap: 12 }}>
          <View>
            <Text style={{ color: "#0f172a", fontSize: 22, fontWeight: "900" }}>
              Food & Water
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
              Hydration and nutrition estimates for today.
            </Text>
          </View>
          <DailyNutritionSummaryCard summary={nutritionSummary} />
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/food" as Href)}
            style={{
              alignItems: "center",
              backgroundColor: "#7c3aed",
              borderRadius: 18,
              justifyContent: "center",
              minHeight: 52
            }}
          >
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
              Open Food & Water
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {fitnessEnabled && fitnessSummary ? (
        <View style={{ gap: 12 }}>
          <View>
            <Text style={{ color: "#0f172a", fontSize: 22, fontWeight: "900" }}>
              Fitness
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
              Movement and workout progress at your pace.
            </Text>
          </View>
          <FitnessSummaryCard summary={fitnessSummary} />
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/fitness" as Href)}
            style={{
              alignItems: "center",
              backgroundColor: "#22c55e",
              borderRadius: 18,
              justifyContent: "center",
              minHeight: 52
            }}
          >
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
              Open Fitness
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </AppMainLayout>
  );
}

function MedicationSupplementOverviewCard({
  accentColor,
  emptyText,
  onMarkTaken,
  route,
  summary,
  title
}: {
  accentColor: string;
  emptyText: string;
  onMarkTaken: () => void;
  route: "/medication" | "/supplements";
  summary: MedicationSupplementTodaySummary | null;
  title: string;
}) {
  const nextReminder = summary?.nextItem;

  return (
    <AppCard>
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", gap: 10, justifyContent: "space-between" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>{title}</Text>
            <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
              {summary?.totalCount
                ? title === "Medication"
                  ? `You marked ${summary.takenCount} of ${summary.totalCount} medications as taken today.`
                  : `You marked ${summary.takenCount} of ${summary.totalCount} supplements as taken today.`
                : emptyText}
            </Text>
          </View>
          <Text style={{ color: accentColor, fontSize: 18, fontWeight: "900" }}>
            {summary?.dueCount ?? 0} due
          </Text>
        </View>

        {summary?.missedCount ? (
          <Text style={{ color: "#b45309", lineHeight: 20 }}>
            {title === "Medication" ? "A medication reminder was missed." : "A supplement reminder was missed."}
          </Text>
        ) : null}

        {nextReminder ? (
          <View style={{ backgroundColor: "#f8fafc", borderRadius: 16, padding: 12 }}>
            <Text style={{ color: "#0f172a", fontWeight: "900" }}>{nextReminder.itemName}</Text>
            <Text style={{ color: "#64748b", marginTop: 4 }}>
              {nextReminder.scheduledAt ? `Next ${new Date(nextReminder.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "As needed"}
            </Text>
          </View>
        ) : null}

        <View style={{ flexDirection: "row", gap: 10 }}>
          {nextReminder ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                markDoseTaken({
                  itemId: nextReminder.itemId,
                  itemType: nextReminder.itemType,
                  scheduleId: nextReminder.scheduleId,
                  scheduledAt: nextReminder.scheduledAt
                }).then(onMarkTaken)
              }
              style={{ alignItems: "center", backgroundColor: accentColor, borderRadius: 16, flex: 1, justifyContent: "center", minHeight: 46 }}
            >
              <Text style={{ color: "#ffffff", fontWeight: "900" }}>Mark Taken</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(route as Href)}
            style={{ alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 16, flex: 1, justifyContent: "center", minHeight: 46 }}
          >
            <Text style={{ color: "#475569", fontWeight: "900" }}>Open</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppCard>
  );
}

function HealthQuickViewBar({
  fitnessSummary,
  widgetValues,
  nutritionSummary,
  widgets
}: {
  fitnessSummary: FitnessSummary | null;
  widgetValues: Record<string, string>;
  nutritionSummary: DailyNutritionSummary | null;
  widgets: HealthQuickWidget[];
}) {
  if (!widgets.length) {
    return (
      <AppCard>
        <Text style={{ color: "#64748b", lineHeight: 21 }}>
          Choose what you want to see at a glance.
        </Text>
      </AppCard>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -4 }}
      contentContainerStyle={{ gap: 10, paddingHorizontal: 4 }}
    >
      {widgets.map((widget) => (
        <TouchableOpacity
          activeOpacity={0.85}
          key={widget.widgetKey}
          onPress={() => {
            if (widget.widgetKey === "goal_weight" || widget.widgetKey === "nutrition_goal") {
              router.push({ pathname: "/food", params: { tab: "targets" } } as Href);
            } else if (widget.widgetKey === "water_progress" || widget.widgetKey === "water_today") {
              router.push({ pathname: "/food", params: { tab: "water" } } as Href);
            } else if (isNutritionWidget(widget.widgetKey) || widget.widgetKey === "food_log") {
              router.push("/food" as Href);
            } else if (isMedicationWidget(widget.widgetKey)) {
              router.push("/medication" as Href);
            } else if (isSupplementWidget(widget.widgetKey)) {
              router.push("/supplements" as Href);
            } else if (widget.widgetKey === "workout" || widget.widgetKey === "steps") {
              router.push("/fitness" as Href);
            } else if (isBiometricWidget(widget.widgetKey)) {
              const type = getBiometricWidgetRouteType(widget.widgetKey);
              router.push((type ? `/biometrics?type=${encodeURIComponent(type)}` : "/biometrics") as Href);
            } else if (isDeviceSyncWidget(widget.widgetKey)) {
              router.push(getDeviceSyncWidgetRoute(widget.widgetKey) as Href);
            }
          }}
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#e2e8f0",
            borderRadius: 20,
            borderWidth: 1,
            minHeight: 96,
            padding: 14,
            width: 148
          }}
        >
          <Text style={{ color: "#64748b", fontSize: 12, fontWeight: "900" }}>
            {widget.title}
          </Text>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900", marginTop: 8 }}>
            {widgetValues[widget.widgetKey] ?? getWidgetValue(widget.widgetKey, nutritionSummary, fitnessSummary)}
          </Text>
          <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 6 }}>
            {isNutritionWidget(widget.widgetKey) || widget.widgetKey === "food_log"
              ? "Open nutrition"
              : isMedicationWidget(widget.widgetKey)
                ? "Open medication"
                : isSupplementWidget(widget.widgetKey)
                  ? "Open supplements"
              : isBiometricWidget(widget.widgetKey)
                ? "Open biometrics"
                : isDeviceSyncWidget(widget.widgetKey)
                  ? "Open sync"
              : "Quick view"}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function HealthWidgetPicker({
  onToggle,
  widgets
}: {
  onToggle: (widget: HealthQuickWidget) => void;
  widgets: HealthQuickWidget[];
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
      {widgets.map((widget) => (
        <TouchableOpacity
          activeOpacity={0.85}
          key={widget.widgetKey}
          onPress={() => onToggle(widget)}
          style={{
            backgroundColor: widget.isPinned ? "#ede9fe" : "#f8fafc",
            borderColor: widget.isPinned ? "#c4b5fd" : "#e2e8f0",
            borderRadius: 999,
            borderWidth: 1,
            paddingHorizontal: 12,
            paddingVertical: 9
          }}
        >
          <Text style={{ color: widget.isPinned ? "#6d28d9" : "#475569", fontWeight: "900" }}>
            {widget.isPinned ? "Pinned " : "Pin "}
            {widget.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function HealthRealmCard({
  accentColor,
  description,
  iconName,
  onPress,
  title
}: {
  accentColor: string;
  description: string;
  iconName: AppIconName;
  onPress?: () => void;
  title: string;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={!onPress}
      onPress={onPress}
      style={{
        backgroundColor: "#ffffff",
        borderColor: "#e2e8f0",
        borderRadius: 22,
        borderWidth: 1,
        flexGrow: 1,
        minHeight: 138,
        minWidth: "45%",
        opacity: onPress ? 1 : 0.7,
        padding: 14
      }}
    >
      <AppIcon color={accentColor} container containerVariant="white" name={iconName} size={22} />
      <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900", marginTop: 12 }}>
        {title}
      </Text>
      <Text style={{ color: "#64748b", lineHeight: 19, marginTop: 5 }}>
        {description}
      </Text>
    </TouchableOpacity>
  );
}

function getWidgetValue(
  widgetKey: WidgetKey,
  nutritionSummary: DailyNutritionSummary | null,
  fitnessSummary: FitnessSummary | null
) {
  switch (widgetKey) {
    case "calories_today":
      return nutritionSummary?.foodLogCount
        ? `${Math.round(nutritionSummary.calories)}`
        : "No logs";
    case "protein_today":
      return `${Math.round(nutritionSummary?.proteinGrams ?? 0)}g`;
    case "water_today":
    case "water":
      return `${Math.round(nutritionSummary?.waterMl ?? 0)}ml`;
    case "calories_progress":
      return nutritionSummary?.foodLogCount
        ? `${Math.round(nutritionSummary.calories)} kcal`
        : "No target";
    case "protein_progress":
      return `${Math.round(nutritionSummary?.proteinGrams ?? 0)}g`;
    case "water_progress":
      return `${Math.round(nutritionSummary?.waterMl ?? 0)}ml`;
    case "fiber_progress":
      return "No target";
    case "goal_weight":
    case "nutrition_goal":
      return "Set goal";
    case "food_diary_status":
    case "food_log":
      return nutritionSummary?.foodLogCount
        ? `${nutritionSummary.foodLogCount} entries`
        : "No logs";
    case "steps":
      return `${fitnessSummary?.stepsToday ?? 0}`;
    case "workout":
      return fitnessSummary?.latestWorkout?.title ?? "No workout";
    case "medication":
    case "medication_due_today":
    case "next_medication":
    case "medication_taken_today":
    case "missed_medication":
    case "medication_schedule_status":
      return "Open";
    case "supplements_due_today":
    case "next_supplement":
    case "supplements_taken_today":
    case "supplement_schedule_status":
      return "Open";
    case "sleep":
    case "energy":
    case "mood":
    case "weight":
    case "biometric_goal_weight":
    case "resting_heart_rate":
    case "blood_pressure":
    case "blood_glucose":
    case "digestion":
    case "symptoms":
    case "steps_today":
    case "distance_today":
    case "last_synced_workout":
    case "sleep_last_night":
    case "active_calories":
    case "synced_weight":
    case "sync_status":
      return "Not set";
    case "baby_feed":
      return "Ready";
    case "cycle":
    case "cycle_private":
      return "Private";
    case "elder_checkin":
      return "Ready";
    default:
      return "Ready";
  }
}
