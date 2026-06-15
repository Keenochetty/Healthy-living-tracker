import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { typography, useHealthTheme } from "@/constants/theme";

export type DonutSegment = {
  color: string;
  value: number;
};

type DonutChartProps = {
  label?: string;
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
};

export function DonutChart({
  label,
  segments,
  size = 84,
  strokeWidth = 12,
}: DonutChartProps) {
  const { colors } = useHealthTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = Math.max(
    1,
    segments.reduce((sum, segment) => sum + segment.value, 0),
  );
  let offset = 0;

  return (
    <View
      style={{
        alignItems: "center",
        height: size,
        justifyContent: "center",
        width: size,
      }}
    >
      <Svg
        height={size}
        style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
        width={size}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke={colors.border.strong}
          strokeWidth={strokeWidth}
        />
        {segments.map((segment, index) => {
          const length = (segment.value / total) * circumference;
          const dashOffset = -offset;
          offset += length;
          return (
            <Circle
              cx={size / 2}
              cy={size / 2}
              fill="none"
              key={`${segment.color}-${index}`}
              r={radius}
              stroke={segment.color}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={dashOffset}
              strokeWidth={strokeWidth}
            />
          );
        })}
      </Svg>
      {label ? (
        <Text style={{ color: colors.text.primary, ...typography.label }}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}
