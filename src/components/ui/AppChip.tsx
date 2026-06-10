import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { radius, spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";

type AppChipProps = {
  accessibilityHint?: string;
  accessibilityLabel?: string;
  emoji?: string;
  icon?: ReactNode;
  label: string;
  onPress?: () => void;
  selected?: boolean;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info" | "private" | "muted";
};

export function AppChip({
  accessibilityHint,
  accessibilityLabel,
  emoji,
  icon,
  label,
  onPress,
  selected = false,
  variant = "default"
}: AppChipProps) {
  const { theme } = useAppTheme();
  const colors = getChipColors(variant, selected, theme);
  const content = (
    <>
      {emoji ? <Text>{emoji}</Text> : icon}
      <Text style={{ color: colors.text, fontSize: 13, fontWeight: "800" }}>{label}</Text>
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
    paddingVertical: spacing.sm
  };

  if (onPress) {
    return (
      <Pressable accessibilityHint={accessibilityHint} accessibilityLabel={accessibilityLabel ?? label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [style, pressed && { opacity: 0.82 }]}>
        {content}
      </Pressable>
    );
  }

  return <View style={style}>{content}</View>;
}

function getChipColors(variant: NonNullable<AppChipProps["variant"]>, selected: boolean, theme: ReturnType<typeof useAppTheme>["theme"]) {
  if (selected) {
    return { background: theme.primary, border: theme.primary, text: "#ffffff" };
  }

  const map = {
    danger: ["#fee2e2", "#fecaca", theme.danger],
    default: [theme.surface, theme.border, theme.mutedText],
    info: ["#dbeafe", "#bfdbfe", theme.info],
    muted: ["#f8fafc", theme.border, theme.mutedText],
    primary: [theme.primarySoft, theme.primarySoft, theme.primary],
    private: ["#f5f3ff", "#ddd6fe", "#7c3aed"],
    success: ["#dcfce7", "#bbf7d0", theme.success],
    warning: ["#fef3c7", "#fde68a", theme.warning]
  } as const;

  const [background, border, text] = map[variant];
  return { background, border, text };
}
