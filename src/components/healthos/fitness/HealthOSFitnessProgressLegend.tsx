import { StyleSheet, Text, useColorScheme, View } from "react-native";

import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSFitnessLegendItem } from "./HealthOSFitnessTypes";

type HealthOSFitnessProgressLegendProps = {
  items: HealthOSFitnessLegendItem[];
};

export function HealthOSFitnessProgressLegend({ items }: HealthOSFitnessProgressLegendProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item.key} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          <View style={styles.copy}>
            <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
              {item.label}
            </Text>
            <Text style={[healthOSTypography.buttonLabel, { color: palette.inkText }]}>
              {item.value}
            </Text>
          </View>
          {item.target ? (
            <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
              {item.target}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
  },
  dot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  list: {
    flex: 1,
    gap: healthOSSpacing.sm,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
});

