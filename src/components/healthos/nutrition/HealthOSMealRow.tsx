import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

import { AppIcon } from "@/components/ui/AppIcon";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSRadius, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSMealDisplay } from "./HealthOSNutritionTypes";

type HealthOSMealRowProps = {
  meal: HealthOSMealDisplay;
  onLongPress: (meal: HealthOSMealDisplay) => void;
  onPress: (meal: HealthOSMealDisplay) => void;
};

export function HealthOSMealRow({ meal, onLongPress, onPress }: HealthOSMealRowProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <Pressable
      accessibilityLabel={`${meal.name}, ${Math.round(meal.calories ?? 0)} calories`}
      accessibilityRole="button"
      onLongPress={() => onLongPress(meal)}
      onPress={() => onPress(meal)}
      style={({ pressed }) => [
        styles.row,
        { borderColor: palette.borderSubtle },
        pressed && { opacity: 0.76 },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: `${palette.nutrition}1F` }]}>
        <AppIcon color={palette.nutrition} decorative name="nutrition" size={18} />
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
            {meal.name}
          </Text>
          {meal.timeLabel ? (
            <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
              {meal.timeLabel}
            </Text>
          ) : null}
        </View>
        <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
          {Math.round(meal.calories ?? 0)} kcal - {Math.round(meal.proteinG ?? 0)}g protein -{" "}
          {Math.round(meal.carbsG ?? 0)}g carbs - {Math.round(meal.fatG ?? 0)}g fat
        </Text>
        <View style={styles.chips}>
          <HealthOSPill label={sourceLabel(meal.source)} size="sm" variant="realm" realmColor={palette.nutrition} />
          {meal.cautions.map((caution) => (
            <HealthOSPill key={caution} label={caution} size="sm" variant="warning" />
          ))}
        </View>
      </View>
      <Text style={[healthOSTypography.buttonLabel, { color: palette.softText }]}>
        Details
      </Text>
    </Pressable>
  );
}

function sourceLabel(source: HealthOSMealDisplay["source"]) {
  switch (source) {
    case "ai":
      return "AI draft";
    case "mealPlan":
      return "Meal plan";
    case "scan":
      return "Scan";
    default:
      return source;
  }
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.xs,
    marginTop: healthOSSpacing.sm,
  },
  content: {
    flex: 1,
    gap: healthOSSpacing.xs,
  },
  icon: {
    alignItems: "center",
    borderRadius: healthOSRadius.md,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  row: {
    alignItems: "center",
    borderRadius: healthOSRadius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    padding: healthOSSpacing.md,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    justifyContent: "space-between",
  },
});
