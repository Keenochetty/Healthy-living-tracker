import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppCard, AppIcon } from "@/components/ui";
import { useAppTheme } from "@/theme/ThemeProvider";
import type { BabyCalendarEvent } from "@/types/child";

export function BabyTimeline({
  events,
  onLogFeed,
}: {
  events: BabyCalendarEvent[];
  onLogFeed: () => void;
}) {
  const { theme } = useAppTheme();

  if (!events.length) {
    return (
      <AppCard
        style={[
          styles.emptyCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View
          style={[styles.emptyIcon, { backgroundColor: theme.primarySoft }]}
        >
          <AppIcon color={theme.primary} decorative name="calendar" size={24} />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>
          Start today&apos;s timeline
        </Text>
        <Text style={[styles.emptyText, { color: theme.mutedText }]}>
          Feeds, sleep, diapers, notes, and medicine logs will appear here.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onLogFeed}
          style={[styles.button, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.buttonText}>Log feed</Text>
        </Pressable>
      </AppCard>
    );
  }

  return (
    <AppCard
      padding="sm"
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      {events.slice(0, 8).map((event, index) => (
        <View
          key={event.id}
          style={[
            styles.row,
            index < Math.min(events.length, 8) - 1
              ? { borderBottomColor: theme.border, borderBottomWidth: 1 }
              : null,
          ]}
        >
          <Text style={[styles.time, { color: theme.mutedText }]}>
            {formatTime(event.eventAt)}
          </Text>
          <View style={styles.rail}>
            {index < Math.min(events.length, 8) - 1 ? (
              <View style={[styles.line, { backgroundColor: theme.border }]} />
            ) : null}
            <View
              style={[
                styles.dot,
                { backgroundColor: event.color || theme.primary },
              ]}
            />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.title, { color: theme.text }]}>
              {formatType(event.type)}
            </Text>
            <Text
              numberOfLines={2}
              style={[styles.detail, { color: theme.mutedText }]}
            >
              {event.label}
            </Text>
          </View>
          <AppIcon
            color={event.color || theme.primary}
            decorative
            name={iconFor(event.type) as never}
            size={21}
          />
        </View>
      ))}
    </AppCard>
  );
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
  });
}

function formatType(value: string) {
  if (value === "solid_food") return "Solid food";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function iconFor(type: BabyCalendarEvent["type"]) {
  if (type === "feeding" || type === "solid_food") return "nutrition";
  if (type === "sleep") return "sleep";
  if (type === "diaper") return "baby_child";
  if (type === "medicine") return "medication";
  if (type === "vaccine") return "vaccines";
  if (type === "growth") return "weight";
  return "calendar";
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    borderRadius: 999,
    marginTop: 14,
    minHeight: 44,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonText: { color: "#10201d", fontWeight: "900" },
  card: { borderWidth: 1, overflow: "hidden" },
  copy: { flex: 1 },
  detail: { lineHeight: 18, marginTop: 2 },
  dot: { borderRadius: 999, height: 12, width: 12 },
  emptyCard: { borderWidth: 1 },
  emptyIcon: {
    alignItems: "center",
    borderRadius: 18,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  emptyText: { lineHeight: 21, marginTop: 6 },
  emptyTitle: { fontSize: 19, fontWeight: "900", marginTop: 12 },
  line: { bottom: -36, left: 5, position: "absolute", top: 12, width: 2 },
  rail: {
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "center",
    width: 16,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    minHeight: 72,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  time: { fontSize: 13, fontWeight: "800", width: 44 },
  title: { fontSize: 15, fontWeight: "900" },
});
