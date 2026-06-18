import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

import { AppIcon } from "@/components/ui";
import {
  getHealthOSPalette,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type HealthOSCaptureControlsProps = {
  isCapturing: boolean;
  onAskAI: () => void;
  onCapture: () => void;
  onPickFromGallery: () => void;
};

export function HealthOSCaptureControls({
  isCapturing,
  onAskAI,
  onCapture,
  onPickFromGallery,
}: HealthOSCaptureControlsProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <View style={styles.row}>
      <OverlayButton
        icon="upload"
        label="Gallery"
        onPress={onPickFromGallery}
      />
      <Pressable
        accessibilityLabel="Take scan photo"
        accessibilityRole="button"
        disabled={isCapturing}
        onPress={onCapture}
        style={({ pressed }) => [
          styles.captureOuter,
          { borderColor: palette.skyBlue },
          pressed && { opacity: 0.72, transform: [{ scale: 0.96 }] },
          isCapturing && { opacity: 0.58 },
        ]}
      >
        <View style={[styles.captureInner, { backgroundColor: palette.shimmerWhite }]} />
      </Pressable>
      <OverlayButton icon="ai" label="AI" onPress={onAskAI} />
    </View>
  );
}

function OverlayButton({
  icon,
  label,
  onPress,
}: {
  icon: "ai" | "upload";
  label: string;
  onPress: () => void;
}) {
  const palette = getHealthOSPalette(useColorScheme() === "dark" ? "dark" : "light");
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.72 }]}
    >
      <AppIcon color={palette.shimmerWhite} decorative name={icon} size={20} />
      <Text style={[healthOSTypography.micro, { color: palette.shimmerWhite }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "rgba(2, 6, 23, 0.48)",
    borderColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: healthOSRadius.lg,
    borderWidth: 1,
    gap: healthOSSpacing.xxs,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  captureInner: {
    borderRadius: 999,
    height: 54,
    width: 54,
  },
  captureOuter: {
    alignItems: "center",
    backgroundColor: "rgba(2, 6, 23, 0.38)",
    borderRadius: 999,
    borderWidth: 3,
    height: 74,
    justifyContent: "center",
    width: 74,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.xl,
    justifyContent: "center",
  },
});
