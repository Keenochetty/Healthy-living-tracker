import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSSafeArea,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import { HealthOSExtractionPreview } from "./HealthOSExtractionPreview";
import type {
  HealthOSExtractionState,
  HealthOSScanAsset,
  HealthOSScanImportTarget,
  HealthOSScanModeConfig,
} from "./HealthOSScanTypes";

type HealthOSScanResultSheetProps = {
  asset: HealthOSScanAsset | null;
  extractionState: HealthOSExtractionState;
  importTargets: HealthOSScanImportTarget[];
  onAskAI: () => void;
  onClose: () => void;
  onExtract: () => void;
  onImportTarget: (target: HealthOSScanImportTarget) => void;
  onRetake: () => void;
  onSaveRecord: () => void;
  selectedMode: HealthOSScanModeConfig;
  visible: boolean;
};

export function HealthOSScanResultSheet({
  asset,
  extractionState,
  importTargets,
  onAskAI,
  onClose,
  onExtract,
  onImportTarget,
  onRetake,
  onSaveRecord,
  selectedMode,
  visible,
}: HealthOSScanResultSheetProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, surfaces.glassPanel]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text style={[healthOSTypography.sectionTitle, { color: palette.inkText }]}>
                What should HealthOS do with this?
              </Text>
              <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                Review extracted health information before saving.
              </Text>
            </View>
            <HealthOSPill label="Close" onPress={onClose} size="sm" variant="glass" />
          </View>
          <View style={styles.modeRow}>
            <HealthOSPill label={selectedMode.label} size="sm" variant="ai" />
            {asset ? (
              <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
                {asset.source === "gallery" ? "Gallery upload" : "Camera capture"}
              </Text>
            ) : null}
          </View>
          {asset ? (
            <Image resizeMode="cover" source={{ uri: asset.uri }} style={styles.thumbnail} />
          ) : null}
          <View style={styles.actionRow}>
            <HealthOSPill label="Extract data" onPress={onExtract} variant="active" />
            <HealthOSPill label="Ask AI" onPress={onAskAI} variant="ai" />
            <HealthOSPill label="Save as record" onPress={onSaveRecord} variant="glass" />
            <HealthOSPill label="Import to app" onPress={onExtract} variant="glass" />
            <HealthOSPill label="Add reminder" onPress={onExtract} variant="glass" />
            <HealthOSPill label="Find related info" onPress={onAskAI} variant="glass" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.targetRow}>
              {importTargets.map((target) => (
                <HealthOSPill
                  key={target}
                  label={targetLabel(target)}
                  onPress={() => onImportTarget(target)}
                  variant="glass"
                />
              ))}
            </View>
          </ScrollView>
          <HealthOSExtractionPreview state={extractionState} />
          <HealthOSCard variant="compact">
            <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
              Review before saving. This does not replace medical advice. Confirm medication instructions with your healthcare professional.
            </Text>
          </HealthOSCard>
          <HealthOSPill label="Retake" onPress={onRetake} variant="glass" />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function targetLabel(target: HealthOSScanImportTarget) {
  if (target === "babyChild") return "Baby/Child";
  if (target === "womenHealth") return "Women’s Health";
  return target.charAt(0).toUpperCase() + target.slice(1);
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  backdrop: {
    backgroundColor: "rgba(2, 6, 23, 0.42)",
    flex: 1,
    justifyContent: "flex-end",
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
    gap: healthOSSpacing.md,
  },
  modeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
  sheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    gap: healthOSSpacing.md,
    maxHeight: "88%",
    paddingBottom: healthOSSafeArea.screenBottom + healthOSSpacing.lg,
  },
  targetRow: {
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    paddingRight: healthOSSpacing.lg,
  },
  thumbnail: {
    borderRadius: 18,
    height: 120,
    width: "100%",
  },
  titleBlock: {
    flex: 1,
    gap: healthOSSpacing.xxs,
  },
});
