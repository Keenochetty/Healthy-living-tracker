import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  HealthDonutChart,
  HealthMiniLineChart,
  HealthProgressRing,
} from "@/components/health/HealthHubCharts";
import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppCard, AppChip, AppIcon, AppSection } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import { GENERAL_HEALTH_WEEK } from "@/lib/generalHealthMockData";
import { getTodayFitnessSummary } from "@/lib/fitnessStorage";
import { getRecordsOverviewSummary } from "@/lib/healthRecordsStorage";
import { calculateTodayMedicationSchedule } from "@/lib/medicationSupplementStorage";
import { getTodayNutritionSummary } from "@/lib/nutritionStorage";
import {
  healthRealmAccents,
  realmAccentWithOpacity,
} from "@/theme/healthTheme";
import { useAppTheme } from "@/theme/ThemeProvider";
import { fontSizes, radius, spacing } from "@/theme/tokens";
import type { FitnessSummary } from "@/types/fitness";
import type { RecordsOverviewSummary } from "@/types/healthRecords";
import type { MedicationSupplementTodaySummary } from "@/types/medication";
import type { DailyNutritionSummary } from "@/types/nutrition";

type RealmData = {
  fitness: FitnessSummary | null;
  medication: MedicationSupplementTodaySummary | null;
  nutrition: DailyNutritionSummary | null;
  records: RecordsOverviewSummary | null;
};

const EMPTY_DATA: RealmData = {
  fitness: null,
  medication: null,
  nutrition: null,
  records: null,
};

const HEART_TREND = [72, 76, 74, 79, 77, 75, 78];

export function HealthRealmOverview() {
  const [data, setData] = useState<RealmData>(EMPTY_DATA);

  const loadRealm = useCallback(async () => {
    const [nutrition, fitness, medication, records] = await Promise.all([
      getTodayNutritionSummary(),
      getTodayFitnessSummary(),
      calculateTodayMedicationSchedule(),
      getRecordsOverviewSummary(),
    ]);
    setData({ fitness, medication, nutrition, records });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRealm().catch(() => setData(EMPTY_DATA));
    }, [loadRealm]),
  );

  return (
    <AppMainLayout subtitle="Your connected health overview" title="Health">
      <View style={styles.stack}>
        <HealthScoreHero data={data} />
        <RealmGrid data={data} />
        <MetricOverview data={data} />
        <QuickActions />
        <View style={styles.safetyNote}>
          <AppIcon color={healthRealmAccents.health} decorative name="safety" size={17} />
          <Text style={styles.safetyText}>
            Health tracking helps organize your information and does not replace
            professional medical advice.
          </Text>
        </View>
      </View>
    </AppMainLayout>
  );
}

function HealthScoreHero({ data }: { data: RealmData }) {
  const { theme } = useAppTheme();
  const attention =
    (data.medication?.dueCount ?? 0) +
    (data.medication?.missedCount ?? 0) +
    (data.records?.recordsNeedingAttention ?? 0);

  // UI-only readiness score until a reviewed health scoring model is connected.
  const score = Math.max(
    0,
    Math.min(
      96,
      58 +
        (data.fitness?.activeMinutesToday ? 9 : 0) +
        (data.nutrition?.foodLogCount ? 8 : 0) +
        (data.nutrition?.waterMl ? 7 : 0) +
        (data.medication?.takenCount ? 8 : 0) +
        (data.records?.recentRecords.length ? 6 : 0) -
        Math.min(20, attention * 4),
    ),
  );
  const insight =
    attention > 0
      ? `${attention} item${attention === 1 ? "" : "s"} need attention`
      : "Stable today";

  return (
    <AppCard padding="md" style={styles.hero}>
      <View style={styles.heroCopy}>
        <AppChip label="UNIFIED HEALTH" variant="primary" />
        <Text style={[styles.heroTitle, { color: theme.text }]}>Your health, together</Text>
        <Text style={[styles.heroInsight, { color: theme.mutedText }]}>{insight}</Text>
        <View style={styles.heroActions}>
          <AppChip label="Log health" onPress={() => router.push("/health/general" as Href)} selected />
          <AppChip label="Timeline" onPress={() => router.push("/health-calendar" as Href)} />
        </View>
      </View>
      <View accessible accessibilityLabel={`Health overview score ${score} out of 100`} style={styles.score}>
        <HealthProgressRing
          color={healthRealmAccents.health}
          progress={score}
          trackColor={theme.primarySoft}
        />
        <View style={styles.scoreText}>
          <Text style={[styles.scoreValue, { color: theme.text }]}>{score}</Text>
          <Text style={[styles.scoreLabel, { color: theme.mutedText }]}>score</Text>
        </View>
      </View>
    </AppCard>
  );
}

function RealmGrid({ data }: { data: RealmData }) {
  const realms: RealmItem[] = [
    { accent: "health", icon: "vitals", route: "/health/general", status: "Vitals and general health", title: "Vitals" },
    { accent: "fitness", icon: "fitness", route: "/(tabs)/fitness", status: data.fitness?.activeMinutesToday ? `${data.fitness.activeMinutesToday} active min` : "Ready to move", title: "Fitness" },
    { accent: "food", icon: "nutrition", route: "/(tabs)/food", status: data.nutrition?.foodLogCount ? `${data.nutrition.foodLogCount} logs today` : "Nutrition and water", title: "Food" },
    { accent: "meds", icon: "medication", route: "/medication", status: data.medication?.dueCount ? `${data.medication.dueCount} due today` : "Medication and supplements", title: "Medication" },
    { accent: "records", icon: "records", route: "/records", status: data.records?.recordsNeedingAttention ? `${data.records.recordsNeedingAttention} need review` : "Records and care", title: "Records" },
    { accent: "women", icon: "pregnancy_cycle", route: "/cycle", status: "Cycle and pregnancy", title: "Women's health" },
    { accent: "baby", icon: "child_baby", route: "/baby-child", status: "Baby and child care", title: "Child care" },
    { accent: "family", icon: "caregiver", route: "/(tabs)/circle", status: "Shared care", title: "Family" },
    { accent: "health", icon: "mood", route: "/health/general/notes", status: "Notes and mood", title: "Mind" },
  ];

  return (
    <AppSection subtitle="Every health area in one compact hub." title="Health realms">
      <View style={styles.realmGrid}>
        {realms.map((realm) => <RealmCard item={realm} key={realm.title} />)}
      </View>
    </AppSection>
  );
}

type RealmItem = {
  accent: keyof typeof healthRealmAccents;
  icon: AppIconName;
  route: Href;
  status: string;
  title: string;
};

function RealmCard({ item }: { item: RealmItem }) {
  const { theme } = useAppTheme();
  const accent = healthRealmAccents[item.accent];
  return (
    <Pressable
      accessibilityLabel={`${item.title}. ${item.status}`}
      accessibilityRole="button"
      onPress={() => router.push(item.route)}
      style={({ pressed }) => [
        styles.realmCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.realmIcon, { backgroundColor: realmAccentWithOpacity(item.accent, 0.16) }]}>
        <AppIcon color={accent} decorative name={item.icon} size={18} />
      </View>
      <Text numberOfLines={1} style={[styles.realmTitle, { color: theme.text }]}>{item.title}</Text>
      <Text numberOfLines={2} style={[styles.realmStatus, { color: theme.mutedText }]}>{item.status}</Text>
    </Pressable>
  );
}

function MetricOverview({ data }: { data: RealmData }) {
  const { theme } = useAppTheme();
  const adherence = data.medication?.totalCount
    ? Math.round((data.medication.takenCount / data.medication.totalCount) * 100)
    : 100;
  const macros = [
    data.nutrition?.proteinGrams ?? 1,
    data.nutrition?.carbsGrams ?? 1,
    data.nutrition?.fatGrams ?? 1,
  ];

  return (
    <AppSection subtitle="Signals from connected health areas." title="Today at a glance">
      <View style={styles.metricGrid}>
        <MetricCard
          chart={<HealthMiniLineChart color={healthRealmAccents.health} data={HEART_TREND} />}
          detail="UI preview until readings sync"
          label="Vitals trend"
          route="/health/general/heart-rate"
          value="78 bpm"
        />
        <MetricCard
          chart={<HealthProgressRing color={healthRealmAccents.fitness} progress={data.fitness?.weeklyGoalProgress ?? 0} size={54} trackColor={theme.primarySoft} />}
          detail={`${data.fitness?.stepsToday ?? 0} steps`}
          label="Movement"
          route="/(tabs)/fitness"
          value={`${data.fitness?.activeMinutesToday ?? 0} min`}
        />
        <MetricCard
          chart={<HealthDonutChart colors={[healthRealmAccents.food, healthRealmAccents.health, healthRealmAccents.women]} trackColor={theme.primarySoft} values={macros} />}
          detail={`${Math.round(data.nutrition?.waterMl ?? 0)} ml water`}
          label="Nutrition"
          route="/(tabs)/food"
          value={data.nutrition?.foodLogCount ? `${data.nutrition.foodLogCount} logs` : "Not logged"}
        />
        <MetricCard
          chart={<HealthProgressRing color={healthRealmAccents.meds} progress={adherence} size={54} trackColor={theme.primarySoft} />}
          detail={data.medication?.totalCount ? `${data.medication.takenCount} of ${data.medication.totalCount} taken` : "No schedule today"}
          label="Medication"
          route="/medication"
          value={`${adherence}%`}
        />
        <MetricCard
          chart={<HealthMiniLineChart color={healthRealmAccents.records} data={GENERAL_HEALTH_WEEK.map((item) => item.value)} />}
          detail={`${data.records?.recentVisits.length ?? 0} saved visits`}
          label="Care items"
          route="/records"
          value={`${data.records?.recordsNeedingAttention ?? 0} attention`}
        />
      </View>
    </AppSection>
  );
}

function MetricCard({
  chart,
  detail,
  label,
  route,
  value,
}: {
  chart: React.ReactNode;
  detail: string;
  label: string;
  route: Href;
  value: string;
}) {
  const { theme } = useAppTheme();
  return (
    <AppCard onPress={() => router.push(route)} padding="sm" style={styles.metricCard}>
      <View style={styles.metricTop}>{chart}</View>
      <Text style={[styles.metricLabel, { color: theme.mutedText }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: theme.text }]}>{value}</Text>
      <Text numberOfLines={2} style={[styles.metricDetail, { color: theme.mutedText }]}>{detail}</Text>
    </AppCard>
  );
}

function QuickActions() {
  return (
    <AppSection title="Quick actions">
      <View style={styles.actions}>
        <AppChip label="Health note" onPress={() => router.push("/health/general/notes" as Href)} />
        <AppChip label="Weight" onPress={() => router.push("/health/general/weight" as Href)} />
        <AppChip label="Device sync" onPress={() => router.push("/device-sync" as Href)} />
        <AppChip label="Records" onPress={() => router.push("/records" as Href)} />
      </View>
    </AppSection>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  hero: { alignItems: "center", borderColor: realmAccentWithOpacity("health", 0.45), borderWidth: 1, flexDirection: "row", gap: spacing.md, overflow: "hidden" },
  heroActions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.md },
  heroCopy: { flex: 1, gap: spacing.xs },
  heroInsight: { fontSize: fontSizes.sm, lineHeight: 19 },
  heroTitle: { fontSize: fontSizes.xl, fontWeight: "900", lineHeight: 28, marginTop: spacing.sm },
  metricCard: { flexBasis: "46%", flexGrow: 1, minHeight: 142 },
  metricDetail: { fontSize: fontSizes.xs, lineHeight: 15, marginTop: spacing.xs },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  metricLabel: { fontSize: fontSizes.xs, fontWeight: "800", marginTop: spacing.sm, textTransform: "uppercase" },
  metricTop: { alignItems: "flex-end", height: 54, justifyContent: "center" },
  metricValue: { fontSize: fontSizes.md, fontWeight: "900", marginTop: 2 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  realmCard: { borderRadius: radius.lg, borderWidth: 1, flexBasis: "30%", flexGrow: 1, minHeight: 124, padding: spacing.md },
  realmGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  realmIcon: { alignItems: "center", borderRadius: radius.md, height: 34, justifyContent: "center", width: 34 },
  realmStatus: { fontSize: 10, lineHeight: 14, marginTop: spacing.xs },
  realmTitle: { fontSize: 12, fontWeight: "900", marginTop: spacing.sm },
  safetyNote: { alignItems: "flex-start", borderLeftColor: healthRealmAccents.health, borderLeftWidth: 3, flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.md },
  safetyText: { color: "#8b96a6", flex: 1, fontSize: fontSizes.xs, lineHeight: 18 },
  score: { alignItems: "center", height: 82, justifyContent: "center", width: 82 },
  scoreLabel: { fontSize: 9, fontWeight: "800", textTransform: "uppercase" },
  scoreText: { alignItems: "center", position: "absolute" },
  scoreValue: { fontSize: fontSizes.lg, fontWeight: "900" },
  stack: { gap: spacing["2xl"] },
});
