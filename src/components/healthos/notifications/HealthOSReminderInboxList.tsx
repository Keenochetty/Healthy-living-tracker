import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthOSReminderDisplayItem } from "@/features/reminders";
import { HealthOSReminderRow } from "./HealthOSReminderRow";

type Props = {
  items: HealthOSReminderDisplayItem[];
  onDone: (item: HealthOSReminderDisplayItem) => void;
  onOpen: (item: HealthOSReminderDisplayItem) => void;
  onSnooze: (item: HealthOSReminderDisplayItem) => void;
};

export function HealthOSReminderInboxList({ items, onDone, onOpen, onSnooze }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard title="Reminder inbox" subtitle="Current reminder items from the existing HealthSync reminder engine.">
      <View style={styles.stack}>
        {items.length ? (
          items.map((item) => (
            <HealthOSReminderRow key={item.id} item={item} onDone={onDone} onOpen={onOpen} onSnooze={onSnooze} />
          ))
        ) : (
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            No reminders match this filter.
          </Text>
        )}
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: healthOSSpacing.sm,
  },
});
