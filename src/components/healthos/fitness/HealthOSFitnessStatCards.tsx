import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSFitnessStatCard } from "./HealthOSFitnessTypes";

type HealthOSFitnessStatCardsProps = {
  stats: HealthOSFitnessStatCard[];
};

export function HealthOSFitnessStatCards({ stats }: HealthOSFitnessStatCardsProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <View style={styles.grid}>
      {stats.map((stat) => (
        <View key={stat.key} style={styles.item}>
          <HealthOSCard variant="compact">
            <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
              {stat.label}
            </Text>
            <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
              {stat.value}
            </Text>
          </HealthOSCard>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  item: {
    flexBasis: "47%",
    flexGrow: 1,
  },
});

