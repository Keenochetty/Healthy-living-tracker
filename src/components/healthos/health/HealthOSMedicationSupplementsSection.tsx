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
import type { HealthOSHealthSectionMeta, HealthOSMetric } from "./HealthOSHealthTypes";

type MedicationSummary = {
  dueCount?: number;
  missedCount?: number;
  takenCount?: number;
  totalCount?: number;
};

type HealthOSMedicationSupplementsSectionProps = {
  medicationSummary: MedicationSummary | null;
  onLongPress: () => void;
  section: HealthOSHealthSectionMeta;
};

export function HealthOSMedicationSupplementsSection({
  medicationSummary,
  onLongPress,
  section,
}: HealthOSMedicationSupplementsSectionProps) {
  const palette = getHealthOSPalette(useColorScheme() === "dark" ? "dark" : "light");
  const metrics: HealthOSMetric[] = [
    {
      label: "Due",
      status: (medicationSummary?.dueCount ?? 0) > 0 ? "warning" : "default",
      value: `${medicationSummary?.dueCount ?? 0}`,
    },
    {
      label: "Missed",
      status: (medicationSummary?.missedCount ?? 0) > 0 ? "warning" : "default",
      value: `${medicationSummary?.missedCount ?? 0}`,
    },
    {
      label: "Taken",
      status: (medicationSummary?.takenCount ?? 0) > 0 ? "good" : "default",
      value: `${medicationSummary?.takenCount ?? 0}`,
    },
    {
      label: "Scheduled",
      value: `${medicationSummary?.totalCount ?? 0}`,
    },
  ];
  const hasSchedule = Boolean(medicationSummary?.totalCount);

  return (
    <HealthOSHealthSectionCard
      icon={<AppIcon decorative name="medication" size={20} variant="private" />}
      onLongPress={onLongPress}
      onPress={() => router.push("/medication")}
      privacyLabel="Sensitive"
      section={section}
      variant={(medicationSummary?.missedCount ?? 0) > 0 ? "danger" : "elevated"}
    >
      <View style={styles.grid}>
        {metrics.map((metric) => (
          <HealthOSHealthMetricTile key={metric.label} metric={metric} />
        ))}
      </View>
      {!hasSchedule ? (
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          Add your first medication or supplement reminder.
        </Text>
      ) : null}
      <View style={styles.actions}>
        <HealthOSPill label="View schedule" onPress={() => router.push("/medication")} size="sm" variant="realm" />
        <HealthOSPill label="Scan script" onPress={() => router.push("/(tabs)/scan")} size="sm" variant="glass" />
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
