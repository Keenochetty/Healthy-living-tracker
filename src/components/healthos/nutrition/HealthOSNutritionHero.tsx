import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSSegmentedRingChart, type HealthOSSegmentedRingSegment } from "@/components/healthos/charts/HealthOSSegmentedRingChart";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import { HealthOSNutritionMacroLegend } from "./HealthOSNutritionMacroLegend";
import type { HealthOSMacroLegendItem } from "./HealthOSNutritionTypes";

type HealthOSNutritionHeroProps = {
  hasLoggedFood: boolean;
  legendItems: HealthOSMacroLegendItem[];
  note: string;
  percent: number;
  segments: HealthOSSegmentedRingSegment[];
};

export function HealthOSNutritionHero({
  hasLoggedFood,
  legendItems,
  note,
  percent,
  segments,
}: HealthOSNutritionHeroProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard variant="elevated">
      <View style={styles.heroRow}>
        <HealthOSSegmentedRingChart
          centerLabel={`${percent}%`}
          centerSublabel={hasLoggedFood ? "Today" : "No meals yet"}
          segments={segments}
          size={132}
          testID="healthos-nutrition-macro-ring"
        />
        <HealthOSNutritionMacroLegend items={legendItems} />
      </View>
      <Text style={[healthOSTypography.bodySmall, styles.note, { color: palette.softText }]}>
        {note}
      </Text>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.lg,
    justifyContent: "center",
  },
  note: {
    marginTop: healthOSSpacing.md,
  },
});
