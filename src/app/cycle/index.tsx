import {
  Href,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  DateWheelPicker,
  NumberWheelPicker,
  PresetChipGroup,
  QuickLogBottomSheet,
  QuickNoteField,
  QuickSaveButton,
} from "@/components/fitness/QuickWorkoutInputs";
import {
  HealthDonutChart,
  HealthMiniLineChart,
  HealthProgressRing,
} from "@/components/health/HealthHubCharts";
import { AppMainLayout } from "@/components/layout/AppMainLayout";
import {
  FloatingAssistantButton,
  FloatingBottomNav,
} from "@/components/navigation";
import {
  AppButton,
  AppCard,
  AppChip,
  AppIcon,
  AppSection,
} from "@/components/ui";
import { lightImpact, successImpact } from "@/lib/haptics";
import {
  calculatePregnancyWeekSummary,
  getPregnancyProfile,
} from "@/lib/pregnancyStorage";
import {
  archiveContraceptionMethod,
  calculateCycleEstimate,
  createContraceptionLog,
  createContraceptionMethod,
  createMoodEnergyLog,
  createPeriodLog,
  createSymptomLog,
  enableWomensHealth,
  getCalendarHaloOverlaysForDateRange,
  getContraceptionLogs,
  getContraceptionMethodLabel,
  getContraceptionMethods,
  getCycleProfile,
  getMoodEnergyLogs,
  getPeriodLogs,
  getSymptomLogs,
  getTrustedHealthContentCards,
  getWomensHealthSettings,
  getWomensHealthSharePermissions,
  getWomensHealthTodaySummary,
  saveCycleProfile,
  saveWomensHealthSettings,
  saveWomensHealthSharePermission,
} from "@/lib/womensHealthStorage";
import type {
  CalendarHaloOverlay,
  ContraceptionEventType,
  ContraceptionLog,
  ContraceptionMethod,
  ContraceptionMethodType,
  CycleEstimate,
  CycleProfile,
  FlowLevel,
  MoodEnergyLog,
  PeriodLog,
  SymptomSeverity,
  TrustedHealthContentCard,
  WomensHealthSettings,
  WomensHealthSharePermission,
  WomensHealthTodaySummary,
  WomensSymptomLog,
} from "@/types/womensHealth";
import type {
  PregnancyProfile,
  PregnancyWeekSummary,
} from "@/types/pregnancy";
import {
  healthRealmAccents,
  realmAccentWithOpacity,
} from "@/theme/healthTheme";
import { useAppTheme } from "@/theme/ThemeProvider";

type WomensHealthTab =
  | "today"
  | "calendar"
  | "log"
  | "cycle"
  | "contraception"
  | "reports"
  | "learn"
  | "privacy";
type SheetMode =
  | "period"
  | "symptoms"
  | "mood"
  | "discharge"
  | "ovulation_test"
  | "pregnancy_test"
  | "contraception_log"
  | "contraception_method"
  | null;

const TABS: Array<{ key: WomensHealthTab; label: string }> = [
  { key: "today", label: "Today" },
  { key: "calendar", label: "Calendar" },
  { key: "log", label: "Log" },
  { key: "cycle", label: "Cycle" },
  { key: "contraception", label: "Contraception" },
  { key: "reports", label: "Reports" },
  { key: "learn", label: "Learn" },
  { key: "privacy", label: "Privacy" },
];

const FLOW_OPTIONS: FlowLevel[] = ["spotting", "light", "medium", "heavy"];
const CRAMP_OPTIONS = [
  { label: "None", value: 0 },
  { label: "Mild", value: 2 },
  { label: "Moderate", value: 5 },
  { label: "Severe", value: 8 },
];
const SYMPTOMS = [
  "Cramps",
  "Headache",
  "Bloating",
  "Breast tenderness",
  "Back pain",
  "Acne / skin",
  "Cravings",
  "Nausea",
  "Fatigue",
  "Sleep change",
  "Mood change",
  "Discharge",
  "Other",
];
const MOODS = [
  "Calm",
  "Happy",
  "Sad",
  "Irritable",
  "Stressed",
  "Anxious",
  "Emotional",
  "Motivated",
  "Other",
];
const ENERGY = ["Very low", "Low", "Okay", "Good", "Great"];
const DISCHARGE = [
  "Dry",
  "Sticky",
  "Creamy",
  "Watery",
  "Egg-white",
  "Unusual",
  "Notes",
];
const TEST_RESULTS = ["positive", "negative", "invalid", "unsure"];
const CONTRACEPTION_METHODS: Array<{
  key: ContraceptionMethodType;
  label: string;
}> = [
  { key: "combined_pill", label: "Daily combined pill" },
  { key: "progestogen_only_pill", label: "Progestogen-only pill / mini pill" },
  { key: "patch", label: "Patch" },
  { key: "vaginal_ring", label: "Vaginal ring" },
  { key: "injection", label: "Injection" },
  { key: "implant", label: "Implant / matchstick" },
  { key: "copper_iud", label: "IUD / copper coil" },
  { key: "hormonal_ius", label: "IUS / hormonal coil" },
  {
    key: "emergency_contraception_note",
    label: "Emergency contraception note",
  },
  { key: "barrier", label: "Condom / barrier note" },
  { key: "other", label: "Other" },
];
const CONTRACEPTION_EVENTS: Array<{
  key: ContraceptionEventType;
  label: string;
}> = [
  { key: "taken", label: "Taken / done" },
  { key: "missed", label: "Missed" },
  { key: "late", label: "Late" },
  { key: "due", label: "Due" },
  { key: "replaced", label: "Replaced" },
  { key: "removed", label: "Removed" },
  { key: "inserted", label: "Inserted" },
  { key: "user_noted", label: "Note" },
];
const TODAY = new Date().toISOString().slice(0, 10);

const SAFETY_TEXT =
  "Women’s Health tracking is for organization and education only. It is not medical advice and does not replace a doctor, nurse, clinic, pharmacist, or healthcare professional.";
const ESTIMATE_TEXT =
  "Cycle, period, ovulation, and fertile-window estimates are based on your logs and may be inaccurate. Do not rely on this app to prevent pregnancy.";
const CONTRACEPTION_TEXT =
  "Contraception tracking helps you organize reminders, dates, and notes. Always follow your product leaflet, prescription label, clinic guidance, or healthcare professional’s advice.";
const FOOD_TEXT =
  "Most everyday foods do not cancel contraception. Some medicines, herbal supplements, vomiting, diarrhoea, or missed/late doses may affect certain contraception methods. Check your leaflet or speak to a healthcare professional if unsure.";

type RealmData = {
  estimate: CycleEstimate | null;
  profile: CycleProfile | null;
  settings: WomensHealthSettings | null;
  summary: WomensHealthTodaySummary | null;
  periods: PeriodLog[];
  symptoms: WomensSymptomLog[];
  moods: MoodEnergyLog[];
  methods: ContraceptionMethod[];
  contraceptionLogs: ContraceptionLog[];
  shares: WomensHealthSharePermission[];
  learnCards: TrustedHealthContentCard[];
  overlays: CalendarHaloOverlay[];
  pregnancyProfile: PregnancyProfile | null;
  pregnancyWeek: PregnancyWeekSummary | null;
};

const EMPTY_DATA: RealmData = {
  contraceptionLogs: [],
  estimate: null,
  learnCards: [],
  methods: [],
  moods: [],
  overlays: [],
  periods: [],
  pregnancyProfile: null,
  pregnancyWeek: null,
  profile: null,
  settings: null,
  shares: [],
  summary: null,
  symptoms: [],
};

export default function WomensHealthScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<WomensHealthTab>(
    toTab(params.tab),
  );
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [toast, setToast] = useState("");
  const [data, setData] = useState<RealmData>(EMPTY_DATA);

  const loadRealm = useCallback(async () => {
    const monthStart = startOfMonth(new Date(`${selectedDate}T12:00:00`));
    const monthEnd = endOfMonth(new Date(`${selectedDate}T12:00:00`));
    const [
      settings,
      profile,
      estimate,
      summary,
      periods,
      symptoms,
      moods,
      methods,
      contraceptionLogs,
      shares,
      learnCards,
      overlays,
      pregnancyProfile,
      pregnancyWeek,
    ] = await Promise.all([
      getWomensHealthSettings(),
      getCycleProfile(),
      calculateCycleEstimate(),
      getWomensHealthTodaySummary(),
      getPeriodLogs(),
      getSymptomLogs(),
      getMoodEnergyLogs(),
      getContraceptionMethods(),
      getContraceptionLogs(),
      getWomensHealthSharePermissions(),
      getTrustedHealthContentCards(),
      getCalendarHaloOverlaysForDateRange(monthStart, monthEnd),
      getPregnancyProfile(),
      calculatePregnancyWeekSummary(),
    ]);

    setData({
      contraceptionLogs,
      estimate,
      learnCards,
      methods,
      moods,
      overlays,
      periods,
      pregnancyProfile,
      pregnancyWeek,
      profile,
      settings,
      shares,
      summary,
      symptoms,
    });
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      Promise.resolve()
        .then(loadRealm)
        .catch(() => undefined);
    }, [loadRealm]),
  );

  async function afterSaved(message: string) {
    await successImpact();
    setToast(message);
    setSheetMode(null);
    await loadRealm();
  }

  if (!data.settings?.trackingEnabled) {
    return (
      <>
        <AppMainLayout subtitle="Private optional realm" title="Women’s Health">
          <ActivationState
            onEnable={async () => {
              await enableWomensHealth();
              await loadRealm();
            }}
          />
          <Footer text={SAFETY_TEXT} />
        </AppMainLayout>
        <RealmNav />
      </>
    );
  }

  return (
    <>
      <AppMainLayout
        subtitle="Private cycle and contraception tracker"
        title="Women’s Health"
      >
        <HeaderCard data={data} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {TABS.map((tab) => (
            <Chip
              key={tab.key}
              label={tab.label}
              onPress={() => setActiveTab(tab.key)}
              selected={activeTab === tab.key}
            />
          ))}
        </ScrollView>
        {toast ? (
          <SuccessToast message={toast} onDismiss={() => setToast("")} />
        ) : null}

        {activeTab === "today" ? (
          <TodayTab
            data={data}
            onOpenSheet={setSheetMode}
            onTab={setActiveTab}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        ) : null}
        {activeTab === "calendar" ? (
          <CalendarTab
            data={data}
            onOpenSheet={setSheetMode}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        ) : null}
        {activeTab === "log" ? (
          <LogTab data={data} onOpenSheet={setSheetMode} />
        ) : null}
        {activeTab === "cycle" ? (
          <CycleTab data={data} onSaved={afterSaved} />
        ) : null}
        {activeTab === "contraception" ? (
          <ContraceptionTab
            data={data}
            onOpenSheet={setSheetMode}
            onSaved={afterSaved}
          />
        ) : null}
        {activeTab === "reports" ? (
          <ReportsTab data={data} onOpenSheet={setSheetMode} />
        ) : null}
        {activeTab === "learn" ? <LearnTab cards={data.learnCards} /> : null}
        {activeTab === "privacy" ? (
          <PrivacyTab data={data} onSaved={afterSaved} />
        ) : null}

        <Footer text={SAFETY_TEXT} />
        <Footer text={ESTIMATE_TEXT} />

        <PeriodSheet
          onClose={() => setSheetMode(null)}
          onSaved={afterSaved}
          selectedDate={selectedDate}
          visible={sheetMode === "period"}
        />
        <SymptomsSheet
          onClose={() => setSheetMode(null)}
          onSaved={afterSaved}
          selectedDate={selectedDate}
          visible={sheetMode === "symptoms"}
        />
        <MoodSheet
          onClose={() => setSheetMode(null)}
          onSaved={afterSaved}
          selectedDate={selectedDate}
          visible={sheetMode === "mood"}
        />
        <DischargeSheet
          onClose={() => setSheetMode(null)}
          onSaved={afterSaved}
          selectedDate={selectedDate}
          visible={sheetMode === "discharge"}
        />
        <TestSheet
          kind="ovulation"
          onClose={() => setSheetMode(null)}
          onSaved={afterSaved}
          selectedDate={selectedDate}
          visible={sheetMode === "ovulation_test"}
        />
        <TestSheet
          kind="pregnancy"
          onClose={() => setSheetMode(null)}
          onSaved={afterSaved}
          selectedDate={selectedDate}
          visible={sheetMode === "pregnancy_test"}
        />
        <ContraceptionLogSheet
          methods={data.methods}
          onClose={() => setSheetMode(null)}
          onSaved={afterSaved}
          visible={sheetMode === "contraception_log"}
        />
        <ContraceptionMethodSheet
          onClose={() => setSheetMode(null)}
          onSaved={afterSaved}
          visible={sheetMode === "contraception_method"}
        />
      </AppMainLayout>
      <RealmNav />
    </>
  );
}

function ActivationState({ onEnable }: { onEnable: () => void }) {
  return (
    <View style={styles.stack}>
      <AppCard style={styles.heroCard}>
        <Text style={styles.kicker}>Private and optional</Text>
        <Text style={styles.heroTitle}>
          Women’s Health is private and optional.
        </Text>
        <Text style={styles.heroBody}>
          Enable cycle, symptoms, contraception, and related notes only if you
          want to.
        </Text>
        <AppButton
          onPress={onEnable}
          style={styles.buttonTop}
          title="Enable Women’s Health"
        />
      </AppCard>
      <PremiumEmptyState
        button="Enable Women’s Health"
        message="Track cycle, symptoms, contraception, and related notes only if you choose."
        onPress={onEnable}
        title="Share nothing by default"
      />
    </View>
  );
}

function HeaderCard({ data }: { data: RealmData }) {
  const { theme } = useAppTheme();
  const summary = data.summary;
  const cycleLength = data.profile?.cycleLengthDays ?? 28;
  const progress = summary?.cycleDay
    ? Math.min(100, Math.round((summary.cycleDay / cycleLength) * 100))
    : 0;
  const pregnancyActive = data.pregnancyProfile?.status === "active";

  return (
    <AppCard
      padding="md"
      style={[
        styles.headerCard,
        {
          backgroundColor: theme.surface,
          borderColor: realmAccentWithOpacity("women", 0.42),
        },
      ]}
    >
      <View style={styles.v8HeroRow}>
        <View style={styles.v8HeroCopy}>
          <Text style={styles.headerKicker}>
            {summary?.privacyStatus ?? "Private"} WOMEN'S HEALTH
          </Text>
          <Text style={[styles.v8HeroTitle, { color: theme.text }]}>
            {pregnancyActive
              ? `Pregnancy week ${data.pregnancyWeek?.weekNumber ?? "—"}`
              : summary?.cycleDay
                ? `Cycle day ${summary.cycleDay}`
                : "Your private health space"}
          </Text>
          <Text style={[styles.v8HeroBody, { color: theme.mutedText }]}>
            {pregnancyActive
              ? `${formatValue(data.pregnancyWeek?.trimester ?? "unknown")} trimester tracking is active.`
              : summary?.nextPeriodText ??
                "Add a period start date when you are ready."}
          </Text>
        </View>
        <View style={styles.v8Ring}>
          <HealthProgressRing
            color={healthRealmAccents.women}
            progress={
              pregnancyActive
                ? Math.min(
                    100,
                    ((data.pregnancyWeek?.weekNumber ?? 0) / 40) * 100,
                  )
                : progress
            }
            size={78}
            trackColor={theme.border}
          />
          <Text style={[styles.v8RingValue, { color: theme.text }]}>
            {pregnancyActive
              ? `W${data.pregnancyWeek?.weekNumber ?? "—"}`
              : summary?.cycleDay ?? "—"}
          </Text>
        </View>
      </View>
      <View style={styles.v8HeroStats}>
        <V8HeroMetric
          label="Symptoms"
          value={`${summary?.symptomCountToday ?? 0} today`}
        />
        <V8HeroMetric
          label="Contraception"
          value={summary?.contraceptionStatus ?? "Not tracking"}
        />
        <V8HeroMetric
          label="Overlay"
          value={data.settings?.overlayEnabled ? "Private on" : "Off"}
        />
      </View>
      <View style={styles.v8ActionRow}>
        <AppChip label="Pregnancy" onPress={() => router.push("/pregnancy")} />
        <AppChip
          label="Privacy"
          onPress={() => router.push("/settings/privacy-center")}
          selected
        />
      </View>
    </AppCard>
  );
}

function V8HeroMetric({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.v8HeroMetric, { backgroundColor: theme.background }]}>
      <Text
        numberOfLines={1}
        style={[styles.v8HeroMetricValue, { color: theme.text }]}
      >
        {value}
      </Text>
      <Text style={[styles.v8HeroMetricLabel, { color: theme.mutedText }]}>
        {label}
      </Text>
    </View>
  );
}

function TodayTab({
  data,
  onOpenSheet,
  onTab,
  selectedDate,
  setSelectedDate,
}: {
  data: RealmData;
  onOpenSheet: (mode: SheetMode) => void;
  onTab: (tab: WomensHealthTab) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}) {
  return (
    <View style={styles.stack}>
      <WomensHealthSnapshot data={data} />
      <OverviewQuickActions
        onOpenSheet={onOpenSheet}
        onTab={onTab}
      />

      <CompactCalendar
        data={data}
        onOpenSheet={onOpenSheet}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      <QuickActions onOpenSheet={onOpenSheet} />
      <ContraceptionStatusCard data={data} onOpenSheet={onOpenSheet} />
      <EstimateCard
        estimate={data.estimate}
        onOpenCalendar={() => onTab("calendar")}
      />
      <ReportsPreview data={data} onOpenReports={() => onTab("reports")} />
      <PrivacyStatusCard
        settings={data.settings}
        onOpenPrivacy={() => onTab("privacy")}
      />
      <AiSuggestions />
      {data.learnCards[0] ? <LearnCard card={data.learnCards[0]} /> : null}
    </View>
  );
}

function WomensHealthSnapshot({ data }: { data: RealmData }) {
  const { theme } = useAppTheme();
  const cautionCount = data.contraceptionLogs.filter(
    (log) => log.eventType === "late" || log.eventType === "missed",
  ).length;
  const symptomTrend = data.symptoms
    .slice(0, 7)
    .reverse()
    .map((log) => severityScore(log.severity));
  const trend =
    symptomTrend.length > 1
      ? symptomTrend
      : [0, data.symptoms.length ? 1 : 0];

  return (
    <AppSection
      subtitle="Real private logs and reminders. No medical interpretation."
      title="Status snapshot"
    >
      <View style={styles.v8SnapshotGrid}>
        <AppCard padding="sm" style={styles.v8SnapshotCard}>
          <View style={styles.v8SnapshotTop}>
            <View>
              <Text style={[styles.v8SnapshotLabel, { color: theme.mutedText }]}>
                Private logs
              </Text>
              <Text style={[styles.v8SnapshotValue, { color: theme.text }]}>
                {data.periods.length + data.symptoms.length + data.moods.length}
              </Text>
            </View>
            <HealthDonutChart
              colors={[healthRealmAccents.women, theme.warning, theme.info]}
              size={52}
              trackColor={theme.border}
              values={[
                data.periods.length,
                data.symptoms.length,
                data.moods.length,
              ]}
            />
          </View>
          <Text style={[styles.v8SnapshotMeta, { color: theme.mutedText }]}>
            {data.periods.length} cycle | {data.symptoms.length} symptom |{" "}
            {data.moods.length} mood
          </Text>
        </AppCard>
        <AppCard padding="sm" style={styles.v8SnapshotCard}>
          <View style={styles.v8SnapshotTop}>
            <View>
              <Text style={[styles.v8SnapshotLabel, { color: theme.mutedText }]}>
                Symptom trend
              </Text>
              <Text style={[styles.v8SnapshotValue, { color: theme.text }]}>
                {data.symptoms.length}
              </Text>
            </View>
            <HealthMiniLineChart
              color={healthRealmAccents.women}
              data={trend}
              height={42}
              width={86}
            />
          </View>
          <Text style={[styles.v8SnapshotMeta, { color: theme.mutedText }]}>
            {cautionCount
              ? `${cautionCount} contraception reminder${cautionCount === 1 ? "" : "s"} need review.`
              : "No missed or late contraception notes."}
          </Text>
        </AppCard>
      </View>
    </AppSection>
  );
}

function OverviewQuickActions({
  onOpenSheet,
  onTab,
}: {
  onOpenSheet: (mode: SheetMode) => void;
  onTab: (tab: WomensHealthTab) => void;
}) {
  return (
    <AppSection
      subtitle="Open existing private logs, routes, and settings."
      title="Quick actions"
    >
      <View style={styles.v8ActionRow}>
        <AppChip
          label="Log period"
          onPress={() => onOpenSheet("period")}
          selected
        />
        <AppChip label="Log symptom" onPress={() => onOpenSheet("symptoms")} />
        <AppChip label="Contraception" onPress={() => onTab("contraception")} />
        <AppChip label="Calendar" onPress={() => onTab("calendar")} />
        <AppChip
          label="Pregnancy update"
          onPress={() => router.push("/pregnancy")}
        />
        <AppChip label="Records" onPress={() => router.push("/records")} />
        <AppChip label="Privacy" onPress={() => onTab("privacy")} />
      </View>
    </AppSection>
  );
}

function CalendarTab({
  data,
  onOpenSheet,
  selectedDate,
  setSelectedDate,
}: {
  data: RealmData;
  onOpenSheet: (mode: SheetMode) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}) {
  const selectedOverlays = data.overlays.filter(
    (overlay) => overlay.date === selectedDate,
  );
  return (
    <View style={styles.stack}>
      <AppSection
        title="Compact calendar"
        subtitle="Private overlays stay inside Women’s Health unless shared."
      />
      <CompactCalendar
        data={data}
        onOpenSheet={onOpenSheet}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        variant="month"
      />
      <AppCard style={styles.darkCard}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.darkTitle}>Selected date</Text>
            <Text style={styles.darkMuted}>{selectedDate}</Text>
          </View>
          <GhostButton
            label="Full Calendar"
            onPress={() => router.push("/calendar" as Href)}
          />
        </View>
        {selectedOverlays.length ? (
          <View style={styles.overlayList}>
            {selectedOverlays.map((overlay) => (
              <OverlayPill key={overlay.id} overlay={overlay} />
            ))}
          </View>
        ) : (
          <Text style={styles.darkMuted}>
            No private overlay for this date.
          </Text>
        )}
      </AppCard>
      <QuickActions onOpenSheet={onOpenSheet} />
      <Footer text={ESTIMATE_TEXT} />
    </View>
  );
}

function LogTab({
  data,
  onOpenSheet,
}: {
  data: RealmData;
  onOpenSheet: (mode: SheetMode) => void;
}) {
  return (
    <View style={styles.stack}>
      <AppSection
        title="Quick logging"
        subtitle="Fast chips and optional notes. Everything stays private by default."
      />
      <QuickActions onOpenSheet={onOpenSheet} />
      <View style={styles.metricGrid}>
        <MetricCard label="Period logs" value={`${data.periods.length}`} />
        <MetricCard label="Symptom logs" value={`${data.symptoms.length}`} />
        <MetricCard label="Mood logs" value={`${data.moods.length}`} />
        <MetricCard
          label="Contraception notes"
          value={`${data.contraceptionLogs.length}`}
        />
      </View>
      <LogList data={data} />
    </View>
  );
}

function CycleTab({
  data,
  onSaved,
}: {
  data: RealmData;
  onSaved: (message: string) => void;
}) {
  const [lastPeriodStartDate, setLastPeriodStartDate] = useState(
    data.profile?.lastPeriodStartDate ?? TODAY,
  );
  const [cycleLengthDays, setCycleLengthDays] = useState(
    data.profile?.cycleLengthDays ?? 28,
  );
  const [periodLengthDays, setPeriodLengthDays] = useState(
    data.profile?.periodLengthDays ?? 5,
  );

  async function save() {
    await saveCycleProfile({
      cycleLengthDays,
      lastPeriodStartDate,
      periodLengthDays,
    });
    await onSaved("Cycle settings saved");
  }

  return (
    <View style={styles.stack}>
      <AppSection
        title="Cycle setup"
        subtitle="Estimates remain cautious and editable."
      />
      <EstimateCard estimate={data.estimate} />
      <AppCard style={styles.darkCard}>
        <Text style={styles.darkTitle}>Cycle basics</Text>
        <Text style={styles.inputLabel}>Last period start</Text>
        <DateWheelPicker
          onChange={setLastPeriodStartDate}
          value={lastPeriodStartDate}
        />
        <Text style={styles.inputLabel}>Average cycle length</Text>
        <PresetChipGroup
          onSelect={setCycleLengthDays}
          presets={[24, 26, 28, 30, 32]}
          selectedValue={cycleLengthDays}
          suffix=" days"
        />
        <NumberWheelPicker
          max={60}
          min={18}
          onChange={setCycleLengthDays}
          suffix=" days"
          value={cycleLengthDays}
        />
        <Text style={styles.inputLabel}>Average period length</Text>
        <PresetChipGroup
          onSelect={setPeriodLengthDays}
          presets={[3, 4, 5, 6, 7]}
          selectedValue={periodLengthDays}
          suffix=" days"
        />
        <NumberWheelPicker
          max={14}
          min={1}
          onChange={setPeriodLengthDays}
          suffix=" days"
          value={periodLengthDays}
        />
        <QuickSaveButton onPress={save} title="Save cycle settings" />
      </AppCard>
      <Footer text={ESTIMATE_TEXT} />
    </View>
  );
}

function ContraceptionTab({
  data,
  onOpenSheet,
  onSaved,
}: {
  data: RealmData;
  onOpenSheet: (mode: SheetMode) => void;
  onSaved: (message: string) => void;
}) {
  const cautionLogs = data.contraceptionLogs.filter(
    (log) => log.eventType === "missed" || log.eventType === "late",
  );
  return (
    <View style={styles.stack}>
      <AppSection
        title="Contraception"
        subtitle="Reminders, dates, and notes only. No decisions or instructions."
      />
      {!data.methods.length ? (
        <PremiumEmptyState
          button="Add method"
          message="Set reminders for pills, injections, implants, patches, rings, IUDs, or other methods."
          onPress={() => onOpenSheet("contraception_method")}
          title="Add contraception tracking"
        />
      ) : null}
      <View style={styles.actionRow}>
        <AppButton
          onPress={() => onOpenSheet("contraception_method")}
          title="Add method"
        />
        <GhostButton
          label="Log event"
          onPress={() => onOpenSheet("contraception_log")}
        />
      </View>
      {data.methods.map((method) => (
        <AppCard key={method.id} style={styles.methodCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.darkTitle}>{method.name}</Text>
              <Text style={styles.darkMuted}>
                {getContraceptionMethodLabel(method.methodType)}
              </Text>
            </View>
            <PrivacyBadge label="Private" />
          </View>
          <View style={styles.metricGrid}>
            <MetricCard
              label="Next reminder"
              value={
                method.nextDueAt
                  ? method.nextDueAt.slice(0, 10)
                  : "Set up when ready"
              }
            />
            <MetricCard
              label="Reminder"
              value={
                method.reminderEnabled ? (method.reminderTime ?? "On") : "Off"
              }
            />
          </View>
          {method.foodTimingNote ? (
            <CautionCard text="Confirm timing matches the label or healthcare professional’s instructions." />
          ) : null}
          <Text style={styles.darkMuted}>
            {method.notes ||
              "Add notes from the product leaflet, clinic, or label when helpful."}
          </Text>
          <View style={styles.actionRow}>
            <GhostButton
              label="Mark taken"
              onPress={() => logContraception(method.id, "taken", onSaved)}
            />
            <GhostButton
              label="Mark missed"
              onPress={() => logContraception(method.id, "missed", onSaved)}
            />
            <GhostButton
              label="Archive"
              onPress={async () => {
                await archiveContraceptionMethod(method.id);
                await onSaved("Method archived");
              }}
            />
          </View>
        </AppCard>
      ))}
      {cautionLogs.length ? (
        <CautionCard text="This may need professional confirmation. Check your product leaflet or ask a pharmacist, doctor, nurse, clinic, or healthcare professional." />
      ) : null}
      <Footer text={CONTRACEPTION_TEXT} />
      <Footer text={FOOD_TEXT} />
    </View>
  );
}

function ReportsTab({
  data,
  onOpenSheet,
}: {
  data: RealmData;
  onOpenSheet: (mode: SheetMode) => void;
}) {
  if (
    !data.periods.length &&
    !data.symptoms.length &&
    !data.moods.length &&
    !data.contraceptionLogs.length
  ) {
    return (
      <View style={styles.stack}>
        <PremiumEmptyState
          button="Add log"
          message="Log cycle, symptoms, mood, or contraception notes to see trends."
          onPress={() => onOpenSheet("period")}
          title="Reports will appear here"
        />
        <Footer text={SAFETY_TEXT} />
      </View>
    );
  }

  const periodStarts = data.periods.filter(
    (log) => log.flowLevel !== "none",
  ).length;
  const symptomTypes = new Set(data.symptoms.map((log) => log.symptom)).size;
  const lateOrMissed = data.contraceptionLogs.filter(
    (log) => log.eventType === "late" || log.eventType === "missed",
  ).length;

  return (
    <View style={styles.stack}>
      <AppSection
        title="Reports"
        subtitle="Patterns are based on your logs and stay non-medical."
      />
      <View style={styles.metricGrid}>
        <MetricCard label="Cycle logs" value={`${periodStarts}`} />
        <MetricCard label="Symptoms tracked" value={`${symptomTypes}`} />
        <MetricCard label="Mood logs" value={`${data.moods.length}`} />
        <MetricCard label="Missed / late notes" value={`${lateOrMissed}`} />
      </View>
      <ChartCard
        title="Flow summary"
        values={FLOW_OPTIONS.map(
          (flow) =>
            data.periods.filter((log) => log.flowLevel === flow).length /
            Math.max(1, data.periods.length),
        )}
      />
      <ChartCard
        title="Mood / energy trend"
        values={data.moods.slice(0, 8).map((log) => (log.energyLevel ?? 3) / 5)}
      />
      <ChartCard
        title="Symptoms over time"
        values={data.symptoms
          .slice(0, 8)
          .map((log) => severityScore(log.severity) / 3)}
      />
      <CautionCard text="You may want to discuss patterns with a healthcare professional if concerned." />
    </View>
  );
}

function LearnTab({ cards }: { cards: TrustedHealthContentCard[] }) {
  return (
    <View style={styles.stack}>
      <AppSection title="Learn" subtitle="Trusted source cards only." />
      {cards.length ? (
        cards.map((card) => <LearnCard card={card} key={card.id} />)
      ) : (
        <PremiumEmptyState
          message="No trusted source has been added for this topic yet."
          title="No trusted source saved"
        />
      )}
    </View>
  );
}

function PrivacyTab({
  data,
  onSaved,
}: {
  data: RealmData;
  onSaved: (message: string) => void;
}) {
  const shareCategories: WomensHealthSharePermission["category"][] = [
    "summary",
    "calendar_overlay",
    "period_logs",
    "symptoms",
    "mood_energy",
    "contraception",
    "reports",
  ];
  return (
    <View style={styles.stack}>
      <AppSection title="Privacy" subtitle="Share nothing by default." />
      <AppCard style={styles.darkCard}>
        <Text style={styles.darkTitle}>
          Women’s Health is private by default.
        </Text>
        <Text style={styles.darkMuted}>
          You choose exactly what to share. Caregiver access is hidden unless
          explicitly selected.
        </Text>
        <View style={styles.metricGrid}>
          <MetricCard
            label="Partner"
            value={data.settings?.sharedWithPartner ? "Shared selected" : "Off"}
          />
          <MetricCard
            label="Family"
            value={data.settings?.sharedWithFamily ? "Shared selected" : "Off"}
          />
          <MetricCard
            label="Caregiver"
            value={
              data.settings?.sharedWithCaregiver ? "Shared selected" : "Off"
            }
          />
          <MetricCard
            label="Overlay"
            value={data.settings?.overlayEnabled ? "Private on" : "Off"}
          />
        </View>
        <View style={styles.actionRow}>
          <GhostButton
            label={
              data.settings?.overlayEnabled ? "Hide overlay" : "Show overlay"
            }
            onPress={async () => {
              await saveWomensHealthSettings({
                overlayEnabled: !data.settings?.overlayEnabled,
              });
              await onSaved("Privacy updated");
            }}
          />
        </View>
      </AppCard>
      {shareCategories.map((category) => (
        <AppCard key={category} style={styles.privacyCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.privacyTitle}>{formatValue(category)}</Text>
              <Text style={styles.privacyBody}>
                Currently private unless you save selected access.
              </Text>
            </View>
            <GhostButton
              label="Keep private"
              onPress={async () => {
                await saveWomensHealthSharePermission({
                  category,
                  permissionLevel: "none",
                  profileId: "local-profile",
                  viewerType: "selected",
                });
                await onSaved("Sharing setting saved");
              }}
            />
          </View>
        </AppCard>
      ))}
      <Footer text="This information is private. Share selected details only if you choose." />
    </View>
  );
}

function CompactCalendar({
  data,
  onOpenSheet,
  selectedDate,
  setSelectedDate,
  variant = "week",
}: {
  data: RealmData;
  onOpenSheet: (mode: SheetMode) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  variant?: "week" | "month";
}) {
  const days = useMemo(
    () =>
      variant === "week"
        ? getWeekDays(new Date(`${selectedDate}T12:00:00`))
        : getMonthPreview(new Date(`${selectedDate}T12:00:00`)),
    [selectedDate, variant],
  );
  return (
    <AppCard style={styles.calendarCard}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.darkTitle}>Calendar</Text>
          <Text style={styles.darkMuted}>
            Tap a date to log. Halos are estimates or logs.
          </Text>
        </View>
        <GhostButton
          label="Open full"
          onPress={() => router.push("/calendar" as Href)}
        />
      </View>
      <View style={styles.calendarGrid}>
        {days.map((date) => {
          const dateKey = toDateKey(date);
          const overlays = data.overlays.filter(
            (overlay) => overlay.date === dateKey,
          );
          const isSelected = dateKey === selectedDate;
          return (
            <Pressable
              accessibilityLabel={`${dateKey}. ${overlays.map((overlay) => overlay.label).join(", ") || "No Women’s Health overlay"}`}
              accessibilityRole="button"
              key={dateKey}
              onPress={async () => {
                await lightImpact();
                setSelectedDate(dateKey);
                onOpenSheet("period");
              }}
              style={[
                styles.dayCell,
                isSelected ? styles.dayCellSelected : null,
              ]}
            >
              <DayHalos overlays={overlays} selected={isSelected} />
              <Text
                style={[
                  styles.dayText,
                  isSelected ? styles.dayTextSelected : null,
                ]}
              >
                {date.getDate()}
              </Text>
              <View style={styles.dayDots}>
                {overlays.slice(0, 3).map((overlay) => (
                  <View
                    key={overlay.id}
                    style={[styles.dayDot, { backgroundColor: overlay.color }]}
                  />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
      <OverlayLegend />
    </AppCard>
  );
}

function DayHalos({
  overlays,
  selected,
}: {
  overlays: CalendarHaloOverlay[];
  selected: boolean;
}) {
  const haloOverlays = overlays.filter((overlay) =>
    [
      "period_logged",
      "period_predicted",
      "fertile_window_estimate",
      "ovulation_estimate",
      "contraception_caution",
    ].includes(overlay.type),
  );
  if (!haloOverlays.length) return null;
  return (
    <View pointerEvents="none" style={styles.haloLayer}>
      {haloOverlays.slice(0, 2).map((overlay, index) => (
        <View
          key={overlay.id}
          style={[
            styles.haloRing,
            {
              borderColor: overlay.color,
              height: 46 - index * 8,
              width: 46 - index * 8,
              opacity: selected ? 1 : 0.72,
            },
          ]}
        />
      ))}
      {overlays.length > 1 ? (
        <View style={styles.profileMarker}>
          <Text style={styles.profileMarkerText}>
            {overlays.length > 2 ? "+" : "WH"}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function QuickActions({
  onOpenSheet,
}: {
  onOpenSheet: (mode: SheetMode) => void;
}) {
  const actions: Array<{ icon: string; label: string; mode: SheetMode }> = [
    { icon: "calendar_timeline", label: "Log Period", mode: "period" },
    { icon: "warning", label: "Symptoms", mode: "symptoms" },
    { icon: "mind", label: "Mood / Energy", mode: "mood" },
    { icon: "water", label: "Discharge", mode: "discharge" },
    {
      icon: "contraception",
      label: "Contraception",
      mode: "contraception_log",
    },
    { icon: "pregnancy", label: "Pregnancy Test", mode: "pregnancy_test" },
  ];
  return (
    <View style={styles.quickGrid}>
      {actions.map((action) => (
        <Pressable
          accessibilityLabel={action.label}
          accessibilityRole="button"
          key={action.label}
          onPress={() => onOpenSheet(action.mode)}
          style={styles.quickAction}
        >
          <AppIcon
            color="#f9a8d4"
            decorative
            name={action.icon as never}
            size={22}
          />
          <Text style={styles.quickText}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function ContraceptionStatusCard({
  data,
  onOpenSheet,
}: {
  data: RealmData;
  onOpenSheet: (mode: SheetMode) => void;
}) {
  const caution = data.contraceptionLogs.some(
    (log) => log.eventType === "missed" || log.eventType === "late",
  );
  return (
    <AppCard style={styles.darkCard}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.darkTitle}>Contraception</Text>
          <Text style={styles.darkMuted}>
            {data.summary?.contraceptionStatus ?? "Not tracking"}
          </Text>
        </View>
        <PrivacyBadge label="Private" />
      </View>
      {data.methods[0] ? (
        <View style={styles.metricGrid}>
          <MetricCard label="Method" value={data.methods[0].name} />
          <MetricCard
            label="Next"
            value={
              data.methods[0].nextDueAt
                ? data.methods[0].nextDueAt.slice(0, 10)
                : "Set up when ready"
            }
          />
        </View>
      ) : (
        <PremiumEmptyState
          button="Add method"
          message="Set reminders for pills, injections, implants, patches, rings, IUDs, or other methods."
          onPress={() => onOpenSheet("contraception_method")}
          title="Add contraception tracking"
        />
      )}
      {caution ? (
        <CautionCard text="This may need professional confirmation. Check your product leaflet or ask a healthcare professional." />
      ) : null}
    </AppCard>
  );
}

function EstimateCard({
  estimate,
  onOpenCalendar,
}: {
  estimate: CycleEstimate | null;
  onOpenCalendar?: () => void;
}) {
  return (
    <AppCard style={styles.estimateCard}>
      <Text style={styles.estimateTitle}>Upcoming estimates</Text>
      <View style={styles.metricGrid}>
        <MetricCard
          label="Predicted period"
          value={estimate?.nextPeriodStart ?? "No estimate"}
        />
        <MetricCard
          label="Estimated ovulation"
          value={estimate?.estimatedOvulationDate ?? "No estimate"}
        />
        <MetricCard
          label="Fertile window estimate"
          value={
            estimate?.fertileWindowStart
              ? `${estimate.fertileWindowStart} to ${estimate.fertileWindowEnd}`
              : "No estimate"
          }
        />
        <MetricCard label="Confidence" value={estimate?.confidence ?? "Low"} />
      </View>
      <Text style={styles.estimateBody}>{ESTIMATE_TEXT}</Text>
      {onOpenCalendar ? (
        <View style={styles.actionRow}>
          <GhostButton label="View calendar" onPress={onOpenCalendar} />
        </View>
      ) : null}
    </AppCard>
  );
}

function ReportsPreview({
  data,
  onOpenReports,
}: {
  data: RealmData;
  onOpenReports: () => void;
}) {
  return (
    <AppCard style={styles.darkCard}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.darkTitle}>Reports preview</Text>
          <Text style={styles.darkMuted}>
            Based on your logs, without medical interpretation.
          </Text>
        </View>
        <GhostButton label="Reports" onPress={onOpenReports} />
      </View>
      <View style={styles.metricGrid}>
        <MetricCard label="Period logs" value={`${data.periods.length}`} />
        <MetricCard label="Symptoms" value={`${data.symptoms.length}`} />
      </View>
    </AppCard>
  );
}

function PrivacyStatusCard({
  settings,
  onOpenPrivacy,
}: {
  settings: WomensHealthSettings | null;
  onOpenPrivacy: () => void;
}) {
  return (
    <AppCard style={styles.privacyCard}>
      <View style={styles.sectionHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.privacyTitle}>Privacy status</Text>
          <Text style={styles.privacyBody}>
            Women’s Health is private by default. You choose exactly what to
            share.
          </Text>
        </View>
        <GhostButton
          label={
            settings?.sharedWithPartner ||
            settings?.sharedWithFamily ||
            settings?.sharedWithCaregiver
              ? "Shared selected"
              : "Private"
          }
          onPress={onOpenPrivacy}
        />
      </View>
    </AppCard>
  );
}

function AiSuggestions() {
  const prompts = [
    "Log period",
    "Log symptoms",
    "Summarize my cycle logs",
    "Prepare questions for my doctor",
    "Add contraception note",
  ];
  return (
    <AppCard style={styles.darkCard}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.darkTitle}>AI helper</Text>
          <Text style={styles.darkMuted}>
            Creates drafts only. No diagnosis, pregnancy prediction, or
            contraception instructions.
          </Text>
        </View>
        <AppIcon color="#c4b5fd" decorative name="ai_draft" size={22} />
      </View>
      <View style={styles.promptGrid}>
        {prompts.map((prompt) => (
          <GhostButton
            key={prompt}
            label={prompt}
            onPress={() =>
              router.push(
                `/ai?mode=quick_logger&context=womens_health&prompt=${encodeURIComponent(prompt)}` as Href,
              )
            }
          />
        ))}
      </View>
    </AppCard>
  );
}

function PeriodSheet({
  onClose,
  onSaved,
  selectedDate,
  visible,
}: SheetProps & { selectedDate: string }) {
  const [date, setDate] = useState(selectedDate);
  const [flow, setFlow] = useState<FlowLevel>("medium");
  const [cramps, setCramps] = useState(0);
  const [mood, setMood] = useState("");
  const [energy, setEnergy] = useState(3);
  const [painNote, setPainNote] = useState("");
  const [medicationNote, setMedicationNote] = useState("");
  const [notes, setNotes] = useState("");

  async function save() {
    await createPeriodLog({
      crampsLevel: cramps,
      date,
      energyLevel: energy,
      flowLevel: flow,
      medicationNote,
      mood,
      notes: [painNote, notes].filter(Boolean).join(" "),
      painLevel: cramps,
    });
    await onSaved("Period log saved");
  }

  return (
    <QuickLogBottomSheet onClose={onClose} title="Log period" visible={visible}>
      <DateWheelPicker onChange={setDate} value={date} />
      <ChipRow
        options={FLOW_OPTIONS.map((item) => ({
          key: item,
          label: formatValue(item),
        }))}
        selected={flow}
        onSelect={(value) => setFlow(value as FlowLevel)}
      />
      <ChipRow
        options={CRAMP_OPTIONS.map((item) => ({
          key: String(item.value),
          label: item.label,
        }))}
        selected={String(cramps)}
        onSelect={(value) => setCramps(Number(value))}
      />
      <ChipRow
        options={MOODS.map((item) => ({ key: item, label: item }))}
        selected={mood}
        onSelect={setMood}
      />
      <PresetChipGroup
        onSelect={setEnergy}
        presets={[1, 2, 3, 4, 5]}
        selectedValue={energy}
        suffix="/5 energy"
      />
      <TextInput
        onChangeText={setPainNote}
        placeholder="Pain note optional"
        placeholderTextColor="#94a3b8"
        style={styles.darkInput}
        value={painNote}
      />
      <TextInput
        onChangeText={setMedicationNote}
        placeholder="Medication note optional"
        placeholderTextColor="#94a3b8"
        style={styles.darkInput}
        value={medicationNote}
      />
      <QuickNoteField onChangeText={setNotes} value={notes} />
      <QuickSaveButton onPress={save} title="Save period log" />
    </QuickLogBottomSheet>
  );
}

function SymptomsSheet({
  onClose,
  onSaved,
  selectedDate,
  visible,
}: SheetProps & { selectedDate: string }) {
  const [date, setDate] = useState(selectedDate);
  const [symptom, setSymptom] = useState("Cramps");
  const [severity, setSeverity] = useState<SymptomSeverity>("mild");
  const [notes, setNotes] = useState("");
  async function save() {
    await createSymptomLog({ date, notes, severity, symptom });
    await onSaved("Symptom log saved");
  }
  return (
    <QuickLogBottomSheet
      onClose={onClose}
      title="Log symptoms"
      visible={visible}
    >
      <DateWheelPicker onChange={setDate} value={date} />
      <ChipRow
        options={SYMPTOMS.map((item) => ({ key: item, label: item }))}
        selected={symptom}
        onSelect={setSymptom}
      />
      <ChipRow
        options={["mild", "moderate", "strong"].map((item) => ({
          key: item,
          label: item === "strong" ? "Severe" : formatValue(item),
        }))}
        selected={severity}
        onSelect={(value) => setSeverity(value as SymptomSeverity)}
      />
      <QuickNoteField onChangeText={setNotes} value={notes} />
      <QuickSaveButton onPress={save} title="Save symptoms" />
    </QuickLogBottomSheet>
  );
}

function MoodSheet({
  onClose,
  onSaved,
  selectedDate,
  visible,
}: SheetProps & { selectedDate: string }) {
  const [date, setDate] = useState(selectedDate);
  const [mood, setMood] = useState("Calm");
  const [energyLabel, setEnergyLabel] = useState("Okay");
  const [notes, setNotes] = useState("");
  async function save() {
    await createMoodEnergyLog({
      date,
      energyLevel: ENERGY.indexOf(energyLabel) + 1,
      mood,
      notes,
    });
    await onSaved("Mood and energy saved");
  }
  return (
    <QuickLogBottomSheet
      onClose={onClose}
      title="Log mood / energy"
      visible={visible}
    >
      <DateWheelPicker onChange={setDate} value={date} />
      <ChipRow
        options={MOODS.map((item) => ({ key: item, label: item }))}
        selected={mood}
        onSelect={setMood}
      />
      <ChipRow
        options={ENERGY.map((item) => ({ key: item, label: item }))}
        selected={energyLabel}
        onSelect={setEnergyLabel}
      />
      <QuickNoteField onChangeText={setNotes} value={notes} />
      <QuickSaveButton onPress={save} title="Save mood / energy" />
    </QuickLogBottomSheet>
  );
}

function DischargeSheet({
  onClose,
  onSaved,
  selectedDate,
  visible,
}: SheetProps & { selectedDate: string }) {
  const [date, setDate] = useState(selectedDate);
  const [discharge, setDischarge] = useState("Dry");
  const [notes, setNotes] = useState("");
  async function save() {
    await createSymptomLog({
      date,
      notes,
      severity: discharge === "Unusual" ? "moderate" : "mild",
      symptom: `Discharge: ${discharge}`,
    });
    await onSaved("Discharge note saved");
  }
  return (
    <QuickLogBottomSheet
      onClose={onClose}
      title="Log discharge"
      visible={visible}
    >
      <DateWheelPicker onChange={setDate} value={date} />
      <ChipRow
        options={DISCHARGE.map((item) => ({ key: item, label: item }))}
        selected={discharge}
        onSelect={setDischarge}
      />
      <QuickNoteField onChangeText={setNotes} value={notes} />
      <Footer text="Discharge notes are for personal tracking only. If you notice unusual smell, pain, itching, or concern, speak to a healthcare professional." />
      <QuickSaveButton onPress={save} title="Save discharge note" />
    </QuickLogBottomSheet>
  );
}

function TestSheet({
  kind,
  onClose,
  onSaved,
  selectedDate,
  visible,
}: SheetProps & { kind: "ovulation" | "pregnancy"; selectedDate: string }) {
  const [date, setDate] = useState(selectedDate);
  const [result, setResult] = useState("unsure");
  const [notes, setNotes] = useState("");
  async function save() {
    await createSymptomLog({
      date,
      notes,
      severity: "mild",
      symptom: `${kind === "pregnancy" ? "Pregnancy" : "Ovulation"} test: ${result}`,
    });
    await onSaved(
      kind === "pregnancy" && result === "positive"
        ? "Positive test note saved. Consider confirming with a healthcare professional or clinic."
        : "Test note saved",
    );
  }
  return (
    <QuickLogBottomSheet
      onClose={onClose}
      title={`Log ${kind} test`}
      visible={visible}
    >
      <DateWheelPicker onChange={setDate} value={date} />
      <ChipRow
        options={TEST_RESULTS.map((item) => ({
          key: item,
          label: formatValue(item),
        }))}
        selected={result}
        onSelect={setResult}
      />
      <QuickNoteField onChangeText={setNotes} value={notes} />
      {kind === "pregnancy" && result === "positive" ? (
        <CautionCard text="You logged a positive pregnancy test. Consider confirming with a healthcare professional or clinic." />
      ) : null}
      <QuickSaveButton onPress={save} title="Save test note" />
    </QuickLogBottomSheet>
  );
}

function ContraceptionLogSheet({
  methods,
  onClose,
  onSaved,
  visible,
}: SheetProps & { methods: ContraceptionMethod[] }) {
  const [methodId, setMethodId] = useState<string>("none");
  const [eventType, setEventType] = useState<ContraceptionEventType>("taken");
  const [notes, setNotes] = useState("");
  async function save() {
    await createContraceptionLog({
      eventAt: new Date().toISOString(),
      eventType,
      methodId: methodId === "none" ? undefined : methodId,
      notes,
    });
    await onSaved("Contraception note saved");
  }
  return (
    <QuickLogBottomSheet
      onClose={onClose}
      title="Log contraception"
      visible={visible}
    >
      <ChipRow
        options={(methods.length
          ? methods
          : [{ id: "none", name: "General note" }]
        ).map((item) => ({ key: item.id, label: item.name }))}
        selected={methodId}
        onSelect={setMethodId}
      />
      <ChipRow
        options={CONTRACEPTION_EVENTS.map((item) => ({
          key: item.key,
          label: item.label,
        }))}
        selected={eventType}
        onSelect={(value) => setEventType(value as ContraceptionEventType)}
      />
      <QuickNoteField onChangeText={setNotes} value={notes} />
      {eventType === "missed" || eventType === "late" ? (
        <CautionCard text="This may need professional confirmation. Check your product leaflet or speak to a healthcare professional." />
      ) : null}
      <QuickSaveButton onPress={save} title="Save contraception note" />
    </QuickLogBottomSheet>
  );
}

function ContraceptionMethodSheet({ onClose, onSaved, visible }: SheetProps) {
  const [methodType, setMethodType] =
    useState<ContraceptionMethodType>("combined_pill");
  const [name, setName] = useState("My method");
  const [nextDueAt, setNextDueAt] = useState(TODAY);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [notes, setNotes] = useState("");
  async function save() {
    await createContraceptionMethod({
      methodType,
      name,
      nextDueAt: `${nextDueAt}T${reminderTime}:00`,
      notes,
      reminderEnabled: true,
      reminderTime,
    });
    await onSaved("Contraception method saved");
  }
  return (
    <QuickLogBottomSheet
      onClose={onClose}
      title="Add contraception method"
      visible={visible}
    >
      <ChipRow
        options={CONTRACEPTION_METHODS.map((item) => ({
          key: item.key,
          label: item.label,
        }))}
        selected={methodType}
        onSelect={(value) => setMethodType(value as ContraceptionMethodType)}
      />
      <TextInput
        onChangeText={setName}
        placeholder="Method name or brand optional"
        placeholderTextColor="#94a3b8"
        style={styles.darkInput}
        value={name}
      />
      <DateWheelPicker onChange={setNextDueAt} value={nextDueAt} />
      <TextInput
        onChangeText={setReminderTime}
        placeholder="Reminder time, e.g. 09:00"
        placeholderTextColor="#94a3b8"
        style={styles.darkInput}
        value={reminderTime}
      />
      <QuickNoteField onChangeText={setNotes} value={notes} />
      <Footer text={CONTRACEPTION_TEXT} />
      <QuickSaveButton onPress={save} title="Save method" />
    </QuickLogBottomSheet>
  );
}

async function logContraception(
  methodId: string,
  eventType: ContraceptionEventType,
  onSaved: (message: string) => void,
) {
  await createContraceptionLog({
    eventAt: new Date().toISOString(),
    eventType,
    methodId,
  });
  await onSaved("Contraception note saved");
}

function LogList({ data }: { data: RealmData }) {
  const items = [
    ...data.periods
      .slice(0, 5)
      .map((log) => `${log.date} - ${formatValue(log.flowLevel)} flow`),
    ...data.symptoms
      .slice(0, 5)
      .map(
        (log) => `${log.date} - ${log.symptom} - ${formatValue(log.severity)}`,
      ),
    ...data.moods
      .slice(0, 5)
      .map(
        (log) =>
          `${log.date} - ${log.mood ?? "Mood"} - energy ${log.energyLevel ?? "-"}`,
      ),
    ...data.contraceptionLogs
      .slice(0, 5)
      .map(
        (log) => `${log.eventAt.slice(0, 10)} - ${formatValue(log.eventType)}`,
      ),
  ].slice(0, 12);
  return <List items={items} empty="Logs will appear here." />;
}

function OverlayLegend() {
  const items = [
    { color: "#db2777", label: "Period logged" },
    { color: "#f9a8d4", label: "Predicted period" },
    { color: "#a78bfa", label: "Fertile estimate" },
    { color: "#fbbf24", label: "Ovulation estimate" },
    { color: "#14b8a6", label: "Contraception" },
  ];
  return (
    <View style={styles.legendRow}>
      {items.map((item) => (
        <View key={item.label} style={styles.legendItem}>
          <View style={[styles.dayDot, { backgroundColor: item.color }]} />
          <Text style={styles.legendText}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

function OverlayPill({ overlay }: { overlay: CalendarHaloOverlay }) {
  return (
    <View style={styles.overlayPill}>
      <View style={[styles.dayDot, { backgroundColor: overlay.color }]} />
      <Text style={styles.overlayText}>{overlay.label}</Text>
      {overlay.isShared ? <Text style={styles.sharedText}>Shared</Text> : null}
    </View>
  );
}

function ChipRow({
  onSelect,
  options,
  selected,
}: {
  onSelect: (value: string) => void;
  options: Array<{ key: string; label: string }>;
  selected: string;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
    >
      {options.map((option) => (
        <Chip
          key={option.key}
          label={option.label}
          onPress={() => onSelect(option.key)}
          selected={selected === option.key}
        />
      ))}
    </ScrollView>
  );
}

function Chip({
  label,
  onPress,
  selected,
}: {
  label: string;
  onPress: () => void;
  selected?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected ? styles.chipSelected : null]}
    >
      <Text
        style={[styles.chipText, selected ? styles.chipTextSelected : null]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.heroMetric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <AppCard style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </AppCard>
  );
}

function ChartCard({ title, values }: { title: string; values: number[] }) {
  const normalized = values.length ? values : [0.12, 0.18, 0.1, 0.16];
  return (
    <AppCard style={styles.darkCard}>
      <Text style={styles.darkTitle}>{title}</Text>
      <View style={styles.barRow}>
        {normalized.map((value, index) => (
          <View key={`${title}-${index}`} style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { height: `${Math.max(8, Math.min(100, value * 100))}%` },
              ]}
            />
          </View>
        ))}
      </View>
      <Text style={styles.darkMuted}>
        Based on your logs. Discuss patterns with a healthcare professional if
        concerned.
      </Text>
    </AppCard>
  );
}

function LearnCard({ card }: { card: TrustedHealthContentCard }) {
  return (
    <AppCard style={styles.learnCard}>
      <Text style={styles.learnSource}>
        {card.sourceName} - Last checked {card.lastCheckedAt}
      </Text>
      <Text style={styles.learnTitle}>{card.title}</Text>
      <Text style={styles.learnBody}>{card.summary}</Text>
      <Text style={styles.learnBody}>
        Education only. Speak to a healthcare professional if unsure.
      </Text>
      <View style={styles.actionRow}>
        <GhostButton label="Open source" onPress={() => undefined} />
      </View>
    </AppCard>
  );
}

function List({ empty, items }: { empty: string; items: string[] }) {
  if (!items.length) return <Text style={styles.darkMuted}>{empty}</Text>;
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <Text key={item} style={styles.listItem}>
          {item}
        </Text>
      ))}
    </View>
  );
}

function PremiumEmptyState({
  button,
  message,
  onPress,
  title,
}: {
  button?: string;
  message: string;
  onPress?: () => void;
  title: string;
}) {
  return (
    <AppCard style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{message}</Text>
      {button && onPress ? (
        <View style={styles.actionRow}>
          <AppButton onPress={onPress} title={button} />
        </View>
      ) : null}
    </AppCard>
  );
}

function CautionCard({ text }: { text: string }) {
  return (
    <AppCard style={styles.cautionCard}>
      <Text style={styles.cautionText}>{text}</Text>
    </AppCard>
  );
}

function Footer({ text }: { text: string }) {
  return (
    <AppCard style={styles.footerCard}>
      <Text style={styles.footerText}>{text}</Text>
    </AppCard>
  );
}

function PrivacyBadge({ label }: { label: string }) {
  return (
    <View
      accessibilityLabel={`Privacy status: ${label}`}
      style={styles.privacyBadge}
    >
      <Text style={styles.privacyBadgeText}>{label}</Text>
    </View>
  );
}

function GhostButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.ghostButton}
    >
      <Text style={styles.ghostText}>{label}</Text>
    </Pressable>
  );
}

function SuccessToast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <Pressable onPress={onDismiss} style={styles.successToast}>
      <AppIcon color="#10201d" decorative name="success" size={18} />
      <Text style={styles.successText}>{message}</Text>
    </Pressable>
  );
}

function RealmNav() {
  return (
    <>
      <FloatingBottomNav activeRouteName="health" />
      <FloatingAssistantButton sensitiveProfile />
    </>
  );
}

type SheetProps = {
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
  visible: boolean;
};

function severityScore(severity: SymptomSeverity) {
  return severity === "strong" ? 3 : severity === "moderate" ? 2 : 1;
}

function getWeekDays(date: Date) {
  const start = new Date(date);
  start.setDate(date.getDate() - 3);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function getMonthPreview(date: Date) {
  const start = startOfMonth(date);
  return Array.from({ length: 35 }, (_, index) => addDays(start, index));
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 12);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toTab(value?: string | string[]): WomensHealthTab {
  const next = Array.isArray(value) ? value[0] : value;
  return TABS.some((tab) => tab.key === next)
    ? (next as WomensHealthTab)
    : "today";
}

function formatValue(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const styles = StyleSheet.create({
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  barFill: {
    backgroundColor: "#f9a8d4",
    borderRadius: 999,
    bottom: 0,
    position: "absolute",
    width: "100%",
  },
  barRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
    height: 92,
    marginTop: 14,
  },
  barTrack: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
    flex: 1,
    height: "100%",
    overflow: "hidden",
  },
  buttonTop: { marginTop: 16 },
  calendarCard: {
    backgroundColor: "#111827",
    borderColor: "rgba(249,168,212,0.28)",
    borderWidth: 1,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  cautionCard: {
    backgroundColor: "#fffbeb",
    borderColor: "#fcd34d",
    borderWidth: 1,
  },
  cautionText: { color: "#92400e", lineHeight: 20 },
  chip: {
    backgroundColor: "rgba(15,23,42,0.08)",
    borderColor: "rgba(15,23,42,0.12)",
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingRight: 16 },
  chipSelected: { backgroundColor: "#be185d", borderColor: "#f9a8d4" },
  chipText: { color: "#475569", fontWeight: "900" },
  chipTextSelected: { color: "#fff7ed" },
  darkCard: {
    backgroundColor: "#111827",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
  },
  darkInput: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 16,
    borderWidth: 1,
    color: "#f8fafc",
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  darkMuted: { color: "#cbd5e1", lineHeight: 21, marginTop: 6 },
  darkTitle: { color: "#f8fafc", fontSize: 19, fontWeight: "900" },
  dayCell: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 18,
    borderWidth: 1,
    height: 62,
    justifyContent: "center",
    minWidth: 46,
    overflow: "hidden",
    position: "relative",
  },
  dayCellSelected: {
    backgroundColor: "rgba(190,24,93,0.35)",
    borderColor: "#f9a8d4",
  },
  dayDot: { borderRadius: 99, height: 6, width: 6 },
  dayDots: { flexDirection: "row", gap: 3, marginTop: 5, minHeight: 7 },
  dayText: { color: "#e2e8f0", fontWeight: "900" },
  dayTextSelected: { color: "#ffffff" },
  emptyBody: { color: "#64748b", lineHeight: 21, marginTop: 6 },
  emptyCard: {
    backgroundColor: "#fff7ed",
    borderColor: "#fed7aa",
    borderWidth: 1,
  },
  emptyTitle: { color: "#0f172a", fontSize: 20, fontWeight: "900" },
  estimateBody: { color: "#713f12", lineHeight: 20, marginTop: 12 },
  estimateCard: {
    backgroundColor: "#fef3c7",
    borderColor: "#fcd34d",
    borderWidth: 1,
  },
  estimateTitle: { color: "#713f12", fontSize: 20, fontWeight: "900" },
  footerCard: {
    backgroundColor: "#fff7ed",
    borderColor: "#fed7aa",
    borderWidth: 1,
  },
  footerText: { color: "#9a3412", lineHeight: 20 },
  ghostButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ghostText: { color: "#f8fafc", fontWeight: "900" },
  haloLayer: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  haloRing: { borderRadius: 999, borderWidth: 2, position: "absolute" },
  headerBody: { color: "#64748b", lineHeight: 20, marginTop: 5 },
  headerCard: {
    backgroundColor: "#fdf2f8",
    borderColor: "#fbcfe8",
    borderWidth: 1,
  },
  headerIcon: {
    alignItems: "center",
    backgroundColor: "#fff7ed",
    borderRadius: 18,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  headerKicker: {
    color: "#be185d",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  headerRow: { alignItems: "center", flexDirection: "row", gap: 14 },
  headerTitle: {
    color: "#0f172a",
    fontSize: 23,
    fontWeight: "900",
    marginTop: 3,
  },
  heroBody: { color: "#fce7f3", lineHeight: 22, marginTop: 8 },
  heroCard: {
    backgroundColor: "#831843",
    borderColor: "rgba(249,168,212,0.35)",
    borderWidth: 1,
  },
  heroGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
  heroMetric: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 18,
    flexBasis: "47%",
    flexGrow: 1,
    padding: 12,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 29,
    fontWeight: "900",
    marginTop: 6,
  },
  inputLabel: { color: "#f8fafc", fontWeight: "900", marginTop: 12 },
  kicker: {
    color: "#f9a8d4",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  learnBody: { color: "#475569", lineHeight: 21, marginTop: 7 },
  learnCard: {
    backgroundColor: "#ffffff",
    borderColor: "#fbcfe8",
    borderWidth: 1,
  },
  learnSource: { color: "#be185d", fontSize: 12, fontWeight: "900" },
  learnTitle: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 6,
  },
  legendItem: { alignItems: "center", flexDirection: "row", gap: 5 },
  legendRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
  legendText: { color: "#cbd5e1", fontSize: 11, fontWeight: "800" },
  list: { gap: 8 },
  listItem: {
    backgroundColor: "#111827",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 16,
    borderWidth: 1,
    color: "#e2e8f0",
    lineHeight: 20,
    padding: 12,
  },
  methodCard: {
    backgroundColor: "#111827",
    borderColor: "rgba(249,168,212,0.24)",
    borderWidth: 1,
  },
  metricCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  metricLabel: { color: "#94a3b8", fontSize: 12, fontWeight: "900" },
  metricValue: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 6,
  },
  overlayList: { gap: 8, marginTop: 12 },
  overlayPill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  overlayText: { color: "#f8fafc", fontWeight: "900" },
  privacyBadge: {
    backgroundColor: "#fdf2f8",
    borderColor: "#f9a8d4",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  privacyBadgeText: { color: "#be185d", fontSize: 12, fontWeight: "900" },
  privacyBody: { color: "#475569", lineHeight: 20, marginTop: 4 },
  privacyCard: {
    backgroundColor: "#fdf2f8",
    borderColor: "#fbcfe8",
    borderWidth: 1,
  },
  privacyTitle: { color: "#0f172a", fontSize: 18, fontWeight: "900" },
  profileMarker: {
    alignItems: "center",
    backgroundColor: "#fff7ed",
    borderRadius: 999,
    height: 18,
    justifyContent: "center",
    position: "absolute",
    right: 3,
    top: 3,
    width: 18,
  },
  profileMarkerText: { color: "#831843", fontSize: 8, fontWeight: "900" },
  promptGrid: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  quickAction: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
    borderWidth: 1,
    flexBasis: "30%",
    flexGrow: 1,
    gap: 8,
    justifyContent: "center",
    minHeight: 94,
    minWidth: 96,
    padding: 10,
  },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickText: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },
  sectionHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  sharedText: { color: "#c4b5fd", fontSize: 11, fontWeight: "900" },
  stack: { gap: 14 },
  successText: { color: "#10201d", fontWeight: "900" },
  successToast: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#f9a8d4",
    borderRadius: 999,
    flexDirection: "row",
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 14,
  },
  tabRow: { gap: 8, paddingRight: 16 },
  v8ActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  v8HeroBody: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  v8HeroCopy: {
    flex: 1,
  },
  v8HeroMetric: {
    borderRadius: 16,
    flex: 1,
    minWidth: 82,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  v8HeroMetricLabel: {
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
    textTransform: "uppercase",
  },
  v8HeroMetricValue: {
    fontSize: 13,
    fontWeight: "900",
  },
  v8HeroRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  v8HeroStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
    marginTop: 14,
  },
  v8HeroTitle: {
    fontSize: 23,
    fontWeight: "900",
    lineHeight: 27,
    marginTop: 5,
  },
  v8Ring: {
    alignItems: "center",
    height: 78,
    justifyContent: "center",
    width: 78,
  },
  v8RingValue: {
    fontSize: 14,
    fontWeight: "900",
    position: "absolute",
  },
  v8SnapshotCard: {
    flexBasis: "47%",
    flexGrow: 1,
    minWidth: 150,
  },
  v8SnapshotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  v8SnapshotLabel: {
    fontSize: 11,
    fontWeight: "800",
  },
  v8SnapshotMeta: {
    fontSize: 10,
    lineHeight: 15,
    marginTop: 9,
  },
  v8SnapshotTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  v8SnapshotValue: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 3,
  },
});
