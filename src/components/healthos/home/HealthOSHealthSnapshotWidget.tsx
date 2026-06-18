import { Href, router } from "expo-router";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSWidget } from "@/components/healthos/HealthOSWidget";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthOSHomeSummaries } from "./HealthOSHomeTypes";

type WidgetProps = {
  summaries?: HealthOSHomeSummaries;
  onLongPress?: () => void;
};

export function HealthOSHealthSnapshotWidget({
  onLongPress,
  summaries,
}: WidgetProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const metrics = [
    { label: "Weight", value: "Not logged" },
    { label: "Heart rate", value: "Not logged" },
    {
      label: "Water",
      value: summaries?.nutrition?.waterMl
        ? `${summaries.nutrition.waterMl} ml`
        : "Not logged",
    },
    {
      label: "Activity",
      value: summaries?.fitness?.activeMinutesToday
        ? `${summaries.fitness.activeMinutesToday} min`
        : "Not logged",
    },
  ];

  return (
    <HealthOSWidget
      onLongPress={onLongPress}
      onPress={() => router.push("/(tabs)/health" as Href)}
      removable
      subtitle="Latest logged metrics"
      title="Health Snapshot"
      variant="elevated"
      widgetKey="healthSnapshot"
    >
      <View style={styles.grid}>
        {metrics.map((metric) => (
          <View
            accessibilityLabel={`${metric.label}. ${metric.value}.`}
            key={metric.label}
            style={[styles.metric, { borderColor: palette.borderSubtle }]}
          >
            <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
              {metric.label}
            </Text>
            <Text style={[healthOSTypography.buttonLabel, { color: palette.inkText }]}>
              {metric.value}
            </Text>
          </View>
        ))}
      </View>
      <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
        {hasAnyMetric(summaries)
          ? "Showing available local summary data. Add more check-ins for richer trends."
          : "Add your first health check-in to start seeing trends."}
      </Text>
    </HealthOSWidget>
  );
}

function hasAnyMetric(summaries?: HealthOSHomeSummaries) {
  return Boolean(
    summaries?.nutrition?.waterMl || summaries?.fitness?.activeMinutesToday,
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  metric: {
    borderRadius: 16,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    gap: healthOSSpacing.xxs,
    padding: healthOSSpacing.sm,
  },
});
