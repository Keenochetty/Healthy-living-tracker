import { StyleSheet, Text, useColorScheme, View } from "react-native";

import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type HealthOSAuthErrorProps = {
  message?: string;
};

export function HealthOSAuthError({ message }: HealthOSAuthErrorProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);

  if (!message) return null;

  return (
    <View accessibilityRole="alert" style={[surfaces.dangerSurface, styles.panel]}>
      <Text style={[healthOSTypography.bodySmall, { color: palette.danger }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: healthOSSpacing.md,
  },
});
