import { Pressable, StyleSheet, Text, View } from "react-native";

import { BabyAtAGlance } from "@/components/baby-child/BabyAtAGlance";
import { BabyEducationCard } from "@/components/baby-child/BabyEducationCard";
import { BabyQuickLogGrid, type BabyQuickLogMode } from "@/components/baby-child/BabyQuickLogGrid";
import { BabyTimeline } from "@/components/baby-child/BabyTimeline";
import { AppCard, AppIcon } from "@/components/ui";
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
  onSheet
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
  const selectedChildEvents = events.filter((event) => event.childProfileId === childProfileId);

  if (isLoading) return <OverviewSkeleton />;

  if (error) {
    return (
      <AppCard style={{ backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }}>
        <Text style={[styles.errorTitle, { color: theme.text }]}>Could not load Baby Care right now.</Text>
        <Text style={[styles.errorText, { color: theme.mutedText }]}>Try again when you are ready.</Text>
        <Pressable accessibilityRole="button" onPress={onRetry} style={[styles.retryButton, { backgroundColor: theme.primary }]}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </AppCard>
    );
  }

  return (
    <View style={styles.stack}>
      <AppCard style={[styles.hero, { backgroundColor: isDark(theme.background) ? theme.surfaceSoft ?? theme.surface : "#fff0ed", borderColor: theme.border }]}>
        <View style={styles.heroHeader}>
          <View style={[styles.heroIcon, { backgroundColor: theme.surface }]}>
            <AppIcon color={theme.primary} decorative name="baby_child" size={22} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={[styles.heroTitle, { color: theme.text }]}>Care Now</Text>
            <Text style={[styles.heroSubtitle, { color: theme.mutedText }]}>Essentials at a glance</Text>
          </View>
        </View>
        <View style={[styles.careGrid, { backgroundColor: theme.surface }]}>
          <CareMetric icon="nutrition" label="Last feed" primary={care.lastFeed ? formatAgo(care.lastFeed.loggedAt) : "Not logged yet"} secondary={care.lastFeed?.amountMl ? `${care.lastFeed.amountMl} ml` : "Start when ready"} tone="#fff0e8" />
          <CareMetric icon="sleep" label="Last sleep" primary={care.lastSleep ? formatAgo(care.lastSleep.loggedAt) : "Not logged yet"} secondary={care.lastSleep ? formatMinutes(care.lastSleep.durationMinutes) : "Start when ready"} tone="#f1edff" />
          <CareMetric icon="baby_child" label="Last diaper" primary={care.lastDiaper ? formatAgo(care.lastDiaper.loggedAt) : "Not logged yet"} secondary={care.lastDiaper ? formatValue(care.lastDiaper.diaperType) : "Start when ready"} tone="#e8f8f4" />
          <CareMetric icon="calendar" label="Next reminder" primary={care.nextReminder ?? "Add reminder"} secondary={care.nextReminder ? "Saved care reminder" : "Start when ready"} tone="#edf5ff" />
        </View>
      </AppCard>

      <SectionTitle subtitle="Log in a tap, view in time." title="Quick Log" />
      <BabyQuickLogGrid onSelect={onSheet} />

      <SectionTitle title="Today's Timeline" />
      <BabyTimeline events={selectedChildEvents} onLogFeed={() => onSheet("feed")} />

      <SectionTitle title="Today at a Glance" />
      <BabyAtAGlance diapers={care.diaperCount} dirtyDiapers={care.dirtyDiaperCount} feeds={care.feedCount} medicineDue={care.medicineDueCount} sleepMinutes={care.sleepMinutes} wetDiapers={care.wetDiaperCount} />

      <SectionTitle subtitle="Visual summaries from today's selected-child logs." title="Today's Insights" />
      <TodayInsights care={care} />

      <BabyEducationCard />

      <AppCard padding="md" style={[styles.safetyCard, { backgroundColor: theme.primarySoft, borderColor: theme.border }]}>
        <Text style={[styles.safetyText, { color: theme.mutedText }]}>
          Baby and child tracking is for organization and education only. It is not medical advice and does not replace a pediatrician, doctor, nurse, clinic, or healthcare professional.
        </Text>
      </AppCard>
    </View>
  );
}

function CareMetric({ icon, label, primary, secondary, tone }: { icon: string; label: string; primary: string; secondary: string; tone: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.metric, { backgroundColor: isDark(theme.background) ? theme.surface : tone }]}>
      <View style={[styles.metricIcon, { backgroundColor: theme.primarySoft }]}>
        <AppIcon color={theme.primary} decorative name={icon as never} size={20} />
      </View>
      <Text style={[styles.metricLabel, { color: theme.text }]}>{label}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.metricPrimary, { color: theme.text }]}>{primary}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.metricSecondary, { color: theme.mutedText }]}>{secondary}</Text>
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
      value: care.sleepBlockCount ? `${care.sleepBlockCount} blocks · ${formatMinutes(care.sleepMinutes)}` : "Start logging to see patterns."
    },
    {
      bars: makeBars(care.feedCount, care.feedTotalMl),
      icon: "nutrition",
      label: "Feeding",
      subtitle: "Logged feeds today",
      value: care.feedCount ? `${care.feedCount} feeds${care.feedTotalMl ? ` · ${care.feedTotalMl} ml` : ""}` : "Start logging to see patterns."
    },
    {
      bars: [care.wetDiaperCount, care.dirtyDiaperCount, care.diaperCount],
      icon: "baby_child",
      label: "Diapers",
      subtitle: "Wet and dirty notes",
      value: care.diaperCount ? `${care.wetDiaperCount} wet · ${care.dirtyDiaperCount} dirty` : "Start logging to see patterns."
    },
    {
      bars: care.growthLatest ? [2, 3, 4, 5] : [1, 2, 2, 3],
      icon: "weight",
      label: "Growth",
      subtitle: "Track measurements over time",
      value: care.growthLatest ? `Latest record · ${care.growthLatest}` : "Start logging to see patterns."
    }
  ];
  const { theme } = useAppTheme();

  return (
    <View style={styles.insightGrid}>
      {items.map((item, itemIndex) => (
        <AppCard key={item.label} padding="sm" style={[styles.insightCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.insightHeader}>
            <View style={[styles.insightIcon, { backgroundColor: theme.primarySoft }]}>
              <AppIcon color={theme.primary} decorative name={item.icon as never} size={18} />
            </View>
            <Text style={[styles.insightLabel, { color: theme.text }]}>{item.label}</Text>
          </View>
          <Text style={[styles.insightSubtitle, { color: theme.mutedText }]}>{item.subtitle}</Text>
          <View style={styles.bars}>
            {item.bars.map((bar, index) => (
              <View
                key={`${item.label}-${index}`}
                style={[
                  styles.bar,
                  {
                    backgroundColor: insightColors[itemIndex],
                    height: 12 + Math.min(34, Math.max(5, bar * 5))
                  }
                ]}
              />
            ))}
          </View>
          <Text style={[styles.insightValue, { color: theme.mutedText }]}>{item.value}</Text>
        </AppCard>
      ))}
    </View>
  );
}

const insightColors = ["#c4b5fd", "#fdba74", "#6ee7c8", "#93c5fd"];

function makeBars(count: number, total: number) {
  if (!count) return [1, 2, 1, 3, 2];
  return Array.from({ length: Math.min(6, Math.max(3, count)) }, (_, index) => Math.max(1, ((total || count * 10) / (index + 3)) % 8));
}

function SectionTitle({ subtitle, title }: { subtitle?: string; title: string }) {
  const { theme } = useAppTheme();
  return (
    <View>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.sectionSubtitle, { color: theme.mutedText }]}>{subtitle}</Text> : null}
    </View>
  );
}

function OverviewSkeleton() {
  const { theme } = useAppTheme();
  return (
    <View accessibilityLabel="Loading Baby Care" style={styles.stack}>
      {[100, 220, 210, 160].map((height, index) => (
        <View key={height} style={[styles.skeleton, { backgroundColor: theme.surface, borderColor: theme.border, height }]}>
          <View style={[styles.skeletonLine, { backgroundColor: theme.primarySoft, width: index ? "45%" : "60%" }]} />
          <View style={[styles.skeletonLine, { backgroundColor: theme.primarySoft, width: "82%" }]} />
        </View>
      ))}
    </View>
  );
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

function isDark(background: string) {
  return background.startsWith("#0") || background.startsWith("#1") || background.startsWith("rgb");
}

const styles = StyleSheet.create({
  bar: { borderRadius: 999, flex: 1, minWidth: 7 },
  bars: { alignItems: "flex-end", flexDirection: "row", gap: 5, height: 50, marginTop: 14 },
  careGrid: { borderRadius: 20, flexDirection: "row", flexWrap: "wrap", gap: 1, marginTop: 16, overflow: "hidden" },
  errorText: { lineHeight: 21, marginTop: 6 },
  errorTitle: { fontSize: 20, fontWeight: "900" },
  hero: { borderWidth: 1 },
  heroCopy: { flex: 1 },
  heroHeader: { alignItems: "center", flexDirection: "row", gap: 12 },
  heroIcon: { alignItems: "center", borderRadius: 18, height: 42, justifyContent: "center", width: 42 },
  heroSubtitle: { lineHeight: 20, marginTop: 4 },
  heroTitle: { fontSize: 21, fontWeight: "900" },
  insightCard: { borderWidth: 1, flexBasis: "46%", flexGrow: 1, minHeight: 190 },
  insightGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  insightHeader: { alignItems: "center", flexDirection: "row", gap: 8 },
  insightIcon: { alignItems: "center", borderRadius: 14, height: 34, justifyContent: "center", width: 34 },
  insightLabel: { fontSize: 15, fontWeight: "900" },
  insightSubtitle: { fontSize: 12, lineHeight: 18, marginTop: 9 },
  insightValue: { fontSize: 11, lineHeight: 17, marginTop: 10 },
  metric: { alignItems: "center", flexBasis: "48%", flexGrow: 1, minHeight: 138, padding: 12 },
  metricIcon: { alignItems: "center", borderRadius: 16, height: 38, justifyContent: "center", width: 38 },
  metricLabel: { fontSize: 12, fontWeight: "900", marginTop: 8, textAlign: "center" },
  metricPrimary: { fontSize: 14, fontWeight: "900", marginTop: 7, textAlign: "center" },
  metricSecondary: { fontSize: 12, marginTop: 5, textAlign: "center" },
  retryButton: { alignSelf: "flex-start", borderRadius: 999, marginTop: 14, minHeight: 44, paddingHorizontal: 18, paddingVertical: 12 },
  retryText: { color: "#10201d", fontWeight: "900" },
  safetyCard: { borderWidth: 1 },
  safetyText: { fontSize: 12, lineHeight: 19 },
  sectionSubtitle: { lineHeight: 20, marginTop: 3 },
  sectionTitle: { fontSize: 21, fontWeight: "900" },
  skeleton: { borderRadius: 26, borderWidth: 1, gap: 14, padding: 18 },
  skeletonLine: { borderRadius: 999, height: 14 },
  stack: { gap: 16 }
});
