import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSSectionHeader } from "@/components/healthos/HealthOSSectionHeader";
import {
  getHealthOSPalette,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type HealthOSFitnessProgressSectionProps = {
  onViewProgress: () => void;
};

export function HealthOSFitnessProgressSection({ onViewProgress }: HealthOSFitnessProgressSectionProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <View style={styles.container}>
      <HealthOSSectionHeader actionLabel="Open" onAction={onViewProgress} title="Progress" subtitle="Weekly consistency and personal best foundation." />
      <HealthOSCard variant="compact">
        <View style={styles.chartPlaceholder}>
          {[30, 58, 42, 70, 50, 64, 38].map((height, index) => (
            <View key={`${height}-${index}`} style={[styles.bar, { backgroundColor: palette.fitness, height }]} />
          ))}
        </View>
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          Strength, cardio, mobility, and personal best analytics will appear when real history is available.
        </Text>
      </HealthOSCard>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderRadius: healthOSRadius.pill,
    flex: 1,
    opacity: 0.75,
  },
  chartPlaceholder: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    height: 86,
  },
  container: {
    gap: healthOSSpacing.md,
  },
});

