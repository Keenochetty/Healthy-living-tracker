import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthOSReminderDisplayItem } from "@/features/reminders";
import type { HealthOSUpcomingReminderSection } from "./useHealthOSNotificationsData";
import { HealthOSReminderRow } from "./HealthOSReminderRow";

type Props = {
  onDone: (item: HealthOSReminderDisplayItem) => void;
  onOpen: (item: HealthOSReminderDisplayItem) => void;
  onSnooze: (item: HealthOSReminderDisplayItem) => void;
  sections: HealthOSUpcomingReminderSection[];
};

export function HealthOSUpcomingScheduleSection({ onDone, onOpen, onSnooze, sections }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard title="Upcoming schedule" subtitle="A grouped view of confirmed upcoming reminders.">
      <View style={styles.stack}>
        {sections.length ? (
          sections.map((section) => (
            <View key={section.dateLabel} style={styles.section}>
              <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
                {section.dateLabel}
              </Text>
              {section.items.slice(0, 4).map((item) => (
                <HealthOSReminderRow key={item.id} item={item} onDone={onDone} onOpen={onOpen} onSnooze={onSnooze} />
              ))}
            </View>
          ))
        ) : (
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            No upcoming reminders are scheduled.
          </Text>
        )}
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: healthOSSpacing.sm,
  },
  stack: {
    gap: healthOSSpacing.lg,
  },
});
