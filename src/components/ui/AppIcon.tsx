import { View } from "react-native";

import { appIcons, type AppIconName } from "@/constants/appIcons";
import { radius } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";

type AppIconProps = {
  accessibilityLabel?: string;
  backgroundColor?: string;
  color?: string;
  container?: boolean;
  containerVariant?: "soft" | "primary" | "white" | "transparent";
  decorative?: boolean;
  name: AppIconName;
  size?: number;
  strokeWidth?: number;
  variant?:
    | "default"
    | "primary"
    | "muted"
    | "success"
    | "warning"
    | "danger"
    | "private";
};

export function AppIcon({
  accessibilityLabel,
  backgroundColor,
  color,
  container = false,
  containerVariant = "soft",
  decorative,
  name,
  size = 22,
  strokeWidth = 2.2,
  variant = "default",
}: AppIconProps) {
  const { theme } = useAppTheme();
  const Icon = appIcons[name];
  const isAiLogo = name === "ai" || name === "ai_assistant";
  const iconColor = isAiLogo
    ? getMonochromeLogoColor(backgroundColor ?? theme.background)
    : color ?? getIconColor(variant, theme);
  const accessibilityProps =
    accessibilityLabel && !decorative
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
        width: size + 24,
      }}
    >
      <Icon
        color={
          isAiLogo
            ? getMonochromeLogoColor(
                backgroundColor ?? getContainerColor(containerVariant, theme),
              )
            : containerVariant === "primary"
              ? "#ffffff"
              : iconColor
        }
        size={size}
        strokeWidth={strokeWidth}
      />
    </View>
  );
}

function getMonochromeLogoColor(backgroundColor: string) {
  const hex = backgroundColor.match(/^#([\da-f]{6})$/i)?.[1];

  if (!hex) {
    return backgroundColor.includes("255") ? "#000000" : "#ffffff";
  }

  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;

  return luminance > 145 ? "#000000" : "#ffffff";
}

function getIconColor(
  variant: NonNullable<AppIconProps["variant"]>,
  theme: ReturnType<typeof useAppTheme>["theme"],
) {
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

function getContainerColor(
  containerVariant: NonNullable<AppIconProps["containerVariant"]>,
  theme: ReturnType<typeof useAppTheme>["theme"],
) {
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
