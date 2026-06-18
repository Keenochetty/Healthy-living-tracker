import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Bell, Settings } from "lucide-react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthOSNotificationPermissionDisplay } from "@/features/reminders";

type Props = {
  onOpenSettings: () => void;
  onRequestPermission: () => void;
  permission: HealthOSNotificationPermissionDisplay;
};

export function HealthOSNotificationPermissionCard({
  onOpenSettings,
  onRequestPermission,
  permission,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard
      icon={<Bell color={palette.ai} size={20} />}
      rightAccessory={
        <View style={styles.actions}>
          <ActionButton label="Enable" onPress={onRequestPermission} />
          <ActionButton icon={<Settings color={palette.inkText} size={14} />} label="Device" onPress={onOpenSettings} />
        </View>
      }
      subtitle={permission.description}
      title="Notification permission"
      variant="elevated"
    />
  );
}

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon?: ReactNode;
  label: string;
  onPress: () => void;
}) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <Pressable onPress={onPress} style={styles.button}>
      {icon}
      <Text style={[healthOSTypography.caption, { color: palette.inkText }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.xs,
  },
  button: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.xs,
    minHeight: 32,
    paddingHorizontal: healthOSSpacing.sm,
  },
});
