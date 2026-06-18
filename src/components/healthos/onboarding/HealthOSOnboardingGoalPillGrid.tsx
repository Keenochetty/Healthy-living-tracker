import { StyleSheet, View } from "react-native";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { healthOSSpacing } from "@/theme/healthos";

export type HealthOSOnboardingGoal = {
  key: string;
  label: string;
};

type HealthOSOnboardingGoalPillGridProps = {
  goals: HealthOSOnboardingGoal[];
  onToggle: (key: string) => void;
  selectedKeys: string[];
};

export function HealthOSOnboardingGoalPillGrid({
  goals,
  onToggle,
  selectedKeys,
}: HealthOSOnboardingGoalPillGridProps) {
  return (
    <View style={styles.grid}>
      {goals.map((goal) => (
        <HealthOSPill
          key={goal.key}
          label={goal.label}
          onPress={() => onToggle(goal.key)}
          selected={selectedKeys.includes(goal.key)}
          variant="glass"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
});
