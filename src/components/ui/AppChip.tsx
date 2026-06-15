import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { radius, spacing } from "@/theme/tokens";
import { getContrastText } from "@/theme/designSystem";
import { useAppTheme } from "@/theme/ThemeProvider";

type AppChipProps = {
  accessibilityHint?: string;
  accessibilityLabel?: string;
  emoji?: string;
  icon?: ReactNode;
  label: string;
  onPress?: () => void;
  selected?: boolean;
  variant?:
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "private"
    | "muted";
};

export function AppChip({
  accessibilityHint,
  accessibilityLabel,
  emoji,
  icon,
  label,
  onPress,
  selected = false,
  variant = "default",
}: AppChipProps) {
  const { theme } = useAppTheme();
  const colors = getChipColors(variant, selected, theme);
  const content = (
    <>
      {emoji ? <Text>{emoji}</Text> : icon}
      <Text style={{ color: colors.text, fontSize: 13, fontWeight: "800" }}>
        {label}
      </Text>
    </>
  );
  const style = {
    alignItems: "center" as const,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row" as const,
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  };

  if (onPress) {
    return (
      <Pressable
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [style, pressed && { opacity: 0.82 }]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={style}>{content}</View>;
}

function getChipColors(
  variant: NonNullable<AppChipProps["variant"]>,
  selected: boolean,
  theme: ReturnType<typeof useAppTheme>["theme"],
) {
  if (selected) {
    return {
      background: theme.primary,
      border: theme.primary,
      text: getContrastText(theme.primary),
    };
  }

  const map = {
    danger: [withAlpha(theme.danger, "20"), withAlpha(theme.danger, "55"), theme.danger],
    default: [theme.surface, theme.border, theme.mutedText],
    info: [withAlpha(theme.info, "20"), withAlpha(theme.info, "55"), theme.info],
    muted: [theme.surfaceSoft ?? theme.surface, theme.border, theme.mutedText],
    primary: [theme.primarySoft, theme.primarySoft, theme.primary],
    private: [withAlpha(theme.secondary, "20"), withAlpha(theme.secondary, "55"), theme.secondary],
    success: [withAlpha(theme.success, "20"), withAlpha(theme.success, "55"), theme.success],
    warning: [withAlpha(theme.warning, "20"), withAlpha(theme.warning, "55"), theme.warning],
  } as const;

  const [background, border, text] = map[variant];
  return { background, border, text };
}

function withAlpha(color: string, alpha: string) {
  return /^#[0-9a-f]{6}$/i.test(color) ? `${color}${alpha}` : color;
}
