import { StyleSheet, Text, useColorScheme, View } from "react-native";

import {
  getHealthOSPalette,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type HealthOSOnboardingProgressProps = {
  step: number;
  total: number;
};

export function HealthOSOnboardingProgress({
  step,
  total,
}: HealthOSOnboardingProgressProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const percent = Math.max(0, Math.min(1, step / total));

  return (
    <View
      accessibilityLabel={`Onboarding step ${step} of ${total}`}
      style={styles.container}
    >
      <View style={[styles.track, { backgroundColor: palette.borderSubtle }]}>
        <View
          style={[
            styles.fill,
            { backgroundColor: palette.skyBlue, width: `${percent * 100}%` },
          ]}
        />
      </View>
      <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
        Step {step} of {total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: healthOSSpacing.xs,
    marginBottom: healthOSSpacing.md,
  },
  fill: {
    borderRadius: healthOSRadius.pill,
    height: "100%",
  },
  track: {
    borderRadius: healthOSRadius.pill,
    height: 6,
    overflow: "hidden",
  },
});
