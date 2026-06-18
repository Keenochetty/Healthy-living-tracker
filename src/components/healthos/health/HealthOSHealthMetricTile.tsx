import { StyleSheet, Text, useColorScheme, View } from "react-native";

import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSBorderWidth,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSMetric } from "./HealthOSHealthTypes";

type HealthOSHealthMetricTileProps = {
  metric: HealthOSMetric;
};

export function HealthOSHealthMetricTile({ metric }: HealthOSHealthMetricTileProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);
  const statusColor =
    metric.status === "warning"
      ? palette.warning
      : metric.status === "good"
        ? palette.success
        : palette.softText;

  return (
    <View
      style={[
        styles.tile,
        surfaces.compactCard,
        { borderColor: palette.borderSubtle },
      ]}
    >
      <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
        {metric.label}
      </Text>
      <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
        {metric.value}
      </Text>
      <View style={[styles.trendLine, { backgroundColor: statusColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: healthOSRadius.lg,
    borderWidth: healthOSBorderWidth.thin,
    flexBasis: "47%",
    flexGrow: 1,
    gap: healthOSSpacing.xs,
    minHeight: 92,
    padding: healthOSSpacing.md,
  },
  trendLine: {
    borderRadius: healthOSRadius.pill,
    height: 3,
    marginTop: "auto",
    opacity: 0.7,
    width: 40,
  },
});

