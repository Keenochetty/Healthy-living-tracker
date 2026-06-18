import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { BellRing } from "lucide-react-native";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthOSNotificationPermissionDisplay } from "@/features/reminders";

type Props = {
  permission: HealthOSNotificationPermissionDisplay;
  reminderCount: number;
};

export function HealthOSReminderCenterHeader({ permission, reminderCount }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <View style={styles.header}>
      <View style={styles.iconWrap}>
        <BellRing color={palette.inkText} size={22} />
      </View>
      <View style={styles.copy}>
        <Text style={[healthOSTypography.screenTitle, { color: palette.inkText }]}>
          Reminder Center
        </Text>
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          Manage today, upcoming alerts, review queues, quiet hours, and category preferences.
        </Text>
      </View>
      <View style={styles.pills}>
        <HealthOSPill label={`${reminderCount} items`} size="sm" variant="glass" />
        <HealthOSPill
          label={permission.label}
          size="sm"
          variant={permission.tone === "success" ? "success" : permission.tone === "danger" ? "danger" : "warning"}
        />
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
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: healthOSSpacing.md,
  },
  iconWrap: {
    paddingTop: healthOSSpacing.xs,
  },
  pills: {
    alignItems: "flex-end",
    gap: healthOSSpacing.xs,
  },
});
