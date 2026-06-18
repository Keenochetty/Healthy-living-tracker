import { ScrollView, StyleSheet, View } from "react-native";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { AppIcon } from "@/components/ui/AppIcon";
import { healthOSSpacing } from "@/theme/healthos";

type HealthOSNutritionQuickActionsProps = {
  onAddWater: () => void;
  onAddToCalendar: () => void;
  onAskAI: () => void;
  onGroceryList: () => void;
  onImportRecipe: () => void;
  onLogMeal: () => void;
  onPlanMeal: () => void;
  onScanLabel: () => void;
};

export function HealthOSNutritionQuickActions({
  onAddWater,
  onAddToCalendar,
  onAskAI,
  onGroceryList,
  onImportRecipe,
  onLogMeal,
  onPlanMeal,
  onScanLabel,
}: HealthOSNutritionQuickActionsProps) {
  const actions = [
    { icon: "add" as const, label: "Log meal", onPress: onLogMeal },
    { icon: "scan" as const, label: "Scan label", onPress: onScanLabel },
    { icon: "water" as const, label: "Add water", onPress: onAddWater },
    { icon: "nutrition" as const, label: "Plan meal", onPress: onPlanMeal },
    { icon: "source" as const, label: "Grocery list", onPress: onGroceryList },
    { icon: "ai" as const, label: "Ask AI", onPress: onAskAI },
    { icon: "source" as const, label: "Import recipe", onPress: onImportRecipe },
    { icon: "calendar_timeline" as const, label: "Calendar", onPress: onAddToCalendar },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.row}>
        {actions.map((action) => (
          <HealthOSPill
            icon={<AppIcon decorative name={action.icon} size={16} variant="muted" />}
            key={action.label}
            label={action.label}
            onPress={action.onPress}
            variant="glass"
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    paddingRight: healthOSSpacing.lg,
  },
});
