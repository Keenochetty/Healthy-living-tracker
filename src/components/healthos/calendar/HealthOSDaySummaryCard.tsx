import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import { formatCalendarDate } from "./calendarVisuals";
import { HealthOSCalendarEventRow } from "./HealthOSCalendarEventRow";
import type { HealthOSCalendarDisplayEvent } from "./HealthOSCalendarTypes";

type HealthOSDaySummaryCardProps = {
  date: Date;
  events: HealthOSCalendarDisplayEvent[];
  onAdd: () => void;
  onViewFullDay: () => void;
};

export function HealthOSDaySummaryCard({
  date,
  events,
  onAdd,
  onViewFullDay,
}: HealthOSDaySummaryCardProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard
      rightAccessory={
        <HealthOSPill label="View full day" onPress={onViewFullDay} size="sm" variant="glass" />
      }
      subtitle={
        events.length
          ? `${events.length} planned item${events.length === 1 ? "" : "s"}`
          : "No planned items"
      }
      title={formatCalendarDate(date)}
      variant="glass"
    >
      <View style={styles.stack}>
        {events.length ? (
          events
            .slice(0, 4)
            .map((event) => <HealthOSCalendarEventRow event={event} key={event.id} />)
        ) : (
          <View style={styles.empty}>
            <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
              No planned items for this day.
            </Text>
            <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
              Add an event, reminder, scan, or health log when you need it.
            </Text>
            <HealthOSPill label="Add item" onPress={onAdd} variant="active" />
          </View>
        )}
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  empty: {
    gap: healthOSSpacing.sm,
  },
  stack: {
    gap: healthOSSpacing.sm,
  },
});
