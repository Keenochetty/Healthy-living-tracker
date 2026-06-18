import { ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSSectionHeader } from "@/components/healthos/HealthOSSectionHeader";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSMealPlanDisplay } from "./HealthOSNutritionTypes";

type HealthOSMealPlanCardsProps = {
  activePlan: HealthOSMealPlanDisplay | null;
  onActivatePlan: (plan?: HealthOSMealPlanDisplay) => void;
  onAddIngredients: () => void;
  onAskAI: () => void;
  onSchedule: () => void;
  onShare: () => void;
  suggestedPlans: HealthOSMealPlanDisplay[];
};

export function HealthOSMealPlanCards({
  activePlan,
  onActivatePlan,
  onAddIngredients,
  onAskAI,
  onSchedule,
  onShare,
  suggestedPlans,
}: HealthOSMealPlanCardsProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <>
      <HealthOSSectionHeader
        actionLabel="Plan"
        onAction={() => onActivatePlan()}
        subtitle={activePlan ? "Active plan ready for review." : "Create your first meal plan."}
        title="Meal plans"
      />
      {activePlan ? (
        <HealthOSCard title={activePlan.title} subtitle={activePlan.description} variant="elevated" />
      ) : (
        <HealthOSCard variant="compact">
          <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
            Create your first meal plan.
          </Text>
          <Text style={[healthOSTypography.bodySmall, styles.copy, { color: palette.softText }]}>
            Suggested templates are planning starts only. Nothing is generated or saved until you choose an action.
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.row}>
              {suggestedPlans.map((plan) => (
                <HealthOSPill
                  key={plan.id}
                  label={plan.title}
                  onPress={() => onActivatePlan(plan)}
                  variant="realm"
                  realmColor={palette.nutrition}
                />
              ))}
            </View>
          </ScrollView>
          <View style={styles.actions}>
            <HealthOSPill label="Calendar" onPress={onSchedule} variant="glass" />
            <HealthOSPill label="Ingredients" onPress={onAddIngredients} variant="glass" />
            <HealthOSPill label="Share" onPress={onShare} variant="glass" />
            <HealthOSPill label="Ask AI" onPress={onAskAI} variant="ai" />
          </View>
        </HealthOSCard>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.md,
  },
  copy: {
    marginTop: healthOSSpacing.xs,
  },
  row: {
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.md,
    paddingRight: healthOSSpacing.lg,
  },
});
