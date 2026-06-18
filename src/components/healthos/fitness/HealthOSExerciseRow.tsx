import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSExerciseDisplay } from "./HealthOSFitnessTypes";

type HealthOSExerciseRowProps = {
  exercise: HealthOSExerciseDisplay;
  onLongPress: () => void;
  onPress: () => void;
};

export function HealthOSExerciseRow({ exercise, onLongPress, onPress }: HealthOSExerciseRowProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard onLongPress={onLongPress} onPress={onPress} variant="compact">
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
            {exercise.name}
          </Text>
          <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
            {exercise.muscleGroups.concat(exercise.secondaryMuscles ?? []).join(" | ")}
          </Text>
        </View>
        <HealthOSPill label={exercise.equipment[0] ?? "Equipment"} size="sm" variant="glass" />
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: healthOSSpacing.xxs,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
});

