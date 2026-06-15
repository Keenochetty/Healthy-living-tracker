import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { typography, useHealthTheme } from "@/constants/theme";

type ProgressRingProps = {
  color?: string;
  label?: string;
  progress: number;
  size?: number;
  strokeWidth?: number;
};

export function ProgressRing({
  color,
  label,
  progress,
  size = 96,
  strokeWidth = 10,
}: ProgressRingProps) {
  const { colors } = useHealthTheme();
  const normalized = Math.max(0, Math.min(100, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

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
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke={color ?? colors.brand.primary}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - normalized / 100)}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
      </Svg>
      <Text style={{ color: colors.text.primary, ...typography.sectionTitle }}>
        {label ?? Math.round(normalized)}
      </Text>
    </View>
  );
}
