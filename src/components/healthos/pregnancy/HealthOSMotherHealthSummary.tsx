import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSPregnancyData } from "./HealthOSPregnancyTypes";

type Props = {
  summary: HealthOSPregnancyData["motherHealthSummary"];
};

export function HealthOSMotherHealthSummary({ summary }: Props) {
  return (
    <HealthOSCard subtitle={summary.status} title="Mother health summary" variant="elevated">
      <View style={styles.grid}>
        <Tile label="Symptoms" value={`${summary.symptomCount}`} />
        <Tile label="Mood check-ins" value={`${summary.moodCheckIns}`} />
        <Tile label="Pain notes" value={`${summary.painCount}`} />
        <Tile label="Next appointment" value={summary.appointmentStatus} />
        <Tile label="Supplements" value={summary.supplementStatus} />
        <Tile label="Weight" value={summary.weightTrendStatus} />
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
      <Text numberOfLines={2} style={[healthOSTypography.bodySmall, { color: palette.inkText }]}>
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
