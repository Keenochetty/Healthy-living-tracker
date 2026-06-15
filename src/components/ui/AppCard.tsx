import { ReactNode } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";

import { radius as radii, spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";

type AppCardProps = {
  children: ReactNode;
  backgroundColor?: string;
  onPress?: () => void;
  padding?: "sm" | "md" | "lg";
  radius?: "md" | "lg" | "xl" | "2xl";
  style?: StyleProp<ViewStyle>;
  variant?:
    | "default"
    | "soft"
    | "primary"
    | "warning"
    | "danger"
    | "success"
    | "glass";
};

export function AppCard({
  children,
  backgroundColor,
  onPress,
  padding = "lg",
  radius = "xl",
  style,
  variant = "default",
}: AppCardProps) {
  const { theme } = useAppTheme();
  const background = backgroundColor ?? getVariantBackground(variant, theme);
  const cardStyle: StyleProp<ViewStyle> = [
    {
      backgroundColor: background,
      borderColor:
        variant === "glass" ? theme.border : theme.border,
      borderRadius: radii[radius],
      borderWidth: 1,
      padding:
        padding === "sm"
          ? spacing.md
          : padding === "md"
            ? spacing.lg
            : spacing.xl,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDarkColor(theme.background) ? 0.16 : 0.06,
      shadowRadius: 16,
      elevation: 3,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && { opacity: 0.86 }]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

function getVariantBackground(
  variant: NonNullable<AppCardProps["variant"]>,
  theme: ReturnType<typeof useAppTheme>["theme"],
) {
  switch (variant) {
    case "soft":
      return theme.primarySoft;
    case "primary":
      return theme.primary;
    case "warning":
      return withAlpha(theme.warning, "18");
    case "danger":
      return withAlpha(theme.danger, "18");
    case "success":
      return withAlpha(theme.success, "18");
    case "glass":
      return isDarkColor(theme.background)
        ? "rgba(30,41,59,0.78)"
        : "rgba(255,255,255,0.78)";
    default:
      return theme.surface;
  }
}

function withAlpha(color: string, alpha: string) {
  return /^#[0-9a-f]{6}$/i.test(color) ? `${color}${alpha}` : color;
}

function isDarkColor(color: string) {
  return color.startsWith("#0") || color.startsWith("#1");
}
