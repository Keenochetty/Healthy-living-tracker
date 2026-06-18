import { Modal, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSExerciseDisplay } from "./HealthOSFitnessTypes";
import { HealthOSMuscleMapPreview } from "./HealthOSMuscleMapPreview";

type HealthOSExerciseDetailSheetProps = {
  exercise: HealthOSExerciseDisplay | null;
  onAddToPlan: () => void;
  onClose: () => void;
  onMarkComplete: () => void;
  onReplace: () => void;
  onSchedule: () => void;
};

export function HealthOSExerciseDetailSheet({
  exercise,
  onAddToPlan,
  onClose,
  onMarkComplete,
  onReplace,
  onSchedule,
}: HealthOSExerciseDetailSheetProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);

  return (
    <Modal animationType="slide" transparent visible={Boolean(exercise)} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, surfaces.elevatedCard]}>
          {exercise ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[healthOSTypography.sectionTitle, { color: palette.inkText }]}>
                {exercise.name}
              </Text>
              <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                {[exercise.difficulty, exercise.equipment.join(", ")].filter(Boolean).join(" | ")}
              </Text>
              <HealthOSCard variant="compact">
                <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                  {exercise.videoUrl ? "Video available. Tap play in the full exercise page." : "No video media connected yet."}
                </Text>
              </HealthOSCard>
              <HealthOSMuscleMapPreview
                muscles={exercise.muscleGroups.map((label) => ({
                  group: "fullBody",
                  label,
                  status: "targeted",
                }))}
                onFilter={onReplace}
              />
              <View style={styles.instructions}>
                <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
                  Instructions
                </Text>
                {exercise.instructions.slice(0, 5).map((instruction) => (
                  <Text key={instruction} style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                    - {instruction}
                  </Text>
                ))}
                <Text style={[healthOSTypography.caption, { color: palette.warning }]}>
                  Stop if you feel sharp pain. Check with a professional if injured or pregnant.
                </Text>
              </View>
              <View style={styles.actions}>
                <HealthOSPill label="Add to plan" onPress={onAddToPlan} variant="realm" />
                <HealthOSPill label="Replace" onPress={onReplace} variant="glass" />
                <HealthOSPill label="Schedule" onPress={onSchedule} variant="glass" />
                <HealthOSPill label="Mark complete" onPress={onMarkComplete} variant="glass" />
              </View>
            </ScrollView>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.lg,
  },
  backdrop: {
    backgroundColor: "rgba(2, 6, 23, 0.32)",
    flex: 1,
    justifyContent: "flex-end",
  },
  instructions: {
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.lg,
  },
  sheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: healthOSRadius["2xl"],
    borderTopRightRadius: healthOSRadius["2xl"],
    maxHeight: "86%",
    padding: healthOSSpacing.lg,
  },
});

