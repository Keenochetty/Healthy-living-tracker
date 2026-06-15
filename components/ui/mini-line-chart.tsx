import Svg, { Path } from "react-native-svg";

import { useHealthTheme } from "@/constants/theme";

type MiniLineChartProps = {
  color?: string;
  height?: number;
  points: number[];
  width?: number;
};

export function MiniLineChart({
  color,
  height = 54,
  points,
  width = 180,
}: MiniLineChartProps) {
  const { colors } = useHealthTheme();
  const safePoints = points.length > 1 ? points : [0, 0];
  const min = Math.min(...safePoints);
  const max = Math.max(...safePoints);
  const range = Math.max(1, max - min);
  const path = safePoints
    .map((point, index) => {
      const x = (index / (safePoints.length - 1)) * width;
      const y = height - ((point - min) / range) * (height - 8) - 4;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <Svg height={height} width={width}>
      <Path
        d={path}
        fill="none"
        stroke={color ?? colors.brand.primary}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={4}
      />
    </Svg>
  );
}
