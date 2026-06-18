import { Text, View, StyleSheet } from "react-native";
import { router } from "expo-router";

import { AppIcon } from "@/components/ui/AppIcon";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { HealthOSProgressRingPlaceholder } from "@/components/healthos/HealthOSProgressRingPlaceholder";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
} from "@/theme/healthos";
import { useColorScheme } from "react-native";

import { HealthOSHealthSectionCard } from "./HealthOSHealthSectionCard";
import type { HealthOSHealthSectionMeta } from "./HealthOSHealthTypes";

type PregnancySummary = {
  daysUntilDueDate?: number;
  estimatedDueDate?: string;
  weekNumber?: number;
};

type HealthOSPregnancySectionProps = {
  onLongPress: () => void;
  section: HealthOSHealthSectionMeta;
  summary: PregnancySummary | null;
};

export function HealthOSPregnancySection({
  onLongPress,
  section,
  summary,
}: HealthOSPregnancySectionProps) {
  const palette = getHealthOSPalette(useColorScheme() === "dark" ? "dark" : "light");
  const weekNumber = summary?.weekNumber ?? 0;
  const hasPregnancyProfile = weekNumber > 0 || Boolean(summary?.estimatedDueDate);

  return (
    <HealthOSHealthSectionCard
      icon={<AppIcon decorative name="pregnancy" size={20} variant="private" />}
      onLongPress={onLongPress}
      onPress={() => router.push("/pregnancy")}
      privacyLabel="Private"
      section={section}
      variant="glass"
    >
      <View style={styles.row}>
        <HealthOSProgressRingPlaceholder
          max={40}
          size={72}
          sublabel={hasPregnancyProfile ? `Week ${weekNumber}` : "Not enabled"}
          value={weekNumber}
          variant="wellness"
        />
        <View style={styles.copy}>
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            {hasPregnancyProfile
              ? "Pregnancy profile is connected to this hub."
              : "Pregnancy tools stay hidden until you enable them or add a profile."}
          </Text>
          {summary?.daysUntilDueDate ? (
            <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
              {summary.daysUntilDueDate} days until estimated due date.
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.actions}>
        <HealthOSPill label="Pregnancy" onPress={() => router.push("/pregnancy")} size="sm" variant="realm" />
        <HealthOSPill label="Records" onPress={() => router.push("/records")} size="sm" variant="glass" />
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
  copy: {
    flex: 1,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.md,
  },
});

