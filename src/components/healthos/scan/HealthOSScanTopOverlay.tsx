import { useState } from "react";
import { Pressable, StyleSheet, useColorScheme, View } from "react-native";

import { AppIcon } from "@/components/ui";
import {
  HealthOSGlassMenu,
  type HealthOSGlassMenuItem,
} from "@/components/healthos/HealthOSGlassMenu";
import {
  getHealthOSPalette,
  healthOSRadius,
  healthOSSpacing,
  type HealthOSColorMode,
} from "@/theme/healthos";

type HealthOSScanTopOverlayProps = {
  flashEnabled: boolean;
  onManualEntry: () => void;
  onOpenHistory: () => void;
  onPickFromGallery: () => void;
  onShowTips: () => void;
  onToggleFacing: () => void;
  onToggleFlash: () => void;
};

export function HealthOSScanTopOverlay({
  flashEnabled,
  onManualEntry,
  onOpenHistory,
  onPickFromGallery,
  onShowTips,
  onToggleFacing,
  onToggleFlash,
}: HealthOSScanTopOverlayProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuMode, setMenuMode] = useState<"info" | "menu">("menu");
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const menuItems: HealthOSGlassMenuItem[] = [
    { key: "history", label: "Scan history", onPress: onOpenHistory },
    { key: "gallery", label: "Upload from gallery", onPress: onPickFromGallery },
    { key: "manual", label: "Manual entry", onPress: onManualEntry },
    {
      closeOnPress: false,
      key: "tips",
      label: "Scan tips",
      onPress: () => {
        setMenuVisible(true);
        setMenuMode("info");
        onShowTips();
      },
    },
    {
      closeOnPress: false,
      key: "settings",
      label: "Camera permissions/settings",
      onPress: () => {
        setMenuVisible(true);
        setMenuMode("info");
      },
    },
  ];

  return (
    <>
      <View style={styles.container}>
        <OverlayIconButton
          accessibilityLabel="Open scan menu"
          icon="settings"
          onPress={() => {
            setMenuMode("menu");
            setMenuVisible(true);
          }}
        />
        <View style={styles.rightControls}>
          <OverlayIconButton
            accessibilityLabel={flashEnabled ? "Turn flash off" : "Turn flash on"}
            icon="warning"
            onPress={onToggleFlash}
          />
          <OverlayIconButton
            accessibilityLabel="Flip camera"
            icon="sync"
            onPress={onToggleFacing}
          />
        </View>
      </View>
      <HealthOSGlassMenu
        infoBody="Use good lighting, keep the full label or document inside the frame, and review extracted health information before saving."
        infoTips={[
          "Scan modes are user-selected, not automatic detection.",
          "Photos are not imported until you confirm.",
          "Medication and scripts require careful review.",
        ]}
        infoTitle="Scan tips"
        items={menuItems}
        mode={menuMode}
        onClose={() => setMenuVisible(false)}
        visible={menuVisible}
      />
    </>
  );
}

function OverlayIconButton({
  accessibilityLabel,
  icon,
  onPress,
}: {
  accessibilityLabel: string;
  icon: "settings" | "sync" | "warning";
  onPress: () => void;
}) {
  const palette = getHealthOSPalette(useColorScheme() === "dark" ? "dark" : "light");
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.72 }]}
    >
      <AppIcon color={palette.shimmerWhite} decorative name={icon} size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "rgba(2, 6, 23, 0.48)",
    borderColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: healthOSRadius.pill,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    left: 16,
    position: "absolute",
    right: 16,
    top: 14,
    zIndex: 5,
  },
  rightControls: {
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
});
