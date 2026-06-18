import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { AppIcon } from "@/components/ui/AppIcon";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  healthOSSpacing,
  healthOSTypography,
} from "@/theme/healthos";

import { HealthOSHealthMetricTile } from "./HealthOSHealthMetricTile";
import { HealthOSHealthSectionCard } from "./HealthOSHealthSectionCard";
import type { HealthOSHealthSectionMeta, HealthOSMetric } from "./HealthOSHealthTypes";

type HealthOSVitalsOverviewSectionProps = {
  metrics: HealthOSMetric[];
  onLongPress: () => void;
  section: HealthOSHealthSectionMeta;
};

export function HealthOSVitalsOverviewSection({
  metrics,
  onLongPress,
  section,
}: HealthOSVitalsOverviewSectionProps) {
  const hasLogs = metrics.some((metric) => metric.value !== "No log");
  const sectionRoute = section.routeTarget ? String(section.routeTarget) : null;
  const targetRoute = sectionRoute ?? "/biometrics";

  function openTargetRoute() {
    router.push(targetRoute as never);
  }

  return (
    <HealthOSHealthSectionCard
      icon={<AppIcon decorative name="vitals" size={20} variant="primary" />}
      onLongPress={onLongPress}
      onPress={openTargetRoute}
      section={section}
    >
      <View style={styles.grid}>
        {metrics.map((metric) => (
          <HealthOSHealthMetricTile key={metric.label} metric={metric} />
        ))}
      </View>
      {!hasLogs ? (
        <Text style={healthOSTypography.bodySmall}>Add your first health check-in.</Text>
      ) : null}
      <HealthOSPill
        label="Open biometrics"
        onPress={() => router.push("/biometrics" as never)}
        size="sm"
        variant="realm"
      />
    </HealthOSHealthSectionCard>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
});
