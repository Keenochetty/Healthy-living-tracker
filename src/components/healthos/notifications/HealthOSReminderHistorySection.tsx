import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthOSReminderHistoryItem } from "@/features/reminders";

type Props = {
  items: HealthOSReminderHistoryItem[];
};

export function HealthOSReminderHistorySection({ items }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard title="Reminder history" subtitle="Recent in-app actions and local notification scheduling records.">
      <View style={styles.stack}>
        {items.length ? (
          items.map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={styles.copy}>
                <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
                  {item.title}
                </Text>
                <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
              <HealthOSPill label={item.source} size="sm" variant="glass" />
            </View>
          ))
        ) : (
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            No reminder actions have been logged yet.
          </Text>
        )}
      </View>
    </HealthOSCard>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  });
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: healthOSSpacing.xs,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
  stack: {
    gap: healthOSSpacing.md,
  },
});
