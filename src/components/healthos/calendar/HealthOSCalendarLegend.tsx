import { StyleSheet, Text, useColorScheme, View } from "react-native";

import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import { getCalendarCategoryColor } from "./calendarVisuals";
import type { HealthOSCalendarEventCategory } from "./HealthOSCalendarTypes";

const legend: Array<{ category: HealthOSCalendarEventCategory; label: string }> = [
  { category: "health", label: "Health" },
  { category: "medication", label: "Medication" },
  { category: "family", label: "Family" },
  { category: "fitness", label: "Fitness" },
  { category: "cycle", label: "Private" },
  { category: "ai", label: "AI" },
];

export function HealthOSCalendarLegend() {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <View accessibilityLabel="Calendar legend" style={styles.container}>
      {legend.map((item) => (
        <View key={item.label} style={styles.item}>
          <View
            style={[
              styles.dot,
              { backgroundColor: getCalendarCategoryColor(item.category, mode) },
            ]}
          />
          <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
            {item.label}
          </Text>
        </View>
      ))}
      <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
        Shared items may show initials.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  dot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  item: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.xs,
  },
});
