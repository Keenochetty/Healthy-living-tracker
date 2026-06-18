import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSPregnancyData } from "./HealthOSPregnancyTypes";

type Props = {
  overview: HealthOSPregnancyData["weekOverview"];
};

export function HealthOSPregnancyWeekOverview({ overview }: Props) {
  return (
    <HealthOSCard title="Week and trimester" variant="elevated">
      <View style={styles.grid}>
        <Tile label="Week" value={overview.week} />
        <Tile label="Trimester" value={overview.trimester} />
        <Tile label="Next appointment" value={overview.nextAppointment} />
        <Tile label="Next step" value={overview.nextChecklistItem} />
      </View>
    </HealthOSCard>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <View style={[styles.tile, { borderColor: palette.borderSubtle }]}>
      <Text style={[healthOSTypography.caption, { color: palette.softText }]}>{label}</Text>
      <Text numberOfLines={2} style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  tile: {
    borderRadius: 18,
    borderWidth: 1,
    flexGrow: 1,
    gap: healthOSSpacing.xs,
    minWidth: "46%",
    padding: healthOSSpacing.md,
  },
});
