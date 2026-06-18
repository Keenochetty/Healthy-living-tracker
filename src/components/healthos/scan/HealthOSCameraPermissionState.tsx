import { Linking, StyleSheet, Text, useColorScheme, View } from "react-native";

import { AppIcon } from "@/components/ui";
import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthOSCameraPermissionStatus } from "./useHealthOSScanCamera";

type HealthOSCameraPermissionStateProps = {
  onPickFromGallery: () => void;
  onRequestPermission: () => void;
  status: HealthOSCameraPermissionStatus;
};

export function HealthOSCameraPermissionState({
  onPickFromGallery,
  onRequestPermission,
  status,
}: HealthOSCameraPermissionStateProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const copy = getPermissionCopy(status);

  return (
    <View style={styles.center}>
      <HealthOSCard
        icon={<AppIcon color={palette.skyBlue} decorative name="scan" size={24} />}
        subtitle={copy.body}
        title={copy.title}
        variant="elevated"
      >
        <View style={styles.actions}>
          {status === "undetermined" ? (
            <HealthOSPill
              label="Allow camera"
              onPress={onRequestPermission}
              variant="active"
            />
          ) : null}
          {status === "denied" ? (
            <HealthOSPill
              label="Open settings"
              onPress={() => Linking.openSettings()}
              variant="active"
            />
          ) : null}
          <HealthOSPill
            label="Upload from gallery"
            onPress={onPickFromGallery}
            variant="glass"
          />
        </View>
        <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
          Photos are not uploaded or imported automatically.
        </Text>
      </HealthOSCard>
    </View>
  );
}

function getPermissionCopy(status: HealthOSCameraPermissionStatus) {
  if (status === "loading") {
    return {
      body: "Checking whether this device can use the camera.",
      title: "Camera permission loading",
    };
  }
  if (status === "denied") {
    return {
      body: "Camera access is blocked. You can enable it in device settings or upload from gallery instead.",
      title: "Camera access denied",
    };
  }
  return {
    body: "HealthOS needs camera access to scan labels, scripts, notes, records, and plans.",
    title: "Allow camera access",
  };
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    padding: healthOSSpacing.lg,
  },
});
