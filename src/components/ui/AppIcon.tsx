import { View } from "react-native";

import { appIcons, type AppIconName } from "@/constants/appIcons";
import { radius } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";

type AppIconProps = {
  accessibilityLabel?: string;
  color?: string;
  container?: boolean;
  containerVariant?: "soft" | "primary" | "white" | "transparent";
  decorative?: boolean;
  name: AppIconName;
  size?: number;
  strokeWidth?: number;
  variant?: "default" | "primary" | "muted" | "success" | "warning" | "danger" | "private";
};

export function AppIcon({
  accessibilityLabel,
  color,
  container = false,
  containerVariant = "soft",
  decorative,
  name,
  size = 22,
  strokeWidth = 2.2,
  variant = "default"
}: AppIconProps) {
  const { theme } = useAppTheme();
  const Icon = appIcons[name];
  const iconColor = color ?? getIconColor(variant, theme);
  const accessibilityProps = accessibilityLabel && !decorative
    ? { accessibilityLabel, accessibilityRole: "image" as const }
    : { accessible: false };

  if (!container) {
    return (
      <View {...accessibilityProps}>
        <Icon color={iconColor} size={size} strokeWidth={strokeWidth} />
      </View>
    );
  }

  return (
    <View
      {...accessibilityProps}
      style={{
        alignItems: "center",
        backgroundColor: getContainerColor(containerVariant, theme),
        borderRadius: radius.lg,
        height: size + 24,
        justifyContent: "center",
        width: size + 24
      }}
    >
      <Icon color={containerVariant === "primary" ? "#ffffff" : iconColor} size={size} strokeWidth={strokeWidth} />
    </View>
  );
}

function getIconColor(variant: NonNullable<AppIconProps["variant"]>, theme: ReturnType<typeof useAppTheme>["theme"]) {
  switch (variant) {
    case "primary":
      return theme.primary;
    case "muted":
      return theme.mutedText;
    case "success":
      return theme.success;
    case "warning":
      return theme.warning;
    case "danger":
      return theme.danger;
    case "private":
      return "#7c3aed";
    default:
      return theme.text;
  }
}

function getContainerColor(containerVariant: NonNullable<AppIconProps["containerVariant"]>, theme: ReturnType<typeof useAppTheme>["theme"]) {
  switch (containerVariant) {
    case "primary":
      return theme.primary;
    case "white":
      return theme.surface;
    case "transparent":
      return "transparent";
    default:
      return theme.primarySoft;
  }
}
