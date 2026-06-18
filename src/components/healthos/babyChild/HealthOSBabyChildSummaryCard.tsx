import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

export type HealthOSBabyChildMetric = {
  label: string;
  value: string;
};

type Props = {
  actionLabel?: string;
  metrics?: HealthOSBabyChildMetric[];
  onAction?: () => void;
  safetyNote?: string;
  subtitle?: string;
  title: string;
};

export function HealthOSBabyChildSummaryCard({
  actionLabel,
  metrics = [],
  onAction,
  safetyNote,
  subtitle,
  title,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard subtitle={subtitle} title={title} variant="elevated">
      <View style={styles.stack}>
        {metrics.length ? (
          <View style={styles.grid}>
            {metrics.map((metric) => (
              <View key={metric.label} style={[styles.tile, { borderColor: palette.borderSubtle }]}>
                <Text style={[healthOSTypography.caption, { color: palette.softText }]}>{metric.label}</Text>
                <Text numberOfLines={2} style={[healthOSTypography.bodySmall, { color: palette.inkText }]}>
                  {metric.value}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        {safetyNote ? (
          <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
            {safetyNote}
          </Text>
        ) : null}
        {actionLabel && onAction ? <HealthOSPill label={actionLabel} onPress={onAction} variant="ai" /> : null}
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  stack: {
    gap: healthOSSpacing.md,
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
