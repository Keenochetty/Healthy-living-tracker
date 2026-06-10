import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { PrivacyBadge } from "@/components/privacy";
import {
  AVAILABLE_HEALTH_WIDGETS,
  DEFAULT_SELECTED_HEALTH_WIDGET_IDS,
  HealthWidgetCustomizerSheet,
  type HealthWidgetId,
  type HealthWidgetOption
} from "@/components/health";
import { AppButton, AppCard, AppIcon, AppSection } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import { getBabyCareSummary } from "@/lib/babyChildStorage";
import { getAllChildSummaries } from "@/lib/childStorage";
import { getTodayFitnessSummary } from "@/lib/fitnessStorage";
import { getRecordsOverviewSummary } from "@/lib/healthRecordsStorage";
import { calculateTodayMedicationSchedule, calculateTodaySupplementSchedule } from "@/lib/medicationSupplementStorage";
import { getMensHealthSettings } from "@/lib/mensHealthStorage";
import { getTodayNutritionSummary } from "@/lib/nutritionStorage";
import { calculateCyclePrediction, getPregnancySummary } from "@/lib/cycleStorage";
import { getUserPreferences } from "@/lib/userPreferences";
import { lightImpact } from "@/lib/haptics";
import { HEALTH_REALMS } from "@/lib/healthRealms";
import { getNextHealthReminder, getOverdueReminders, getRemindersForDate } from "@/services/reminders/reminderEngine";
import { getHealthTimelineEvents, getTodayTimelineSummary } from "@/services/timeline/healthTimelineService";
import { useAppTheme } from "@/theme/ThemeProvider";
import type { AppModuleKey } from "@/types/app";
import type { ChildSummary } from "@/types/child";
import type { CyclePrediction, PregnancySummary } from "@/types/cycle";
import type { FitnessSummary } from "@/types/fitness";
import type { RecordsOverviewSummary } from "@/types/healthRecords";
import type { HealthReminder, HealthTimelineEvent, TodayTimelineSummary } from "@/types/healthTimeline";
import type { MedicationSupplementTodaySummary } from "@/types/medication";
import type { DailyNutritionSummary } from "@/types/nutrition";

type RealmDefinition = {
  action: string;
  accent: string;
  description: string;
  icon: AppIconName;
  key: string;
  privacy?: boolean;
  route: Href;
  status: string;
  title: string;
};

type HealthPalette = {
  border: string;
  card: string;
  header: string;
  headerMuted: string;
  headerText: string;
  muted: string;
  primarySoft: string;
  text: string;
  track: string;
};

type HealthData = {
  babyCareByChildId: Record<string, Awaited<ReturnType<typeof getBabyCareSummary>>>;
  childSummaries: ChildSummary[];
  cyclePrediction: CyclePrediction | null;
  enabledModules: AppModuleKey[];
  fitness: FitnessSummary | null;
  medication: MedicationSupplementTodaySummary | null;
  nextReminder: HealthReminder | null;
  nutrition: DailyNutritionSummary | null;
  overdueCount: number;
  pregnancy: PregnancySummary | null;
  records: RecordsOverviewSummary | null;
  recentEvents: HealthTimelineEvent[];
  supplement: MedicationSupplementTodaySummary | null;
  timeline: TodayTimelineSummary | null;
  todayReminderCount: number;
};

type HealthOverviewMockState = "empty" | "error" | "loading" | "ready";

// Change locally to preview the shell states without connecting new data logic.
const MOCK_STATE = "ready" as HealthOverviewMockState;
const WEEKLY_MOVEMENT_PREVIEW = [
  { day: "Mon", value: 42 },
  { day: "Tue", value: 68 },
  { day: "Wed", value: 35 },
  { day: "Thu", value: 76 },
  { day: "Fri", value: 54 },
  { day: "Sat", value: 28 },
  { day: "Sun", value: 18 }
];

const EMPTY_DATA: HealthData = {
  babyCareByChildId: {},
  childSummaries: [],
  cyclePrediction: null,
  enabledModules: [],
  fitness: null,
  medication: null,
  nextReminder: null,
  nutrition: null,
  overdueCount: 0,
  pregnancy: null,
  records: null,
  recentEvents: [],
  supplement: null,
  timeline: null,
  todayReminderCount: 0,
};

export default function HealthScreen() {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const [data, setData] = useState<HealthData>(EMPTY_DATA);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [selectedHealthWidgetIds, setSelectedHealthWidgetIds] = useState<HealthWidgetId[]>(DEFAULT_SELECTED_HEALTH_WIDGET_IDS);
  const [widgetCustomizerVisible, setWidgetCustomizerVisible] = useState(false);
  const twoColumns = width >= 430;
  const selectedHealthWidgets = AVAILABLE_HEALTH_WIDGETS.filter((widget) => selectedHealthWidgetIds.includes(widget.id));

  const loadHealth = useCallback(async () => {
    try {
      setErrorMessage("");
      const [
        preferences,
        nutrition,
        fitness,
        childSummaries,
        cyclePrediction,
        pregnancy,
        mensSettings,
        medication,
        supplement,
        records,
        todayReminders,
        overdueReminders,
        nextReminder,
        timeline,
        recentEvents
      ] = await Promise.all([
        getUserPreferences(),
        getTodayNutritionSummary(),
        getTodayFitnessSummary(),
        getAllChildSummaries(),
        calculateCyclePrediction(),
        getPregnancySummary(),
        getMensHealthSettings(),
        calculateTodayMedicationSchedule(),
        calculateTodaySupplementSchedule(),
        getRecordsOverviewSummary(),
        getRemindersForDate(new Date()),
        getOverdueReminders(),
        getNextHealthReminder(),
        getTodayTimelineSummary(),
        getHealthTimelineEvents(daysAgo(30), new Date())
      ]);
      const enabledModules = [...preferences.enabledModules];
      if (mensSettings.status !== "disabled" && !enabledModules.includes("mens_health")) {
        enabledModules.push("mens_health");
      }
      const babyCareByChildId = Object.fromEntries(
        await Promise.all(childSummaries.map(async (summary) => [summary.child.id, await getBabyCareSummary(summary.child.id)]))
      );

      setData({
        babyCareByChildId,
        childSummaries,
        cyclePrediction,
        enabledModules,
        fitness,
        medication,
        nextReminder,
        nutrition,
        overdueCount: overdueReminders.length,
        pregnancy,
        records,
        recentEvents: recentEvents.slice(0, 5),
        supplement,
        timeline,
        todayReminderCount: todayReminders.length
      });
    } catch {
      setErrorMessage("Could not load Health right now. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHealth();
    }, [loadHealth])
  );

  if (MOCK_STATE === "loading" || isLoading) {
    return <HealthHubSkeleton />;
  }

  if (MOCK_STATE === "error" || errorMessage) return <HealthErrorState message={errorMessage} onRetry={loadHealth} />;
  if (MOCK_STATE === "empty") return <HealthEmptyState />;

  const activeRealms = buildActiveRealms(data);
  const optionalRealms = buildOptionalRealms(data);
  const selectedChild = data.childSummaries.find((summary) => summary.child.id === selectedChildId);
  const groups = [
    { key: "personal", subtitle: "Everyday health, movement, and nutrition.", title: "Personal health", realms: activeRealms.filter((realm) => ["general", "fitness", "nutrition"].includes(realm.key)) },
    { key: "family", subtitle: "Focused spaces for people and care you support.", title: "Family and care", realms: activeRealms.filter((realm) => ["baby-child", "care"].includes(realm.key)) },
    { key: "private", subtitle: "Private tools and organized records.", title: "Private and records", realms: activeRealms.filter((realm) => ["womens-health", "documents"].includes(realm.key)) }
  ].filter((group) => group.realms.length);

  return (
    <View style={{ backgroundColor: theme.background, flex: 1 }}>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        <HealthHeader />
        <HealthProfileContextRow childSummaries={data.childSummaries} onSelectChild={setSelectedChildId} selectedChildId={selectedChildId} />

        {selectedChild ? (
          <BabyEntrancePreview care={data.babyCareByChildId[selectedChild.child.id]} summary={selectedChild} />
        ) : (
          <>
            <TodaySnapshot data={data} />

            <HealthPulse data={data} />

            <AppSection actionLabel="Customize" onActionPress={() => setWidgetCustomizerVisible(true)} subtitle={`${selectedHealthWidgets.length} selected · Choose what you want to see first.`} title="Your health bar">
              <HealthQuickView widgets={selectedHealthWidgets} />
            </AppSection>

            <WeeklyMovementPreview />

            <ComingUp data={data} />

            {groups.map((group) => (
              <AppSection key={group.key} subtitle={group.subtitle} title={group.title}>
                <View style={styles.realmGrid}>
                  {group.realms.map((realm) => (
                    <RealmCard key={realm.key} realm={realm} twoColumns={twoColumns} />
                  ))}
                </View>
              </AppSection>
            ))}

            <RecentActivity events={data.recentEvents} />

            {optionalRealms.length ? (
              <AppSection subtitle="Turn on only the realms you want to use." title="Add more health tools">
                <View style={styles.optionalStack}>
                  {optionalRealms.map((realm) => (
                    <OptionalTool key={realm.key} realm={realm} />
                  ))}
                </View>
              </AppSection>
            ) : null}

            <AppCard variant="soft">
              <View style={styles.privacyFooter}>
                <View style={styles.footerIcon}>
                  <AppIcon color={theme.primary} name="privacy" size={22} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>Your health, your permissions</Text>
                  <Text style={[styles.helperText, { color: theme.mutedText }]}>
                    Sensitive realms and values only appear when your permissions allow them.
                  </Text>
                  <Text style={[styles.helperText, { color: theme.mutedText }]}>
                    Health tracking and medication reminders help you stay organised but do not replace professional medical advice.
                  </Text>
                  <Pressable onPress={() => router.push("/settings/privacy-center" as Href)}>
                    <Text style={[styles.inlineAction, { color: theme.primary }]}>Review privacy settings</Text>
                  </Pressable>
                </View>
              </View>
            </AppCard>
          </>
        )}
      </ScrollView>
      <HealthWidgetCustomizerSheet
        onCancel={() => setWidgetCustomizerVisible(false)}
        onSave={(selectedIds) => {
          setSelectedHealthWidgetIds(selectedIds);
          setWidgetCustomizerVisible(false);
        }}
        selectedIds={selectedHealthWidgetIds}
        visible={widgetCustomizerVisible}
      />
    </View>
  );
}

function HealthHubSkeleton() {
  const { theme } = useAppTheme();
  const palette = useHealthPalette();
  return (
    <View style={{ backgroundColor: theme.background, flex: 1 }}>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.skeletonHeader, { backgroundColor: palette.header }]}>
          <SkeletonLine color={palette.headerMuted} width="28%" />
          <SkeletonLine color={palette.headerMuted} height={28} width="58%" />
          <SkeletonLine color={palette.headerMuted} width="42%" />
        </View>
        <View style={[styles.skeletonHero, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <SkeletonLine color={palette.track} width="34%" />
          <SkeletonLine color={palette.track} height={26} width="65%" />
          <SkeletonLine color={palette.track} width="86%" />
          <SkeletonLine color={palette.primarySoft} height={10} width="100%" />
        </View>
        {[0, 1, 2].map((row) => (
          <View key={row} style={styles.skeletonRow}>
            {[0, 1].map((card) => (
              <View key={card} style={[styles.skeletonCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
                <SkeletonLine color={palette.primarySoft} height={38} width={38} />
                <SkeletonLine color={palette.track} width="55%" />
                <SkeletonLine color={palette.track} width="85%" />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function SkeletonLine({ color, height = 12, width }: { color: string; height?: number; width: number | `${number}%` }) {
  return <View style={{ backgroundColor: color, borderRadius: 999, height, opacity: 0.78, width }} />;
}

function HealthHeader() {
  const { theme } = useAppTheme();
  const palette = useHealthPalette();

  return (
    <View style={[styles.stickyHeaderWrap, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: palette.header }]}>
      <View style={styles.headerTop}>
        <View style={[styles.avatar, { backgroundColor: palette.primarySoft }]}>
          <AppIcon color={palette.text} decorative name="profile" size={23} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: palette.headerMuted }]}>HEALTH OVERVIEW</Text>
          <Text numberOfLines={1} style={[styles.headerTitle, { color: palette.headerText }]}>You</Text>
          <Text style={[styles.headerSubtitle, { color: palette.headerMuted }]}>Personal health overview</Text>
        </View>
        <View style={styles.headerActions}>
          <HeaderAction accessibilityLabel="Notifications" icon="reminder" />
          <HeaderAction accessibilityLabel="Health help" icon="ai_assistant" />
        </View>
      </View>
      </View>
    </View>
  );
}

function HeaderAction({ accessibilityLabel, icon }: { accessibilityLabel: string; icon: AppIconName }) {
  const palette = useHealthPalette();
  return (
    <Pressable
      accessibilityHint="This action will be connected in a later step."
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={() => undefined}
      style={({ pressed }) => [styles.headerAction, { borderColor: palette.headerMuted }, pressed ? styles.pressed : null]}
    >
      <AppIcon color={palette.headerText} decorative name={icon} size={18} />
    </Pressable>
  );
}

function HealthProfileContextRow({
  childSummaries,
  onSelectChild,
  selectedChildId
}: {
  childSummaries: ChildSummary[];
  onSelectChild: (childId: string | null) => void;
  selectedChildId: string | null;
}) {
  const palette = useHealthPalette();
  const { theme } = useAppTheme();

  return (
    <View style={styles.contextSection}>
      <Text style={[styles.contextLabel, { color: palette.muted }]}>Viewing health for</Text>
      <ScrollView contentContainerStyle={styles.contextRow} horizontal showsHorizontalScrollIndicator={false}>
        <Pressable
          accessibilityLabel="View your health"
          accessibilityRole="button"
          accessibilityState={{ selected: selectedChildId === null }}
          onPress={() => onSelectChild(null)}
          style={[
            styles.contextChip,
            { backgroundColor: selectedChildId === null ? theme.primary : palette.card, borderColor: selectedChildId === null ? theme.primary : palette.border }
          ]}
        >
          <AppIcon color={selectedChildId === null ? "#10201d" : theme.primary} decorative name="profile" size={17} />
          <Text style={[styles.contextChipText, { color: selectedChildId === null ? "#10201d" : palette.text }]}>You</Text>
        </Pressable>
        {childSummaries.map((summary) => {
          const selected = selectedChildId === summary.child.id;
          return (
            <Pressable
              accessibilityLabel={`View ${summary.child.displayName} care`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={summary.child.id}
              onPress={() => onSelectChild(summary.child.id)}
              style={[
                styles.contextChip,
                { backgroundColor: selected ? theme.primary : palette.card, borderColor: selected ? theme.primary : palette.border }
              ]}
            >
              <AppIcon color={selected ? "#10201d" : theme.primary} decorative name="child_baby" size={17} />
              <Text numberOfLines={1} style={[styles.contextChipText, { color: selected ? "#10201d" : palette.text }]}>{summary.child.displayName}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function BabyEntrancePreview({
  care,
  summary
}: {
  care?: Awaited<ReturnType<typeof getBabyCareSummary>>;
  summary: ChildSummary;
}) {
  const { theme } = useAppTheme();
  const palette = useHealthPalette();
  const child = summary.child;
  const nextVaccine = care?.vaccines.find((record) => record.nextDoseDate || record.scheduledDate);

  return (
    <AppCard style={[styles.babyPreview, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <View style={styles.babyPreviewHeader}>
        <View style={[styles.babyPreviewAvatar, { backgroundColor: theme.primarySoft }]}>
          <Text style={[styles.babyPreviewAvatarText, { color: palette.text }]}>{child.avatarEmoji || getInitials(child.displayName)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.babyPreviewTitle, { color: palette.text }]}>{child.displayName}&apos;s care</Text>
          <Text style={[styles.helperText, { color: palette.muted }]}>Parent view · {child.privacy === "shared_selected" ? "Shared selected" : "Private"}</Text>
        </View>
        <AppIcon color={theme.primary} decorative name="child_baby" size={24} />
      </View>

      <Text style={[styles.babyPreviewDescription, { color: palette.muted }]}>Feeds, sleep, diapers, growth, and records.</Text>

      <View style={styles.babySummaryGrid}>
        <BabySummaryItem label="Last feed" value={summary.latestFeed ? formatAgo(summary.latestFeed.loggedAt) : "Not logged yet"} />
        <BabySummaryItem label="Sleep today" value={care ? formatMinutes(care.sleep.totalMinutes) : "Start when ready"} />
        <BabySummaryItem label="Last diaper" value={summary.latestDiaper ? `${formatValue(summary.latestDiaper.diaperType)} · ${formatAgo(summary.latestDiaper.loggedAt)}` : "Not logged yet"} />
        <BabySummaryItem label="Next reminder" value={care?.medicineDueCount ? `${care.medicineDueCount} medicine due` : nextVaccine?.vaccineName ?? "Add reminder"} />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push({ pathname: "/baby-child", params: { childId: child.id } } as unknown as Href)}
        style={({ pressed }) => [styles.babyOpenButton, { backgroundColor: theme.primary }, pressed ? styles.pressed : null]}
      >
        <Text style={styles.babyOpenButtonText}>Open Baby Care</Text>
        <AppIcon color="#10201d" decorative name="child_baby" size={18} />
      </Pressable>
    </AppCard>
  );
}

function BabySummaryItem({ label, value }: { label: string; value: string }) {
  const palette = useHealthPalette();
  return (
    <View style={[styles.babySummaryItem, { backgroundColor: palette.primarySoft }]}>
      <Text style={[styles.babySummaryLabel, { color: palette.muted }]}>{label}</Text>
      <Text numberOfLines={2} style={[styles.babySummaryValue, { color: palette.text }]}>{value}</Text>
    </View>
  );
}

function HealthPulse({ data }: { data: HealthData }) {
  const { theme } = useAppTheme();
  const palette = useHealthPalette();
  const [animatedProgress] = useState(() => new Animated.Value(0));
  const pulse = getHealthPulse(data);

  useEffect(() => {
    Animated.timing(animatedProgress, {
      duration: 650,
      toValue: pulse.progress,
      useNativeDriver: false
    }).start();
  }, [animatedProgress, pulse.progress]);

  const width = animatedProgress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  return (
    <View
      accessibilityLabel={pulse.accessibilityLabel}
      style={[styles.pulseCard, { backgroundColor: palette.card, borderColor: palette.border }]}
    >
      <View style={styles.pulseTop}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>HEALTH PULSE</Text>
          <Text style={[styles.pulseTitle, { color: palette.text }]}>{pulse.title}</Text>
          <Text style={[styles.helperText, { color: palette.muted }]}>{pulse.description}</Text>
        </View>
        <View style={[styles.pulseValue, { backgroundColor: palette.primarySoft }]}>
          <Text style={[styles.pulseValueText, { color: theme.primary }]}>{pulse.value}</Text>
        </View>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: palette.track }]}>
        <Animated.View style={[styles.progressFill, { backgroundColor: theme.primary, width }]} />
      </View>
      <View style={styles.pulseSignals}>
        {pulse.signals.map((signal) => (
          <View key={signal.label} style={styles.signal}>
            <View style={[styles.signalDot, { backgroundColor: signal.active ? theme.primary : palette.track }]} />
            <Text style={[styles.signalText, { color: palette.muted }]}>{signal.label}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.pulseNote, { color: palette.muted }]}>Based on activity tracked in this app, not a medical score.</Text>
    </View>
  );
}

function HealthQuickView({ widgets }: { widgets: HealthWidgetOption[] }) {
  const { theme } = useAppTheme();
  const palette = useHealthPalette();
  if (!widgets.length) {
    return (
      <AppCard variant="glass">
        <View style={styles.emptyState}>
          <View style={styles.softIcon}><AppIcon name="add" size={22} variant="primary" /></View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: palette.text }]}>Choose quick health widgets</Text>
            <Text style={[styles.helperText, { color: palette.muted }]}>Pick the health details you want to see first.</Text>
          </View>
        </View>
      </AppCard>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.widgetRow} horizontal showsHorizontalScrollIndicator={false}>
      {widgets.map((widget) => (
        <Pressable
          accessibilityHint="This local quick widget can be connected to a tracker later."
          accessibilityLabel={`${widget.label}: ${widget.value}, ${widget.status}`}
          accessibilityRole="button"
          key={widget.id}
          onPress={() => undefined}
          style={({ pressed }) => [styles.widgetCard, { backgroundColor: palette.card, borderColor: palette.border }, pressed ? styles.pressed : null]}
        >
          <View style={[styles.widgetIcon, { backgroundColor: palette.primarySoft }]}><AppIcon color={theme.primary} decorative name={widget.icon} size={19} /></View>
          <Text numberOfLines={1} style={[styles.widgetLabel, { color: palette.muted }]}>{widget.label}</Text>
          <Text numberOfLines={1} style={[styles.widgetValue, { color: palette.text }]}>{widget.value}</Text>
          <Text numberOfLines={1} style={[styles.widgetDescription, { color: palette.muted }]}>{widget.description}</Text>
          <Text style={[styles.widgetAction, { color: theme.primary }]}>{widget.status}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function TodaySnapshot({ data }: { data: HealthData }) {
  const latest = data.timeline?.latestEvent;
  const suggested = getSuggestedAction(data);
  const palette = useHealthPalette();
  const { theme } = useAppTheme();
  return (
    <AppCard style={[styles.summaryCard, { backgroundColor: palette.primarySoft, borderColor: palette.border }]}>
      <View style={styles.summaryHeading}>
        <View style={[styles.summaryIcon, { backgroundColor: palette.card }]}>
          <AppIcon color={theme.primary} decorative name="today" size={22} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.summaryTitle, { color: palette.text }]}>Today&apos;s health</Text>
          <Text style={[styles.summarySubtitle, { color: palette.muted }]}>
            {data.todayReminderCount} reminder{data.todayReminderCount === 1 ? "" : "s"} · {data.timeline?.totalEvents ?? 0} health log{data.timeline?.totalEvents === 1 ? "" : "s"} today
          </Text>
        </View>
      </View>
      <View style={styles.snapshotGrid}>
        <SnapshotCard icon="reminder" label="Reminders" value={data.overdueCount ? `${data.overdueCount} need attention` : `${data.todayReminderCount} scheduled`} />
        <SnapshotCard icon="calendar_timeline" label="Latest log" value={latest?.lockedPrivate ? "Private activity" : latest?.title ?? "Nothing logged yet"} />
        <SnapshotCard icon="calendar" label="Next appointment" value={data.nextReminder?.lockedPrivate ? "Private reminder" : data.nextReminder?.title ?? "Nothing scheduled"} />
        <SnapshotCard icon="health" label="Suggested next action" onPress={suggested.onPress} value={suggested.label} />
      </View>
    </AppCard>
  );
}

function SnapshotCard({ icon, label, onPress, value }: { icon: AppIconName; label: string; onPress?: () => void; value: string }) {
  const palette = useHealthPalette();
  return (
    <AppCard onPress={onPress} padding="md" style={[styles.snapshotCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <AppIcon name={icon} size={19} variant="primary" />
      <Text style={[styles.snapshotLabel, { color: palette.muted }]}>{label}</Text>
      <Text numberOfLines={2} style={[styles.snapshotValue, { color: palette.text }]}>{value}</Text>
    </AppCard>
  );
}

function WeeklyMovementPreview() {
  const { theme } = useAppTheme();
  const palette = useHealthPalette();
  const loggedDays = WEEKLY_MOVEMENT_PREVIEW.filter((item) => item.value >= 40).length;

  return (
    <AppSection subtitle="A simple glance preview from local sample data." title="Weekly movement">
      <AppCard style={[styles.weeklyCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <View accessibilityLabel={`${loggedDays} of 7 days logged`} style={styles.weeklyBars}>
          {WEEKLY_MOVEMENT_PREVIEW.map((item, index) => {
            const today = index === WEEKLY_MOVEMENT_PREVIEW.length - 1;
            return (
              <View key={item.day} style={styles.weeklyColumn}>
                <View style={[styles.weeklyTrack, { backgroundColor: palette.track }]}>
                  <View
                    style={[
                      styles.weeklyFill,
                      {
                        backgroundColor: today ? theme.primary : palette.primarySoft,
                        height: `${item.value}%`
                      }
                    ]}
                  />
                </View>
                <Text style={[styles.weeklyDay, { color: palette.muted }]}>{item.day}</Text>
              </View>
            );
          })}
        </View>
        <Text style={[styles.weeklySummary, { color: palette.text }]}>{loggedDays} of 7 days logged</Text>
        <Text style={[styles.helperText, { color: palette.muted }]}>Today is highlighted. This preview does not provide medical interpretation.</Text>
      </AppCard>
    </AppSection>
  );
}

function RealmCard({ realm, twoColumns }: { realm: RealmDefinition; twoColumns: boolean }) {
  const palette = useHealthPalette();
  return (
    <Pressable
      accessibilityHint={`Opens the ${realm.title} health area. ${realm.description}`}
      accessibilityLabel={`Open ${realm.title}. ${realm.status}`}
      accessibilityRole="button"
      onPress={() => {
        lightImpact();
        router.push(realm.route);
      }}
      style={({ pressed }) => [
        styles.realmCard,
        { backgroundColor: palette.card, borderColor: `${realm.accent}55`, flexBasis: twoColumns ? "47%" : "100%", maxWidth: twoColumns ? "48.5%" : "100%" },
        pressed ? styles.pressed : null
      ]}
    >
      <View style={styles.realmTop}>
        <View style={[styles.realmIcon, { backgroundColor: `${realm.accent}18` }]}>
          <AppIcon color={realm.accent} decorative name={realm.icon} size={23} />
        </View>
        <View style={styles.realmTopActions}>
          {realm.privacy ? <PrivacyBadge /> : null}
          <Text style={[styles.realmChevron, { color: realm.accent }]}>{">"}</Text>
        </View>
      </View>
      <Text numberOfLines={2} style={[styles.realmTitle, { color: palette.text }]}>{realm.title}</Text>
      <View style={[styles.realmStatusBadge, { backgroundColor: `${realm.accent}12`, borderColor: `${realm.accent}35` }]}>
        <Text numberOfLines={1} style={[styles.realmStatus, { color: realm.accent }]}>{realm.status}</Text>
      </View>
      <Text numberOfLines={3} style={[styles.realmDescription, { color: palette.muted }]}>{realm.description}</Text>
      <Text style={[styles.realmAction, { color: realm.accent }]}>{realm.action}</Text>
    </Pressable>
  );
}

function ComingUp({ data }: { data: HealthData }) {
  const { theme } = useAppTheme();
  const palette = useHealthPalette();
  const dark = ["#08111a", "#0f172a"].includes(theme.background.toLowerCase());
  const items = [
    data.nextReminder
      ? {
          icon: data.nextReminder.lockedPrivate ? "privacy" as AppIconName : getEventIcon(data.nextReminder.type),
          label: data.nextReminder.lockedPrivate ? "Private health reminder" : data.nextReminder.title,
          meta: formatDateTime(data.nextReminder.dueAt),
          route: (data.nextReminder.lockedPrivate ? "/health-calendar" : data.nextReminder.route ?? "/health-calendar") as Href
        }
      : null,
    data.medication?.nextItem
      ? { icon: "medication" as AppIconName, label: "Medication schedule", meta: formatOptionalTime(data.medication.nextItem.scheduledAt), route: "/medication" as Href }
      : null,
    data.supplement?.nextItem
      ? { icon: "health" as AppIconName, label: "Supplement schedule", meta: formatOptionalTime(data.supplement.nextItem.scheduledAt), route: "/supplements" as Href }
      : null
  ].filter(Boolean) as Array<{ icon: AppIconName; label: string; meta: string; route: Href }>;

  return (
    <AppSection actionLabel="Timeline" onActionPress={() => router.push("/health-calendar" as Href)} subtitle="Calm reminders and upcoming care items." title="Needs attention">
      <AppCard style={[styles.priorityCard, { backgroundColor: palette.card, borderColor: dark ? palette.border : "#f2d7a5" }]}>
        {items.length ? (
          <View style={styles.list}>
            {items.slice(0, 3).map((item, index) => (
              <Pressable accessibilityHint="Opens this care item." accessibilityLabel={`${item.label}, ${item.meta}`} accessibilityRole="button" key={`${item.label}-${index}`} onPress={() => router.push(item.route)} style={({ pressed }) => [styles.listRow, { borderBottomColor: palette.border }, pressed ? styles.pressed : null]}>
                <View style={[styles.listIcon, { backgroundColor: dark ? palette.primarySoft : "#fff3d6" }]}><AppIcon name={item.icon} size={19} variant="primary" /></View>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={[styles.listTitle, { color: palette.text }]}>{item.label}</Text>
                  <Text numberOfLines={1} style={[styles.listMeta, { color: palette.muted }]}>{item.meta}</Text>
                </View>
                <AppIcon name="add" size={15} variant="muted" />
              </Pressable>
            ))}
          </View>
        ) : (
          <EmptyBlock action="Add reminder" description="Add reminders, appointments, workouts, or health notes whenever they are useful." onPress={() => router.push("/health-calendar?tab=add" as Href)} title="Nothing coming up" />
        )}
      </AppCard>
    </AppSection>
  );
}

function RecentActivity({ events }: { events: HealthTimelineEvent[] }) {
  const palette = useHealthPalette();
  return (
    <AppSection actionLabel="View timeline" onActionPress={() => router.push("/health-calendar" as Href)} subtitle="A privacy-aware preview of your latest health logs." title="Recent activity">
      <AppCard>
        {events.length ? (
          <View style={styles.list}>
            {events.slice(0, 5).map((event) => (
              <Pressable
                accessibilityHint="Opens the health timeline."
                accessibilityLabel={`${event.lockedPrivate ? "Private health activity" : event.title}, ${formatDateTime(event.eventAt)}`}
                accessibilityRole="button"
                key={event.id}
                onPress={() => router.push("/health-calendar" as Href)}
                style={({ pressed }) => [styles.listRow, { borderBottomColor: palette.border }, pressed ? styles.pressed : null]}
              >
                <View style={[styles.listIcon, { backgroundColor: palette.primarySoft }]}><AppIcon name={event.lockedPrivate ? "privacy" : getEventIcon(event.type)} size={19} variant="primary" /></View>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={[styles.listTitle, { color: palette.text }]}>{event.lockedPrivate ? "Private health activity" : event.title}</Text>
                  <Text style={[styles.listMeta, { color: palette.muted }]}>{formatDateTime(event.eventAt)}</Text>
                </View>
                {event.isPrivate ? <PrivacyBadge /> : null}
              </Pressable>
            ))}
          </View>
        ) : (
          <EmptyBlock description="Your logs and notes will appear here after you start tracking." title="No recent health activity" />
        )}
      </AppCard>
    </AppSection>
  );
}

function HealthEmptyState() {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.centeredState, { backgroundColor: theme.background }]}>
      <View style={[styles.stateIcon, { backgroundColor: theme.primarySoft }]}>
        <AppIcon color={theme.primary} decorative name="add" size={28} />
      </View>
      <Text style={[styles.stateTitle, { color: theme.text }]}>Choose your first health widgets</Text>
      <Text style={[styles.stateText, { color: theme.mutedText }]}>Pick the health items you want to see first.</Text>
      <AppButton accessibilityLabel="Customize health bar" label="Customize health bar" onPress={() => router.push("/onboarding/modules" as Href)} />
    </View>
  );
}

function HealthErrorState({ message, onRetry }: { message?: string; onRetry: () => void }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.centeredState, { backgroundColor: theme.background }]}>
      <View style={[styles.stateIcon, { backgroundColor: theme.primarySoft }]}>
        <AppIcon color={theme.primary} decorative name="warning" size={28} />
      </View>
      <Text style={[styles.stateTitle, { color: theme.text }]}>We couldn&apos;t load this overview</Text>
      <Text style={[styles.stateText, { color: theme.mutedText }]}>{message || "Try again when you are ready."}</Text>
      <AppButton accessibilityLabel="Try loading Health Overview again" label="Try again" onPress={onRetry} />
    </View>
  );
}

function OptionalTool({ realm }: { realm: RealmDefinition }) {
  const palette = useHealthPalette();
  return (
    <AppCard padding="md" style={styles.optionalCard}>
      <View style={[styles.realmIcon, { backgroundColor: `${realm.accent}18` }]}><AppIcon color={realm.accent} name={realm.icon} size={21} /></View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.listTitle, { color: palette.text }]}>{realm.title}</Text>
        <Text numberOfLines={2} style={[styles.listMeta, { color: palette.muted }]}>{realm.description}</Text>
      </View>
      {realm.privacy ? <PrivacyBadge /> : null}
      <Pressable accessibilityHint="Opens health module setup." accessibilityLabel={`Set up ${realm.title}`} accessibilityRole="button" onPress={() => router.push("/onboarding/modules" as Href)} style={[styles.setupButton, { backgroundColor: palette.header }]}>
        <Text style={[styles.setupText, { color: palette.headerText }]}>Set up</Text>
      </Pressable>
    </AppCard>
  );
}

function EmptyBlock({ action, description, onPress, title }: { action?: string; description: string; onPress?: () => void; title: string }) {
  const { theme } = useAppTheme();
  const palette = useHealthPalette();
  return (
    <View style={styles.emptyBlock}>
      <View style={styles.softIcon}><AppIcon name="health" size={22} variant="primary" /></View>
      <Text style={[styles.cardTitle, { color: palette.text }]}>{title}</Text>
      <Text style={[styles.helperText, { color: palette.muted }]}>{description}</Text>
      {action && onPress ? <Pressable onPress={onPress}><Text style={[styles.inlineAction, { color: theme.primary }]}>{action}</Text></Pressable> : null}
    </View>
  );
}

function buildActiveRealms(_data: HealthData): RealmDefinition[] {
  return HEALTH_REALMS.map((item) => realm(
    item.slug,
    item.title,
    item.icon,
    item.accent,
    item.status,
    item.description,
    "Open area",
    `/health/${item.slug}` as Href,
    item.slug === "womens-health" || item.slug === "baby-child" || item.slug === "documents"
  ));
}

function buildOptionalRealms(_data: HealthData): RealmDefinition[] {
  return [];
}

function realm(key: string, title: string, icon: AppIconName, accent: string, status: string, description: string, action: string, route: Href, privacy = false): RealmDefinition {
  return { accent, action, description, icon, key, privacy, route, status, title };
}

function getHealthPulse(data: HealthData) {
  const nutritionActive = Boolean(data.nutrition?.foodLogCount || data.nutrition?.waterMl);
  const fitnessActive = Boolean(data.fitness?.activeMinutesToday || data.fitness?.workoutsThisWeek || data.fitness?.stepsToday);
  const timelineActive = Boolean(data.timeline?.totalEvents);
  const medicationApplicable = Boolean(data.medication?.totalCount);
  const supplementApplicable = Boolean(data.supplement?.totalCount);
  const signals = [
    { active: nutritionActive, label: "Nutrition" },
    { active: fitnessActive, label: "Movement" },
    { active: timelineActive, label: "Health logs" },
    ...(medicationApplicable ? [{ active: Boolean(data.medication?.takenCount), label: "Medication" }] : []),
    ...(supplementApplicable ? [{ active: Boolean(data.supplement?.takenCount), label: "Supplements" }] : [])
  ];
  const hasTracking = signals.some((signal) => signal.active) || medicationApplicable || supplementApplicable;
  if (!hasTracking) {
    return {
      accessibilityLabel: "Health Pulse: start with your first health log",
      description: "Your pulse will build as you log meals, movement, reminders, and health activity.",
      progress: 0,
      signals,
      title: "Start with one small check-in",
      value: "First log"
    };
  }

  const values = [
    nutritionActive ? 1 : 0,
    fitnessActive ? 1 : 0,
    timelineActive ? 1 : 0,
    ...(medicationApplicable ? [scheduleProgress(data.medication)] : []),
    ...(supplementApplicable ? [scheduleProgress(data.supplement)] : [])
  ];
  const progress = values.reduce((sum, value) => sum + value, 0) / values.length;
  return {
    accessibilityLabel: `Health Pulse: ${Math.round(progress * 100)} percent of today's trackable activity`,
    description: "A quick view of the health activity you have tracked today.",
    progress,
    signals,
    title: progress >= 0.7 ? "Your tracking is taking shape" : "A few check-ins can complete today's view",
    value: `${Math.round(progress * 100)}%`
  };
}

function scheduleProgress(summary: MedicationSupplementTodaySummary | null) {
  if (!summary?.totalCount) return 0;
  return Math.min(summary.takenCount / summary.totalCount, 1);
}

function getSuggestedAction(data: HealthData) {
  if (data.medication?.dueCount) return { label: "Mark medication", onPress: () => router.push("/medication" as Href) };
  if (!data.nutrition?.foodLogCount) return { label: "Log your first meal", onPress: () => router.push("/food" as Href) };
  if (!data.fitness?.activeMinutesToday) return { label: "Start a workout", onPress: () => router.push("/fitness" as Href) };
  return { label: "Add a health note", onPress: () => router.push("/records" as Href) };
}

function getInitials(value: string) {
  return value.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function getEventIcon(type: string): AppIconName {
  if (type === "medication") return "medication";
  if (type === "workout") return "fitness";
  if (type === "meal" || type === "water") return type === "water" ? "water" : "food";
  if (type === "baby_child") return "child_baby";
  if (type === "record" || type === "health_note") return "records";
  if (type === "womens_health" || type === "pregnancy") return "pregnancy_cycle";
  return "calendar_timeline";
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString([], { day: "numeric", hour: "2-digit", minute: "2-digit", month: "short" });
}

function formatOptionalTime(value?: string) {
  return value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "As needed";
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString([], { day: "numeric", month: "short" });
}

function formatAgo(value: string) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = Math.round(minutes % 60);
  return hours ? `${hours}h ${remaining}m` : `${remaining}m`;
}

function formatValue(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function daysAgo(count: number) {
  const value = new Date();
  value.setDate(value.getDate() - count);
  return value;
}

function useHealthPalette(): HealthPalette {
  const { theme } = useAppTheme();
  const background = theme.background.toLowerCase();
  const dark = background === "#0f172a" || background === "#08111a";
  return {
    border: theme.border,
    card: theme.surface,
    header: dark ? theme.surface : "#102a2a",
    headerMuted: dark ? theme.mutedText : "#b8d8d2",
    headerText: dark ? theme.text : "#f8fffd",
    muted: theme.mutedText,
    primarySoft: dark ? "rgba(45,212,191,0.14)" : "#e4f7f2",
    text: theme.text,
    track: dark ? "rgba(148,163,184,0.18)" : "#e2eee9"
  };
}

const styles = StyleSheet.create({
  avatar: { alignItems: "center", backgroundColor: "#ccfbf1", borderRadius: 18, height: 48, justifyContent: "center", width: 48 },
  avatarText: { color: "#115e59", fontSize: 20, fontWeight: "900" },
  babyOpenButton: { alignItems: "center", alignSelf: "flex-start", borderRadius: 999, flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 4, minHeight: 48, paddingHorizontal: 18, paddingVertical: 12 },
  babyOpenButtonText: { color: "#10201d", fontWeight: "900" },
  babyPreview: { borderWidth: 1, gap: 16 },
  babyPreviewAvatar: { alignItems: "center", borderRadius: 24, height: 56, justifyContent: "center", width: 56 },
  babyPreviewAvatarText: { fontSize: 18, fontWeight: "900" },
  babyPreviewDescription: { lineHeight: 20 },
  babyPreviewHeader: { alignItems: "center", flexDirection: "row", gap: 12 },
  babyPreviewTitle: { fontSize: 22, fontWeight: "900" },
  babySummaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  babySummaryItem: { borderRadius: 18, flexBasis: "46%", flexGrow: 1, minHeight: 82, padding: 12 },
  babySummaryLabel: { fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  babySummaryValue: { fontSize: 14, fontWeight: "900", lineHeight: 19, marginTop: 7 },
  cardTitle: { color: "#0f172a", fontSize: 17, fontWeight: "900" },
  centeredState: { alignItems: "center", flex: 1, gap: 12, justifyContent: "center", padding: 28 },
  contextChip: { alignItems: "center", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 7, maxWidth: 180, minHeight: 42, paddingHorizontal: 14, paddingVertical: 9 },
  contextChipText: { flexShrink: 1, fontWeight: "900" },
  contextLabel: { fontSize: 12, fontWeight: "900", marginBottom: 9, textTransform: "uppercase" },
  contextRow: { gap: 9, paddingRight: 18 },
  contextSection: { width: "100%" },
  emptyBlock: { alignItems: "center", gap: 8, paddingVertical: 8 },
  emptyState: { alignItems: "center", flexDirection: "row", gap: 12 },
  eyebrow: { color: "#0f766e", fontSize: 12, fontWeight: "900", letterSpacing: 1.1 },
  footerIcon: { alignItems: "center", backgroundColor: "#ccfbf1", borderRadius: 16, height: 44, justifyContent: "center", width: 44 },
  header: { backgroundColor: "#0f172a", borderRadius: 26, gap: 14, overflow: "hidden", padding: 16 },
  headerSubtitle: { color: "#94a3b8", fontSize: 13, marginTop: 3 },
  headerTitle: { color: "#f8fafc", fontSize: 22, fontWeight: "900", marginTop: 3 },
  headerTop: { alignItems: "center", flexDirection: "row", gap: 12 },
  headerAction: { alignItems: "center", borderRadius: 16, borderWidth: 1, height: 44, justifyContent: "center", width: 44 },
  headerActions: { alignItems: "center", flexDirection: "row", gap: 8 },
  helperText: { color: "#64748b", lineHeight: 20, marginTop: 4 },
  inlineAction: { color: "#0f766e", fontWeight: "900", marginTop: 9 },
  list: { gap: 5 },
  listIcon: { alignItems: "center", backgroundColor: "#f0fdfa", borderRadius: 14, height: 42, justifyContent: "center", width: 42 },
  listMeta: { color: "#64748b", fontSize: 12, lineHeight: 17, marginTop: 3 },
  listRow: { alignItems: "center", borderBottomColor: "#e2e8f0", borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 11, minHeight: 62, paddingVertical: 7 },
  listTitle: { color: "#0f172a", fontSize: 15, fontWeight: "900" },
  optionalCard: { alignItems: "center", flexDirection: "row", gap: 11 },
  optionalStack: { gap: 10 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  progressFill: { borderRadius: 999, height: "100%" },
  progressTrack: { borderRadius: 999, height: 11, overflow: "hidden" },
  privacyFooter: { alignItems: "flex-start", flexDirection: "row", gap: 12 },
  profileChip: { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.12)", borderRadius: 999, borderWidth: 1, maxWidth: 140, minHeight: 36, paddingHorizontal: 13, paddingVertical: 8 },
  profileChipSelected: { backgroundColor: "#ccfbf1", borderColor: "#5eead4" },
  profileChipText: { color: "#cbd5e1", fontSize: 12, fontWeight: "900" },
  profileChipTextSelected: { color: "#115e59" },
  profileRow: { gap: 8, paddingRight: 20 },
  pulseCard: { borderRadius: 26, borderWidth: 1, gap: 16, padding: 16 },
  pulseNote: { fontSize: 12, lineHeight: 18 },
  pulseSignals: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  pulseTitle: { fontSize: 22, fontWeight: "900", lineHeight: 28, marginTop: 5 },
  pulseTop: { alignItems: "flex-start", flexDirection: "row", gap: 12 },
  pulseValue: { alignItems: "center", borderRadius: 18, justifyContent: "center", minHeight: 58, minWidth: 72, paddingHorizontal: 10 },
  pulseValueText: { fontSize: 16, fontWeight: "900" },
  realmAction: { fontSize: 12, fontWeight: "900", marginTop: "auto", paddingTop: 8 },
  realmCard: { backgroundColor: "#ffffff", borderRadius: 24, borderWidth: 1, flexGrow: 1, gap: 9, minHeight: 228, padding: 16 },
  realmChevron: { fontSize: 19, fontWeight: "900" },
  realmDescription: { color: "#64748b", fontSize: 12, lineHeight: 18 },
  realmGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  realmIcon: { alignItems: "center", borderRadius: 15, height: 44, justifyContent: "center", width: 44 },
  realmStatus: { fontSize: 11, fontWeight: "900", letterSpacing: 0.2 },
  realmStatusBadge: { alignSelf: "flex-start", borderRadius: 999, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 5 },
  realmTitle: { color: "#0f172a", fontSize: 17, fontWeight: "900" },
  realmTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  realmTopActions: { alignItems: "center", flexDirection: "row", gap: 7 },
  screenContent: { alignSelf: "center", gap: 24, maxWidth: 480, paddingBottom: 210, paddingHorizontal: 18, paddingTop: 18, width: "100%" },
  setupButton: { backgroundColor: "#0f172a", borderRadius: 999, minHeight: 38, paddingHorizontal: 13, paddingVertical: 10 },
  setupText: { color: "#ffffff", fontSize: 12, fontWeight: "900" },
  signal: { alignItems: "center", flexDirection: "row", gap: 5 },
  signalDot: { borderRadius: 999, height: 7, width: 7 },
  signalText: { fontSize: 12, fontWeight: "800" },
  skeletonCard: { borderRadius: 22, borderWidth: 1, flex: 1, gap: 14, minHeight: 150, padding: 16 },
  skeletonHeader: { borderRadius: 28, gap: 14, padding: 20 },
  skeletonHero: { borderRadius: 26, borderWidth: 1, gap: 16, padding: 18 },
  skeletonRow: { flexDirection: "row", gap: 12 },
  snapshotCard: { borderWidth: 1, flexBasis: "47%", flexGrow: 1, gap: 6, minHeight: 118 },
  snapshotGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  snapshotLabel: { color: "#64748b", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  snapshotValue: { color: "#0f172a", fontSize: 14, fontWeight: "900", lineHeight: 19 },
  summaryCard: { borderRadius: 26, borderWidth: 1, gap: 16, padding: 16 },
  summaryHeading: { alignItems: "center", flexDirection: "row", gap: 12 },
  summaryIcon: { alignItems: "center", borderRadius: 17, height: 46, justifyContent: "center", width: 46 },
  summarySubtitle: { lineHeight: 20, marginTop: 4 },
  summaryTitle: { fontSize: 21, fontWeight: "900" },
  softIcon: { alignItems: "center", backgroundColor: "#f0fdfa", borderRadius: 15, height: 44, justifyContent: "center", width: 44 },
  stateText: { lineHeight: 21, maxWidth: 320, textAlign: "center" },
  stateIcon: { alignItems: "center", borderRadius: 22, height: 60, justifyContent: "center", width: 60 },
  stateTitle: { fontSize: 20, fontWeight: "900", textAlign: "center" },
  stickyHeaderWrap: { paddingBottom: 8, zIndex: 10 },
  priorityCard: { borderRadius: 24, borderWidth: 1, padding: 16 },
  widgetAction: { color: "#0f766e", fontSize: 12, fontWeight: "900" },
  widgetCard: { backgroundColor: "#ffffff", borderColor: "#ccfbf1", borderRadius: 20, borderWidth: 1, gap: 8, minHeight: 158, padding: 14, width: 140 },
  widgetDescription: { fontSize: 12, lineHeight: 17 },
  widgetIcon: { alignItems: "center", backgroundColor: "#f0fdfa", borderRadius: 13, height: 38, justifyContent: "center", width: 38 },
  widgetLabel: { color: "#64748b", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  widgetRow: { gap: 12, paddingRight: 4 },
  widgetValue: { color: "#0f172a", fontSize: 20, fontWeight: "900" },
  weeklyBars: { alignItems: "flex-end", flexDirection: "row", gap: 9, height: 130, justifyContent: "space-between" },
  weeklyCard: { borderRadius: 26, borderWidth: 1, gap: 12, padding: 16 },
  weeklyColumn: { alignItems: "center", flex: 1, gap: 7 },
  weeklyDay: { fontSize: 12, fontWeight: "800" },
  weeklyFill: { borderRadius: 999, bottom: 0, position: "absolute", width: "100%" },
  weeklySummary: { fontSize: 16, fontWeight: "900" },
  weeklyTrack: { borderRadius: 999, height: 96, overflow: "hidden", position: "relative", width: 12 }
});
