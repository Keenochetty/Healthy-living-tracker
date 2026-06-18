import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthOSCategoryPreference } from "@/features/reminders";
import type { ReminderCategory } from "@/types/healthTimeline";
import { HealthOSNotificationPreferenceRow } from "./HealthOSNotificationPreferenceRow";

type Props = {
  items: HealthOSCategoryPreference[];
  onQuickActionsChange: (category: ReminderCategory, value: boolean) => void;
  onToggleNotification: (category: ReminderCategory, value: boolean) => void;
};

export function HealthOSNotificationCategoryPreferences({
  items,
  onQuickActionsChange,
  onToggleNotification,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard title="Category preferences" subtitle="First switch controls device notifications. Second switch controls notification quick actions.">
      <View style={styles.stack}>
        {items.length ? (
          items.map((item) => (
            <HealthOSNotificationPreferenceRow
              key={item.settings.category}
              item={item}
              onQuickActionsChange={(value) => onQuickActionsChange(item.settings.category, value)}
              onToggleNotification={(value) => onToggleNotification(item.settings.category, value)}
            />
          ))
        ) : (
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            Category preferences are not available yet.
          </Text>
        )}
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: healthOSSpacing.md,
  },
});
