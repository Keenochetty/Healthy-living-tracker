import { View } from "react-native";

import { appRadius } from "@/theme/designSystem";
import type { CalendarIndicatorType } from "@/types/designSystem";

type CalendarHaloProps = {
  color: string;
  size?: number;
  type?: CalendarIndicatorType;
};

export function CalendarHalo({ color, size = 42, type = "halo" }: CalendarHaloProps) {
  const borderWidth = type === "double_halo" ? 3 : 2;
  return (
    <View
      accessibilityLabel={`${type.replace(/_/g, " ")} calendar indicator`}
      style={{
        borderColor: color,
        borderRadius: appRadius.pill,
        borderStyle: type === "stacked" ? "dashed" : "solid",
        borderWidth,
        height: size,
        position: "absolute",
        width: size
      }}
    />
  );
}
