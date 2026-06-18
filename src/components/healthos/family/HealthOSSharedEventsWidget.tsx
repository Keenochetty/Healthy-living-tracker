import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { AppIcon } from "@/components/ui/AppIcon";
import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { HealthOSWidget } from "@/components/healthos/HealthOSWidget";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSSharedEventDisplay } from "./HealthOSFamilyTypes";

type HealthOSSharedEventsWidgetProps = {
  events: HealthOSSharedEventDisplay[];
  onOpenCalendar: () => void;
  onOpenEvent: (event: HealthOSSharedEventDisplay) => void;
};

export function HealthOSSharedEventsWidget({
  events,
  onOpenCalendar,
  onOpenEvent,
}: HealthOSSharedEventsWidgetProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSWidget
      footer={<HealthOSPill label="View calendar" onPress={onOpenCalendar} size="sm" variant="realm" />}
      icon={<AppIcon decorative name="calendar" size={20} variant="primary" />}
      subtitle="Shared family reminders and events"
      title="Shared events"
      widgetKey="family-shared-events"
    >
      {events.length ? (
        <View style={styles.list}>
          {events.slice(0, 4).map((event) => (
            <HealthOSCard key={event.id} onPress={() => onOpenEvent(event)} variant="compact">
              <View style={styles.eventRow}>
                <View style={[styles.dot, { backgroundColor: palette.family }]} />
                <View style={styles.copy}>
                  <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
                    {event.title}
                  </Text>
                  <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
                    {[event.dateLabel, event.timeLabel, event.memberInitials].filter(Boolean).join(" | ")}
                  </Text>
                </View>
              </View>
            </HealthOSCard>
          ))}
        </View>
      ) : (
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          No shared family events yet.
        </Text>
      )}
    </HealthOSWidget>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
  },
  dot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  eventRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
  list: {
    gap: healthOSSpacing.sm,
  },
});

