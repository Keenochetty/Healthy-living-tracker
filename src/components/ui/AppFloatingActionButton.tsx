import { cloneElement, isValidElement, ReactElement, ReactNode } from "react";
import { Pressable, Text } from "react-native";

import { radius, spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";

type AppFloatingActionButtonProps = {
  icon: ReactNode;
  label?: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
};

export function AppFloatingActionButton({ icon, label, onPress, variant = "primary" }: AppFloatingActionButtonProps) {
  const { theme } = useAppTheme();
  const backgroundColor = variant === "secondary" ? theme.secondary : theme.primary;
  const renderedIcon = isValidElement(icon)
    ? cloneElement(icon as ReactElement<{ color?: string }>, { color: "#ffffff" })
    : icon;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        alignSelf: "flex-end",
        backgroundColor,
        borderRadius: radius.full,
        elevation: 8,
        flexDirection: "row",
        gap: spacing.sm,
        minHeight: 54,
        opacity: pressed ? 0.86 : 1,
        paddingHorizontal: label ? spacing.xl : 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 18,
        width: label ? undefined : 54,
        justifyContent: "center"
      })}
    >
      {renderedIcon}
      {label ? <Text style={{ color: "#ffffff", fontWeight: "900" }}>{label}</Text> : null}
    </Pressable>
  );
}
