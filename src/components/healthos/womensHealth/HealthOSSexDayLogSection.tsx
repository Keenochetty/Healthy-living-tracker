import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSSexLogSummary } from "./HealthOSWomenHealthTypes";

type Props = {
  onAddLog: () => void;
  summary: HealthOSSexLogSummary;
};

export function HealthOSSexDayLogSection({ onAddLog, summary }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard title="Sex-day log" subtitle="Private by default" variant="compact">
      <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
        {summary.status}
      </Text>
      <Text style={[healthOSTypography.caption, styles.count, { color: palette.softText }]}>
        Recent private log count: {summary.count}
      </Text>
      <View style={styles.actions}>
        <HealthOSPill label="Add private log" onPress={onAddLog} variant="glass" />
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.md,
  },
  count: {
    marginTop: healthOSSpacing.sm,
  },
});
