import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
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

type TemperatureRange = 7 | 30 | 90 | "all";
type TemperatureUnit = "celsius" | "fahrenheit";
type TemperatureMethod = "Ear" | "Forehead" | "Oral" | "Other" | "Underarm";
type MethodFilter = "All methods" | TemperatureMethod;
type TemperaturePoint = {
  activity: Extract<GeneralHealthActivityEntry, { type: "temperature" }>;
  id: string;
  method?: string;
  recordedAt: string;
  valueCelsius: number;
};
type TemperatureSummary = {
  averageCelsius: number;
  count: number;
  highestCelsius: number;
  lowestCelsius: number;
  methods: number;
};

const RANGE_OPTIONS: { label: string; value: TemperatureRange }[] = [
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
  { label: "All", value: "all" },
];
const SCREEN_STATE: "error" | "loading" | "ready" = "ready";

export function TemperatureDetailScreen() {
  const { theme } = useAppTheme();
  const { activities, addActivity, selectedProfileId, selectedProfileName } =
    useGeneralHealthActivity();
  const [unit, setUnit] = useState<TemperatureUnit>("celsius");
  const [range, setRange] = useState<TemperatureRange>(7);
  const [method, setMethod] = useState<MethodFilter>("All methods");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailActivity, setDetailActivity] =
    useState<GeneralHealthActivityEntry | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [openedAt] = useState(() => new Date());

  // TODO: Replace feature-local Temperature entries with the approved profile health data layer and supported device sources.
  // TODO: Read and persist Temperature display units through the selected profile's country and unit settings.
  const allPoints = useMemo(
    () => getTemperatureReadingsForProfile(activities, selectedProfileId),
    [activities, selectedProfileId],
  );
  const methods = useMemo(() => getAvailableMethods(allPoints), [allPoints]);
  const rangedPoints = useMemo(
    () => filterTemperatureReadingsByRange(allPoints, range, openedAt),
    [allPoints, openedAt, range],
  );
  const points = useMemo(
    () => filterTemperatureReadingsByMethod(rangedPoints, method),
    [method, rangedPoints],
  );
  const summary = useMemo(
    () => calculateTemperatureSavedSummary(points),
    [points],
  );
  const selectedPoint =
    points.find((point) => point.id === selectedId) ?? points.at(-1) ?? null;

  function resetSelection() {
    setSelectedId(null);
  }
  function saveTemperature(draft: GeneralHealthLogDraft) {
    addActivity(
      createGeneralHealthActivity(
        draft,
        selectedProfileId,
        selectedProfileName,
      ),
    );
    setLogOpen(false);
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <HealthScreenContainer bottomSpacing={42} contentStyle={styles.content}>
        <MetricHeader profileName={selectedProfileName} />
        {SCREEN_STATE === "loading" ? <LoadingState /> : null}
        {SCREEN_STATE === "error" ? (
          <ScreenState
            message="Please return to General Health and open this screen again."
            title="We couldn't load temperature history"
          />
        ) : null}
        {SCREEN_STATE === "ready" && !allPoints.length ? (
          <ScreenState
            action="Add temperature reading"
            message="Add a reading to begin building your personal history."
            onAction={() => setLogOpen(true)}
            title="No temperature readings yet"
          />
        ) : null}
        {SCREEN_STATE === "ready" && allPoints.length ? (
          <>
            <LatestCard points={allPoints} unit={unit} />
            <UnitSelector
              setUnit={(next) => {
                setUnit(next);
                resetSelection();
              }}
              unit={unit}
            />
            <RangeSelector
              range={range}
              setRange={(next) => {
                setRange(next);
                resetSelection();
              }}
            />
            <MethodSelector
              method={method}
              methods={methods}
              setMethod={(next) => {
                setMethod(next);
                resetSelection();
              }}
            />
            {!points.length ? (
              <ScreenState
                action={
                  method === "All methods" ? "Show all" : "Show all methods"
                }
                message={
                  method === "All methods"
                    ? "Choose another range or add a new reading."
                    : "Choose another reading method or show all methods."
                }
                onAction={() => {
                  if (method === "All methods") setRange("all");
                  else setMethod("All methods");
                  resetSelection();
                }}
                title={
                  method === "All methods"
                    ? "No readings in this time range"
                    : "No readings for this method"
                }
              />
            ) : (
              <>
                <TemperatureChart
                  method={method}
                  onSelect={setSelectedId}
                  points={points}
                  range={range}
                  selectedId={selectedPoint?.id ?? null}
                  summary={summary}
                  unit={unit}
                />
                {selectedPoint ? (
                  <SelectedReading point={selectedPoint} unit={unit} />
                ) : null}
                <SavedSummary summary={summary} unit={unit} />
                <RecentReadings
                  entries={[...points].reverse().slice(0, 5)}
                  onOpen={setDetailActivity}
                  unit={unit}
                />
              </>
            )}
            <AppButton
              accessibilityLabel="Add temperature reading"
              fullWidth
              label="Add temperature reading"
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
        key={logOpen ? "temperature-open" : "temperature-closed"}
        logType={logOpen ? "temperature" : null}
        onCancel={() => setLogOpen(false)}
        onSave={saveTemperature}
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
            Temperature
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

function LatestCard({
  points,
  unit,
}: {
  points: TemperaturePoint[];
  unit: TemperatureUnit;
}) {
  const { theme } = useAppTheme();
  const latest = points.at(-1)!;
  const previous = points.at(-2);
  const change = previous
    ? displayValue(latest.valueCelsius - previous.valueCelsius, unit, false)
    : null;
  const comparison =
    change === null
      ? "Add more readings to see changes over time."
      : Math.abs(change) < 0.05
        ? "Same value as your previous saved entry."
        : `${formatNumber(Math.abs(change))}${unitSymbol(unit)} ${change > 0 ? "higher" : "lower"} than your previous saved entry.`;
  return (
    <AppCard
      style={[
        styles.hero,
        { backgroundColor: theme.primarySoft, borderColor: theme.primary },
      ]}
    >
      <Text style={[styles.eyebrow, { color: theme.primary }]}>
        LATEST READING
      </Text>
      <Text
        accessibilityLabel={`Latest temperature reading, ${formatTemperatureSpeech(latest.valueCelsius, unit)}${latest.method ? `, ${latest.method} method` : ""}, saved ${formatDateTime(latest.recordedAt)}`}
        adjustsFontSizeToFit
        numberOfLines={1}
        style={[styles.latestValue, { color: theme.text }]}
      >
        {formatTemperature(latest.valueCelsius, unit)}
      </Text>
      {latest.method ? (
        <Text style={[styles.methodText, { color: theme.primary }]}>
          {latest.method}
        </Text>
      ) : null}
      <Text style={[styles.heroTime, { color: theme.mutedText }]}>
        Saved {formatDateTime(latest.recordedAt)}
      </Text>
      <Text style={[styles.heroSupport, { color: theme.mutedText }]}>
        {comparison}
      </Text>
    </AppCard>
  );
}

function UnitSelector({
  setUnit,
  unit,
}: {
  setUnit: (unit: TemperatureUnit) => void;
  unit: TemperatureUnit;
}) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.unitBlock}>
      <Text style={[styles.selectorLabel, { color: theme.mutedText }]}>
        Display unit
      </Text>
      <View style={styles.unitRow}>
        {(["celsius", "fahrenheit"] as const).map((option) => {
          const active = unit === option;
          return (
            <Pressable
              accessibilityLabel={`Degrees ${option === "celsius" ? "Celsius" : "Fahrenheit"}, ${active ? "selected" : "not selected"}`}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={option}
              onPress={() => setUnit(option)}
              style={({ pressed }) => [
                styles.unitButton,
                {
                  backgroundColor: active ? theme.primarySoft : theme.surface,
                  borderColor: active ? theme.primary : theme.border,
                },
                pressed ? styles.pressed : null,
              ]}
            >
              <Text
                style={[
                  styles.selectorText,
                  { color: active ? theme.primary : theme.text },
                ]}
              >
                {active ? "Selected " : ""}
                {unitSymbol(option)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function RangeSelector({
  range,
  setRange,
}: {
  range: TemperatureRange;
  setRange: (range: TemperatureRange) => void;
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
                styles.selectorText,
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

function MethodSelector({
  method,
  methods,
  setMethod,
}: {
  method: MethodFilter;
  methods: TemperatureMethod[];
  setMethod: (method: MethodFilter) => void;
}) {
  const { theme } = useAppTheme();
  const options: MethodFilter[] = ["All methods", ...methods];
  return (
    <View style={styles.methodBlock}>
      <Text style={[styles.selectorLabel, { color: theme.mutedText }]}>
        Reading method
      </Text>
      <ScrollView
        contentContainerStyle={styles.methodRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {options.map((option) => {
          const active = method === option;
          return (
            <Pressable
              accessibilityLabel={`${option}, ${active ? "selected" : "not selected"}`}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={option}
              onPress={() => setMethod(option)}
              style={({ pressed }) => [
                styles.methodButton,
                {
                  backgroundColor: active ? theme.primarySoft : theme.surface,
                  borderColor: active ? theme.primary : theme.border,
                },
                pressed ? styles.pressed : null,
              ]}
            >
              <Text
                style={[
                  styles.methodButtonText,
                  { color: active ? theme.primary : theme.text },
                ]}
              >
                {active ? "Selected " : ""}
                {option}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function TemperatureChart({
  method,
  onSelect,
  points,
  range,
  selectedId,
  summary,
  unit,
}: {
  method: MethodFilter;
  onSelect: (id: string) => void;
  points: TemperaturePoint[];
  range: TemperatureRange;
  selectedId: string | null;
  summary: TemperatureSummary;
  unit: TemperatureUnit;
}) {
  const { theme } = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();
  const width = Math.max(160, Math.min(screenWidth - 70, 410));
  const height = 210;
  const plot = getChartPlot(points, unit, width, height);
  const labels = getXAxisLabels(plot.positions);
  const accessibilityLabel = `Temperature trend for ${formatRangeLabel(range)}${method === "All methods" ? "" : `, ${method} method`}. ${summary.count} saved readings. Lowest saved reading ${formatTemperatureSpeech(summary.lowestCelsius, unit)}, highest ${formatTemperatureSpeech(summary.highestCelsius, unit)}, average ${formatTemperatureSpeech(summary.averageCelsius, unit)}.`;
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
          Temperature trend
        </Text>
        <Text style={[styles.chartUnit, { color: theme.mutedText }]}>
          {unitSymbol(unit)}
        </Text>
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
            accessibilityLabel={`${formatTemperatureSpeech(point.valueCelsius, unit)}${point.method ? `, ${point.method} method` : ""}, ${formatFullDateTime(point.recordedAt)}, added manually`}
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

function SelectedReading({
  point,
  unit,
}: {
  point: TemperaturePoint;
  unit: TemperatureUnit;
}) {
  const { theme } = useAppTheme();
  return (
    <View
      accessibilityLabel={`Selected temperature reading, ${formatTemperatureSpeech(point.valueCelsius, unit)}${point.method ? `, ${point.method} method` : ""}, ${formatFullDateTime(point.recordedAt)}, added manually.${point.activity.details.notes ? ` Note: ${point.activity.details.notes}` : ""}`}
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
        {formatTemperature(point.valueCelsius, unit)}
      </Text>
      {point.method ? (
        <Text style={[styles.methodText, { color: theme.primary }]}>
          {point.method}
        </Text>
      ) : null}
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

function SavedSummary({
  summary,
  unit,
}: {
  summary: TemperatureSummary;
  unit: TemperatureUnit;
}) {
  const metrics = [
    {
      accessibilityLabel: `Lowest saved temperature, ${formatTemperatureSpeech(summary.lowestCelsius, unit)}`,
      label: "Lowest saved",
      value: formatTemperature(summary.lowestCelsius, unit),
    },
    {
      accessibilityLabel: `Highest saved temperature, ${formatTemperatureSpeech(summary.highestCelsius, unit)}`,
      label: "Highest saved",
      value: formatTemperature(summary.highestCelsius, unit),
    },
    {
      accessibilityLabel: `Average saved temperature, ${formatTemperatureSpeech(summary.averageCelsius, unit)}`,
      label: "Average saved",
      value: formatTemperature(summary.averageCelsius, unit),
    },
    {
      accessibilityLabel: `${summary.count} saved ${summary.count === 1 ? "reading" : "readings"}`,
      label: "Readings",
      value: `${summary.count}`,
    },
    {
      accessibilityLabel: `${summary.methods} reading ${summary.methods === 1 ? "method" : "methods"} used`,
      label: "Methods used",
      value: `${summary.methods}`,
    },
  ];
  const { theme } = useAppTheme();
  return (
    <AppSection
      subtitle="Calculated from the readings visible in this time range."
      title="Your saved range"
    >
      <View style={styles.summaryGrid}>
        {metrics.map((metric) => (
          <View
            accessibilityLabel={metric.accessibilityLabel}
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
  unit,
}: {
  entries: TemperaturePoint[];
  onOpen: (entry: GeneralHealthActivityEntry) => void;
  unit: TemperatureUnit;
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
            accessibilityLabel={`${formatTemperatureSpeech(point.valueCelsius, unit)}${point.method ? `, ${point.method} method` : ""}, ${formatFullDateTime(point.recordedAt)}, added manually${point.activity.details.notes ? ", includes a note" : ""}`}
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
                {formatTemperature(point.valueCelsius, unit)}
              </Text>
              {point.method ? (
                <Text style={[styles.readingMethod, { color: theme.primary }]}>
                  {point.method}
                </Text>
              ) : null}
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
        medically. Temperature can vary by reading method. Contact a healthcare
        professional if you are worried about symptoms or readings.
      </Text>
    </View>
  );
}
function LoadingState() {
  const { theme } = useAppTheme();
  return (
    <View style={styles.loading}>
      {[150, 92, 270, 190, 90].map((height) => (
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
      <AppIcon color={theme.primary} container name="biometrics" size={24} />
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

function getTemperatureReadingsForProfile(
  entries: GeneralHealthActivityEntry[],
  profileId: string,
): TemperaturePoint[] {
  return entries
    .flatMap((entry) => {
      const recordedTime = new Date(entry.createdAt).getTime();
      if (
        entry.profileId !== profileId ||
        entry.type !== "temperature" ||
        !entry.details.temperature ||
        !Number.isFinite(recordedTime)
      )
        return [];
      const valueCelsius = Number(entry.details.temperature);
      return Number.isFinite(valueCelsius)
        ? [
            {
              activity: entry,
              id: entry.id,
              method: entry.details.method,
              recordedAt: entry.createdAt,
              valueCelsius,
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
function filterTemperatureReadingsByRange(
  points: TemperaturePoint[],
  range: TemperatureRange,
  reference: Date,
) {
  if (range === "all") return points;
  const cutoff = reference.getTime() - range * 86400000;
  return points.filter(
    (point) => new Date(point.recordedAt).getTime() >= cutoff,
  );
}
function filterTemperatureReadingsByMethod(
  points: TemperaturePoint[],
  method: MethodFilter,
) {
  return method === "All methods"
    ? points
    : points.filter((point) => point.method === method);
}
function getAvailableMethods(points: TemperaturePoint[]): TemperatureMethod[] {
  const allowed: TemperatureMethod[] = [
    "Oral",
    "Ear",
    "Forehead",
    "Underarm",
    "Other",
  ];
  return allowed.filter((method) =>
    points.some((point) => point.method === method),
  );
}
function calculateTemperatureSavedSummary(
  points: TemperaturePoint[],
): TemperatureSummary {
  const values = points.map((point) => point.valueCelsius);
  return {
    averageCelsius:
      values.reduce((sum, value) => sum + value, 0) / values.length,
    count: values.length,
    highestCelsius: Math.max(...values),
    lowestCelsius: Math.min(...values),
    methods: new Set(points.map((point) => point.method).filter(Boolean)).size,
  };
}
function celsiusToFahrenheit(value: number) {
  return (value * 9) / 5 + 32;
}
function displayValue(
  valueCelsius: number,
  unit: TemperatureUnit,
  absolute = true,
) {
  const value =
    unit === "celsius"
      ? valueCelsius
      : absolute
        ? celsiusToFahrenheit(valueCelsius)
        : (valueCelsius * 9) / 5;
  return value;
}
function unitSymbol(unit: TemperatureUnit) {
  return unit === "celsius" ? "\u00B0C" : "\u00B0F";
}
function formatNumber(value: number) {
  return value.toFixed(1);
}
function formatTemperature(valueCelsius: number, unit: TemperatureUnit) {
  return `${formatNumber(displayValue(valueCelsius, unit))}${unitSymbol(unit)}`;
}
function formatTemperatureSpeech(valueCelsius: number, unit: TemperatureUnit) {
  return `${formatNumber(displayValue(valueCelsius, unit))} degrees ${unit === "celsius" ? "Celsius" : "Fahrenheit"}`;
}
function getChartPlot(
  points: TemperaturePoint[],
  unit: TemperatureUnit,
  width: number,
  height: number,
) {
  const left = 42,
    right = 18,
    top = 18,
    bottom = 18;
  const values = points.map((point) => displayValue(point.valueCelsius, unit));
  const rawMin = Math.min(...values),
    rawMax = Math.max(...values),
    dataSpan = Math.max(rawMax - rawMin, unit === "celsius" ? 0.6 : 1);
  const padding = Math.max(unit === "celsius" ? 0.3 : 0.5, dataSpan * 0.2),
    interval = unit === "celsius" ? 0.5 : 1;
  const min = Math.floor((rawMin - padding) / interval) * interval,
    max = Math.ceil((rawMax + padding) / interval) * interval,
    span = Math.max(max - min, interval);
  const firstTime = new Date(points[0].recordedAt).getTime(),
    lastTime = new Date(points.at(-1)!.recordedAt).getTime(),
    timeSpan = Math.max(lastTime - firstTime, 1);
  const positions = points.map((point) => {
    const value = displayValue(point.valueCelsius, unit);
    return {
      ...point,
      value,
      x:
        points.length === 1
          ? left + (width - left - right) / 2
          : left +
            ((new Date(point.recordedAt).getTime() - firstTime) / timeSpan) *
              (width - left - right),
      y: top + ((max - value) / span) * (height - top - bottom),
    };
  });
  const ticks = [max, (max + min) / 2, min].map((value) => ({
    value,
    y: top + ((max - value) / span) * (height - top - bottom),
  }));
  return { bottom, left, positions, right, ticks, top };
}
function getXAxisLabels<T extends TemperaturePoint>(points: T[]) {
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
function formatAxisDate(value: string, range: TemperatureRange) {
  return new Date(value).toLocaleDateString(
    undefined,
    range === 7
      ? { weekday: "short" }
      : range === "all"
        ? { month: "short", year: "2-digit" }
        : { day: "numeric", month: "short" },
  );
}
function formatRangeLabel(range: TemperatureRange) {
  return range === "all" ? "all saved time" : `the last ${range} days`;
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
  heroSupport: { fontSize: 13, lineHeight: 20, marginTop: 5 },
  heroTime: { fontSize: 13 },
  latestValue: { fontSize: 40, fontWeight: "900", lineHeight: 48 },
  loading: { gap: 14 },
  methodBlock: { gap: 8 },
  methodButton: {
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 13,
  },
  methodButtonText: { fontSize: 12, fontWeight: "900" },
  methodRow: { gap: 8, paddingRight: 8 },
  methodText: { fontSize: 13, fontWeight: "900" },
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
  readingCopy: { flex: 1, minWidth: 0 },
  readingMeta: { fontSize: 12, lineHeight: 18, marginTop: 3 },
  readingMethod: { fontSize: 12, fontWeight: "900", marginTop: 3 },
  readingRow: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 92,
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
  selectorLabel: { fontSize: 12, fontWeight: "800" },
  selectorText: { fontSize: 12, fontWeight: "900" },
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
    padding: 14,
  },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  summaryLabel: { fontSize: 12, fontWeight: "800" },
  summaryValue: { fontSize: 18, fontWeight: "900", marginTop: 8 },
  title: { fontSize: 25, fontWeight: "900" },
  unitBlock: { gap: 8 },
  unitButton: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
  },
  unitRow: { flexDirection: "row", gap: 8, maxWidth: 250 },
  xLabels: { flexDirection: "row", justifyContent: "space-between" },
  yLabel: {
    fontSize: 10,
    fontWeight: "800",
    left: 0,
    position: "absolute",
    width: 36,
  },
});
