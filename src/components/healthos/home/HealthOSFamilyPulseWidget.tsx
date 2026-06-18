import { Href, router } from "expo-router";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { AppIcon } from "@/components/ui";
import { HealthOSWidget } from "@/components/healthos/HealthOSWidget";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type WidgetProps = {
  onLongPress?: () => void;
};

export function HealthOSFamilyPulseWidget({ onLongPress }: WidgetProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSWidget
      icon={<AppIcon color={palette.family} decorative name="caregiver" size={22} />}
      onLongPress={onLongPress}
      onPress={() => router.push("/(tabs)/circle" as Href)}
      removable
      subtitle="Shared updates stay opt-in"
      title="Family Pulse"
      variant="glass"
      widgetKey="familyPulse"
    >
      <View style={styles.content}>
        <View style={[styles.avatar, { borderColor: palette.borderSubtle }]}>
          <AppIcon color={palette.family} decorative name="caregiver" size={18} />
        </View>
        <View style={styles.copy}>
          <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
            Invite family when you're ready.
          </Text>
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            Family updates only appear here when sharing is explicitly enabled.
          </Text>
        </View>
      </View>
    </HealthOSWidget>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.md,
  },
  copy: {
    flex: 1,
    gap: healthOSSpacing.xxs,
  },
});
