import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type HealthOSWorkoutBuilderCardProps = {
  onBuildWorkout: () => void;
};

const FILTERS = ["Muscle", "Equipment", "Time", "Difficulty", "Goal"];
const EQUIPMENT = ["Dumbbells", "Barbell", "Machine", "Cable", "Bodyweight", "Resistance band", "Treadmill", "Bike", "None"];

export function HealthOSWorkoutBuilderCard({ onBuildWorkout }: HealthOSWorkoutBuilderCardProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard title="Build your own workout" subtitle="Foundation for muscle, equipment, time, and goal filters" variant="glass">
      <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
        Choose filters now; the full planner algorithm comes later.
      </Text>
      <View style={styles.chips}>
        {FILTERS.map((item) => (
          <HealthOSPill key={item} label={item} size="sm" variant="glass" />
        ))}
      </View>
      <View style={styles.chips}>
        {EQUIPMENT.map((item) => (
          <HealthOSPill key={item} label={item} size="sm" variant="glass" />
        ))}
      </View>
      <HealthOSPill label="Build workout" onPress={onBuildWorkout} size="sm" variant="realm" />
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
});

