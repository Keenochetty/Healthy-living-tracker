import { StyleSheet, Switch, Text, useColorScheme, View } from "react-native";

import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthOSCategoryPreference } from "@/features/reminders";

type Props = {
  item: HealthOSCategoryPreference;
  onQuickActionsChange: (value: boolean) => void;
  onToggleNotification: (value: boolean) => void;
};

export function HealthOSNotificationPreferenceRow({
  item,
  onQuickActionsChange,
  onToggleNotification,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: item.config.accentColor }]} />
      <View style={styles.copy}>
        <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
          {item.config.label}
        </Text>
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          {item.config.description}
        </Text>
      </View>
      <View style={styles.toggles}>
        <Switch onValueChange={onToggleNotification} value={item.settings.notificationEnabled} />
        <Switch onValueChange={onQuickActionsChange} value={item.settings.quickActionsEnabled} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: healthOSSpacing.xs,
    minWidth: 0,
  },
  dot: {
    borderRadius: 999,
    height: 10,
    marginTop: healthOSSpacing.sm,
    width: 10,
  },
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
  toggles: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.xs,
  },
});
