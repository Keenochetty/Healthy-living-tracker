import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSBorderWidth,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

export type HealthOSPillVariant =
  | "active"
  | "ai"
  | "danger"
  | "default"
  | "glass"
  | "realm"
  | "success"
  | "warning";

type HealthOSPillProps = {
  disabled?: boolean;
  icon?: ReactNode;
  label: string;
  onPress?: () => void;
  realmColor?: string;
  selected?: boolean;
  size?: "md" | "sm";
  style?: StyleProp<ViewStyle>;
  testID?: string;
  variant?: HealthOSPillVariant;
};

export function HealthOSPill({
  disabled = false,
  icon,
  label,
  onPress,
  realmColor,
  selected = false,
  size = "md",
  style,
  testID,
  variant = "default",
}: HealthOSPillProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);
  const effectiveVariant = selected ? "active" : variant;
  const colors = getVariantColors(effectiveVariant, palette, realmColor);
  const content = (
    <View
      style={[
        styles.base,
        size === "sm" ? styles.small : styles.medium,
        effectiveVariant === "glass" ? surfaces.glassPill : undefined,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
        },
        disabled && styles.disabled,
        style,
      ]}
      testID={testID}
    >
      {icon ? <View>{icon}</View> : null}
      <Text style={[healthOSTypography.caption, { color: colors.color }]}>{label}</Text>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
    >
      {({ pressed }) => <View style={pressed ? { opacity: 0.72 } : undefined}>{content}</View>}
    </Pressable>
  );
}

function getVariantColors(
  variant: HealthOSPillVariant,
  palette: ReturnType<typeof getHealthOSPalette>,
  realmColor?: string,
) {
  switch (variant) {
    case "active":
      return {
        backgroundColor: palette.skyBlue,
        borderColor: palette.skyBlue,
        color: palette.deepNavy,
      };
    case "warning":
      return {
        backgroundColor: "rgba(217, 119, 6, 0.12)",
        borderColor: "rgba(217, 119, 6, 0.24)",
        color: palette.warning,
      };
    case "danger":
      return {
        backgroundColor: "rgba(220, 38, 38, 0.12)",
        borderColor: "rgba(220, 38, 38, 0.24)",
        color: palette.danger,
      };
    case "success":
      return {
        backgroundColor: "rgba(22, 163, 74, 0.12)",
        borderColor: "rgba(22, 163, 74, 0.24)",
        color: palette.success,
      };
    case "ai":
      return {
        backgroundColor: "rgba(56, 189, 248, 0.12)",
        borderColor: "rgba(56, 189, 248, 0.28)",
        color: palette.ai,
      };
    case "realm":
      return {
        backgroundColor: `${realmColor ?? palette.family}1F`,
        borderColor: `${realmColor ?? palette.family}40`,
        color: realmColor ?? palette.family,
      };
    case "glass":
      return {
        backgroundColor: "transparent",
        borderColor: palette.borderSubtle,
        color: palette.inkText,
      };
    default:
      return {
        backgroundColor: palette.mistBackground,
        borderColor: palette.borderSubtle,
        color: palette.softText,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: healthOSRadius.pill,
    borderWidth: healthOSBorderWidth.thin,
    flexDirection: "row",
    gap: healthOSSpacing.xs,
  },
  disabled: {
    opacity: 0.42,
  },
  medium: {
    minHeight: 36,
    paddingHorizontal: healthOSSpacing.md,
    paddingVertical: healthOSSpacing.sm,
  },
  small: {
    minHeight: 28,
    paddingHorizontal: healthOSSpacing.sm,
    paddingVertical: healthOSSpacing.xs,
  },
});
