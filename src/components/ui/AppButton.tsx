import { ActivityIndicator, Pressable, Text, View, type PressableProps } from "react-native";

import { radius, spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";

type AppButtonProps = PressableProps & {
  disabled?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  label?: string;
  loading?: boolean;
  onPress?: () => void;
  size?: "sm" | "md" | "lg";
  title?: string;
  tone?: "primary" | "secondary";
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger" | "success";
};

export function AppButton({
  disabled,
  fullWidth = false,
  iconLeft,
  iconRight,
  label,
  loading = false,
  size = "md",
  style,
  title,
  tone,
  variant = tone === "secondary" ? "secondary" : "primary",
  ...props
}: AppButtonProps) {
  const { theme } = useAppTheme();
  const buttonTitle = title ?? label ?? "";
  const colors = getButtonColors(variant, theme);
  const minHeight = size === "sm" ? 40 : size === "lg" ? 56 : 50;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={(state) => [
        {
          alignItems: "center",
          alignSelf: fullWidth ? "stretch" : "auto",
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          borderRadius: radius.lg,
          borderWidth: variant === "outline" ? 1 : 0,
          flexDirection: "row",
          gap: spacing.sm,
          justifyContent: "center",
          minHeight,
          opacity: disabled ? 0.55 : 1,
          paddingHorizontal: size === "sm" ? spacing.md : spacing.xl,
          paddingVertical: size === "sm" ? spacing.sm : spacing.md
        },
        state.pressed && { opacity: 0.82 },
        typeof style === "function" ? style(state) : style
      ]}
      {...props}
    >
      {loading ? <ActivityIndicator color={colors.color} size="small" /> : iconLeft}
      <Text style={{ color: colors.color, fontSize: size === "sm" ? 13 : 16, fontWeight: "900" }}>
        {buttonTitle}
      </Text>
      {!loading ? iconRight : null}
    </Pressable>
  );
}

function getButtonColors(variant: NonNullable<AppButtonProps["variant"]>, theme: ReturnType<typeof useAppTheme>["theme"]) {
  switch (variant) {
    case "secondary":
      return { backgroundColor: theme.primarySoft, borderColor: theme.primarySoft, color: theme.primary };
    case "ghost":
      return { backgroundColor: "transparent", borderColor: "transparent", color: theme.primary };
    case "outline":
      return { backgroundColor: "transparent", borderColor: theme.border, color: theme.primary };
    case "danger":
      return { backgroundColor: theme.danger, borderColor: theme.danger, color: "#ffffff" };
    case "success":
      return { backgroundColor: theme.success, borderColor: theme.success, color: "#ffffff" };
    default:
      return { backgroundColor: theme.primary, borderColor: theme.primary, color: "#ffffff" };
  }
}
