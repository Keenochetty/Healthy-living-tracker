import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";

import { GeneralHealthActivityDetailSheet } from "@/components/health/GeneralHealthActivityDetailSheet";
import { useGeneralHealthActivity } from "@/components/health/GeneralHealthActivityProvider";
import { HealthScreenContainer } from "@/components/health/HealthScreenContainer";
import { GeneralHealthLogSheet } from "@/components/health/GeneralHealthLogSheet";
import { AppButton, AppCard, AppIcon, AppSection } from "@/components/ui";
import { createGeneralHealthActivity } from "@/lib/generalHealthActivity";
import type {
  GeneralHealthActivityEntry,
  GeneralHealthLogDraft,
} from "@/lib/generalHealthMockData";
import { useAppTheme } from "@/theme/ThemeProvider";

type OxygenRange = 7 | 30 | 90 | "all";
type OxygenPoint = {
  activity: Extract<GeneralHealthActivityEntry, { type: "vitals" }>;
  id: string;
  recordedAt: string;
  value: number;
};
type OxygenSummary = {
  average: number;
  count: number;
  highest: number;
  lowest: number;
};

const RANGE_OPTIONS: { label: string; value: OxygenRange }[] = [
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
  { label: "All", value: "all" },
];
const SCREEN_STATE: "error" | "loading" | "ready" = "ready";

export function OxygenSaturationDetailScreen() {
  const { theme } = useAppTheme();
  const { activities, addActivity, selectedProfileId, selectedProfileName } =
    useGeneralHealthActivity();
  const [range, setRange] = useState<OxygenRange>(7);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailActivity, setDetailActivity] =
    useState<GeneralHealthActivityEntry | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [openedAt] = useState(() => new Date());

  // TODO: Replace feature-local Oxygen Saturation readings with the approved profile health data layer and supported connected-device sources.
  const allPoints = useMemo(
    () => getOxygenSaturationReadingsForProfile(activities, selectedProfileId),
    [activities, selectedProfileId],
  );
  const points = useMemo(
    () => filterReadingsByRange(allPoints, range, openedAt),
    [allPoints, openedAt, range],
  );
  const summary = useMemo(() => calculateSummary(points), [points]);
  const selectedPoint =
    points.find((point) => point.id === selectedId) ?? points.at(-1) ?? null;

  function saveVitals(draft: GeneralHealthLogDraft) {
    addActivity(
      createGeneralHealthActivity(
        draft,
        selectedProfileId,
        selectedProfileName,
      ),
    );
    setLogOpen(false);
  }

  // TODO: Preselect Oxygen Saturation when the shared Add Vitals sheet supports a focused log mode.
  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <HealthScreenContainer bottomSpacing={42} contentStyle={styles.content}>
        <MetricHeader profileName={selectedProfileName} />
        {SCREEN_STATE === "loading" ? <LoadingState /> : null}
        {SCREEN_STATE === "error" ? (
          <ScreenState
            message="Please return to General Health and open this screen again."
            title="We couldn't load oxygen saturation history"
          />
        ) : null}
        {SCREEN_STATE === "ready" && !allPoints.length ? (
          <ScreenState
            action="Add oxygen saturation reading"
            message="Add a reading to begin building your personal history."
            onAction={() => setLogOpen(true)}
            title="No oxygen saturation readings yet"
          />
        ) : null}
        {SCREEN_STATE === "ready" && allPoints.length ? (
          <>
            <LatestCard points={allPoints} />
            <RangeSelector
              range={range}
              setRange={(next) => {
                setRange(next);
                setSelectedId(null);
              }}
            />
            {!points.length ? (
              <ScreenState
                action="Show all"
                message="Choose another range or add a new reading."
                onAction={() => {
                  setRange("all");
                  setSelectedId(null);
                }}
                title="No readings in this time range"
              />
            ) : (
              <>
                <OxygenChart
                  onSelect={setSelectedId}
                  points={points}
                  range={range}
                  selectedId={selectedPoint?.id ?? null}
                  summary={summary}
                />
                {selectedPoint ? (
                  <SelectedReading point={selectedPoint} />
                ) : null}
                <SavedSummary summary={summary} />
                <RecentReadings
                  entries={[...points].reverse().slice(0, 5)}
                  onOpen={setDetailActivity}
                />
              </>
            )}
            <AppButton
              accessibilityLabel="Add oxygen saturation reading"
              fullWidth
              label="Add oxygen saturation reading"
              onPress={() => setLogOpen(true)}
            />
            <SafetyNote />
          </>
        ) : null}
      </HealthScreenContainer>
      <GeneralHealthActivityDetailSheet
        activity={
          detailActivity?.profileId === selectedProfileId
            ? detailActivity
            : null
        }
        onClose={() => setDetailActivity(null)}
      />
      <GeneralHealthLogSheet
        key={logOpen ? "oxygen-open" : "oxygen-closed"}
        logType={logOpen ? "vitals" : null}
        onCancel={() => setLogOpen(false)}
        onSave={saveVitals}
        profileName={selectedProfileName}
      />
    </View>
  );
}

function MetricHeader({ profileName }: { profileName: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Pressable
          accessibilityHint="Returns to General Health"
          accessibilityLabel="Back to General Health"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.back,
            { backgroundColor: theme.surface, borderColor: theme.border },
            pressed ? styles.pressed : null,
          ]}
        >
          <Text style={[styles.backText, { color: theme.text }]}>{"<"}</Text>
        </Pressable>
        <View style={styles.headerCopy}>
          <Text
            accessibilityRole="header"
            style={[styles.title, { color: theme.text }]}
          >
            Oxygen saturation
          </Text>
          <Text style={[styles.subtitle, { color: theme.mutedText }]}>
            Saved readings and personal trends
          </Text>
        </View>
      </View>
      <View
        accessibilityLabel={`Active profile, ${profileName}`}
        accessible
        style={[
          styles.profile,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View
          style={[styles.profileIcon, { backgroundColor: theme.primarySoft }]}
        >
          <AppIcon color={theme.primary} decorative name="profile" size={16} />
        </View>
        <View>
          <Text style={[styles.profileName, { color: theme.text }]}>
            {profileName}
          </Text>
          <Text style={[styles.profileMeta, { color: theme.mutedText }]}>
            Active profile
          </Text>
        </View>
      </View>
    </View>
  );
}

function LatestCard({ points }: { points: OxygenPoint[] }) {
  const { theme } = useAppTheme();
  const latest = points.at(-1)!;
  const previous = points.at(-2);
  const change = previous ? latest.value - previous.value : null;
  const comparison =
    change === null
      ? "Add more readings to see changes over time."
      : change === 0
        ? "Same value as your previous saved entry."
        : `${formatNumber(Math.abs(change))} ${Math.abs(change) === 1 ? "percentage point" : "percentage points"} ${change > 0 ? "higher" : "lower"} than your previous saved entry.`;
  return (
    <AppCard
      style={[
        styles.hero,
        { backgroundColor: theme.primarySoft, borderColor: theme.primary },
      ]}
    >
      <View pointerEvents="none" style={styles.heroDecoration}>
        <View
          style={[
            styles.heroBubble,
            styles.heroBubbleLarge,
            { borderColor: theme.primary },
          ]}
        />
        <View
          style={[
            styles.heroBubble,
            styles.heroBubbleSmall,
            { borderColor: theme.secondary },
          ]}
        />
      </View>
      <Text style={[styles.eyebrow, { color: theme.primary }]}>
        LATEST READING
      </Text>
      <Text
        accessibilityLabel={`Latest oxygen saturation reading, ${formatNumber(latest.value)} percent, saved ${formatDateTime(latest.recordedAt)}`}
        adjustsFontSizeToFit
        numberOfLines={1}
        style={[styles.latestValue, { color: theme.text }]}
      >
        {formatNumber(latest.value)}
        <Text style={styles.latestUnit}>%</Text>
      </Text>
      <Text style={[styles.metricLabel, { color: theme.primary }]}>
        Oxygen saturation - SpO2
      </Text>
      <Text style={[styles.heroTime, { color: theme.mutedText }]}>
        Saved {formatDateTime(latest.recordedAt)}
      </Text>
      <Text style={[styles.heroSupport, { color: theme.mutedText }]}>
        {comparison}
      </Text>
    </AppCard>
  );
}

function RangeSelector({
  range,
  setRange,
}: {
  range: OxygenRange;
  setRange: (range: OxygenRange) => void;
}) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.rangeRow}>
      {RANGE_OPTIONS.map((option) => {
        const active = range === option.value;
        return (
          <Pressable
            accessibilityLabel={`${option.value === "all" ? "All time" : `${option.value} days`}, ${active ? "selected" : "not selected"}`}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            key={option.label}
            onPress={() => setRange(option.value)}
            style={({ pressed }) => [
              styles.rangeButton,
              {
                backgroundColor: active ? theme.primarySoft : theme.surface,
                borderColor: active ? theme.primary : theme.border,
              },
              pressed ? styles.pressed : null,
            ]}
          >
            <Text
              style={[
                styles.rangeText,
                { color: active ? theme.primary : theme.text },
              ]}
            >
              {active ? "Selected " : ""}
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function OxygenChart({
  onSelect,
  points,
  range,
  selectedId,
  summary,
}: {
  onSelect: (id: string) => void;
  points: OxygenPoint[];
  range: OxygenRange;
  selectedId: string | null;
  summary: OxygenSummary;
}) {
  const { theme } = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();
  const width = Math.max(160, Math.min(screenWidth - 70, 410));
  const height = 210;
  const plot = getChartPlot(points, width, height);
  const labels = getXAxisLabels(plot.positions);
  const accessibilityLabel = `Oxygen saturation trend for ${range === "all" ? "all saved time" : `the last ${range} days`}. ${summary.count} saved readings. Lowest saved reading ${formatNumber(summary.lowest)} percent, highest ${formatNumber(summary.highest)} percent, average ${formatNumber(summary.average)} percent.`;
  function selectNearest(locationX: number) {
    onSelect(
      plot.positions.reduce((current, point) =>
        Math.abs(point.x - locationX) < Math.abs(current.x - locationX)
          ? point
          : current,
      ).id,
    );
  }
  const selectedX =
    plot.positions.find((point) => point.id === selectedId)?.x ?? 0;
  return (
    <AppCard style={[styles.chartCard, { borderColor: theme.border }]}>
      <View style={styles.chartHeading}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Oxygen saturation trend
        </Text>
        <Text style={[styles.chartUnit, { color: theme.mutedText }]}>%</Text>
      </View>
      <Text
        accessibilityLabel={accessibilityLabel}
        accessible
        style={styles.srSummary}
      >
        {accessibilityLabel}
      </Text>
      <View
        onTouchEnd={(event) => selectNearest(event.nativeEvent.locationX)}
        style={[styles.chart, { height, width }]}
      >
        <Svg height={height} pointerEvents="none" width={width}>
          {plot.ticks.map((tick) => (
            <Line
              key={tick.value}
              stroke={theme.border}
              strokeWidth="1"
              x1={plot.left}
              x2={width - plot.right}
              y1={tick.y}
              y2={tick.y}
            />
          ))}
          {selectedId ? (
            <Line
              stroke={theme.mutedText}
              strokeDasharray="3 4"
              strokeWidth="1"
              x1={selectedX}
              x2={selectedX}
              y1={plot.top}
              y2={height - plot.bottom}
            />
          ) : null}
          {plot.positions.length > 1 ? (
            <Polyline
              fill="none"
              points={plot.positions
                .map((point) => `${point.x},${point.y}`)
                .join(" ")}
              stroke={theme.primary}
              strokeWidth="2.5"
            />
          ) : null}
          {plot.positions.map((point) => (
            <Circle
              cx={point.x}
              cy={point.y}
              fill={point.id === selectedId ? theme.surface : theme.primary}
              key={point.id}
              r={point.id === selectedId ? 7 : 4}
              stroke={theme.primary}
              strokeWidth={point.id === selectedId ? 3 : 1}
            />
          ))}
        </Svg>
        {plot.ticks.map((tick) => (
          <Text
            key={tick.value}
            pointerEvents="none"
            style={[styles.yLabel, { color: theme.mutedText, top: tick.y - 8 }]}
          >
            {formatNumber(tick.value)}
          </Text>
        ))}
        {plot.positions.map((point) => (
          <Pressable
            accessibilityLabel={`${formatNumber(point.value)} percent, ${formatFullDateTime(point.recordedAt)}, added manually`}
            accessibilityRole="button"
            accessibilityState={{ selected: point.id === selectedId }}
            key={point.id}
            onPress={() => onSelect(point.id)}
            style={[
              styles.pointTarget,
              { left: point.x - 22, top: point.y - 22 },
            ]}
          />
        ))}
      </View>
      <View
        style={[
          styles.xLabels,
          { paddingLeft: plot.left, paddingRight: plot.right },
        ]}
      >
        {labels.map((point) => (
          <Text
            key={point.id}
            numberOfLines={1}
            style={[styles.axisText, { color: theme.mutedText }]}
          >
            {formatAxisDate(point.recordedAt, range)}
          </Text>
        ))}
      </View>
      {points.length === 1 ? (
        <Text style={[styles.singleText, { color: theme.mutedText }]}>
          Add more readings to see a trend.
        </Text>
      ) : null}
    </AppCard>
  );
}

function SelectedReading({ point }: { point: OxygenPoint }) {
  const { theme } = useAppTheme();
  return (
    <View
      accessibilityLabel={`Selected oxygen saturation reading, ${formatNumber(point.value)} percent, ${formatFullDateTime(point.recordedAt)}, added manually.${point.activity.details.notes ? ` Note: ${point.activity.details.notes}` : ""}`}
      accessible
      style={[
        styles.selected,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderLeftColor: theme.primary,
        },
      ]}
    >
      <Text style={[styles.selectedKicker, { color: theme.primary }]}>
        SELECTED READING
      </Text>
      <Text style={[styles.selectedValue, { color: theme.text }]}>
        {formatNumber(point.value)}%
      </Text>
      <Text style={[styles.selectedMeta, { color: theme.mutedText }]}>
        {formatFullDateTime(point.recordedAt)}
      </Text>
      {point.activity.details.notes ? (
        <Text
          numberOfLines={2}
          style={[styles.selectedNote, { color: theme.mutedText }]}
        >
          Note: {point.activity.details.notes}
        </Text>
      ) : null}
      <Text style={[styles.source, { color: theme.primary }]}>
        Added manually
      </Text>
    </View>
  );
}

function SavedSummary({ summary }: { summary: OxygenSummary }) {
  const { theme } = useAppTheme();
  const metrics = [
    { label: "Lowest saved", value: `${formatNumber(summary.lowest)}%` },
    { label: "Highest saved", value: `${formatNumber(summary.highest)}%` },
    { label: "Average saved", value: `${formatNumber(summary.average)}%` },
    { label: "Readings", value: `${summary.count}` },
  ];
  return (
    <AppSection
      subtitle="Calculated from the readings visible in this time range."
      title="Your saved range"
    >
      <View style={styles.summaryGrid}>
        {metrics.map((metric) => (
          <View
            accessibilityLabel={
              metric.label === "Readings"
                ? `${summary.count} saved ${summary.count === 1 ? "reading" : "readings"}`
                : `${metric.label} oxygen saturation reading, ${metric.value.replace("%", " percent")}`
            }
            accessible
            key={metric.label}
            style={[
              styles.summaryCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: theme.mutedText }]}>
              {metric.label}
            </Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              {metric.value}
            </Text>
          </View>
        ))}
      </View>
    </AppSection>
  );
}

function RecentReadings({
  entries,
  onOpen,
}: {
  entries: OxygenPoint[];
  onOpen: (entry: GeneralHealthActivityEntry) => void;
}) {
  const { theme } = useAppTheme();
  return (
    <AppSection
      actionAccessibilityHint="Opens General Health history"
      actionAccessibilityLabel="View all health history"
      actionLabel="View all"
      onActionPress={() => router.push("/health/general/history")}
      title="Recent readings"
    >
      <View style={styles.readingStack}>
        {entries.map((point) => (
          <Pressable
            accessibilityHint="Opens the complete saved activity details."
            accessibilityLabel={`${formatNumber(point.value)} percent, ${formatFullDateTime(point.recordedAt)}, added manually${point.activity.details.notes ? ", includes a note" : ""}`}
            accessibilityRole="button"
            key={point.id}
            onPress={() => onOpen(point.activity)}
            style={({ pressed }) => [
              styles.readingRow,
              { backgroundColor: theme.surface, borderColor: theme.border },
              pressed ? styles.pressed : null,
            ]}
          >
            <View style={styles.readingCopy}>
              <Text style={[styles.readingValue, { color: theme.text }]}>
                {formatNumber(point.value)}%
              </Text>
              <Text style={[styles.readingMeta, { color: theme.mutedText }]}>
                {formatRecentDateTime(point.recordedAt)}
              </Text>
              <Text style={[styles.readingSource, { color: theme.mutedText }]}>
                Added manually
                {point.activity.details.notes ? " | Has note" : ""}
              </Text>
            </View>
            <Text style={[styles.chevron, { color: theme.mutedText }]}>
              {">"}
            </Text>
          </Pressable>
        ))}
      </View>
    </AppSection>
  );
}

function SafetyNote() {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.safety, { borderColor: theme.border }]}>
      <AppIcon color={theme.primary} decorative name="health" size={18} />
      <Text style={[styles.safetyText, { color: theme.mutedText }]}>
        This screen organizes the readings you save and does not interpret them
        medically. Contact a healthcare professional if you are worried about
        symptoms or readings.
      </Text>
    </View>
  );
}
function LoadingState() {
  const { theme } = useAppTheme();
  return (
    <View style={styles.loading}>
      {[150, 72, 270, 190, 90].map((height) => (
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
        />
      ))}
    </View>
  );
}
function ScreenState({
  action,
  message,
  onAction,
  title,
}: {
  action?: string;
  message: string;
  onAction?: () => void;
  title: string;
}) {
  const { theme } = useAppTheme();
  return (
    <AppCard style={[styles.empty, { borderColor: theme.border }]}>
      <AppIcon color={theme.primary} container name="device_sync" size={24} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.emptyMessage, { color: theme.mutedText }]}>
        {message}
      </Text>
      {action && onAction ? (
        <AppButton label={action} onPress={onAction} />
      ) : null}
    </AppCard>
  );
}

function getOxygenSaturationReadingsForProfile(
  entries: GeneralHealthActivityEntry[],
  profileId: string,
): OxygenPoint[] {
  return entries
    .flatMap((entry) => {
      const recordedTime = new Date(entry.createdAt).getTime();
      if (
        entry.profileId !== profileId ||
        entry.type !== "vitals" ||
        !entry.details.oxygen ||
        !Number.isFinite(recordedTime)
      )
        return [];
      const value = Number(entry.details.oxygen);
      return Number.isFinite(value)
        ? [
            {
              activity: entry,
              id: entry.id,
              recordedAt: entry.createdAt,
              value,
            },
          ]
        : [];
    })
    .sort(
      (left, right) =>
        new Date(left.recordedAt).getTime() -
        new Date(right.recordedAt).getTime(),
    );
}
function filterReadingsByRange(
  points: OxygenPoint[],
  range: OxygenRange,
  reference: Date,
) {
  if (range === "all") return points;
  const cutoff = reference.getTime() - range * 86400000;
  return points.filter(
    (point) => new Date(point.recordedAt).getTime() >= cutoff,
  );
}
function calculateSummary(points: OxygenPoint[]): OxygenSummary {
  const values = points.map((point) => point.value);
  return {
    average: values.reduce((sum, value) => sum + value, 0) / values.length,
    count: values.length,
    highest: Math.max(...values),
    lowest: Math.min(...values),
  };
}
function getChartPlot(points: OxygenPoint[], width: number, height: number) {
  const left = 42,
    right = 22,
    top = 22,
    bottom = 20;
  const values = points.map((point) => point.value),
    rawMin = Math.min(...values),
    rawMax = Math.max(...values),
    dataSpan = Math.max(rawMax - rawMin, 3),
    padding = Math.max(1, Math.ceil(dataSpan * 0.25));
  const min = Math.floor(rawMin - padding),
    max = Math.ceil(rawMax + padding),
    span = Math.max(max - min, 1),
    firstTime = new Date(points[0].recordedAt).getTime(),
    lastTime = new Date(points.at(-1)!.recordedAt).getTime(),
    timeSpan = Math.max(lastTime - firstTime, 1);
  const positions = points.map((point) => ({
    ...point,
    x:
      points.length === 1
        ? left + (width - left - right) / 2
        : left +
          ((new Date(point.recordedAt).getTime() - firstTime) / timeSpan) *
            (width - left - right),
    y: top + ((max - point.value) / span) * (height - top - bottom),
  }));
  const ticks = [max, Math.round((max + min) / 2), min]
    .filter((value, index, list) => list.indexOf(value) === index)
    .map((value) => ({
      value,
      y: top + ((max - value) / span) * (height - top - bottom),
    }));
  return { bottom, left, positions, right, ticks, top };
}
function getXAxisLabels<T extends OxygenPoint>(points: T[]) {
  if (points.length <= 4) return points;
  const indices = [
    0,
    Math.round((points.length - 1) / 3),
    Math.round(((points.length - 1) * 2) / 3),
    points.length - 1,
  ];
  return indices
    .filter((index, position) => indices.indexOf(index) === position)
    .map((index) => points[index]);
}
function formatNumber(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}
function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  });
}
function formatFullDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "long",
    year: "numeric",
  });
}
function formatAxisDate(value: string, range: OxygenRange) {
  return new Date(value).toLocaleDateString(
    undefined,
    range === 7
      ? { weekday: "short" }
      : range === "all"
        ? { month: "short", year: "2-digit" }
        : { day: "numeric", month: "short" },
  );
}
function formatRecentDateTime(value: string) {
  const date = new Date(value),
    today = new Date(),
    yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const label = sameDay(date, today)
    ? "Today"
    : sameDay(date, yesterday)
      ? "Yesterday"
      : date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  return `${label} | ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}
function sameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

const styles = StyleSheet.create({
  axisText: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "800",
    minWidth: 34,
    textAlign: "center",
  },
  back: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  backText: { fontSize: 22, fontWeight: "900" },
  chart: { alignSelf: "center", position: "relative" },
  chartCard: { borderWidth: 1, gap: 12, overflow: "hidden", padding: 16 },
  chartHeading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chartUnit: { fontSize: 12, fontWeight: "900" },
  chevron: { fontSize: 20, fontWeight: "900" },
  content: { gap: 24 },
  empty: { alignItems: "center", borderWidth: 1, gap: 12, padding: 24 },
  emptyMessage: { lineHeight: 21, textAlign: "center" },
  emptyTitle: { fontSize: 20, fontWeight: "900", textAlign: "center" },
  eyebrow: { fontSize: 11, fontWeight: "900" },
  header: { gap: 12 },
  headerCopy: { flex: 1 },
  headerTop: { alignItems: "center", flexDirection: "row", gap: 12 },
  hero: { borderWidth: 1, gap: 7, overflow: "hidden", padding: 20 },
  heroBubble: { borderWidth: 2, opacity: 0.12, position: "absolute" },
  heroBubbleLarge: {
    borderRadius: 52,
    height: 104,
    right: -18,
    top: -20,
    width: 104,
  },
  heroBubbleSmall: {
    borderRadius: 24,
    height: 48,
    right: 74,
    top: 54,
    width: 48,
  },
  heroDecoration: {
    bottom: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: 170,
  },
  heroSupport: { fontSize: 13, lineHeight: 20, marginTop: 5 },
  heroTime: { fontSize: 13 },
  latestUnit: { fontSize: 24 },
  latestValue: { fontSize: 44, fontWeight: "900", lineHeight: 50 },
  loading: { gap: 14 },
  metricLabel: { fontSize: 12, fontWeight: "900" },
  pointTarget: { height: 44, position: "absolute", width: 44 },
  pressed: { opacity: 0.74 },
  profile: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    minHeight: 48,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  profileIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  profileMeta: { fontSize: 11, marginTop: 1 },
  profileName: { fontSize: 13, fontWeight: "900" },
  rangeButton: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
  },
  rangeRow: { flexDirection: "row", gap: 8 },
  rangeText: { fontSize: 12, fontWeight: "900" },
  readingCopy: { flex: 1, minWidth: 0 },
  readingMeta: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  readingRow: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 82,
    padding: 14,
  },
  readingSource: { fontSize: 12, lineHeight: 18 },
  readingStack: { gap: 10 },
  readingValue: { fontSize: 17, fontWeight: "900" },
  safety: {
    alignItems: "flex-start",
    borderLeftWidth: 3,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
  },
  safetyText: { flex: 1, fontSize: 12, lineHeight: 19 },
  screen: { flex: 1 },
  sectionTitle: { fontSize: 17, fontWeight: "900" },
  selected: {
    borderLeftWidth: 4,
    borderRadius: 18,
    borderWidth: 1,
    gap: 5,
    padding: 15,
  },
  selectedKicker: { fontSize: 11, fontWeight: "900" },
  selectedMeta: { fontSize: 13, lineHeight: 19 },
  selectedNote: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  selectedValue: { fontSize: 23, fontWeight: "900" },
  singleText: { fontSize: 13, textAlign: "center" },
  skeleton: { borderRadius: 22, borderWidth: 1 },
  source: { fontSize: 12, fontWeight: "900", marginTop: 3 },
  srSummary: { height: 1, opacity: 0, position: "absolute", width: 1 },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 3 },
  summaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    flexBasis: "46%",
    flexGrow: 1,
    minHeight: 88,
    minWidth: 145,
    padding: 14,
  },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  summaryLabel: { fontSize: 12, fontWeight: "800" },
  summaryValue: { fontSize: 18, fontWeight: "900", marginTop: 8 },
  title: { fontSize: 25, fontWeight: "900" },
  xLabels: { flexDirection: "row", justifyContent: "space-between" },
  yLabel: {
    fontSize: 10,
    fontWeight: "800",
    left: 0,
    position: "absolute",
    width: 36,
  },
});
