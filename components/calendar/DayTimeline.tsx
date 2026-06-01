import { StyleSheet, Text, View } from "react-native";

import { CalendarEventCard } from "@/components/calendar/CalendarEventCard";
import { NativeEmptyState } from "@/components/ui";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import type { CalendarEvent } from "@/types/calendar";

type DayTimelineProps = {
  date: Date;
  events: CalendarEvent[];
  onOpenEvent?: (event: CalendarEvent) => void;
};

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    weekday: "long"
  }).format(date);
}

export function DayTimeline({ date, events, onOpenEvent }: DayTimelineProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{formatDateLabel(date)}</Text>
        <Text style={styles.count}>{events.length} events</Text>
      </View>

      {events.length === 0 ? (
        <NativeEmptyState icon="calendar" title="No events this day" message="Choose another day or add an event placeholder." />
      ) : (
        <View style={styles.list}>
          {events.map((event) => (
            <CalendarEventCard event={event} key={event.id} onOpen={onOpenEvent} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md
  },
  count: {
    color: colors.text.muted,
    fontSize: 14,
    fontWeight: "800"
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  list: {
    gap: spacing.md
  },
  title: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: "900"
  }
});
