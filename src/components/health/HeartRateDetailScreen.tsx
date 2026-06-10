import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";

import { GeneralHealthActivityDetailSheet } from "@/components/health/GeneralHealthActivityDetailSheet";
import { useGeneralHealthActivity } from "@/components/health/GeneralHealthActivityProvider";
import { HealthScreenContainer } from "@/components/health/HealthScreenContainer";
import { GeneralHealthLogSheet } from "@/components/health/GeneralHealthLogSheet";
import { AppButton, AppCard, AppIcon, AppSection } from "@/components/ui";
import { createGeneralHealthActivity } from "@/lib/generalHealthActivity";
import type { GeneralHealthActivityEntry, GeneralHealthLogDraft } from "@/lib/generalHealthMockData";
import { useAppTheme } from "@/theme/ThemeProvider";

type HeartRateRange = 7 | 30 | 90 | "all";
type HeartRatePoint = { activity: Extract<GeneralHealthActivityEntry, { type: "vitals" }>; id: string; recordedAt: string; value: number };

const RANGE_OPTIONS: { label: string; value: HeartRateRange }[] = [
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
  { label: "All", value: "all" }
];
const SCREEN_STATE: "error" | "loading" | "ready" = "ready";

export function HeartRateDetailScreen() {
  const { theme } = useAppTheme();
  const { activities, addActivity, selectedProfileId, selectedProfileName } = useGeneralHealthActivity();
  const [range, setRange] = useState<HeartRateRange>(7);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailActivity, setDetailActivity] = useState<GeneralHealthActivityEntry | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [openedAt] = useState(() => new Date());

  // TODO: Replace feature-local readings with the approved profile health data layer and connected-device sources.
  const allPoints = useMemo(() => getHeartRateReadingsForProfile(activities, selectedProfileId), [activities, selectedProfileId]);
  const points = useMemo(() => filterHeartRateReadingsByRange(allPoints, range, openedAt), [allPoints, openedAt, range]);
  const summary = useMemo(() => calculateHeartRateSavedSummary(points), [points]);
  const selectedPoint = points.find((point) => point.id === selectedId) ?? points.at(-1) ?? null;

  function saveVitals(draft: GeneralHealthLogDraft) {
    addActivity(createGeneralHealthActivity(draft, selectedProfileId, selectedProfileName));
    setLogOpen(false);
  }

  // TODO: Preselect and focus Heart Rate when the shared Add Vitals sheet supports a focused log mode.
  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <HealthScreenContainer bottomSpacing={40} contentStyle={styles.content}>
        <HeartRateHeader profileName={selectedProfileName} />
        {SCREEN_STATE === "loading" ? <HeartRateLoading /> : null}
        {SCREEN_STATE === "error" ? <HeartRateState message="Please return to General Health and open this screen again." title="We couldn't load heart rate history" /> : null}
        {SCREEN_STATE === "ready" && !allPoints.length ? <HeartRateState action="Add heart rate reading" message="Add a reading to begin building your personal history." onAction={() => setLogOpen(true)} title="No heart rate readings yet" /> : null}
        {SCREEN_STATE === "ready" && allPoints.length ? (
          <>
            <HeartRateLatestCard points={allPoints} />
            <HeartRateRangeSelector range={range} setRange={(nextRange) => { setRange(nextRange); setSelectedId(null); }} />
            {!points.length ? (
              <HeartRateState action="Show all" message="Choose another range or add a new reading." onAction={() => { setRange("all"); setSelectedId(null); }} title="No readings in this time range" />
            ) : (
              <>
                <HeartRateTrendChart onSelect={setSelectedId} points={points} selectedId={selectedPoint?.id ?? null} summary={summary} />
                {selectedPoint ? <SelectedPointCard point={selectedPoint} /> : null}
                <SavedRangeSummary summary={summary} />
                <RecentHeartRateReadings entries={[...allPoints].reverse().slice(0, 5)} onOpen={setDetailActivity} />
              </>
            )}
            <AppButton accessibilityLabel="Add heart rate reading" fullWidth label="Add heart rate reading" onPress={() => setLogOpen(true)} />
            <SafetyNote />
          </>
        ) : null}
      </HealthScreenContainer>
      <GeneralHealthActivityDetailSheet activity={detailActivity?.profileId === selectedProfileId ? detailActivity : null} onClose={() => setDetailActivity(null)} />
      <GeneralHealthLogSheet key={logOpen ? "heart-rate-open" : "heart-rate-closed"} logType={logOpen ? "vitals" : null} onCancel={() => setLogOpen(false)} onSave={saveVitals} profileName={selectedProfileName} />
    </View>
  );
}

function HeartRateHeader({ profileName }: { profileName: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Pressable accessibilityHint="Returns to General Health" accessibilityLabel="Back to General Health" accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: theme.surface, borderColor: theme.border }, pressed ? styles.pressed : null]}><Text style={[styles.backText, { color: theme.text }]}>{"<"}</Text></Pressable>
        <View style={styles.headerCopy}>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>Heart rate</Text>
          <Text style={[styles.subtitle, { color: theme.mutedText }]}>Saved readings and personal trends</Text>
        </View>
      </View>
      <View accessibilityLabel={`Active profile, ${profileName}`} accessible style={[styles.profile, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={[styles.profileIcon, { backgroundColor: theme.primarySoft }]}><AppIcon color={theme.primary} decorative name="profile" size={16} /></View>
        <View><Text style={[styles.profileName, { color: theme.text }]}>{profileName}</Text><Text style={[styles.profileMeta, { color: theme.mutedText }]}>Active profile</Text></View>
      </View>
    </View>
  );
}

function HeartRateLatestCard({ points }: { points: HeartRatePoint[] }) {
  const { theme } = useAppTheme();
  const latest = points.at(-1)!;
  const previous = points.at(-2);
  const change = previous ? latest.value - previous.value : null;
  const comparison = change === null
    ? "Add more readings to see changes over time."
    : change === 0
      ? "Same value as your previous saved entry."
      : `${Math.abs(change)} bpm ${change > 0 ? "higher" : "lower"} than your previous saved entry.`;
  return (
    <AppCard style={[styles.hero, { backgroundColor: theme.primarySoft, borderColor: theme.primary }]}>
      <Text style={[styles.eyebrow, { color: theme.primary }]}>LATEST READING</Text>
      <Text accessibilityLabel={`Latest heart rate reading, ${latest.value} beats per minute, saved ${formatDateTime(latest.recordedAt)}`} style={[styles.latestValue, { color: theme.text }]}>{latest.value} <Text style={styles.latestUnit}>bpm</Text></Text>
      <Text style={[styles.heroTime, { color: theme.mutedText }]}>Saved {formatDateTime(latest.recordedAt)}</Text>
      <Text style={[styles.heroSupport, { color: theme.mutedText }]}>
        {comparison}
      </Text>
    </AppCard>
  );
}

function HeartRateRangeSelector({ range, setRange }: { range: HeartRateRange; setRange: (value: HeartRateRange) => void }) {
  const { theme } = useAppTheme();
  return <View style={styles.rangeRow}>{RANGE_OPTIONS.map((option) => {
    const active = range === option.value;
    return <Pressable accessibilityLabel={`${option.label === "All" ? "All time" : `${option.value} days`}, ${active ? "selected" : "not selected"}`} accessibilityRole="button" accessibilityState={{ selected: active }} key={option.label} onPress={() => setRange(option.value)} style={({ pressed }) => [styles.rangeButton, { backgroundColor: active ? theme.primarySoft : theme.surface, borderColor: active ? theme.primary : theme.border }, pressed ? styles.pressed : null]}><Text style={[styles.rangeText, { color: active ? theme.primary : theme.text }]}>{active ? "Selected " : ""}{option.label}</Text></Pressable>;
  })}</View>;
}

function HeartRateTrendChart({ onSelect, points, selectedId, summary }: { onSelect: (id: string) => void; points: HeartRatePoint[]; selectedId: string | null; summary: HeartRateSummary }) {
  const { theme } = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();
  const width = Math.max(160, Math.min(screenWidth - 70, 410));
  const height = 220;
  const plot = getChartPlot(points, width, height);
  const xLabels = getXAxisLabels(plot.positions);
  const accessibilityLabel = `Heart rate trend. ${summary.count} saved readings. Lowest saved reading ${summary.lowest} beats per minute, highest ${summary.highest}, average ${summary.average}.`;

  function selectNearest(locationX: number) {
    const nearest = plot.positions.reduce((current, point) =>
      Math.abs(point.x - locationX) < Math.abs(current.x - locationX) ? point : current
    );
    onSelect(nearest.id);
  }

  return (
    <AppCard style={[styles.chartCard, { borderColor: theme.border }]}>
      <View style={styles.chartHeading}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Heart rate trend</Text>
        <Text style={[styles.chartUnit, { color: theme.mutedText }]}>bpm</Text>
      </View>
      <Text accessibilityLabel={accessibilityLabel} accessible style={styles.srSummary}>{accessibilityLabel}</Text>
      <View onTouchEnd={(event) => selectNearest(event.nativeEvent.locationX)} style={[styles.chart, { height, width }]}>
        <Svg height={height} pointerEvents="none" width={width}>
          {plot.ticks.map((tick) => <Line key={tick.value} stroke={theme.border} strokeWidth="1" x1={plot.left} x2={width - plot.right} y1={tick.y} y2={tick.y} />)}
          {selectedId ? <Line stroke={theme.mutedText} strokeDasharray="3 4" strokeWidth="1" x1={plot.positions.find((point) => point.id === selectedId)?.x ?? 0} x2={plot.positions.find((point) => point.id === selectedId)?.x ?? 0} y1={plot.top} y2={height - plot.bottom} /> : null}
          {plot.positions.length > 1 ? <Polyline fill="none" points={plot.positions.map((point) => `${point.x},${point.y}`).join(" ")} stroke={theme.primary} strokeWidth="2.5" /> : null}
          {plot.positions.map((point) => <Circle cx={point.x} cy={point.y} fill={point.id === selectedId ? theme.surface : theme.primary} key={point.id} r={point.id === selectedId ? 7 : 4} stroke={theme.primary} strokeWidth={point.id === selectedId ? 3 : 1} />)}
        </Svg>
        {plot.ticks.map((tick) => <Text key={tick.value} pointerEvents="none" style={[styles.yLabel, { color: theme.mutedText, top: tick.y - 8 }]}>{tick.value}</Text>)}
        {plot.positions.map((point) => <Pressable accessibilityLabel={`${point.value} beats per minute, ${formatFullDateTime(point.recordedAt)}. Added manually.`} accessibilityRole="button" accessibilityState={{ selected: point.id === selectedId }} key={point.id} onPress={() => onSelect(point.id)} style={[styles.pointTarget, { left: point.x - 22, top: point.y - 22 }]} />)}
      </View>
      <View style={[styles.xLabels, { paddingLeft: plot.left, paddingRight: plot.right }]}>
        {xLabels.map((point) => <Text key={point.id} numberOfLines={1} style={[styles.axisText, { color: theme.mutedText }]}>{formatShortDate(point.recordedAt)}</Text>)}
      </View>
      {points.length === 1 ? <Text style={[styles.singleText, { color: theme.mutedText }]}>Add more readings to see a trend.</Text> : null}
    </AppCard>
  );
}

function SelectedPointCard({ point }: { point: HeartRatePoint }) {
  const { theme } = useAppTheme();
  return <View accessibilityLabel={`Selected reading, ${point.value} beats per minute, ${formatFullDateTime(point.recordedAt)}, added manually${point.activity.details.notes ? `, note: ${point.activity.details.notes}` : ""}`} accessible style={[styles.selected, { backgroundColor: theme.surface, borderColor: theme.border }]}><Text style={[styles.selectedKicker, { color: theme.primary }]}>SELECTED READING</Text><Text style={[styles.selectedValue, { color: theme.text }]}>{point.value} <Text style={styles.selectedUnit}>bpm</Text></Text><Text style={[styles.selectedMeta, { color: theme.mutedText }]}>{formatFullDateTime(point.recordedAt)}</Text>{point.activity.details.notes ? <Text numberOfLines={2} style={[styles.selectedNote, { color: theme.mutedText }]}>Note: {point.activity.details.notes}</Text> : null}<Text style={[styles.source, { color: theme.primary }]}>Added manually</Text></View>;
}

type HeartRateSummary = { average: number; count: number; highest: number; lowest: number };
function SavedRangeSummary({ summary }: { summary: HeartRateSummary }) {
  const { theme } = useAppTheme();
  const metrics = [
    { accessibilityLabel: `Lowest saved reading, ${summary.lowest} beats per minute`, label: "Lowest saved", value: `${summary.lowest} bpm` },
    { accessibilityLabel: `Highest saved reading, ${summary.highest} beats per minute`, label: "Highest saved", value: `${summary.highest} bpm` },
    { accessibilityLabel: `Average saved reading, ${summary.average} beats per minute`, label: "Average saved", value: `${summary.average} bpm` },
    { accessibilityLabel: `${summary.count} saved ${summary.count === 1 ? "reading" : "readings"}`, label: "Readings", value: `${summary.count}` }
  ];
  return <AppSection subtitle="Calculated from the readings visible in this time range." title="Your saved range"><View style={styles.summaryGrid}>{metrics.map((metric) => <View accessibilityLabel={metric.accessibilityLabel} accessible key={metric.label} style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}><Text style={[styles.summaryLabel, { color: theme.mutedText }]}>{metric.label}</Text><Text style={[styles.summaryValue, { color: theme.text }]}>{metric.value}</Text></View>)}</View></AppSection>;
}

function RecentHeartRateReadings({ entries, onOpen }: { entries: HeartRatePoint[]; onOpen: (entry: GeneralHealthActivityEntry) => void }) {
  const { theme } = useAppTheme();
  // TODO: Pass a Vitals filter to History when route-level filter parameters are supported.
  return <AppSection actionAccessibilityHint="Opens General Health history" actionAccessibilityLabel="View all health history" actionLabel="View all" onActionPress={() => router.push("/health/general/history")} title="Recent readings"><View style={styles.readingStack}>{entries.map((point) => <Pressable accessibilityHint="Opens the complete saved activity details." accessibilityLabel={`${point.value} beats per minute, ${formatFullDateTime(point.recordedAt)}, added manually${point.activity.details.notes ? ", includes a note" : ""}`} accessibilityRole="button" key={point.id} onPress={() => onOpen(point.activity)} style={({ pressed }) => [styles.readingRow, { backgroundColor: theme.surface, borderColor: theme.border }, pressed ? styles.pressed : null]}><View style={styles.readingCopy}><Text style={[styles.readingValue, { color: theme.text }]}>{point.value} bpm</Text><Text style={[styles.readingMeta, { color: theme.mutedText }]}>{formatDateTime(point.recordedAt)} - Added manually</Text>{point.activity.details.notes ? <Text style={[styles.noteIndicator, { color: theme.primary }]}>Has note</Text> : null}</View><Text style={[styles.chevron, { color: theme.mutedText }]}>{">"}</Text></Pressable>)}</View></AppSection>;
}

function SafetyNote() { const { theme } = useAppTheme(); return <View style={[styles.safety, { borderColor: theme.border }]}><AppIcon color={theme.primary} decorative name="health" size={18} /><Text style={[styles.safetyText, { color: theme.mutedText }]}>This screen organizes the readings you save and does not interpret them medically. Contact a healthcare professional if you are worried about symptoms or readings.</Text></View>; }
function HeartRateLoading() { const { theme } = useAppTheme(); return <View style={styles.loading}>{[150, 260, 160, 90].map((height) => <View key={height} style={[styles.skeleton, { backgroundColor: theme.surface, borderColor: theme.border, height }]} />)}</View>; }
function HeartRateState({ action, message, onAction, title }: { action?: string; message: string; onAction?: () => void; title: string }) { const { theme } = useAppTheme(); return <AppCard style={[styles.empty, { borderColor: theme.border }]}><AppIcon color={theme.primary} container name="vitals" size={24} /><Text style={[styles.emptyTitle, { color: theme.text }]}>{title}</Text><Text style={[styles.emptyMessage, { color: theme.mutedText }]}>{message}</Text>{action && onAction ? <AppButton label={action} onPress={onAction} /> : null}</AppCard>; }

function getHeartRateReadingsForProfile(entries: GeneralHealthActivityEntry[], profileId: string): HeartRatePoint[] {
  return entries.flatMap((entry) => {
    const recordedTime = new Date(entry.createdAt).getTime();
    return entry.profileId === profileId && entry.type === "vitals" && entry.details.heartRate && Number.isFinite(Number(entry.details.heartRate)) && Number.isFinite(recordedTime)
      ? [{ activity: entry, id: entry.id, recordedAt: entry.createdAt, value: Number(entry.details.heartRate) }]
      : [];
  }).sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
}
function filterHeartRateReadingsByRange(points: HeartRatePoint[], range: HeartRateRange, reference: Date) { if (range === "all") return points; const cutoff = reference.getTime() - range * 86400000; return points.filter((point) => new Date(point.recordedAt).getTime() >= cutoff); }
function calculateHeartRateSavedSummary(points: HeartRatePoint[]): HeartRateSummary { const values = points.map((point) => point.value); return { average: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length), count: values.length, highest: Math.max(...values), lowest: Math.min(...values) }; }
function getChartPlot(points: HeartRatePoint[], width: number, height: number) {
  const left = 38;
  const right = 12;
  const top = 14;
  const bottom = 16;
  const values = points.map((point) => point.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const dataSpan = Math.max(rawMax - rawMin, 6);
  const padding = Math.max(4, Math.ceil(dataSpan * 0.2));
  const interval = getTickInterval(dataSpan + padding * 2);
  const min = Math.floor((rawMin - padding) / interval) * interval;
  const max = Math.ceil((rawMax + padding) / interval) * interval;
  const span = Math.max(max - min, interval);
  const firstTime = new Date(points[0].recordedAt).getTime();
  const lastTime = new Date(points.at(-1)!.recordedAt).getTime();
  const timeSpan = Math.max(lastTime - firstTime, 1);
  const positions = points.map((point) => ({
    ...point,
    x: points.length === 1 ? left + (width - left - right) / 2 : left + (new Date(point.recordedAt).getTime() - firstTime) / timeSpan * (width - left - right),
    y: top + (max - point.value) / span * (height - top - bottom)
  }));
  const ticks = [max, Math.round((max + min) / 2 / interval) * interval, min]
    .filter((value, index, list) => list.indexOf(value) === index)
    .map((value) => ({ value, y: top + (max - value) / span * (height - top - bottom) }));
  return { bottom, left, positions, right, ticks, top };
}
function getTickInterval(span: number) { if (span <= 10) return 2; if (span <= 25) return 5; if (span <= 50) return 10; return 20; }
function getXAxisLabels<T extends HeartRatePoint>(points: T[]) {
  if (points.length <= 4) return points;
  const indices = [0, Math.round((points.length - 1) / 3), Math.round((points.length - 1) * 2 / 3), points.length - 1];
  return indices.filter((index, position) => indices.indexOf(index) === position).map((index) => points[index]);
}
function formatDateTime(value: string) { return new Date(value).toLocaleString(undefined, { day: "numeric", hour: "numeric", minute: "2-digit", month: "short" }); }
function formatFullDateTime(value: string) { return new Date(value).toLocaleString(undefined, { day: "numeric", hour: "numeric", minute: "2-digit", month: "long", year: "numeric" }); }
function formatShortDate(value: string) { return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short" }); }

const styles = StyleSheet.create({
  axisText: { flexShrink: 1, fontSize: 11, fontWeight: "800", textAlign: "center" },
  back: { alignItems: "center", borderRadius: 16, borderWidth: 1, height: 44, justifyContent: "center", width: 44 }, backText: { fontSize: 22, fontWeight: "900" },
  chart: { alignSelf: "center", position: "relative" }, chartCard: { borderWidth: 1, gap: 12, overflow: "hidden", padding: 16 }, chartHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, chartUnit: { fontSize: 12, fontWeight: "900" }, chevron: { fontSize: 20, fontWeight: "900" },
  content: { gap: 24 },
  empty: { alignItems: "center", borderWidth: 1, gap: 12, padding: 24 }, emptyMessage: { lineHeight: 21, textAlign: "center" }, emptyTitle: { fontSize: 20, fontWeight: "900", textAlign: "center" },
  eyebrow: { fontSize: 11, fontWeight: "900" }, header: { gap: 12 }, headerCopy: { flex: 1 }, headerTop: { alignItems: "center", flexDirection: "row", gap: 12 },
  hero: { borderWidth: 1, gap: 7, overflow: "hidden", padding: 20 }, heroSupport: { fontSize: 13, lineHeight: 20, marginTop: 5 }, heroTime: { fontSize: 13 },
  latestUnit: { fontSize: 20, fontWeight: "900" }, latestValue: { fontSize: 42, fontWeight: "900", lineHeight: 48 }, loading: { gap: 14 },
  noteIndicator: { fontSize: 12, fontWeight: "900", marginTop: 5 }, pointTarget: { height: 44, position: "absolute", width: 44 }, pressed: { opacity: 0.74 }, profile: { alignItems: "center", alignSelf: "flex-start", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 9, minHeight: 48, paddingHorizontal: 10, paddingVertical: 7 }, profileIcon: { alignItems: "center", borderRadius: 12, height: 32, justifyContent: "center", width: 32 }, profileMeta: { fontSize: 11, marginTop: 1 }, profileName: { fontSize: 13, fontWeight: "900" },
  rangeButton: { alignItems: "center", borderRadius: 16, borderWidth: 1, flex: 1, justifyContent: "center", minHeight: 44 }, rangeRow: { flexDirection: "row", gap: 8 }, rangeText: { fontSize: 13, fontWeight: "900" },
  readingCopy: { flex: 1, minWidth: 0 }, readingMeta: { fontSize: 12, lineHeight: 18, marginTop: 4 }, readingRow: { alignItems: "center", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 10, justifyContent: "space-between", minHeight: 72, padding: 14 }, readingStack: { gap: 10 }, readingValue: { fontSize: 16, fontWeight: "900" },
  safety: { alignItems: "flex-start", borderLeftWidth: 3, flexDirection: "row", gap: 10, paddingHorizontal: 14 }, safetyText: { flex: 1, fontSize: 12, lineHeight: 19 },
  screen: { flex: 1 }, sectionTitle: { fontSize: 17, fontWeight: "900" }, selected: { borderRadius: 18, borderWidth: 1, gap: 5, padding: 15 }, selectedKicker: { fontSize: 11, fontWeight: "900" }, selectedMeta: { fontSize: 13, lineHeight: 19 }, selectedNote: { fontSize: 13, lineHeight: 19, marginTop: 4 }, selectedUnit: { fontSize: 15 }, selectedValue: { fontSize: 22, fontWeight: "900" }, singleText: { fontSize: 13, textAlign: "center" }, skeleton: { borderRadius: 22, borderWidth: 1 }, source: { fontSize: 12, fontWeight: "900", marginTop: 3 }, srSummary: { height: 1, opacity: 0, position: "absolute", width: 1 }, subtitle: { fontSize: 13, lineHeight: 18, marginTop: 3 },
  summaryCard: { borderRadius: 18, borderWidth: 1, flexBasis: "46%", flexGrow: 1, minHeight: 96, padding: 14 }, summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, summaryLabel: { fontSize: 12, fontWeight: "800", lineHeight: 17 }, summaryValue: { fontSize: 18, fontWeight: "900", marginTop: 8 }, title: { fontSize: 25, fontWeight: "900" }, xLabels: { flexDirection: "row", justifyContent: "space-between" }, yLabel: { fontSize: 10, fontWeight: "800", left: 0, position: "absolute", width: 32 }
});
