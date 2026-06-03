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
  variant?: "default" | "soft" | "primary" | "warning" | "danger" | "success" | "glass";
};

export function AppCard({
  children,
  backgroundColor,
  onPress,
  padding = "lg",
  radius = "xl",
  style,
  variant = "default"
}: AppCardProps) {
  const { theme } = useAppTheme();
  const background = backgroundColor ?? getVariantBackground(variant, theme);
  const cardStyle: StyleProp<ViewStyle> = [
    {
      backgroundColor: background,
      borderColor: variant === "glass" ? "rgba(255,255,255,0.45)" : theme.border,
      borderRadius: radii[radius],
      borderWidth: variant === "glass" ? 1 : 0,
      padding: padding === "sm" ? spacing.md : padding === "md" ? spacing.lg : spacing.xl,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: theme.background === "#0f172a" ? 0.16 : 0.06,
      shadowRadius: 16,
      elevation: 3
    },
    style
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

function getVariantBackground(variant: NonNullable<AppCardProps["variant"]>, theme: ReturnType<typeof useAppTheme>["theme"]) {
  switch (variant) {
    case "soft":
      return theme.primarySoft;
    case "primary":
      return theme.primary;
    case "warning":
      return "#fff7ed";
    case "danger":
      return "#fee2e2";
    case "success":
      return "#ecfdf5";
    case "glass":
      return theme.background === "#0f172a" ? "rgba(30,41,59,0.78)" : "rgba(255,255,255,0.78)";
    default:
      return theme.surface;
  }
}
