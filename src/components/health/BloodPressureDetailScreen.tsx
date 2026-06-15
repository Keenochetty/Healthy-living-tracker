import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Circle, Line, Polyline, Rect } from "react-native-svg";

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

type BloodPressureRange = 7 | 30 | 90 | "all";
type BloodPressurePoint = {
  activity: Extract<GeneralHealthActivityEntry, { type: "vitals" }>;
  diastolic: number;
  id: string;
  recordedAt: string;
  systolic: number;
};
type BloodPressureSummary = {
  count: number;
  diastolic: SeriesSummary;
  systolic: SeriesSummary;
};
type SeriesSummary = { average: number; highest: number; lowest: number };

const RANGE_OPTIONS: { label: string; value: BloodPressureRange }[] = [
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
  { label: "All", value: "all" },
];
const SCREEN_STATE: "error" | "loading" | "ready" = "ready";

export function BloodPressureDetailScreen() {
  const { theme } = useAppTheme();
  const { activities, addActivity, selectedProfileId, selectedProfileName } =
    useGeneralHealthActivity();
  const [range, setRange] = useState<BloodPressureRange>(7);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailActivity, setDetailActivity] =
    useState<GeneralHealthActivityEntry | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [openedAt] = useState(() => new Date());

  // TODO: Replace feature-local readings with the approved profile health data layer and connected-device sources.
  const allPoints = useMemo(
    () => getBloodPressureReadingsForProfile(activities, selectedProfileId),
    [activities, selectedProfileId],
  );
  const points = useMemo(
    () => filterBloodPressureReadingsByRange(allPoints, range, openedAt),
    [allPoints, openedAt, range],
  );
  const summary = useMemo(
    () => calculateBloodPressureSavedSummary(points),
    [points],
  );
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

  // TODO: Preselect and focus Blood Pressure when the shared Add Vitals sheet supports a focused log mode.
  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <HealthScreenContainer bottomSpacing={40} contentStyle={styles.content}>
        <MetricHeader profileName={selectedProfileName} />
        {SCREEN_STATE === "loading" ? <LoadingState /> : null}
        {SCREEN_STATE === "error" ? (
          <ScreenState
            message="Please return to General Health and open this screen again."
            title="We couldn't load blood pressure history"
          />
        ) : null}
        {SCREEN_STATE === "ready" && !allPoints.length ? (
          <ScreenState
            action="Add blood pressure reading"
            message="Add a complete Systolic and Diastolic reading to begin building your personal history."
            onAction={() => setLogOpen(true)}
            title="No blood pressure readings yet"
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
                <BloodPressureChart
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
                  entries={[...allPoints].reverse().slice(0, 5)}
                  onOpen={setDetailActivity}
                />
              </>
            )}
            <AppButton
              accessibilityLabel="Add blood pressure reading"
              fullWidth
              label="Add blood pressure reading"
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
        key={logOpen ? "blood-pressure-open" : "blood-pressure-closed"}
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
            Blood pressure
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

function LatestCard({ points }: { points: BloodPressurePoint[] }) {
  const { theme } = useAppTheme();
  const latest = points.at(-1)!;
  const previous = points.at(-2);
  const comparison = previous
    ? `Systolic ${describeChange(latest.systolic - previous.systolic)}; diastolic ${describeChange(latest.diastolic - previous.diastolic)}.`
    : "Add more readings to see changes over time.";
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
            styles.heroDecorationLine,
            { backgroundColor: theme.primary },
          ]}
        />
        <View
          style={[
            styles.heroDecorationLine,
            styles.heroDecorationLineLower,
            { backgroundColor: theme.secondary },
          ]}
        />
      </View>
      <Text style={[styles.eyebrow, { color: theme.primary }]}>
        LATEST READING
      </Text>
      <Text
        accessibilityLabel={`Latest blood pressure reading, systolic ${latest.systolic}, diastolic ${latest.diastolic} millimetres of mercury, saved ${formatDateTime(latest.recordedAt)}`}
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[styles.latestValue, { color: theme.text }]}
      >
        {latest.systolic} / {latest.diastolic}{" "}
        <Text style={styles.latestUnit}>mmHg</Text>
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
  range: BloodPressureRange;
  setRange: (value: BloodPressureRange) => void;
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

function BloodPressureChart({
  onSelect,
  points,
  range,
  selectedId,
  summary,
}: {
  onSelect: (id: string) => void;
  points: BloodPressurePoint[];
  range: BloodPressureRange;
  selectedId: string | null;
  summary: BloodPressureSummary;
}) {
  const { theme } = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();
  const width = Math.max(160, Math.min(screenWidth - 70, 410));
  const height = 205;
  const plot = getChartPlot(points, width, height);
  const labels = getXAxisLabels(plot.positions);
  const accessibilityLabel = `Blood pressure trend for ${formatRangeLabel(range)}. ${summary.count} complete ${summary.count === 1 ? "reading" : "readings"}. Systolic saved values range from ${summary.systolic.lowest} to ${summary.systolic.highest} millimetres of mercury. Diastolic saved values range from ${summary.diastolic.lowest} to ${summary.diastolic.highest}.`;
  function selectNearest(locationX: number) {
    const nearest = plot.positions.reduce((current, point) =>
      Math.abs(point.x - locationX) < Math.abs(current.x - locationX)
        ? point
        : current,
    );
    onSelect(nearest.id);
  }
  const selectedX =
    plot.positions.find((point) => point.id === selectedId)?.x ?? 0;
  return (
    <AppCard style={[styles.chartCard, { borderColor: theme.border }]}>
      <View style={styles.chartHeading}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Blood pressure trend
        </Text>
        <Text style={[styles.chartUnit, { color: theme.mutedText }]}>mmHg</Text>
      </View>
      <View
        accessibilityLabel="Chart legend. Systolic data series uses a solid line with circle markers. Diastolic data series uses a dashed line with square markers."
        accessible
        style={styles.legend}
      >
        <LegendItem dashed={false} label="Systolic" marker="circle" />
        <LegendItem dashed label="Diastolic" marker="square" />
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
                .map((point) => `${point.x},${point.systolicY}`)
                .join(" ")}
              stroke={theme.primary}
              strokeWidth="2.5"
            />
          ) : null}
          {plot.positions.length > 1 ? (
            <Polyline
              fill="none"
              points={plot.positions
                .map((point) => `${point.x},${point.diastolicY}`)
                .join(" ")}
              stroke={theme.secondary}
              strokeDasharray="5 4"
              strokeWidth="2.5"
            />
          ) : null}
          {plot.positions.map((point) => (
            <Circle
              cx={point.x}
              cy={point.systolicY}
              fill={point.id === selectedId ? theme.surface : theme.primary}
              key={`s-${point.id}`}
              r={point.id === selectedId ? 7 : 4}
              stroke={theme.primary}
              strokeWidth={point.id === selectedId ? 3 : 1}
            />
          ))}
          {plot.positions.map((point) => (
            <Rect
              fill={point.id === selectedId ? theme.surface : theme.secondary}
              height={point.id === selectedId ? 13 : 8}
              key={`d-${point.id}`}
              stroke={theme.secondary}
              strokeWidth={point.id === selectedId ? 3 : 1}
              width={point.id === selectedId ? 13 : 8}
              x={point.x - (point.id === selectedId ? 6.5 : 4)}
              y={point.diastolicY - (point.id === selectedId ? 6.5 : 4)}
            />
          ))}
        </Svg>
        {plot.ticks.map((tick) => (
          <Text
            key={tick.value}
            pointerEvents="none"
            style={[styles.yLabel, { color: theme.mutedText, top: tick.y - 8 }]}
          >
            {tick.value}
          </Text>
        ))}
        {plot.positions.map((point) => (
          <Pressable
            accessibilityLabel={`Systolic ${point.systolic}, diastolic ${point.diastolic} millimetres of mercury, ${formatFullDateTime(point.recordedAt)}, added manually`}
            accessibilityRole="button"
            accessibilityState={{ selected: point.id === selectedId }}
            key={point.id}
            onPress={() => onSelect(point.id)}
            style={[
              styles.pointTarget,
              {
                left: point.x - 22,
                top: Math.min(point.systolicY, point.diastolicY) - 22,
                height: Math.abs(point.diastolicY - point.systolicY) + 44,
              },
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

function LegendItem({
  dashed,
  label,
  marker,
}: {
  dashed: boolean;
  label: string;
  marker: "circle" | "square";
}) {
  const { theme } = useAppTheme();
  const color = marker === "circle" ? theme.primary : theme.secondary;
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendLine,
          {
            backgroundColor: dashed ? "transparent" : color,
            borderColor: color,
            borderStyle: dashed ? "dashed" : "solid",
          },
        ]}
      />
      <View
        style={[
          marker === "circle" ? styles.legendCircle : styles.legendSquare,
          { backgroundColor: color },
        ]}
      />
      <Text style={[styles.legendText, { color: theme.text }]}>{label}</Text>
    </View>
  );
}

function SelectedReading({ point }: { point: BloodPressurePoint }) {
  const { theme } = useAppTheme();
  return (
    <View
      accessibilityLabel={`Selected blood pressure reading. Systolic ${point.systolic}, diastolic ${point.diastolic} millimetres of mercury. ${formatFullDateTime(point.recordedAt)}. Added manually.${point.activity.details.notes ? ` Note: ${point.activity.details.notes}` : ""}`}
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
        {point.systolic} / {point.diastolic}{" "}
        <Text style={styles.selectedUnit}>mmHg</Text>
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

function SavedSummary({ summary }: { summary: BloodPressureSummary }) {
  return (
    <AppSection
      subtitle="Calculated from the readings visible in this time range."
      title="Your saved range"
    >
      <View style={styles.summaryGrid}>
        <SeriesSummaryCard label="Systolic" summary={summary.systolic} />
        <SeriesSummaryCard label="Diastolic" summary={summary.diastolic} />
      </View>
      <ReadingCount count={summary.count} />
    </AppSection>
  );
}
function SeriesSummaryCard({
  label,
  summary,
}: {
  label: string;
  summary: SeriesSummary;
}) {
  const { theme } = useAppTheme();
  return (
    <View
      accessibilityLabel={`${label} saved-data summary`}
      style={[
        styles.summaryCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.summaryTitle, { color: theme.text }]}>{label}</Text>
      <SummaryRow
        label="Lowest saved"
        series={label}
        value={`${summary.lowest} mmHg`}
      />
      <SummaryRow
        label="Highest saved"
        series={label}
        value={`${summary.highest} mmHg`}
      />
      <SummaryRow
        label="Average saved"
        series={label}
        value={`${summary.average} mmHg`}
      />
    </View>
  );
}
function SummaryRow({
  label,
  series,
  value,
}: {
  label: string;
  series: string;
  value: string;
}) {
  const { theme } = useAppTheme();
  return (
    <View
      accessibilityLabel={`${label} ${series} reading, ${value}`}
      accessible
      style={styles.summaryRow}
    >
      <Text style={[styles.summaryLabel, { color: theme.mutedText }]}>
        {label}
      </Text>
      <Text style={[styles.summaryValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}
function ReadingCount({ count }: { count: number }) {
  const { theme } = useAppTheme();
  return (
    <View
      accessibilityLabel={`${count} saved ${count === 1 ? "reading" : "readings"}`}
      accessible
      style={[
        styles.countCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.summaryLabel, { color: theme.mutedText }]}>
        Readings
      </Text>
      <Text style={[styles.countValue, { color: theme.text }]}>{count}</Text>
    </View>
  );
}

function RecentReadings({
  entries,
  onOpen,
}: {
  entries: BloodPressurePoint[];
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
            accessibilityLabel={`Systolic ${point.systolic}, diastolic ${point.diastolic} millimetres of mercury, ${formatFullDateTime(point.recordedAt)}, added manually${point.activity.details.notes ? ", includes a note" : ""}`}
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
                {point.systolic} / {point.diastolic}{" "}
                <Text style={styles.readingUnit}>mmHg</Text>
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
      {[150, 280, 190, 90].map((height) => (
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
      <AppIcon color={theme.primary} container name="health" size={24} />
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

function getBloodPressureReadingsForProfile(
  entries: GeneralHealthActivityEntry[],
  profileId: string,
): BloodPressurePoint[] {
  return entries
    .flatMap((entry) => {
      const recordedTime = new Date(entry.createdAt).getTime();
      if (
        entry.profileId !== profileId ||
        entry.type !== "vitals" ||
        !entry.details.systolic ||
        !entry.details.diastolic ||
        !Number.isFinite(recordedTime)
      )
        return [];
      const systolic = Number(entry.details.systolic);
      const diastolic = Number(entry.details.diastolic);
      return Number.isFinite(systolic) && Number.isFinite(diastolic)
        ? [
            {
              activity: entry,
              diastolic,
              id: entry.id,
              recordedAt: entry.createdAt,
              systolic,
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
function filterBloodPressureReadingsByRange(
  points: BloodPressurePoint[],
  range: BloodPressureRange,
  reference: Date,
) {
  if (range === "all") return points;
  const cutoff = reference.getTime() - range * 86400000;
  return points.filter(
    (point) => new Date(point.recordedAt).getTime() >= cutoff,
  );
}
function calculateBloodPressureSavedSummary(
  points: BloodPressurePoint[],
): BloodPressureSummary {
  return {
    count: points.length,
    diastolic: calculateSeries(points.map((point) => point.diastolic)),
    systolic: calculateSeries(points.map((point) => point.systolic)),
  };
}
function calculateSeries(values: number[]): SeriesSummary {
  return {
    average: Math.round(
      values.reduce((sum, value) => sum + value, 0) / values.length,
    ),
    highest: Math.max(...values),
    lowest: Math.min(...values),
  };
}
function describeChange(change: number) {
  return change === 0
    ? "is unchanged from your previous saved entry"
    : `is ${Math.abs(change)} mmHg ${change > 0 ? "higher" : "lower"} than your previous saved entry`;
}

function getChartPlot(
  points: BloodPressurePoint[],
  width: number,
  height: number,
) {
  const left = 40,
    right = 18,
    top = 18,
    bottom = 18;
  const values = points.flatMap((point) => [point.systolic, point.diastolic]);
  const rawMin = Math.min(...values),
    rawMax = Math.max(...values);
  const dataSpan = Math.max(rawMax - rawMin, 10),
    padding = Math.max(5, Math.ceil(dataSpan * 0.15));
  const interval = getTickInterval(dataSpan + padding * 2);
  const min = Math.floor((rawMin - padding) / interval) * interval,
    max = Math.ceil((rawMax + padding) / interval) * interval;
  const span = Math.max(max - min, interval);
  const firstTime = new Date(points[0].recordedAt).getTime(),
    lastTime = new Date(points.at(-1)!.recordedAt).getTime(),
    timeSpan = Math.max(lastTime - firstTime, 1);
  const positions = points.map((point) => ({
    ...point,
    diastolicY:
      top + ((max - point.diastolic) / span) * (height - top - bottom),
    systolicY: top + ((max - point.systolic) / span) * (height - top - bottom),
    x:
      points.length === 1
        ? left + (width - left - right) / 2
        : left +
          ((new Date(point.recordedAt).getTime() - firstTime) / timeSpan) *
            (width - left - right),
  }));
  const ticks = [max, Math.round((max + min) / 2 / interval) * interval, min]
    .filter((value, index, list) => list.indexOf(value) === index)
    .map((value) => ({
      value,
      y: top + ((max - value) / span) * (height - top - bottom),
    }));
  return { bottom, left, positions, right, ticks, top };
}
function getTickInterval(span: number) {
  if (span <= 20) return 5;
  if (span <= 50) return 10;
  return 20;
}
function getXAxisLabels<T extends BloodPressurePoint>(points: T[]) {
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
function formatAxisDate(value: string, range: BloodPressureRange) {
  return new Date(value).toLocaleDateString(
    undefined,
    range === 7
      ? { weekday: "short" }
      : range === "all"
        ? { month: "short", year: "2-digit" }
        : { day: "numeric", month: "short" },
  );
}
function formatRangeLabel(range: BloodPressureRange) {
  return range === "all" ? "all saved time" : `the last ${range} days`;
}
function formatRecentDateTime(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const label = isSameCalendarDay(date, today)
    ? "Today"
    : isSameCalendarDay(date, yesterday)
      ? "Yesterday"
      : date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  return `${label} | ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}
function isSameCalendarDay(left: Date, right: Date) {
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
    minWidth: 36,
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
  countCard: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    padding: 14,
  },
  countValue: { fontSize: 20, fontWeight: "900" },
  empty: { alignItems: "center", borderWidth: 1, gap: 12, padding: 24 },
  emptyMessage: { lineHeight: 21, textAlign: "center" },
  emptyTitle: { fontSize: 20, fontWeight: "900", textAlign: "center" },
  eyebrow: { fontSize: 11, fontWeight: "900" },
  header: { gap: 12 },
  headerCopy: { flex: 1 },
  headerTop: { alignItems: "center", flexDirection: "row", gap: 12 },
  hero: { borderWidth: 1, gap: 7, overflow: "hidden", padding: 20 },
  heroDecoration: {
    height: 76,
    opacity: 0.1,
    position: "absolute",
    right: -24,
    top: 12,
    transform: [{ rotate: "-8deg" }],
    width: 170,
  },
  heroDecorationLine: {
    borderRadius: 3,
    height: 3,
    position: "absolute",
    right: 0,
    top: 20,
    width: 150,
  },
  heroDecorationLineLower: { right: 18, top: 48, width: 118 },
  heroSupport: { fontSize: 13, lineHeight: 20, marginTop: 5 },
  heroTime: { fontSize: 13 },
  latestUnit: { fontSize: 16, fontWeight: "900" },
  latestValue: { fontSize: 34, fontWeight: "900", lineHeight: 43 },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  legendCircle: { borderRadius: 5, height: 9, width: 9 },
  legendItem: { alignItems: "center", flexDirection: "row", gap: 6 },
  legendLine: { borderTopWidth: 2, width: 22 },
  legendSquare: { height: 9, width: 9 },
  legendText: { fontSize: 12, fontWeight: "900" },
  loading: { gap: 14 },
  pointTarget: { position: "absolute", width: 44 },
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
  rangeText: { fontSize: 13, fontWeight: "900" },
  readingCopy: { flex: 1, minWidth: 0 },
  readingMeta: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  readingRow: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    minHeight: 82,
    padding: 14,
  },
  readingSource: { fontSize: 12, lineHeight: 18 },
  readingStack: { gap: 10 },
  readingUnit: { fontSize: 12 },
  readingValue: { fontSize: 16, fontWeight: "900" },
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
    borderRadius: 18,
    borderWidth: 1,
    borderLeftWidth: 4,
    gap: 5,
    padding: 15,
  },
  selectedKicker: { fontSize: 11, fontWeight: "900" },
  selectedMeta: { fontSize: 13, lineHeight: 19 },
  selectedNote: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  selectedUnit: { fontSize: 14 },
  selectedValue: { fontSize: 21, fontWeight: "900" },
  singleText: { fontSize: 13, textAlign: "center" },
  skeleton: { borderRadius: 22, borderWidth: 1 },
  source: { fontSize: 12, fontWeight: "900", marginTop: 3 },
  srSummary: { height: 1, opacity: 0, position: "absolute", width: 1 },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 3 },
  summaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    gap: 11,
    minWidth: 150,
    padding: 14,
  },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  summaryLabel: { flexShrink: 1, fontSize: 12, fontWeight: "800" },
  summaryRow: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  summaryTitle: { fontSize: 15, fontWeight: "900" },
  summaryValue: {
    flexShrink: 0,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "right",
  },
  title: { fontSize: 25, fontWeight: "900" },
  xLabels: { flexDirection: "row", justifyContent: "space-between" },
  yLabel: {
    fontSize: 10,
    fontWeight: "800",
    left: 0,
    position: "absolute",
    width: 34,
  },
});
