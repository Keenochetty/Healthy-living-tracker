import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSMemberNotificationDisplay } from "./HealthOSFamilyTypes";

type HealthOSMemberNotificationPreviewProps = {
  notifications?: HealthOSMemberNotificationDisplay;
  onManage?: () => void;
};

export function HealthOSMemberNotificationPreview({
  notifications,
  onManage,
}: HealthOSMemberNotificationPreviewProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const rows = notifications
    ? [
        ["Shared events", notifications.sharedEvents],
        ["Mood updates", notifications.moodUpdates],
        ["Caregiver notes", notifications.caregiverNotes],
        ["Record shares", notifications.recordShares],
      ]
    : [];

  return (
    <View style={styles.container}>
      <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
        Notifications
      </Text>
      {rows.length ? (
        rows.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
              {label}
            </Text>
            <HealthOSPill label={value ?? "Not configured"} size="sm" variant="glass" />
          </View>
        ))
      ) : (
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          Notification controls will appear here after member preferences are connected.
        </Text>
      )}
      {onManage ? (
        <HealthOSPill label="Manage notifications" onPress={onManage} size="sm" variant="realm" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: healthOSSpacing.sm,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    justifyContent: "space-between",
  },
});

