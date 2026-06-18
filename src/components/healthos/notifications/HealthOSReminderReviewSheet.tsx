import { Modal, Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import { X } from "lucide-react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSBottomSheetSizes,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import {
  getReminderSafetyNotes,
  type HealthOSReminderReviewCandidate,
} from "@/features/reminders";

type Props = {
  candidate?: HealthOSReminderReviewCandidate | null;
  onClose: () => void;
  onSaveReviewed: () => void;
  visible: boolean;
};

export function HealthOSReminderReviewSheet({
  candidate,
  onClose,
  onSaveReviewed,
  visible,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const notes = candidate ? getReminderSafetyNotes(candidate.category) : [];

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor:
                mode === "dark" ? palette.deepNavy : palette.shimmerWhite,
            },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.copy}>
              <Text style={[healthOSTypography.sectionTitle, { color: palette.inkText }]}>
                Review reminder
              </Text>
              <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                Confirm details before anything is saved or scheduled.
              </Text>
            </View>
            <Pressable accessibilityLabel="Close review sheet" onPress={onClose}>
              <X color={palette.inkText} size={20} />
            </Pressable>
          </View>
          <HealthOSCard title={candidate?.title ?? "New reminder draft"} subtitle={candidate?.reason ?? "Create a reviewed reminder from a trusted app flow."} variant="compact">
            <View style={styles.stack}>
              <HealthOSPill label="Not scheduled" size="sm" variant="warning" />
              {notes.map((note) => (
                <Text key={note} style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                  {note}
                </Text>
              ))}
            </View>
          </HealthOSCard>
          <View style={styles.actions}>
            <HealthOSPill label="Cancel" onPress={onClose} variant="glass" />
            <HealthOSPill label="Create import preview" onPress={onSaveReviewed} variant="active" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
    justifyContent: "flex-end",
  },
  backdrop: {
    backgroundColor: "rgba(15, 23, 42, 0.52)",
    flex: 1,
    justifyContent: "flex-end",
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
  sheet: {
    borderTopLeftRadius: healthOSBottomSheetSizes.cornerRadius,
    borderTopRightRadius: healthOSBottomSheetSizes.cornerRadius,
    gap: healthOSSpacing.lg,
    maxHeight: "86%",
    padding: healthOSSpacing.xl,
  },
  stack: {
    gap: healthOSSpacing.sm,
  },
});
