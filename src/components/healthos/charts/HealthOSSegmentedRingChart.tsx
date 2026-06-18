import { StyleSheet, Text, useColorScheme, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import {
  getHealthOSChartTheme,
  getHealthOSPalette,
  healthOSChartSizes,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

export type HealthOSSegmentedRingSegment = {
  color?: string;
  key: string;
  label: string;
  max?: number;
  muted?: boolean;
  value: number;
};

type HealthOSSegmentedRingChartProps = {
  animated?: boolean;
  centerLabel?: string;
  centerSublabel?: string;
  segments: HealthOSSegmentedRingSegment[];
  showTrack?: boolean;
  size?: number;
  strokeWidth?: number;
  testID?: string;
};

export function HealthOSSegmentedRingChart({
  centerLabel,
  centerSublabel,
  segments,
  showTrack = true,
  size = healthOSChartSizes.progressRingLarge,
  strokeWidth = Math.max(7, Math.round(size * 0.08)),
  testID,
}: HealthOSSegmentedRingChartProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const chartTheme = getHealthOSChartTheme(mode);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce(
    (sum, segment) => sum + Math.max(0, Math.min(1, segment.max ? segment.value / segment.max : segment.value)) ,
    0,
  );
  let offset = 0;

  return (
    <View
      accessibilityLabel={`${centerLabel ?? "Fitness progress"} ${centerSublabel ?? ""}`}
      accessibilityRole="image"
      style={[styles.container, { height: size, width: size }]}
      testID={testID}
    >
      <Svg height={size} width={size}>
        {showTrack ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            fill="transparent"
            r={radius}
            stroke={chartTheme.ringTrack}
            strokeWidth={strokeWidth}
          />
        ) : null}
        {segments.map((segment, index) => {
          const normalized = Math.max(
            0,
            Math.min(1, segment.max ? segment.value / segment.max : segment.value),
          );
          const fraction = total > 1 ? normalized / total : normalized;
          const length = circumference * fraction;
          const dashOffset = circumference * 0.25 - offset;
          offset += length;

          return (
            <Circle
              cx={size / 2}
              cy={size / 2}
              fill="transparent"
              key={segment.key}
              r={radius}
              stroke={
                segment.muted
                  ? chartTheme.ringTrack
                  : segment.color ?? chartTheme.ringSegments[index % chartTheme.ringSegments.length]
              }
              strokeDasharray={`${Math.max(0, length - 5)} ${circumference}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              strokeWidth={strokeWidth}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
        })}
      </Svg>
      <View style={styles.center}>
        {centerLabel ? (
          <Text style={[healthOSTypography.sectionTitle, { color: palette.inkText }]}>
            {centerLabel}
          </Text>
        ) : null}
        {centerSublabel ? (
          <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
            {centerSublabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
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
    justifyContent: "center",
  },
});

