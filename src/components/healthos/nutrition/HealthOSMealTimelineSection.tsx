import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { AppIcon } from "@/components/ui/AppIcon";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import { HealthOSMealRow } from "./HealthOSMealRow";
import type { HealthOSMealDisplay, HealthOSMealTimelineSectionDisplay } from "./HealthOSNutritionTypes";

type HealthOSMealTimelineSectionProps = {
  onAddMeal: () => void;
  onMealLongPress: (meal: HealthOSMealDisplay) => void;
  onMealPress: (meal: HealthOSMealDisplay) => void;
  section: HealthOSMealTimelineSectionDisplay;
};

export function HealthOSMealTimelineSection({
  onAddMeal,
  onMealLongPress,
  onMealPress,
  section,
}: HealthOSMealTimelineSectionProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const calories = section.meals.reduce((total, meal) => total + (meal.calories ?? 0), 0);

  return (
    <HealthOSCard variant="compact">
      <View style={styles.header}>
        <View>
          <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
            {section.title}
          </Text>
          <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
            {section.meals.length
              ? `${section.meals.length} items - ${Math.round(calories)} kcal`
              : "Nothing logged yet"}
          </Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onAddMeal} style={styles.addButton}>
          <Text style={[healthOSTypography.buttonLabel, { color: palette.skyBlue }]}>
            Add
          </Text>
        </Pressable>
      </View>
      <View style={styles.meals}>
        {section.meals.length ? (
          section.meals.map((meal) => (
            <HealthOSMealRow
              key={meal.id}
              meal={meal}
              onLongPress={onMealLongPress}
              onPress={onMealPress}
            />
          ))
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={onAddMeal}
            style={[styles.emptyRow, { borderColor: palette.borderSubtle }]}
          >
            <AppIcon decorative name="add" size={16} variant="muted" />
            <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
              {section.addLabel}
            </Text>
          </Pressable>
        )}
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  addButton: {
    minHeight: 44,
    justifyContent: "center",
  },
  emptyRow: {
    alignItems: "center",
    borderRadius: 18,
    borderStyle: "dashed",
    borderWidth: 1,
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    minHeight: 48,
    paddingHorizontal: healthOSSpacing.md,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  meals: {
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.md,
  },
});
