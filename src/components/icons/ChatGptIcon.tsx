import Svg, { G, Path } from "react-native-svg";

type ChatGptIconProps = {
  color?: string;
  size?: number;
  strokeWidth?: number;
};

const rotations = [0, 60, 120, 180, 240, 300] as const;

export function ChatGptIcon({
  color = "currentColor",
  size = 24,
  strokeWidth = 1.9,
}: ChatGptIconProps) {
  return (
    <Svg
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {rotations.map((rotation) => (
        <G key={rotation} origin="12, 12" rotation={rotation}>
          <Path
            d="M12 3.25c3.05 0 5.2 2.12 5.2 5.02v4.38c0 1.78-1.43 3.2-3.2 3.2H9.72"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
          />
        </G>
      ))}
    </Svg>
  );
}
