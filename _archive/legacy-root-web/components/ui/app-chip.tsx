import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { layout } from "@/constants/layout";
import { componentRadius } from "@/constants/radius";
import { spacing } from "@/constants/spacing";
import { typography, useHealthTheme } from "@/constants/theme";

type AppChipProps = {
  icon?: ReactNode;
  label: string;
  onPress?: () => void;
  selected?: boolean;
  toneColor?: string;
};

export function AppChip({
  icon,
  label,
  onPress,
  selected = false,
  toneColor,
}: AppChipProps) {
  const { colors } = useHealthTheme();
  const activeColor = toneColor ?? colors.brand.primary;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: selected ? activeColor : colors.surface.secondary,
        borderColor: selected ? "transparent" : colors.border.soft,
        borderRadius: componentRadius.chip,
        borderWidth: 1,
        flexDirection: "row",
        gap: spacing.sm,
        minHeight: layout.minTapTarget,
        opacity: pressed ? 0.8 : 1,
        paddingHorizontal: spacing.lg,
      })}
    >
      {icon ? <View>{icon}</View> : null}
      <Text
        style={{
          color: selected ? colors.text.inverse : colors.text.secondary,
          ...typography.bodySmall,
          fontWeight: "800",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
