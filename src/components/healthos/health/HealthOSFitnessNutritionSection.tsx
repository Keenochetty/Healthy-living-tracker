import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { AppIcon } from "@/components/ui/AppIcon";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { HealthOSProgressRingPlaceholder } from "@/components/healthos/HealthOSProgressRingPlaceholder";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
} from "@/theme/healthos";
import { useColorScheme } from "react-native";

import { HealthOSHealthMetricTile } from "./HealthOSHealthMetricTile";
import { HealthOSHealthSectionCard } from "./HealthOSHealthSectionCard";
import type { HealthOSHealthSectionMeta, HealthOSMetric } from "./HealthOSHealthTypes";

type FitnessSummary = {
  activeMinutesToday?: number;
  currentStreakDays?: number;
  stepsToday?: number;
  weeklyGoalProgress?: number;
  workoutsThisWeek?: number;
};

type NutritionSummary = {
  calories?: number;
  foodLogCount?: number;
  proteinGrams?: number;
  waterMl?: number;
};

type HealthOSFitnessNutritionSectionProps = {
  fitnessSummary: FitnessSummary | null;
  nutritionSummary: NutritionSummary | null;
  onLongPress: () => void;
  section: HealthOSHealthSectionMeta;
};

export function HealthOSFitnessNutritionSection({
  fitnessSummary,
  nutritionSummary,
  onLongPress,
  section,
}: HealthOSFitnessNutritionSectionProps) {
  const palette = getHealthOSPalette(useColorScheme() === "dark" ? "dark" : "light");
  const metrics: HealthOSMetric[] = [
    { label: "Active min", value: `${fitnessSummary?.activeMinutesToday ?? 0}` },
    { label: "Steps", value: `${fitnessSummary?.stepsToday ?? 0}` },
    { label: "Protein", value: `${Math.round(nutritionSummary?.proteinGrams ?? 0)}g` },
    { label: "Water", value: `${Math.round(nutritionSummary?.waterMl ?? 0)}ml` },
  ];
  const hasActivity =
    Boolean(fitnessSummary?.activeMinutesToday) ||
    Boolean(fitnessSummary?.stepsToday) ||
    Boolean(nutritionSummary?.foodLogCount) ||
    Boolean(nutritionSummary?.waterMl);

  return (
    <HealthOSHealthSectionCard
      icon={<AppIcon decorative name="fitness" size={20} variant="primary" />}
      onLongPress={onLongPress}
      onPress={() => router.push("/(tabs)/fitness")}
      section={section}
      variant="darkHero"
    >
      <View style={styles.row}>
        <HealthOSProgressRingPlaceholder
          max={100}
          size={84}
          value={fitnessSummary?.weeklyGoalProgress ?? 0}
          variant="fitness"
        />
        <View style={styles.metrics}>
          {metrics.map((metric) => (
            <HealthOSHealthMetricTile key={metric.label} metric={metric} />
          ))}
        </View>
      </View>
      {!hasActivity ? (
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          Choose a fitness or nutrition goal.
        </Text>
      ) : null}
      <View style={styles.actions}>
        <HealthOSPill label="Fitness" onPress={() => router.push("/(tabs)/fitness")} size="sm" variant="realm" />
        <HealthOSPill label="Nutrition" onPress={() => router.push("/(tabs)/food")} size="sm" variant="realm" />
      </View>
    </HealthOSHealthSectionCard>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  metrics: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.md,
  },
});
