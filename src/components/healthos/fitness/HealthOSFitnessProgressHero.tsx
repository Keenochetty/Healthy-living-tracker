import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSSegmentedRingChart, type HealthOSSegmentedRingSegment } from "@/components/healthos/charts";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSFitnessLegendItem } from "./HealthOSFitnessTypes";
import { HealthOSFitnessProgressLegend } from "./HealthOSFitnessProgressLegend";

type HealthOSFitnessProgressHeroProps = {
  legendItems: HealthOSFitnessLegendItem[];
  note: string;
  percent: number;
  segments: HealthOSSegmentedRingSegment[];
};

export function HealthOSFitnessProgressHero({
  legendItems,
  note,
  percent,
  segments,
}: HealthOSFitnessProgressHeroProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard variant="darkHero">
      <View style={styles.row}>
        <HealthOSSegmentedRingChart
          centerLabel={`${percent}%`}
          centerSublabel={percent ? "Today" : "No plan"}
          segments={segments}
          size={128}
        />
        <HealthOSFitnessProgressLegend items={legendItems} />
      </View>
      <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
        {note}
      </Text>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.lg,
    marginBottom: healthOSSpacing.md,
  },
});

