import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSProgressRingPlaceholder } from "@/components/healthos/HealthOSProgressRingPlaceholder";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSCycleSummary } from "./HealthOSWomenHealthTypes";

type Props = {
  cycleLengthDays?: number;
  summary: HealthOSCycleSummary;
};

export function HealthOSCycleOverviewHero({ cycleLengthDays = 28, summary }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const cycleValue = summary.cycleDay ?? 0;

  return (
    <HealthOSCard variant="elevated">
      <View style={styles.row}>
        <HealthOSProgressRingPlaceholder
          label={summary.hasCycleData ? `Day ${summary.cycleDay ?? "-"}` : "No cycle yet"}
          max={cycleLengthDays}
          size={124}
          sublabel={summary.hasCycleData ? summary.currentPhase : "Add last period"}
          value={cycleValue}
          variant="default"
        />
        <View style={styles.info}>
          <Metric label="Cycle day" value={summary.cycleDay ? `Day ${summary.cycleDay}` : "Not set"} />
          <Metric label="Predicted period" value={summary.nextPeriodText} />
          <Metric label="Fertile window" value={summary.fertileWindowText} />
          <Metric label="Logged symptoms" value={`${summary.symptomCountToday} today`} />
        </View>
      </View>
      <Text style={[healthOSTypography.caption, styles.note, { color: palette.softText }]}>
        {summary.hasCycleData
          ? "Predictions are estimates based on your logs and may be inaccurate."
          : "Add your last period to start predictions."}
      </Text>
    </HealthOSCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <View style={styles.metric}>
      <Text style={[healthOSTypography.caption, { color: palette.softText }]}>{label}</Text>
      <Text style={[healthOSTypography.buttonLabel, { color: palette.inkText }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  info: {
    flex: 1,
    gap: healthOSSpacing.sm,
    minWidth: 170,
  },
  metric: {
    gap: healthOSSpacing.xxs,
  },
  note: {
    marginTop: healthOSSpacing.md,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.lg,
    justifyContent: "center",
  },
});
