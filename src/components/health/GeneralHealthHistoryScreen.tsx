import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { HealthScreenContainer } from "@/components/health/HealthScreenContainer";
import { GeneralHealthActivityList } from "@/components/health/GeneralHealthActivityTimeline";
import { useGeneralHealthActivity } from "@/components/health/GeneralHealthActivityProvider";
import { AppButton, AppCard, AppIcon } from "@/components/ui";
import type { GeneralHealthActivityEntry, GeneralHealthActivityType } from "@/lib/generalHealthMockData";
import { useAppTheme } from "@/theme/ThemeProvider";

type HistoryRange = 7 | 30 | 90 | "all";
type HistoryType = GeneralHealthActivityType | "all";
type GeneralHealthHistoryState = "error" | "loading" | "ready";

const HISTORY_STATE: GeneralHealthHistoryState = "ready";
const RANGE_OPTIONS: { label: string; value: HistoryRange }[] = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
  { label: "All", value: "all" }
];
const TYPE_OPTIONS: { label: string; value: HistoryType }[] = [
  { label: "All", value: "all" },
  { label: "Vitals", value: "vitals" },
  { label: "Weight", value: "weight" },
  { label: "Temperature", value: "temperature" },
  { label: "Notes", value: "note" }
];

export function GeneralHealthHistoryScreen() {
  const { theme } = useAppTheme();
  const { activities, selectedProfileId, selectedProfileName } = useGeneralHealthActivity();
  const [openedAt] = useState(() => new Date());
  const [range, setRange] = useState<HistoryRange>(30);
  const [type, setType] = useState<HistoryType>("all");

  // TODO: Apply final profile permissions and sharing rules through the approved privacy layer.
  // TODO: Replace feature-local activity state with the approved profile health data layer.
  const profileActivities = useMemo(
    () => activities.filter((entry) => entry.profileId === selectedProfileId && isValidActivityDate(entry.createdAt)),
    [activities, selectedProfileId]
  );
  const visibleActivities = useMemo(
    () => filterGeneralHealthActivity(profileActivities, range, type, openedAt),
    [openedAt, profileActivities, range, type]
  );

  function resetFilters() {
    setRange(30);
    setType("all");
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <HealthScreenContainer contentStyle={styles.content}>
        <HistoryHeader count={profileActivities.length} profileName={selectedProfileName} />
        {HISTORY_STATE === "loading" ? <HistoryLoadingState /> : null}
        {HISTORY_STATE === "error" ? <HistoryErrorState /> : null}
        {HISTORY_STATE === "ready" ? (
          <>
            <HistoryFilters onReset={resetFilters} range={range} setRange={setRange} setType={setType} type={type} />
            <Text accessibilityLiveRegion="polite" style={[styles.resultSummary, { color: theme.mutedText }]}>
              {getResultSummary(visibleActivities.length, range, type)}
            </Text>
            {profileActivities.length ? (
              visibleActivities.length ? (
                <GeneralHealthActivityList entries={visibleActivities} />
              ) : (
                <HistoryEmptyState
                  actionLabel="Reset filters"
                  message="Try another time range or activity type."
                  onAction={resetFilters}
                  title="No matching activity"
                />
              )
            ) : (
              <HistoryEmptyState
                actionLabel="Back to General Health"
                message="Your saved vitals, weight, temperature, and health notes will appear here."
                onAction={() => router.back()}
                title="No health history yet"
              />
            )}
          </>
        ) : null}
      </HealthScreenContainer>
    </View>
  );
}

function HistoryHeader({ count, profileName }: { count: number; profileName: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Pressable accessibilityHint="Returns to General Health" accessibilityLabel="Back to General Health" accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: theme.surface, borderColor: theme.border }, pressed ? styles.pressed : null]}>
          <Text style={[styles.backText, { color: theme.text }]}>{"<"}</Text>
        </Pressable>
        <View style={styles.headerCopy}>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>Health history</Text>
          <Text style={[styles.subtitle, { color: theme.mutedText }]}>Your saved general health activity</Text>
        </View>
      </View>
      <View accessibilityLabel={`${profileName}, ${formatEntryCount(count)}`} accessible style={[styles.profile, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={[styles.profileIcon, { backgroundColor: theme.primarySoft }]}>
          <AppIcon color={theme.primary} decorative name="profile" size={18} />
        </View>
        <View>
          <Text style={[styles.profileName, { color: theme.text }]}>{profileName}</Text>
          <Text style={[styles.profileMeta, { color: theme.mutedText }]}>{formatEntryCount(count)}</Text>
        </View>
      </View>
    </View>
  );
}

function HistoryFilters({ onReset, range, setRange, setType, type }: {
  onReset: () => void;
  range: HistoryRange;
  setRange: (value: HistoryRange) => void;
  setType: (value: HistoryType) => void;
  type: HistoryType;
}) {
  const { theme } = useAppTheme();
  const changed = range !== 30 || type !== "all";
  return (
    <View style={[styles.filters, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <FilterRow label="Time range" options={RANGE_OPTIONS} selected={range} onSelect={setRange} />
      <FilterRow label="Activity type" options={TYPE_OPTIONS} selected={type} onSelect={setType} />
      {changed ? (
        <Pressable accessibilityLabel="Reset health history filters" accessibilityRole="button" onPress={onReset} style={({ pressed }) => [styles.reset, pressed ? styles.pressed : null]}>
          <Text style={[styles.resetText, { color: theme.primary }]}>Reset filters</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function FilterRow<T extends string | number>({ label, onSelect, options, selected }: {
  label: string;
  onSelect: (value: T) => void;
  options: { label: string; value: T }[];
  selected: T;
}) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.filterGroup}>
      <Text style={[styles.filterLabel, { color: theme.text }]}>{label}</Text>
      <ScrollView contentContainerStyle={styles.chips} horizontal showsHorizontalScrollIndicator={false}>
        {options.map((option) => {
          const active = option.value === selected;
          return (
            <Pressable
              accessibilityLabel={`${option.label}${label === "Activity type" ? " filter" : ""}, ${active ? "selected" : "not selected"}`}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={String(option.value)}
              onPress={() => onSelect(option.value)}
              style={({ pressed }) => [styles.chip, { backgroundColor: active ? theme.primarySoft : theme.background, borderColor: active ? theme.primary : theme.border }, pressed ? styles.pressed : null]}
            >
              <Text style={[styles.chipMark, { color: active ? theme.primary : theme.mutedText }]}>{active ? "Selected" : "-"}</Text>
              <Text style={[styles.chipText, { color: active ? theme.primary : theme.text }]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function HistoryEmptyState({ actionLabel, message, onAction, title }: { actionLabel?: string; message: string; onAction?: () => void; title: string }) {
  const { theme } = useAppTheme();
  return (
    <AppCard style={[styles.empty, { borderColor: theme.border }]}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.primarySoft }]}><AppIcon color={theme.primary} decorative name="health" size={24} /></View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.emptyMessage, { color: theme.mutedText }]}>{message}</Text>
      {actionLabel && onAction ? <AppButton accessibilityLabel={actionLabel === "Reset filters" ? "Reset health history filters" : actionLabel} label={actionLabel} onPress={onAction} variant="secondary" /> : null}
    </AppCard>
  );
}

function HistoryLoadingState() {
  const { theme } = useAppTheme();
  return <View accessible accessibilityLabel="Loading health history" accessibilityRole="progressbar" style={styles.stateStack}>{[96, 122, 112].map((height) => <View key={height} style={[styles.skeleton, { backgroundColor: theme.surface, borderColor: theme.border, height }]} />)}</View>;
}

function HistoryErrorState() {
  return <HistoryEmptyState message="Please return to General Health and open history again." title="We couldn't load health history" />;
}

function filterGeneralHealthActivity(entries: GeneralHealthActivityEntry[], range: HistoryRange, type: HistoryType, referenceDate: Date) {
  const cutoff = range === "all" ? null : new Date(referenceDate.getTime() - range * 24 * 60 * 60 * 1000);
  return entries
    .filter((entry) => !cutoff || new Date(entry.createdAt) >= cutoff)
    .filter((entry) => type === "all" || entry.type === type)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

function isValidActivityDate(value: string) {
  return Number.isFinite(new Date(value).getTime());
}

function getResultSummary(count: number, range: HistoryRange, type: HistoryType) {
  const typeLabel = TYPE_OPTIONS.find((option) => option.value === type)?.label ?? "Activity";
  const rangeLabel = range === "all" ? "all time" : `the last ${range} days`;
  if (type === "all") return `${formatEntryCount(count)} in ${rangeLabel}`;
  if (!count) return `No ${typeLabel} entries in ${rangeLabel}`;
  return `${count} ${typeLabel} ${count === 1 ? "entry" : "entries"} in ${rangeLabel}`;
}

function formatEntryCount(count: number) {
  return `${count} ${count === 1 ? "entry" : "entries"}`;
}

const styles = StyleSheet.create({
  back: { alignItems: "center", borderRadius: 16, borderWidth: 1, height: 44, justifyContent: "center", width: 44 },
  backText: { fontSize: 22, fontWeight: "900", lineHeight: 24 },
  chip: { alignItems: "center", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 6, minHeight: 42, paddingHorizontal: 12 },
  chipMark: { fontSize: 13, fontWeight: "900" },
  chips: { gap: 8, paddingRight: 4 },
  chipText: { fontSize: 13, fontWeight: "900" },
  content: { gap: 24 },
  empty: { alignItems: "center", borderWidth: 1, gap: 10, padding: 22 },
  emptyIcon: { alignItems: "center", borderRadius: 20, height: 52, justifyContent: "center", width: 52 },
  emptyMessage: { lineHeight: 20, maxWidth: 310, textAlign: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "900", textAlign: "center" },
  filterGroup: { gap: 9 },
  filterLabel: { fontSize: 14, fontWeight: "900" },
  filters: { borderRadius: 20, borderWidth: 1, gap: 17, padding: 15 },
  header: { gap: 16 },
  headerCopy: { flex: 1 },
  headerTop: { alignItems: "flex-start", flexDirection: "row", gap: 13 },
  pressed: { opacity: 0.74 },
  profile: { alignItems: "center", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 10, minHeight: 58, padding: 10 },
  profileIcon: { alignItems: "center", borderRadius: 14, height: 38, justifyContent: "center", width: 38 },
  profileMeta: { fontSize: 12, marginTop: 2 },
  profileName: { fontSize: 14, fontWeight: "900" },
  reset: { alignSelf: "flex-start", minHeight: 40, justifyContent: "center" },
  resetText: { fontSize: 13, fontWeight: "900" },
  resultSummary: { fontSize: 13, fontWeight: "800" },
  screen: { flex: 1 },
  skeleton: { borderRadius: 20, borderWidth: 1 },
  stateStack: { gap: 12 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  title: { fontSize: 27, fontWeight: "900", lineHeight: 33 }
});
