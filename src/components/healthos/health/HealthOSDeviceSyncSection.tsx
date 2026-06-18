import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { AppIcon } from "@/components/ui/AppIcon";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
} from "@/theme/healthos";
import { useColorScheme } from "react-native";

import { HealthOSHealthSectionCard } from "./HealthOSHealthSectionCard";
import type { HealthOSHealthSectionMeta } from "./HealthOSHealthTypes";

type HealthOSDeviceSyncSectionProps = {
  onLongPress: () => void;
  section: HealthOSHealthSectionMeta;
};

export function HealthOSDeviceSyncSection({
  onLongPress,
  section,
}: HealthOSDeviceSyncSectionProps) {
  const palette = getHealthOSPalette(useColorScheme() === "dark" ? "dark" : "light");

  return (
    <HealthOSHealthSectionCard
      icon={<AppIcon decorative name="device_sync" size={20} variant="primary" />}
      onLongPress={onLongPress}
      onPress={() => router.push("/device-sync")}
      section={section}
    >
      <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
        Device sync is ready as a gateway. New native wearable integrations are not added in this phase.
      </Text>
      <View style={styles.pills}>
        {["Steps", "Heart rate", "Sleep", "Workouts"].map((label) => (
          <HealthOSPill key={label} label={label} size="sm" variant="glass" />
        ))}
      </View>
      <HealthOSPill
        label="Connect device"
        onPress={() => router.push("/device-sync")}
        size="sm"
        variant="realm"
      />
    </HealthOSHealthSectionCard>
  );
}

const styles = StyleSheet.create({
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
});

