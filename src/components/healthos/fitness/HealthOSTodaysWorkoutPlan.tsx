import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { HealthOSSectionHeader } from "@/components/healthos/HealthOSSectionHeader";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import { HealthOSExerciseRow } from "./HealthOSExerciseRow";
import type { HealthOSExerciseDisplay, HealthOSWorkoutDisplay } from "./HealthOSFitnessTypes";
import { HealthOSWorkoutCard } from "./HealthOSWorkoutCard";

type HealthOSTodaysWorkoutPlanProps = {
  menuVisible: boolean;
  onAddToCalendar: () => void;
  onBuildPlan: () => void;
  onCloseMenu: () => void;
  onExerciseLongPress: (exercise: HealthOSExerciseDisplay) => void;
  onExercisePress: (exercise: HealthOSExerciseDisplay) => void;
  onMove: () => void;
  onScanMachine: () => void;
  onShare: () => void;
  onStart: () => void;
  onWorkoutLongPress: () => void;
  workout: HealthOSWorkoutDisplay | null;
};

export function HealthOSTodaysWorkoutPlan({
  menuVisible,
  onAddToCalendar,
  onBuildPlan,
  onCloseMenu,
  onExerciseLongPress,
  onExercisePress,
  onMove,
  onScanMachine,
  onShare,
  onStart,
  onWorkoutLongPress,
  workout,
}: HealthOSTodaysWorkoutPlanProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <View style={styles.container}>
      <HealthOSSectionHeader title="Today's plan" subtitle="Workout plan and exercise recommendations." />
      {workout ? (
        <>
          <HealthOSWorkoutCard
            menuVisible={menuVisible}
            onAddToCalendar={onAddToCalendar}
            onCloseMenu={onCloseMenu}
            onLongPress={onWorkoutLongPress}
            onMove={onMove}
            onShare={onShare}
            onStart={onStart}
            onViewDetails={onStart}
            workout={workout}
          />
          <View style={styles.exercises}>
            {workout.exercises.map((exercise) => (
              <HealthOSExerciseRow
                exercise={exercise}
                key={exercise.id}
                onLongPress={() => onExerciseLongPress(exercise)}
                onPress={() => onExercisePress(exercise)}
              />
            ))}
          </View>
        </>
      ) : (
        <HealthOSCard variant="compact">
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            Choose a workout plan or build your own.
          </Text>
          <View style={styles.actions}>
            <HealthOSPill label="Build plan" onPress={onBuildPlan} size="sm" variant="realm" />
            <HealthOSPill label="Scan machine" onPress={onScanMachine} size="sm" variant="glass" />
          </View>
        </HealthOSCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.md,
  },
  container: {
    gap: healthOSSpacing.md,
  },
  exercises: {
    gap: healthOSSpacing.sm,
  },
});

