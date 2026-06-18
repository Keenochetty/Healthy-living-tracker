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

import { HealthOSHealthMetricTile } from "./HealthOSHealthMetricTile";
import { HealthOSHealthSectionCard } from "./HealthOSHealthSectionCard";
import type { HealthOSHealthSectionMeta } from "./HealthOSHealthTypes";

type HealthOSBabyChildSectionProps = {
  childProfileCount: number;
  onLongPress: () => void;
  section: HealthOSHealthSectionMeta;
};

export function HealthOSBabyChildSection({
  childProfileCount,
  onLongPress,
  section,
}: HealthOSBabyChildSectionProps) {
  const palette = getHealthOSPalette(useColorScheme() === "dark" ? "dark" : "light");

  return (
    <HealthOSHealthSectionCard
      icon={<AppIcon decorative name="baby_child" size={20} variant="private" />}
      onLongPress={onLongPress}
      onPress={() => router.push("/baby-child")}
      privacyLabel="Family"
      section={section}
    >
      <View style={styles.grid}>
        <HealthOSHealthMetricTile
          metric={{
            label: "Profiles",
            status: childProfileCount > 0 ? "good" : "default",
            value: `${childProfileCount}`,
          }}
        />
        <HealthOSHealthMetricTile metric={{ label: "Milestones", value: "Open realm" }} />
      </View>
      <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
        {childProfileCount > 0
          ? "Baby and child profile access is ready."
          : "Baby and child tools stay hidden until relevant or added."}
      </Text>
      <View style={styles.actions}>
        <HealthOSPill label="Baby / Child" onPress={() => router.push("/baby-child")} size="sm" variant="realm" />
        <HealthOSPill label="Vaccine cards" onPress={() => router.push("/records")} size="sm" variant="glass" />
      </View>
    </HealthOSHealthSectionCard>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
});

