import { View } from "react-native";

import { appColors, appRadius, appSpacing } from "@/theme/designSystem";
import { TabPill } from "./TabPill";

type SegmentedControlProps<T extends string> = {
  onChange: (value: T) => void;
  options: Array<{ label: string; value: T }>;
  value: T;
};

export function SegmentedControl<T extends string>({
  onChange,
  options,
  value,
}: SegmentedControlProps<T>) {
  return (
    <View
      style={{
        backgroundColor: appColors.surfaceWarm,
        borderColor: appColors.border,
        borderRadius: appRadius.pill,
        borderWidth: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: appSpacing.xs,
        padding: appSpacing.xs,
      }}
    >
      {options.map((option) => (
        <TabPill
          active={value === option.value}
          key={option.value}
          label={option.label}
          onPress={() => onChange(option.value)}
        />
      ))}
    </View>
  );
}
