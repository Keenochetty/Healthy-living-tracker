import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSMacroLegendItem } from "./HealthOSNutritionTypes";

type HealthOSNutritionMacroLegendProps = {
  items: HealthOSMacroLegendItem[];
};

export function HealthOSNutritionMacroLegend({ items }: HealthOSNutritionMacroLegendProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item.key} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          <View style={styles.labelBlock}>
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
  container: {
    flex: 1,
    gap: healthOSSpacing.sm,
    minWidth: 170,
  },
  dot: {
    borderRadius: 999,
    height: 9,
    width: 9,
  },
  labelBlock: {
    flex: 1,
    gap: healthOSSpacing.xxs,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
});
