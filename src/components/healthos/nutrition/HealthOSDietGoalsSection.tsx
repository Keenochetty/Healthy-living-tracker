import { ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSDietGoal } from "./HealthOSNutritionTypes";

type HealthOSDietGoalsSectionProps = {
  goals: Array<{ key: HealthOSDietGoal; label: string; selected: boolean }>;
  onManageGoals: () => void;
};

export function HealthOSDietGoalsSection({ goals, onManageGoals }: HealthOSDietGoalsSectionProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard title="Diet goals and preferences" variant="compact">
      <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
        Preferences guide planning and caution surfaces. They do not force restrictive diets.
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {goals.map((goal) => (
            <HealthOSPill
              key={goal.key}
              label={goal.label}
              onPress={onManageGoals}
              selected={goal.selected}
              variant="glass"
            />
          ))}
        </View>
      </ScrollView>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.md,
    paddingRight: healthOSSpacing.lg,
  },
});
