import { Href, router } from "expo-router";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSProgressRingPlaceholder } from "@/components/healthos/HealthOSProgressRingPlaceholder";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { HealthOSWidget } from "@/components/healthos/HealthOSWidget";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthOSHomeSummaries } from "./HealthOSHomeTypes";

type WidgetProps = {
  summaries?: HealthOSHomeSummaries;
  onLongPress?: () => void;
};

export function HealthOSFitnessNutritionWidget({
  onLongPress,
  summaries,
}: WidgetProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const activeMinutes = summaries?.fitness?.activeMinutesToday ?? 0;
  const mealsLogged = summaries?.nutrition?.foodLogCount ?? 0;
  const hasSummary = activeMinutes > 0 || mealsLogged > 0;

  return (
    <HealthOSWidget
      onLongPress={onLongPress}
      onPress={() => router.push("/(tabs)/fitness" as Href)}
      removable
      subtitle="Movement and food planning"
      title="Fitness / Nutrition"
      variant="darkHero"
      widgetKey="fitnessNutrition"
    >
      <View style={styles.content}>
        <HealthOSProgressRingPlaceholder
          label="Plan"
          max={1}
          size={72}
          sublabel={hasSummary ? "Logged" : "Not set"}
          value={hasSummary ? 0.35 : 0}
          variant="fitness"
        />
        <View style={styles.copy}>
          <Text style={[healthOSTypography.cardTitle, { color: "#f8fafc" }]}>
            {hasSummary
              ? `${activeMinutes} active minutes · ${mealsLogged} meals`
              : "Choose a fitness or nutrition goal."}
          </Text>
          <Text style={[healthOSTypography.bodySmall, { color: "#cbd5e1" }]}>
            Workout and food summaries stay empty until real logs are available.
          </Text>
          <View style={styles.actions}>
            <HealthOSPill
              label="Fitness"
              onPress={() => router.push("/(tabs)/fitness" as Href)}
              realmColor={palette.fitness}
              size="sm"
              variant="realm"
            />
            <HealthOSPill
              label="Food"
              onPress={() => router.push("/(tabs)/food" as Href)}
              realmColor={palette.nutrition}
              size="sm"
              variant="realm"
            />
          </View>
        </View>
      </View>
    </HealthOSWidget>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.xs,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.md,
  },
  copy: {
    flex: 1,
    gap: healthOSSpacing.xs,
  },
});
