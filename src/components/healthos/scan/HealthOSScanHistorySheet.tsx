import { Modal, Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

import { AppIcon } from "@/components/ui";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSSafeArea,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type HealthOSScanHistorySheetProps = {
  onClose: () => void;
  visible: boolean;
};

export function HealthOSScanHistorySheet({
  onClose,
  visible,
}: HealthOSScanHistorySheetProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, surfaces.glassPanel]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={[healthOSTypography.sectionTitle, { color: palette.inkText }]}>
              Scan history
            </Text>
            <HealthOSPill label="Close" onPress={onClose} size="sm" variant="glass" />
          </View>
          <View style={styles.empty}>
            <AppIcon color={palette.softText} decorative name="scan" size={24} />
            <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
              No scans yet.
            </Text>
            <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
              Reviewed scans can appear here after a safe history store is approved.
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(2, 6, 23, 0.42)",
    flex: 1,
    justifyContent: "flex-end",
  },
  empty: {
    alignItems: "center",
    gap: healthOSSpacing.sm,
    paddingVertical: healthOSSpacing.xl,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: "rgba(148, 163, 184, 0.5)",
    borderRadius: 999,
    height: 4,
    width: 44,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    gap: healthOSSpacing.md,
    paddingBottom: healthOSSafeArea.screenBottom + healthOSSpacing.lg,
  },
});
