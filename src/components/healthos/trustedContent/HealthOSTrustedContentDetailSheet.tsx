import { Modal, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";
import { ExternalLink, MessageCircle, X } from "lucide-react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import type { HealthOSTrustedContentItem } from "@/features/trustedContent";
import {
  getHealthOSPalette,
  healthOSBottomSheetSizes,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import { HealthOSContentSafetyDisclaimer } from "./HealthOSContentSafetyDisclaimer";
import { HealthOSSourceQualityBadge } from "./HealthOSSourceQualityBadge";

type Props = {
  item?: HealthOSTrustedContentItem | null;
  onAskAI: (item: HealthOSTrustedContentItem) => void;
  onClose: () => void;
  onOpenSource: (item: HealthOSTrustedContentItem) => void;
  onReportIssue: (item: HealthOSTrustedContentItem) => void;
  onSave: (item: HealthOSTrustedContentItem) => void;
  visible: boolean;
};

export function HealthOSTrustedContentDetailSheet({
  item,
  onAskAI,
  onClose,
  onOpenSource,
  onReportIssue,
  onSave,
  visible,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  if (!item) return null;

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: mode === "dark" ? palette.deepNavy : palette.shimmerWhite },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.copy}>
              <Text style={[healthOSTypography.sectionTitle, { color: palette.inkText }]}>
                {item.title}
              </Text>
              <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                {item.source.sourceName}
              </Text>
            </View>
            <Pressable accessibilityLabel="Close content preview" onPress={onClose}>
              <X color={palette.inkText} size={20} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.chips}>
              <HealthOSSourceQualityBadge quality={item.source.sourceQuality} />
              {item.reviewedAt ? <HealthOSPill label={`Reviewed ${item.reviewedAt}`} size="sm" variant="glass" /> : null}
              {item.updatedAt ? <HealthOSPill label={`Updated ${formatDate(item.updatedAt)}`} size="sm" variant="glass" /> : null}
            </View>
            {item.summary ? (
              <Text style={[healthOSTypography.bodySmall, styles.summary, { color: palette.softText }]}>
                {item.summary}
              </Text>
            ) : null}
            <HealthOSContentSafetyDisclaimer item={item} />
            {item.topicChips?.length ? (
              <View style={styles.chips}>
                {item.topicChips.map((chip) => (
                  <HealthOSPill key={chip} label={chip} size="sm" variant="glass" />
                ))}
              </View>
            ) : null}
            <HealthOSCard title="Source attribution" variant="compact">
              <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                {item.source.sourceName}
                {item.source.sourceUrl ? ` · ${item.source.sourceUrl}` : ""}
              </Text>
            </HealthOSCard>
          </ScrollView>
          <View style={styles.actions}>
            <HealthOSPill label={item.saved ? "Saved" : "Save"} onPress={() => onSave(item)} variant={item.saved ? "success" : "glass"} />
            <HealthOSPill icon={<ExternalLink size={14} />} label="Open original source" onPress={() => onOpenSource(item)} variant="glass" />
            <HealthOSPill icon={<MessageCircle size={14} />} label="Ask AI" onPress={() => onAskAI(item)} variant="ai" />
            <HealthOSPill label="Report issue" onPress={() => onReportIssue(item)} variant="warning" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  backdrop: {
    backgroundColor: "rgba(15, 23, 42, 0.52)",
    flex: 1,
    justifyContent: "flex-end",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  copy: {
    flex: 1,
    gap: healthOSSpacing.xs,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: "rgba(148, 163, 184, 0.42)",
    borderRadius: healthOSRadius.pill,
    height: 4,
    marginBottom: healthOSSpacing.md,
    width: 44,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: healthOSSpacing.md,
  },
  scroll: {
    gap: healthOSSpacing.md,
    paddingBottom: healthOSSpacing.md,
  },
  sheet: {
    borderTopLeftRadius: healthOSBottomSheetSizes.cornerRadius,
    borderTopRightRadius: healthOSBottomSheetSizes.cornerRadius,
    gap: healthOSSpacing.lg,
    maxHeight: "88%",
    padding: healthOSSpacing.xl,
  },
  summary: {
    lineHeight: 21,
  },
});
