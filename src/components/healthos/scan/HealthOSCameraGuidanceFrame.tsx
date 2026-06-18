import { StyleSheet, Text, useColorScheme, View } from "react-native";

import {
  getHealthOSPalette,
  healthOSBorderWidth,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type HealthOSCameraGuidanceFrameProps = {
  hint: string;
};

export function HealthOSCameraGuidanceFrame({
  hint,
}: HealthOSCameraGuidanceFrameProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={[styles.frame, { borderColor: `${palette.skyBlue}88` }]}>
        <View style={[styles.corner, styles.topLeft, { borderColor: palette.shimmerWhite }]} />
        <View style={[styles.corner, styles.topRight, { borderColor: palette.shimmerWhite }]} />
        <View style={[styles.corner, styles.bottomLeft, { borderColor: palette.shimmerWhite }]} />
        <View style={[styles.corner, styles.bottomRight, { borderColor: palette.shimmerWhite }]} />
      </View>
      <View style={styles.hint}>
        <Text style={[healthOSTypography.caption, { color: palette.shimmerWhite }]}>
          {hint}
        </Text>
      </View>
    </View>
  );
}

const cornerBase = {
  height: 30,
  position: "absolute" as const,
  width: 30,
};

const styles = StyleSheet.create({
  bottomLeft: {
    borderBottomWidth: healthOSBorderWidth.strong,
    borderLeftWidth: healthOSBorderWidth.strong,
    bottom: -1,
    left: -1,
  },
  bottomRight: {
    borderBottomWidth: healthOSBorderWidth.strong,
    borderRightWidth: healthOSBorderWidth.strong,
    bottom: -1,
    right: -1,
  },
  container: {
    alignItems: "center",
    gap: healthOSSpacing.md,
    justifyContent: "center",
  },
  corner: cornerBase,
  frame: {
    borderRadius: healthOSRadius.lg,
    borderWidth: healthOSBorderWidth.thin,
    height: 220,
    width: "78%",
  },
  hint: {
    backgroundColor: "rgba(2, 6, 23, 0.46)",
    borderRadius: healthOSRadius.pill,
    paddingHorizontal: healthOSSpacing.md,
    paddingVertical: healthOSSpacing.sm,
  },
  topLeft: {
    borderLeftWidth: healthOSBorderWidth.strong,
    borderTopWidth: healthOSBorderWidth.strong,
    left: -1,
    top: -1,
  },
  topRight: {
    borderRightWidth: healthOSBorderWidth.strong,
    borderTopWidth: healthOSBorderWidth.strong,
    right: -1,
    top: -1,
  },
});
