import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { GeneralHealthActivityDetailSheet } from "@/components/health/GeneralHealthActivityDetailSheet";
import { AppCard, AppIcon, AppSection } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import type { GeneralHealthActivityEntry, GeneralHealthActivityType } from "@/lib/generalHealthMockData";
import { useAppTheme } from "@/theme/ThemeProvider";

const ACTIVITY_CONFIG: Record<GeneralHealthActivityType, { icon: AppIconName; label: string }> = {
  note: { icon: "edit", label: "Note" },
  temperature: { icon: "biometrics", label: "Temperature" },
  vitals: { icon: "vitals", label: "Vitals" },
  weight: { icon: "weight", label: "Weight" }
};

const GROUP_ORDER = ["Today", "Yesterday", "Earlier this week", "Older"] as const;
type ActivityGroupLabel = (typeof GROUP_ORDER)[number];

export function GeneralHealthActivityTimeline({
  actionAccessibilityHint,
  actionAccessibilityLabel,
  actionLabel,
  entries,
  onActionPress,
  profileId
}: {
  actionAccessibilityHint?: string;
  actionAccessibilityLabel?: string;
  actionLabel?: string;
  entries: GeneralHealthActivityEntry[];
  onActionPress?: () => void;
  profileId: string;
}) {
  // TODO: Load and filter health activity by the selected profile through the approved data layer.
  const visibleEntries = entries
    .filter((entry) => entry.profileId === profileId)
    .filter((entry) => isValidActivityDate(entry.createdAt))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

  return (
    <AppSection
      actionAccessibilityHint={actionAccessibilityHint}
      actionAccessibilityLabel={actionAccessibilityLabel}
      actionLabel={actionLabel}
      onActionPress={onActionPress}
      subtitle="Your latest health logs and notes."
      title="Recent activity"
    >
      <GeneralHealthActivityList entries={visibleEntries} />
    </AppSection>
  );
}

export function GeneralHealthActivityList({
  emptyMessage = "Use a quick log to add your first health entry.",
  emptyTitle = "No recent health activity",
  entries
}: {
  emptyMessage?: string;
  emptyTitle?: string;
  entries: GeneralHealthActivityEntry[];
}) {
  const [selectedActivity, setSelectedActivity] = useState<GeneralHealthActivityEntry | null>(null);
  const groups = groupGeneralHealthActivityByDate(entries);
  const selectedVisibleActivity = selectedActivity && entries.some((entry) => entry.id === selectedActivity.id && entry.profileId === selectedActivity.profileId)
    ? selectedActivity
    : null;

  return (
    <>
      {groups.length ? (
        <View style={styles.groups}>
          {groups.map((group) => <GeneralHealthActivityGroup entries={group.entries} key={group.label} label={group.label} onSelect={setSelectedActivity} />)}
        </View>
      ) : <GeneralHealthActivityEmptyState message={emptyMessage} title={emptyTitle} />}
      <GeneralHealthActivityDetailSheet activity={selectedVisibleActivity} onClose={() => setSelectedActivity(null)} />
    </>
  );
}

function GeneralHealthActivityGroup({ entries, label, onSelect }: { entries: GeneralHealthActivityEntry[]; label: ActivityGroupLabel; onSelect: (entry: GeneralHealthActivityEntry) => void }) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.group}>
      <Text accessibilityRole="header" style={[styles.groupLabel, { color: theme.mutedText }]}>{label}</Text>
      <View style={styles.items}>
        {entries.map((entry, index) => (
          <GeneralHealthActivityItem entry={entry} isLast={index === entries.length - 1} key={entry.id} onPress={() => onSelect(entry)} />
        ))}
      </View>
    </View>
  );
}

function GeneralHealthActivityItem({ entry, isLast, onPress }: { entry: GeneralHealthActivityEntry; isLast: boolean; onPress: () => void }) {
  const { theme } = useAppTheme();
  const config = ACTIVITY_CONFIG[entry.type];
  const time = formatActivityTime(entry.createdAt);
  const accessibilityLabel = `Open ${config.label.toLowerCase()} entry from ${time}. ${entry.summary}. Profile: ${entry.profileName}.`;

  return (
    <Pressable
      accessibilityHint="Opens the full activity details."
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.itemRow, pressed ? styles.pressed : null]}
    >
      <View style={styles.rail}>
        <View style={[styles.iconCircle, { backgroundColor: theme.primarySoft, borderColor: theme.border }]}>
          <AppIcon color={theme.primary} decorative name={config.icon} size={19} />
        </View>
        {!isLast ? <View style={[styles.connector, { backgroundColor: theme.border }]} /> : null}
      </View>
      <AppCard style={[styles.itemCard, { borderColor: theme.border }]}>
        <View style={styles.itemHeading}>
          <Text numberOfLines={2} style={[styles.itemTitle, { color: theme.text }]}>{entry.title}</Text>
          <Text style={[styles.time, { color: theme.mutedText }]}>{time}</Text>
        </View>
        <Text numberOfLines={2} style={[styles.summary, { color: theme.mutedText }]}>{entry.summary}</Text>
        <View style={styles.meta}>
          <View style={[styles.profileDot, { backgroundColor: theme.primarySoft }]}>
            <AppIcon color={theme.primary} decorative name="profile" size={13} />
          </View>
          <Text style={[styles.metaText, { color: theme.text }]}>{entry.profileName}</Text>
          <Text style={[styles.metaSeparator, { color: theme.mutedText }]}>-</Text>
          <Text style={[styles.typeLabel, { color: theme.primary }]}>{config.label}</Text>
          <Text style={[styles.chevron, { color: theme.mutedText }]}>{">"}</Text>
        </View>
      </AppCard>
    </Pressable>
  );
}

function GeneralHealthActivityEmptyState({ message, title }: { message: string; title: string }) {
  const { theme } = useAppTheme();
  return (
    <AppCard style={[styles.empty, { borderColor: theme.border }]}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.primarySoft }]}>
        <AppIcon color={theme.primary} decorative name="health" size={22} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.emptyMessage, { color: theme.mutedText }]}>{message}</Text>
    </AppCard>
  );
}

export function groupGeneralHealthActivityByDate(entries: GeneralHealthActivityEntry[]) {
  const grouped = new Map<ActivityGroupLabel, GeneralHealthActivityEntry[]>();
  const now = new Date();

  entries.forEach((entry) => {
    const label = getActivityGroupLabel(new Date(entry.createdAt), now);
    grouped.set(label, [...(grouped.get(label) ?? []), entry]);
  });

  return GROUP_ORDER
    .filter((label) => grouped.has(label))
    .map((label) => ({ entries: grouped.get(label) ?? [], label }));
}

function getActivityGroupLabel(date: Date, now: Date): ActivityGroupLabel {
  if (isSameCalendarDay(date, now)) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameCalendarDay(date, yesterday)) return "Yesterday";
  if (date >= startOfWeek(now) && date < now) return "Earlier this week";
  return "Older";
}

function isSameCalendarDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();
}

function startOfWeek(value: Date) {
  const date = new Date(value);
  const day = date.getDay();
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatActivityTime(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Time unavailable";
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function isValidActivityDate(value: string) {
  return Number.isFinite(new Date(value).getTime());
}

const styles = StyleSheet.create({
  connector: { flex: 1, marginTop: 5, width: 2 },
  chevron: { fontSize: 18, fontWeight: "900", marginLeft: "auto" },
  empty: { alignItems: "center", borderWidth: 1, gap: 8, padding: 20 },
  emptyIcon: { alignItems: "center", borderRadius: 18, height: 46, justifyContent: "center", width: 46 },
  emptyMessage: { lineHeight: 20, maxWidth: 290, textAlign: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "900", marginTop: 3 },
  group: { gap: 10 },
  groupLabel: { fontSize: 13, fontWeight: "900", textTransform: "uppercase" },
  groups: { gap: 22 },
  iconCircle: { alignItems: "center", borderRadius: 20, borderWidth: 1, height: 40, justifyContent: "center", width: 40 },
  itemCard: { borderWidth: 1, flex: 1, gap: 9, minWidth: 0, padding: 14 },
  itemHeading: { alignItems: "flex-start", flexDirection: "row", gap: 10 },
  itemRow: { alignItems: "stretch", flexDirection: "row", gap: 10 },
  itemTitle: { flex: 1, fontSize: 15, fontWeight: "900", lineHeight: 20 },
  items: { gap: 12 },
  meta: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 6 },
  metaSeparator: { fontSize: 12 },
  metaText: { fontSize: 12, fontWeight: "800" },
  profileDot: { alignItems: "center", borderRadius: 12, height: 24, justifyContent: "center", width: 24 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.995 }] },
  rail: { alignItems: "center", width: 40 },
  summary: { fontSize: 13, lineHeight: 19 },
  time: { fontSize: 12, fontWeight: "800", paddingTop: 1 },
  typeLabel: { fontSize: 12, fontWeight: "900" }
});
