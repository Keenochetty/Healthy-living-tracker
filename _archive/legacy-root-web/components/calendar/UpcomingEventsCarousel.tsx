import { ScrollView, StyleSheet, Text, View } from "react-native";

import { CalendarEventCard } from "@/components/calendar/CalendarEventCard";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import { sortEventsByTime } from "@/lib/calendar";
import type { CalendarEvent } from "@/types/calendar";

type UpcomingEventsCarouselProps = {
  events: CalendarEvent[];
  onOpenEvent?: (event: CalendarEvent) => void;
};

export function UpcomingEventsCarousel({
  events,
  onOpenEvent,
}: UpcomingEventsCarouselProps) {
  const upcomingEvents = sortEventsByTime(events)
    .filter((event) => event.eventType !== "emergency")
    .slice(0, 5);

  if (upcomingEvents.length === 0) {
    return <Text style={styles.emptyText}>No upcoming shared events yet.</Text>;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {upcomingEvents.map((event) => (
        <View key={event.id} style={styles.item}>
          <CalendarEventCard event={event} onOpen={onOpenEvent} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  emptyText: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  item: {
    width: 320,
  },
});
