import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

type HealthOSNutritionCalendarSharingCardProps = {
  onAddMealsToCalendar: () => void;
  onShareMealPlan: () => void;
  onViewCalendar: () => void;
};

export function HealthOSNutritionCalendarSharingCard({
  onAddMealsToCalendar,
  onShareMealPlan,
  onViewCalendar,
}: HealthOSNutritionCalendarSharingCardProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard title="Calendar and family" variant="elevated">
      <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
        Meal planning can connect to reminders, prep time, and family routines later. You choose what family can see.
      </Text>
      <View style={styles.actions}>
        <HealthOSPill label="Add meals to calendar" onPress={onAddMealsToCalendar} variant="glass" />
        <HealthOSPill label="View calendar" onPress={onViewCalendar} variant="glass" />
        <HealthOSPill label="Share meal plan" onPress={onShareMealPlan} variant="glass" />
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.md,
  },
});
