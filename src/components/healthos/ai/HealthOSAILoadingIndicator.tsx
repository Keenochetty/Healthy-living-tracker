import { ActivityIndicator, StyleSheet, Text, useColorScheme, View } from "react-native";

import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

export function HealthOSAILoadingIndicator() {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <View style={styles.row}>
      <ActivityIndicator color={palette.ai} size="small" />
      <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
        Thinking through a safe response...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
});
