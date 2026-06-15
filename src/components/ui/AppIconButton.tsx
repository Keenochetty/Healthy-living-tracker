import { cloneElement, isValidElement, ReactElement, ReactNode } from "react";
import { Pressable } from "react-native";

import { radius } from "@/theme/tokens";
import { getContrastText } from "@/theme/designSystem";
import { useAppTheme } from "@/theme/ThemeProvider";

type AppIconButtonProps = {
  accessibilityLabel?: string;
  icon: ReactNode;
  onPress: () => void;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary" | "ghost" | "danger";
};

export function AppIconButton({
  accessibilityLabel,
  icon,
  onPress,
  size = "md",
  variant = "default",
}: AppIconButtonProps) {
  const { theme } = useAppTheme();
  const dimension = size === "sm" ? 36 : size === "lg" ? 52 : 44;
  const colors = getIconButtonColors(variant, theme);
  const renderedIcon = isValidElement(icon)
    ? cloneElement(icon as ReactElement<{ color?: string }>, {
        color: colors.icon,
      })
    : icon;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: colors.background,
        borderColor: variant === "default" ? theme.border : "transparent",
        borderRadius: radius.full,
        borderWidth: variant === "default" ? 1 : 0,
        height: dimension,
        justifyContent: "center",
        opacity: pressed ? 0.82 : 1,
        width: dimension,
      })}
    >
      {renderedIcon}
    </Pressable>
  );
}

function getIconButtonColors(
  variant: NonNullable<AppIconButtonProps["variant"]>,
  theme: ReturnType<typeof useAppTheme>["theme"],
) {
  switch (variant) {
    case "primary":
      return { background: theme.primary, icon: getContrastText(theme.primary) };
    case "ghost":
      return { background: "transparent", icon: theme.primary };
    case "danger":
      return { background: theme.primarySoft, icon: theme.danger };
    default:
      return { background: theme.surface, icon: theme.text };
  }
}
