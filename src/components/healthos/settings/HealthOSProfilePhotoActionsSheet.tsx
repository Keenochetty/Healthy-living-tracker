import { Modal, Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Camera, Image, Trash2, X } from "lucide-react-native";

import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import { HealthOSSettingsRow } from "./HealthOSSettingsRow";

type Props = {
  onChoosePhoto: () => void;
  onClose: () => void;
  onRemovePhoto: () => void;
  onTakePhoto: () => void;
  visible: boolean;
};

export function HealthOSProfilePhotoActionsSheet({
  onChoosePhoto,
  onClose,
  onRemovePhoto,
  onTakePhoto,
  visible,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, surfaces.glassMenu]}>
          <View style={styles.header}>
            <View style={styles.copy}>
              <Text style={[healthOSTypography.sectionTitle, { color: palette.inkText }]}>
                Profile photo
              </Text>
              <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
                Upload storage is deferred unless a safe handler is connected.
              </Text>
            </View>
            <Pressable accessibilityLabel="Close profile photo actions" accessibilityRole="button" onPress={onClose} style={styles.close}>
              <X color={palette.inkText} size={20} />
            </Pressable>
          </View>
          <HealthOSSettingsRow icon={<Image color={palette.ai} size={18} />} onPress={onChoosePhoto} title="Choose from gallery" subtitle="Requests photo permission only when tapped." />
          <HealthOSSettingsRow icon={<Camera color={palette.ai} size={18} />} onPress={onTakePhoto} title="Take photo" subtitle="Requests camera permission only when tapped." />
          <HealthOSSettingsRow destructive icon={<Trash2 color={palette.danger} size={18} />} onPress={onRemovePhoto} title="Remove photo" subtitle="Requires confirmation when storage removal is connected." />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(2, 6, 23, 0.38)",
  },
  close: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  copy: {
    flex: 1,
    gap: healthOSSpacing.xs,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    marginBottom: healthOSSpacing.md,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderRadius: healthOSRadius["2xl"],
    gap: healthOSSpacing.sm,
    padding: healthOSSpacing.lg,
  },
});
