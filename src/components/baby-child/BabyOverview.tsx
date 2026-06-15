import { Pressable, StyleSheet, Text, View } from "react-native";

import { BabyAtAGlance } from "@/components/baby-child/BabyAtAGlance";
import { BabyEducationCard } from "@/components/baby-child/BabyEducationCard";
import {
  BabyQuickLogGrid,
  type BabyQuickLogMode,
} from "@/components/baby-child/BabyQuickLogGrid";
import { BabyTimeline } from "@/components/baby-child/BabyTimeline";
import {
  HealthDonutChart,
  HealthMiniLineChart,
  HealthProgressRing,
} from "@/components/health/HealthHubCharts";
import { AppCard, AppChip, AppIcon } from "@/components/ui";
import {
  healthRealmAccents,
  realmAccentWithOpacity,
} from "@/theme/healthTheme";
import { useAppTheme } from "@/theme/ThemeProvider";
import type { BabyCalendarEvent } from "@/types/child";

export type BabyOverviewCare = {
  diaperCount: number;
  dirtyDiaperCount: number;
  feedCount: number;
  feedTotalMl: number;
  growthLatest?: string;
  lastDiaper?: { diaperType: string; loggedAt: string };
  lastFeed?: { amountMl?: number; loggedAt: string };
  lastSleep?: { durationMinutes: number; loggedAt: string };
  medicineDueCount: number;
  nextReminder?: string;
  sleepBlockCount: number;
  sleepMinutes: number;
  wetDiaperCount: number;
};

export function BabyOverview({
  care,
  childProfileId,
  error,
  events,
  isLoading,
  onRetry,
  onSheet,
}: {
  care: BabyOverviewCare;
  childProfileId: string;
  error?: string;
  events: BabyCalendarEvent[];
  isLoading: boolean;
  onRetry: () => void;
  onSheet: (mode: BabyQuickLogMode) => void;
}) {
  const { theme } = useAppTheme();
  const selectedChildEvents = events.filter(
    (event) => event.childProfileId === childProfileId,
  );

  if (isLoading) return <OverviewSkeleton />;

  if (error) {
    return (
      <AppCard
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderWidth: 1,
        }}
      >
        <Text style={[styles.errorTitle, { color: theme.text }]}>
          Could not load Baby Care right now.
        </Text>
        <Text style={[styles.errorText, { color: theme.mutedText }]}>
          Try again when you are ready.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </AppCard>
    );
  }

  return (
    <View style={styles.stack}>
      <BabyCareHero care={care} onSheet={onSheet} />

      <SectionTitle subtitle="Log in a tap, view in time." title="Quick Log" />
      <BabyQuickLogGrid onSelect={onSheet} />

      <SectionTitle
        subtitle="Real selected-child care logs with no medical interpretation."
        title="Care snapshot"
      />
      <CareSnapshot care={care} />

      <SectionTitle title="Today's Timeline" />
      <BabyTimeline
        events={selectedChildEvents}
        onLogFeed={() => onSheet("feed")}
      />

      <SectionTitle title="Today at a Glance" />
      <BabyAtAGlance
        diapers={care.diaperCount}
        dirtyDiapers={care.dirtyDiaperCount}
        feeds={care.feedCount}
        medicineDue={care.medicineDueCount}
        sleepMinutes={care.sleepMinutes}
        wetDiapers={care.wetDiaperCount}
      />

      <SectionTitle
        subtitle="Visual summaries from today's selected-child logs."
        title="Today's Insights"
      />
      <TodayInsights care={care} />

      <BabyEducationCard />

      <AppCard
        padding="md"
        style={[
          styles.safetyCard,
          { backgroundColor: theme.primarySoft, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.safetyText, { color: theme.mutedText }]}>
          Baby and child tracking is for organization and education only. It is
          not medical advice and does not replace a pediatrician, doctor, nurse,
          clinic, or healthcare professional.
        </Text>
      </AppCard>
    </View>
  );
}

function BabyCareHero({
  care,
  onSheet,
}: {
  care: BabyOverviewCare;
  onSheet: (mode: BabyQuickLogMode) => void;
}) {
  const { theme } = useAppTheme();
  const activityCount =
    care.feedCount + care.sleepBlockCount + care.diaperCount;
  const headline = care.medicineDueCount
    ? `${care.medicineDueCount} medicine item${care.medicineDueCount === 1 ? "" : "s"} due`
    : care.nextReminder ?? "Care timeline is ready";

  return (
    <AppCard
      padding="md"
      style={[
        styles.v8Hero,
        {
          backgroundColor: theme.surface,
          borderColor: realmAccentWithOpacity("baby", 0.42),
        },
      ]}
    >
      <View style={styles.v8HeroRow}>
        <View style={styles.v8HeroCopy}>
          <Text style={styles.v8Kicker}>BABY / CHILD CARE</Text>
          <Text style={[styles.v8HeroTitle, { color: theme.text }]}>
            {headline}
          </Text>
          <Text style={[styles.v8HeroBody, { color: theme.mutedText }]}>
            {care.lastFeed
              ? `Latest feed ${formatAgo(care.lastFeed.loggedAt)}.`
              : "Start with the next care log when ready."}
          </Text>
        </View>
        <View style={styles.v8Ring}>
          <HealthProgressRing
            color={healthRealmAccents.baby}
            progress={Math.min(100, activityCount * 10)}
            size={78}
            trackColor={theme.border}
          />
          <Text style={[styles.v8RingValue, { color: theme.text }]}>
            {activityCount}
          </Text>
        </View>
      </View>
      <View style={styles.v8HeroStats}>
        <HeroMetric label="Feeds" value={`${care.feedCount}`} />
        <HeroMetric label="Sleep" value={formatMinutes(care.sleepMinutes)} />
        <HeroMetric label="Diapers" value={`${care.diaperCount}`} />
      </View>
      <View style={styles.v8Actions}>
        <AppChip label="Log feed" onPress={() => onSheet("feed")} selected />
        <AppChip label="Log sleep" onPress={() => onSheet("sleep")} />
        <AppChip label="Add note" onPress={() => onSheet("note")} />
      </View>
    </AppCard>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
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

function CareSnapshot({ care }: { care: BabyOverviewCare }) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.v8SnapshotGrid}>
      <AppCard padding="sm" style={styles.v8SnapshotCard}>
        <View style={styles.v8SnapshotTop}>
          <View>
            <Text style={[styles.v8SnapshotLabel, { color: theme.mutedText }]}>
              Care activity
            </Text>
            <Text style={[styles.v8SnapshotValue, { color: theme.text }]}>
              {care.feedCount + care.sleepBlockCount + care.diaperCount}
            </Text>
          </View>
          <HealthMiniLineChart
            color={healthRealmAccents.baby}
            data={[
              care.feedCount,
              care.sleepBlockCount,
              care.diaperCount,
              care.medicineDueCount,
            ]}
            height={42}
            width={86}
          />
        </View>
        <Text style={[styles.v8SnapshotMeta, { color: theme.mutedText }]}>
          Feed, sleep, diaper, and medicine logs today.
        </Text>
      </AppCard>
      <AppCard padding="sm" style={styles.v8SnapshotCard}>
        <View style={styles.v8SnapshotTop}>
          <View>
            <Text style={[styles.v8SnapshotLabel, { color: theme.mutedText }]}>
              Diaper notes
            </Text>
            <Text style={[styles.v8SnapshotValue, { color: theme.text }]}>
              {care.diaperCount}
            </Text>
          </View>
          <HealthDonutChart
            colors={[healthRealmAccents.baby, theme.warning]}
            size={52}
            trackColor={theme.border}
            values={[care.wetDiaperCount, care.dirtyDiaperCount]}
          />
        </View>
        <Text style={[styles.v8SnapshotMeta, { color: theme.mutedText }]}>
          {care.wetDiaperCount} wet | {care.dirtyDiaperCount} dirty
        </Text>
      </AppCard>
    </View>
  );
}

function TodayInsights({ care }: { care: BabyOverviewCare }) {
  const items = [
    {
      bars: makeBars(care.sleepBlockCount, care.sleepMinutes),
      icon: "sleep",
      label: "Sleep",
      subtitle: "Today's rest pattern",
      value: care.sleepBlockCount
        ? `${care.sleepBlockCount} blocks · ${formatMinutes(care.sleepMinutes)}`
        : "Start logging to see patterns.",
    },
    {
      bars: makeBars(care.feedCount, care.feedTotalMl),
      icon: "nutrition",
      label: "Feeding",
      subtitle: "Logged feeds today",
      value: care.feedCount
        ? `${care.feedCount} feeds${care.feedTotalMl ? ` · ${care.feedTotalMl} ml` : ""}`
        : "Start logging to see patterns.",
    },
    {
      bars: [care.wetDiaperCount, care.dirtyDiaperCount, care.diaperCount],
      icon: "baby_child",
      label: "Diapers",
      subtitle: "Wet and dirty notes",
      value: care.diaperCount
        ? `${care.wetDiaperCount} wet · ${care.dirtyDiaperCount} dirty`
        : "Start logging to see patterns.",
    },
    {
      bars: care.growthLatest ? [2, 3, 4, 5] : [1, 2, 2, 3],
      icon: "weight",
      label: "Growth",
      subtitle: "Track measurements over time",
      value: care.growthLatest
        ? `Latest record · ${care.growthLatest}`
        : "Start logging to see patterns.",
    },
  ];
  const { theme } = useAppTheme();

  return (
    <View style={styles.insightGrid}>
      {items.map((item, itemIndex) => (
        <AppCard
          key={item.label}
          padding="sm"
          style={[
            styles.insightCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.insightHeader}>
            <View
              style={[
                styles.insightIcon,
                { backgroundColor: theme.primarySoft },
              ]}
            >
              <AppIcon
                color={theme.primary}
                decorative
                name={item.icon as never}
                size={18}
              />
            </View>
            <Text style={[styles.insightLabel, { color: theme.text }]}>
              {item.label}
            </Text>
          </View>
          <Text style={[styles.insightSubtitle, { color: theme.mutedText }]}>
            {item.subtitle}
          </Text>
          <View style={styles.bars}>
            {item.bars.map((bar, index) => (
              <View
                key={`${item.label}-${index}`}
                style={[
                  styles.bar,
                  {
                    backgroundColor: insightColors[itemIndex],
                    height: 12 + Math.min(34, Math.max(5, bar * 5)),
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.insightValue, { color: theme.mutedText }]}>
            {item.value}
          </Text>
        </AppCard>
      ))}
    </View>
  );
}

const insightColors = ["#c4b5fd", "#fdba74", "#6ee7c8", "#93c5fd"];

function makeBars(count: number, total: number) {
  if (!count) return [1, 2, 1, 3, 2];
  return Array.from({ length: Math.min(6, Math.max(3, count)) }, (_, index) =>
    Math.max(1, ((total || count * 10) / (index + 3)) % 8),
  );
}

function SectionTitle({
  subtitle,
  title,
}: {
  subtitle?: string;
  title: string;
}) {
  const { theme } = useAppTheme();
  return (
    <View>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.sectionSubtitle, { color: theme.mutedText }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

function OverviewSkeleton() {
  const { theme } = useAppTheme();
  return (
    <View accessibilityLabel="Loading Baby Care" style={styles.stack}>
      {[100, 220, 210, 160].map((height, index) => (
        <View
          key={height}
          style={[
            styles.skeleton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              height,
            },
          ]}
        >
          <View
            style={[
              styles.skeletonLine,
              {
                backgroundColor: theme.primarySoft,
                width: index ? "45%" : "60%",
              },
            ]}
          />
          <View
            style={[
              styles.skeletonLine,
              { backgroundColor: theme.primarySoft, width: "82%" },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

function formatAgo(value: string) {
  const minutes = Math.max(
    0,
    Math.round((Date.now() - new Date(value).getTime()) / 60000),
  );
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
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const styles = StyleSheet.create({
  bar: { borderRadius: 999, flex: 1, minWidth: 7 },
  bars: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 5,
    height: 50,
    marginTop: 14,
  },
  careGrid: {
    borderRadius: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 1,
    marginTop: 16,
    overflow: "hidden",
  },
  errorText: { lineHeight: 21, marginTop: 6 },
  errorTitle: { fontSize: 20, fontWeight: "900" },
  hero: { borderWidth: 1 },
  heroCopy: { flex: 1 },
  heroHeader: { alignItems: "center", flexDirection: "row", gap: 12 },
  heroIcon: {
    alignItems: "center",
    borderRadius: 18,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  heroSubtitle: { lineHeight: 20, marginTop: 4 },
  heroTitle: { fontSize: 21, fontWeight: "900" },
  insightCard: {
    borderWidth: 1,
    flexBasis: "46%",
    flexGrow: 1,
    minHeight: 190,
  },
  insightGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  insightHeader: { alignItems: "center", flexDirection: "row", gap: 8 },
  insightIcon: {
    alignItems: "center",
    borderRadius: 14,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  insightLabel: { fontSize: 15, fontWeight: "900" },
  insightSubtitle: { fontSize: 12, lineHeight: 18, marginTop: 9 },
  insightValue: { fontSize: 11, lineHeight: 17, marginTop: 10 },
  metric: {
    alignItems: "center",
    flexBasis: "48%",
    flexGrow: 1,
    minHeight: 138,
    padding: 12,
  },
  metricIcon: {
    alignItems: "center",
    borderRadius: 16,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "900",
    marginTop: 8,
    textAlign: "center",
  },
  metricPrimary: {
    fontSize: 14,
    fontWeight: "900",
    marginTop: 7,
    textAlign: "center",
  },
  metricSecondary: { fontSize: 12, marginTop: 5, textAlign: "center" },
  retryButton: {
    alignSelf: "flex-start",
    borderRadius: 999,
    marginTop: 14,
    minHeight: 44,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  retryText: { color: "#10201d", fontWeight: "900" },
  safetyCard: { borderWidth: 1 },
  safetyText: { fontSize: 12, lineHeight: 19 },
  sectionSubtitle: { lineHeight: 20, marginTop: 3 },
  sectionTitle: { fontSize: 21, fontWeight: "900" },
  skeleton: { borderRadius: 26, borderWidth: 1, gap: 14, padding: 18 },
  skeletonLine: { borderRadius: 999, height: 14 },
  stack: { gap: 16 },
  v8Actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  v8Hero: {
    borderWidth: 1,
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
    minWidth: 76,
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
    fontSize: 16,
    fontWeight: "900",
  },
  v8HeroRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  v8HeroStats: {
    flexDirection: "row",
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
  v8Kicker: {
    color: healthRealmAccents.baby,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  v8Ring: {
    alignItems: "center",
    height: 78,
    justifyContent: "center",
    width: 78,
  },
  v8RingValue: {
    fontSize: 16,
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
