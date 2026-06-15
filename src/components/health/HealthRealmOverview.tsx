import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppCard, AppIcon, AppSection } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import { GENERAL_HEALTH_WEEK } from "@/lib/generalHealthMockData";
import { getTodayFitnessSummary } from "@/lib/fitnessStorage";
import { getRecordsOverviewSummary } from "@/lib/healthRecordsStorage";
import { calculateTodayMedicationSchedule } from "@/lib/medicationSupplementStorage";
import { getTodayNutritionSummary } from "@/lib/nutritionStorage";
import { useAppTheme } from "@/theme/ThemeProvider";
import type { FitnessSummary } from "@/types/fitness";
import type { RecordsOverviewSummary } from "@/types/healthRecords";
import type { MedicationSupplementTodaySummary } from "@/types/medication";
import type { DailyNutritionSummary } from "@/types/nutrition";

const ACCENT = "#0f766e";
const ACCENT_BRIGHT = "#5eead4";

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
  records: null
};

const VITALS: Array<{
  icon: AppIconName;
  label: string;
  route: Href;
  value: string;
  detail: string;
}> = [
  { detail: "Updated today", icon: "vitals", label: "Heart rate", route: "/health/general/heart-rate", value: "78 bpm" },
  { detail: "Stable this month", icon: "weight", label: "Weight", route: "/health/general/weight", value: "72.2 kg" },
  { detail: "Based on saved height", icon: "health", label: "BMI", route: "/health/general/weight", value: "23.6" },
  { detail: "Last night", icon: "sleep", label: "Sleep", route: "/device-sync", value: "6h 40m" }
];

const TREND_DATA = [
  { label: "Mon", value: 52 },
  { label: "Tue", value: 66 },
  { label: "Wed", value: 58 },
  { label: "Thu", value: 74 },
  { label: "Fri", value: 62 },
  { label: "Sat", value: 70 },
  { label: "Sun", value: 64 }
];

export function HealthRealmOverview() {
  const [data, setData] = useState<RealmData>(EMPTY_DATA);

  const loadRealm = useCallback(async () => {
    const [nutrition, fitness, medication, records] = await Promise.all([
      getTodayNutritionSummary(),
      getTodayFitnessSummary(),
      calculateTodayMedicationSchedule(),
      getRecordsOverviewSummary()
    ]);
    setData({ fitness, medication, nutrition, records });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRealm().catch(() => setData(EMPTY_DATA));
    }, [loadRealm])
  );

  return (
    <AppMainLayout subtitle="Vitals, trends and records" title="Health Realm">
      <View style={styles.stack}>
        <HealthHero data={data} />
        <VitalsGrid nutrition={data.nutrition} records={data.records} />
        <TrendsSection />
        <QuickLogSection />
        <RecordsShortcut records={data.records} />
        <ConnectedRealms data={data} />
        <View style={styles.safetyNote}>
          <AppIcon color={ACCENT} decorative name="safety" size={17} />
          <Text style={styles.safetyText}>
            Health tracking helps organize your information and does not replace professional medical advice.
          </Text>
        </View>
      </View>
    </AppMainLayout>
  );
}

function HealthHero({ data }: { data: RealmData }) {
  const completedSignals = [
    Boolean(data.nutrition?.waterMl),
    Boolean(data.nutrition?.foodLogCount),
    Boolean(data.fitness?.activeMinutesToday),
    Boolean(data.medication?.takenCount),
    true,
    true,
    Boolean(data.records?.recentRecords.length)
  ].filter(Boolean).length;

  return (
    <AppCard style={styles.hero}>
      <View style={styles.heroGlowOne} />
      <View style={styles.heroGlowTwo} />
      <View style={styles.heroTop}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroKicker}>HEALTH OVERVIEW</Text>
          <Text style={styles.heroTitle}>A calm view of your health</Text>
          <Text style={styles.heroBody}>
            See what is logged, spot gentle trends, and choose one useful next step.
          </Text>
        </View>
        <View accessible accessibilityLabel={`${completedSignals} of 7 health areas have information`} style={styles.scoreRing}>
          <Text style={styles.scoreValue}>{completedSignals}/7</Text>
          <Text style={styles.scoreLabel}>areas</Text>
        </View>
      </View>
      <View style={styles.heroActions}>
        <HeroAction icon="add" label="Log health" onPress={() => router.push("/health/general" as Href)} primary />
        <HeroAction icon="calendar_timeline" label="Timeline" onPress={() => router.push("/health-calendar" as Href)} />
      </View>
    </AppCard>
  );
}

function HeroAction({ icon, label, onPress, primary = false }: { icon: AppIconName; label: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.heroAction, primary ? styles.heroActionPrimary : null]}>
      <AppIcon color={primary ? "#06231c" : "#f0fdfa"} decorative name={icon} size={17} />
      <Text style={[styles.heroActionText, primary ? styles.heroActionTextPrimary : null]}>{label}</Text>
    </Pressable>
  );
}

function VitalsGrid({ nutrition, records }: { nutrition: DailyNutritionSummary | null; records: RecordsOverviewSummary | null }) {
  const { theme } = useAppTheme();
  const cards = [
    ...VITALS,
    {
      detail: nutrition?.waterMl ? "Logged today" : "Log your first glass",
      icon: "water" as AppIconName,
      label: "Water",
      route: "/food" as Href,
      value: nutrition?.waterMl ? `${(nutrition.waterMl / 1000).toFixed(1)} L` : "No data"
    },
    {
      detail: "Add a note when something changes",
      icon: "note" as AppIconName,
      label: "Symptoms",
      route: "/health/general/notes" as Href,
      value: "1 recent"
    },
    {
      detail: "From health records",
      icon: "doctor" as AppIconName,
      label: "Appointments",
      route: "/records" as Href,
      value: records?.recentVisits.length ? `${records.recentVisits.length} saved` : "No visits"
    }
  ];

  return (
    <AppSection subtitle="Tap a card to open its detail view." title="Vitals at a glance">
      <View style={styles.vitalsGrid}>
        {cards.map((item) => (
          <Pressable
            accessibilityHint={`Opens ${item.label} details`}
            accessibilityLabel={`${item.label}, ${item.value}, ${item.detail}`}
            accessibilityRole="button"
            key={item.label}
            onPress={() => router.push(item.route)}
            style={({ pressed }) => [
              styles.vitalCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              pressed ? styles.pressed : null
            ]}
          >
            <View style={styles.vitalIcon}><AppIcon color={ACCENT} decorative name={item.icon} size={19} /></View>
            <Text style={[styles.vitalLabel, { color: theme.mutedText }]}>{item.label}</Text>
            <Text style={[styles.vitalValue, { color: theme.text }]}>{item.value}</Text>
            <Text style={[styles.vitalDetail, { color: theme.mutedText }]}>{item.detail}</Text>
          </Pressable>
        ))}
      </View>
    </AppSection>
  );
}

function TrendsSection() {
  return (
    <AppSection subtitle="Labeled previews from your saved readings." title="Trends">
      <View style={styles.trendStack}>
        <TrendCard
          bars={TREND_DATA}
          label="Resting heart rate"
          range="Last 7 days"
          route="/health/general/heart-rate"
          summary="78 bpm average"
          unit="bpm"
        />
        <TrendCard
          bars={GENERAL_HEALTH_WEEK.map((item) => ({ label: item.day, value: item.value }))}
          label="Weight"
          range="Last 30 days"
          route="/health/general/weight"
          summary="72.2 kg latest"
          unit="kg"
        />
      </View>
    </AppSection>
  );
}

function TrendCard({
  bars,
  label,
  range,
  route,
  summary,
  unit
}: {
  bars: Array<{ label: string; value: number }>;
  label: string;
  range: string;
  route: Href;
  summary: string;
  unit: string;
}) {
  const { theme } = useAppTheme();
  return (
    <Pressable accessibilityLabel={`${label}, ${summary}, ${range}, measured in ${unit}`} accessibilityRole="button" onPress={() => router.push(route)}>
      <AppCard style={[styles.trendCard, { borderColor: theme.border }]}>
        <View style={styles.trendHeader}>
          <View>
            <Text style={[styles.trendLabel, { color: theme.mutedText }]}>{label}</Text>
            <Text style={[styles.trendSummary, { color: theme.text }]}>{summary}</Text>
          </View>
          <View style={styles.rangePill}><Text style={styles.rangeText}>{range}</Text></View>
        </View>
        <View style={styles.chart}>
          {bars.map((bar) => (
            <View key={bar.label} style={styles.chartColumn}>
              <Text style={[styles.chartUnit, { color: theme.mutedText }]}>{bar.value}</Text>
              <View style={[styles.chartTrack, { backgroundColor: theme.primarySoft }]}>
                <View style={[styles.chartFill, { height: `${Math.max(18, bar.value)}%` }]} />
              </View>
              <Text style={[styles.chartLabel, { color: theme.mutedText }]}>{bar.label}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.unitLabel, { color: theme.mutedText }]}>Values shown in {unit}</Text>
      </AppCard>
    </Pressable>
  );
}

function QuickLogSection() {
  return (
    <AppSection subtitle="Capture context now, then add detail when ready." title="Symptoms and notes">
      <View style={styles.rowStack}>
        <ActionRow description="Record what you noticed and when it started." icon="health" label="Log a symptom" route="/health/general/notes" />
        <ActionRow description="Save a private note for your own reference." icon="edit" label="Add a health note" route="/health/general/notes" />
      </View>
    </AppSection>
  );
}

function ActionRow({ description, icon, label, route }: { description: string; icon: AppIconName; label: string; route: Href }) {
  const { theme } = useAppTheme();
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push(route)} style={({ pressed }) => [styles.actionRow, { backgroundColor: theme.surface, borderColor: theme.border }, pressed ? styles.pressed : null]}>
      <View style={styles.rowIcon}><AppIcon color={ACCENT} decorative name={icon} size={20} /></View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, { color: theme.text }]}>{label}</Text>
        <Text style={[styles.rowDescription, { color: theme.mutedText }]}>{description}</Text>
      </View>
      <Text style={[styles.chevron, { color: ACCENT }]}>{">"}</Text>
    </Pressable>
  );
}

function RecordsShortcut({ records }: { records: RecordsOverviewSummary | null }) {
  const { theme } = useAppTheme();
  const recordCount = records?.recentRecords.length ?? 0;
  const appointmentCount = records?.recentVisits.length ?? 0;
  return (
    <AppSection subtitle="Documents, appointments, results and follow-ups." title="Health records">
      <Pressable accessibilityRole="button" onPress={() => router.push("/records" as Href)}>
        <AppCard style={[styles.recordsCard, { borderColor: theme.border }]}>
          <View style={styles.recordsIcon}><AppIcon color="#6d28d9" decorative name="records" size={23} /></View>
          <View style={styles.recordsCopy}>
            <Text style={[styles.recordsTitle, { color: theme.text }]}>Your records in one place</Text>
            <Text style={[styles.recordsBody, { color: theme.mutedText }]}>
              {recordCount || appointmentCount ? `${recordCount} recent records | ${appointmentCount} appointments` : "Add your first document or appointment to build a useful history."}
            </Text>
          </View>
          <Text style={styles.recordsAction}>Open</Text>
        </AppCard>
      </Pressable>
    </AppSection>
  );
}

function ConnectedRealms({ data }: { data: RealmData }) {
  return (
    <AppSection subtitle="A quick summary from the areas connected to Health." title="Connected realms">
      <View style={styles.connectedGrid}>
        <ConnectedCard
          accent="#b45309"
          detail={data.nutrition?.foodLogCount ? `${data.nutrition.foodLogCount} meals | ${Math.round(data.nutrition.waterMl)} ml water` : "Log a meal or water next"}
          icon="nutrition"
          label="Nutrition"
          route="/food"
          value={data.nutrition?.calories ? `${Math.round(data.nutrition.calories)} kcal` : "No meals yet"}
        />
        <ConnectedCard
          accent="#2563eb"
          detail={data.fitness?.workoutsThisWeek ? `${data.fitness.workoutsThisWeek} workouts this week` : "Start with a short movement"}
          icon="fitness"
          label="Fitness"
          route="/fitness"
          value={data.fitness?.activeMinutesToday ? `${data.fitness.activeMinutesToday} active min` : "No activity yet"}
        />
        <ConnectedCard
          accent="#7c3aed"
          detail={data.medication?.totalCount ? `${data.medication.takenCount} of ${data.medication.totalCount} taken today` : "Add medication only when needed"}
          icon="medication"
          label="Medication"
          route="/medication"
          value={data.medication?.dueCount ? `${data.medication.dueCount} due` : "Nothing due"}
        />
      </View>
    </AppSection>
  );
}

function ConnectedCard({ accent, detail, icon, label, route, value }: { accent: string; detail: string; icon: AppIconName; label: string; route: Href; value: string }) {
  const { theme } = useAppTheme();
  return (
    <Pressable accessibilityLabel={`${label}, ${value}, ${detail}`} accessibilityRole="button" onPress={() => router.push(route)} style={({ pressed }) => [styles.connectedCard, { backgroundColor: theme.surface, borderColor: theme.border }, pressed ? styles.pressed : null]}>
      <View style={[styles.connectedIcon, { backgroundColor: `${accent}18` }]}><AppIcon color={accent} decorative name={icon} size={20} /></View>
      <Text style={[styles.connectedLabel, { color: theme.mutedText }]}>{label}</Text>
      <Text style={[styles.connectedValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.connectedDetail, { color: theme.mutedText }]}>{detail}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionRow: { alignItems: "center", borderRadius: 22, borderWidth: 1, flexDirection: "row", gap: 12, minHeight: 82, padding: 14 },
  chart: { alignItems: "flex-end", flexDirection: "row", gap: 7, height: 128, marginTop: 4 },
  chartColumn: { alignItems: "center", flex: 1, gap: 5 },
  chartFill: { backgroundColor: ACCENT_BRIGHT, borderRadius: 999, bottom: 0, position: "absolute", width: "100%" },
  chartLabel: { fontSize: 10, fontWeight: "800" },
  chartTrack: { borderRadius: 999, height: 76, overflow: "hidden", position: "relative", width: 12 },
  chartUnit: { fontSize: 9, fontWeight: "800" },
  chevron: { fontSize: 18, fontWeight: "900" },
  connectedCard: { borderRadius: 22, borderWidth: 1, flexBasis: "46%", flexGrow: 1, minHeight: 164, padding: 14 },
  connectedDetail: { fontSize: 11, lineHeight: 16, marginTop: 6 },
  connectedGrid: { flexDirection: "row", flexWrap: "wrap", gap: 11 },
  connectedIcon: { alignItems: "center", borderRadius: 14, height: 40, justifyContent: "center", width: 40 },
  connectedLabel: { fontSize: 11, fontWeight: "900", marginTop: 12, textTransform: "uppercase" },
  connectedValue: { fontSize: 16, fontWeight: "900", marginTop: 5 },
  hero: { backgroundColor: "#06231c", borderColor: "#0f766e", borderWidth: 1, overflow: "hidden", padding: 20 },
  heroAction: { alignItems: "center", borderColor: "rgba(255,255,255,0.20)", borderRadius: 999, borderWidth: 1, flexDirection: "row", gap: 7, minHeight: 46, paddingHorizontal: 16 },
  heroActionPrimary: { backgroundColor: ACCENT_BRIGHT, borderColor: ACCENT_BRIGHT },
  heroActionText: { color: "#f0fdfa", fontSize: 13, fontWeight: "900" },
  heroActionTextPrimary: { color: "#06231c" },
  heroActions: { flexDirection: "row", flexWrap: "wrap", gap: 9, marginTop: 20 },
  heroBody: { color: "#b9d8d1", lineHeight: 20, marginTop: 8, maxWidth: 290 },
  heroCopy: { flex: 1, minWidth: 180 },
  heroGlowOne: { backgroundColor: "rgba(45,212,191,0.16)", borderRadius: 999, height: 190, position: "absolute", right: -80, top: -100, width: 190 },
  heroGlowTwo: { backgroundColor: "rgba(96,165,250,0.09)", borderRadius: 999, bottom: -100, height: 190, left: -70, position: "absolute", width: 190 },
  heroKicker: { color: "#99f6e4", fontSize: 11, fontWeight: "900", letterSpacing: 1.1, textTransform: "uppercase" },
  heroTitle: { color: "#f0fdfa", fontSize: 27, fontWeight: "900", lineHeight: 32, marginTop: 8 },
  heroTop: { alignItems: "center", flexDirection: "row", gap: 14 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  rangePill: { backgroundColor: "rgba(15,118,110,0.11)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  rangeText: { color: ACCENT, fontSize: 10, fontWeight: "900" },
  recordsAction: { color: "#6d28d9", fontSize: 12, fontWeight: "900" },
  recordsBody: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  recordsCard: { alignItems: "center", borderWidth: 1, flexDirection: "row", gap: 12 },
  recordsCopy: { flex: 1 },
  recordsIcon: { alignItems: "center", backgroundColor: "#ede9fe", borderRadius: 17, height: 48, justifyContent: "center", width: 48 },
  recordsTitle: { fontSize: 16, fontWeight: "900" },
  rowCopy: { flex: 1 },
  rowDescription: { fontSize: 12, lineHeight: 18, marginTop: 3 },
  rowIcon: { alignItems: "center", backgroundColor: "rgba(15,118,110,0.11)", borderRadius: 16, height: 44, justifyContent: "center", width: 44 },
  rowStack: { gap: 10 },
  rowTitle: { fontSize: 15, fontWeight: "900" },
  safetyNote: { alignItems: "flex-start", borderLeftColor: ACCENT, borderLeftWidth: 3, flexDirection: "row", gap: 9, paddingHorizontal: 13 },
  safetyText: { color: "#64748b", flex: 1, fontSize: 12, lineHeight: 19 },
  scoreLabel: { color: "#99f6e4", fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  scoreRing: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(94,234,212,0.28)", borderRadius: 999, borderWidth: 8, height: 104, justifyContent: "center", width: 104 },
  scoreValue: { color: "#f0fdfa", fontSize: 22, fontWeight: "900" },
  stack: { gap: 26 },
  trendCard: { borderWidth: 1, gap: 12, padding: 16 },
  trendHeader: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" },
  trendLabel: { fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  trendStack: { gap: 12 },
  trendSummary: { fontSize: 17, fontWeight: "900", marginTop: 4 },
  unitLabel: { fontSize: 10, textAlign: "right" },
  vitalCard: { borderRadius: 22, borderWidth: 1, flexBasis: "46%", flexGrow: 1, minHeight: 156, padding: 14 },
  vitalDetail: { fontSize: 10, lineHeight: 15, marginTop: 5 },
  vitalIcon: { alignItems: "center", backgroundColor: "rgba(15,118,110,0.11)", borderRadius: 14, height: 38, justifyContent: "center", width: 38 },
  vitalLabel: { fontSize: 11, fontWeight: "900", marginTop: 11, textTransform: "uppercase" },
  vitalValue: { fontSize: 18, fontWeight: "900", marginTop: 5 },
  vitalsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 11 }
});
