import { Image, StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthOSScanAsset } from "./HealthOSScanTypes";

type HealthOSCapturedPreviewProps = {
  asset: HealthOSScanAsset;
  onClose: () => void;
  onRetake: () => void;
  onUsePhoto: () => void;
};

export function HealthOSCapturedPreview({
  asset,
  onClose,
  onRetake,
  onUsePhoto,
}: HealthOSCapturedPreviewProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <View style={styles.container}>
      <Image resizeMode="cover" source={{ uri: asset.uri }} style={styles.image} />
      <View style={styles.topRow}>
        <HealthOSPill label="Retake" onPress={onRetake} variant="glass" />
        <HealthOSPill label="Close" onPress={onClose} variant="glass" />
      </View>
      <View style={styles.bottomCard}>
        <Text style={[healthOSTypography.cardTitle, { color: palette.shimmerWhite }]}>
          Photo ready
        </Text>
        <Text style={[healthOSTypography.bodySmall, { color: palette.shimmerWhite }]}>
          Review before extracting, saving, or importing.
        </Text>
        <View style={styles.actions}>
          <HealthOSPill label="Use photo" onPress={onUsePhoto} variant="active" />
          <HealthOSPill label="Retake" onPress={onRetake} variant="glass" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  bottomCard: {
    backgroundColor: "rgba(2, 6, 23, 0.62)",
    borderColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: healthOSRadius.xl,
    borderWidth: 1,
    bottom: 126,
    gap: healthOSSpacing.sm,
    left: 16,
    padding: healthOSSpacing.lg,
    position: "absolute",
    right: 16,
    zIndex: 2,
  },
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    left: 16,
    position: "absolute",
    right: 16,
    top: 14,
    zIndex: 2,
  },
});
