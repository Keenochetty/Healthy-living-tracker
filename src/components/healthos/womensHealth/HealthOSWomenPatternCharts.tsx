import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSSectionHeader } from "@/components/healthos/HealthOSSectionHeader";
import { getHealthOSPalette, healthOSRadius, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSPatternChart } from "./HealthOSWomenHealthTypes";

type Props = {
  charts: HealthOSPatternChart[];
  onOpenDetails: () => void;
};

export function HealthOSWomenPatternCharts({ charts, onOpenDetails }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <>
      <HealthOSSectionHeader actionLabel="Details" onAction={onOpenDetails} subtitle="Compact private pattern cards." title="Patterns" />
      <View style={styles.grid}>
        {charts.map((chart) => (
          <HealthOSCard key={chart.id} variant="compact" style={styles.card}>
            <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
              {chart.label}
            </Text>
            <Text style={[healthOSTypography.caption, styles.status, { color: palette.softText }]}>
              {chart.status}
            </Text>
            <View style={styles.bars}>
              {(chart.values.length ? chart.values : [0, 0, 0]).slice(0, 6).map((value, index) => (
                <View key={`${chart.id}-${index}`} style={[styles.barTrack, { backgroundColor: palette.borderSubtle }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        backgroundColor: chart.values.length ? palette.women : palette.borderSubtle,
                        height: `${Math.max(12, Math.min(100, value * 18))}%`,
                      },
                    ]}
                  />
                </View>
              ))}
            </View>
          </HealthOSCard>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  barFill: {
    borderRadius: healthOSRadius.pill,
    bottom: 0,
    position: "absolute",
    width: "100%",
  },
  barTrack: {
    borderRadius: healthOSRadius.pill,
    flex: 1,
    height: 46,
    overflow: "hidden",
  },
  bars: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: healthOSSpacing.xs,
    marginTop: healthOSSpacing.md,
  },
  card: {
    flexBasis: "47%",
    flexGrow: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  status: {
    marginTop: healthOSSpacing.xs,
  },
});
