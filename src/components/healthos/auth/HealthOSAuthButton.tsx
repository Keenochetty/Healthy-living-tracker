import { ActivityIndicator, Pressable, StyleSheet, Text, useColorScheme } from "react-native";

import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSOpacity,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type HealthOSAuthButtonProps = {
  accessibilityLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
  title: string;
  variant?: "ghost" | "primary" | "secondary";
};

export function HealthOSAuthButton({
  accessibilityLabel,
  disabled = false,
  loading = false,
  onPress,
  title,
  variant = "primary",
}: HealthOSAuthButtonProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);
  const isPrimary = variant === "primary";
  const isGhost = variant === "ghost";

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary
          ? { backgroundColor: palette.skyBlue, borderColor: palette.skyBlue }
          : isGhost
            ? styles.ghost
            : surfaces.glassPill,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? palette.deepNavy : palette.skyBlue} />
      ) : (
        <Text
          style={[
            healthOSTypography.buttonLabel,
            { color: isPrimary ? palette.deepNavy : palette.inkText },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: healthOSRadius.lg,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    paddingHorizontal: healthOSSpacing.lg,
    width: "100%",
  },
  disabled: {
    opacity: healthOSOpacity.disabled,
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  pressed: {
    opacity: healthOSOpacity.pressed,
  },
});
