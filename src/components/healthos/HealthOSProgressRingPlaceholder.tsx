import { StyleSheet, Text, useColorScheme, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import {
  getHealthOSChartTheme,
  getHealthOSPalette,
  healthOSChartSizes,
  healthOSTypography,
  type HealthOSColorMode,
  type SegmentedRingChartSegment,
} from "@/theme/healthos";

type HealthOSProgressRingPlaceholderProps = {
  label?: string;
  max: number;
  segments?: SegmentedRingChartSegment[];
  size?: number;
  sublabel?: string;
  value: number;
  variant?: "default" | "fitness" | "nutrition" | "wellness";
};

export function HealthOSProgressRingPlaceholder({
  label,
  max,
  segments,
  size = healthOSChartSizes.progressRingMedium,
  sublabel,
  value,
  variant = "default",
}: HealthOSProgressRingPlaceholderProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const chartTheme = getHealthOSChartTheme(mode);
  const strokeWidth = Math.max(6, Math.round(size * 0.09));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, max ? value / max : 0));
  const strokeDashoffset = circumference * (1 - progress);
  const color = getVariantColor(variant, palette);

  return (
    <View style={styles.container}>
      <View style={[styles.ring, { height: size, width: size }]}>
        <Svg height={size} width={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            fill="transparent"
            r={radius}
            stroke={chartTheme.ringTrack}
            strokeWidth={strokeWidth}
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            fill="transparent"
            r={radius}
            stroke={segments?.[0]?.color ?? color}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.center}>
          <Text style={[healthOSTypography.statLabel, { color: palette.softText }]}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      </View>
      {label || sublabel ? (
        <View style={styles.labelBlock}>
          {label ? (
            <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
              {label}
            </Text>
          ) : null}
          {sublabel ? (
            <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
              {sublabel}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function getVariantColor(
  variant: NonNullable<HealthOSProgressRingPlaceholderProps["variant"]>,
  palette: ReturnType<typeof getHealthOSPalette>,
) {
  if (variant === "fitness") return palette.fitness;
  if (variant === "nutrition") return palette.nutrition;
  if (variant === "wellness") return palette.family;
  return palette.skyBlue;
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  container: {
    alignItems: "center",
    gap: 8,
  },
  labelBlock: {
    alignItems: "center",
    gap: 2,
  },
  ring: {
    alignItems: "center",
    justifyContent: "center",
  },
});
