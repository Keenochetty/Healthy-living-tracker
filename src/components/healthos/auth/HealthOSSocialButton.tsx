import { Platform, Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSOpacity,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type HealthOSSocialButtonProps = {
  disabled?: boolean;
  onPress?: () => void;
  provider: "apple" | "google";
};

export function HealthOSSocialButton({
  disabled,
  onPress,
  provider,
}: HealthOSSocialButtonProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);
  const appleUnsupported = provider === "apple" && Platform.OS !== "ios";
  const unavailable = disabled || appleUnsupported || !onPress;
  const label =
    provider === "apple"
      ? appleUnsupported
        ? "Apple sign-in on iOS only"
        : "Continue with Apple"
      : "Continue with Google";

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: unavailable }}
      disabled={unavailable}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        surfaces.glassPill,
        unavailable && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.mark, { borderColor: palette.borderSubtle }]}>
        <Text style={[healthOSTypography.buttonLabel, { color: palette.inkText }]}>
          {provider === "google" ? "G" : ""}
        </Text>
      </View>
      <Text style={[healthOSTypography.buttonLabel, styles.label, { color: palette.inkText }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: healthOSRadius.lg,
    flexDirection: "row",
    gap: healthOSSpacing.md,
    height: 48,
    justifyContent: "center",
    width: "100%",
  },
  disabled: {
    opacity: healthOSOpacity.disabled,
  },
  label: {
    flex: 1,
    textAlign: "center",
  },
  mark: {
    alignItems: "center",
    borderRadius: healthOSRadius.pill,
    borderWidth: 1,
    height: 28,
    justifyContent: "center",
    marginLeft: healthOSSpacing.md,
    width: 28,
  },
  pressed: {
    opacity: healthOSOpacity.pressed,
  },
});
