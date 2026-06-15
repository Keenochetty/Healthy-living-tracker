import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

type ProgressRingProps = {
  color: string;
  progress: number;
  size?: number;
  trackColor: string;
};

export function HealthProgressRing({
  color,
  progress,
  size = 82,
  trackColor,
}: ProgressRingProps) {
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalized = Math.max(0, Math.min(100, progress));

  return (
    <Svg height={size} width={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        fill="none"
        r={radius}
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        fill="none"
        r={radius}
        rotation="-90"
        stroke={color}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={circumference * (1 - normalized / 100)}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
}

export function HealthMiniLineChart({
  color,
  data,
  height = 38,
  width = 100,
}: {
  color: string;
  data: number[];
  height?: number;
  width?: number;
}) {
  const min = Math.min(...data);
  const range = Math.max(1, Math.max(...data) - min);
  const points = data.map((value, index) => ({
    x: (index / Math.max(1, data.length - 1)) * width,
    y: height - 4 - ((value - min) / range) * (height - 8),
  }));
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <Svg height={height} width={width}>
      <Path
        d={path}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
      />
    </Svg>
  );
}

export function HealthDonutChart({
  colors,
  size = 54,
  trackColor,
  values,
}: {
  colors: string[];
  size?: number;
  trackColor: string;
  values: number[];
}) {
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = Math.max(1, values.reduce((sum, value) => sum + value, 0));
  let offset = 0;

  return (
    <View>
      <Svg height={size} width={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {values.map((value, index) => {
          const length = (value / total) * circumference;
          const segment = (
            <Circle
              cx={size / 2}
              cy={size / 2}
              fill="none"
              key={`${index}-${value}`}
              r={radius}
              stroke={colors[index] ?? colors[0]}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              strokeWidth={strokeWidth}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          offset += length;
          return segment;
        })}
      </Svg>
    </View>
  );
}
