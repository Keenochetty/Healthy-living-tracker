import type { ReactNode } from "react";
import { Pressable, Text, View, type ViewStyle } from "react-native";

import { layout } from "@/constants/layout";
import { componentRadius } from "@/constants/radius";
import { spacing } from "@/constants/spacing";
import { typography, useHealthTheme } from "@/constants/theme";

export type AppButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type AppButtonProps = {
  disabled?: boolean;
  icon?: ReactNode;
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  variant?: AppButtonVariant;
};

export function AppButton({
  disabled = false,
  icon,
  label,
  onPress,
  style,
  variant = "primary",
}: AppButtonProps) {
  const { colors } = useHealthTheme();
  const primary = variant === "primary";
  const danger = variant === "danger";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          alignItems: "center",
          backgroundColor: primary
            ? colors.brand.primary
            : danger
              ? colors.status.emergency
              : variant === "secondary"
                ? colors.surface.secondary
                : "transparent",
          borderColor: primary ? "transparent" : colors.border.soft,
          borderRadius: componentRadius.button,
          borderWidth: 1,
          flexDirection: "row",
          gap: spacing.sm,
          justifyContent: "center",
          minHeight: layout.minTapTarget,
          opacity: disabled ? 0.5 : pressed ? 0.82 : 1,
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
          transform: pressed ? [{ scale: 0.98 }] : undefined,
        },
        style,
      ]}
    >
      {icon ? <View>{icon}</View> : null}
      <Text
        style={{
          color:
            primary || danger ? colors.text.inverse : colors.text.primary,
          ...typography.label,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
