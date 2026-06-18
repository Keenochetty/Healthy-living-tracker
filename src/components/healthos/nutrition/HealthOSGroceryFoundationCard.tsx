import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSGrocerySummary } from "./HealthOSNutritionTypes";

type HealthOSGroceryFoundationCardProps = {
  grocerySummary: HealthOSGrocerySummary;
  onAddIngredients: () => void;
  onImportReceipt: () => void;
  onViewShopping: () => void;
};

export function HealthOSGroceryFoundationCard({
  grocerySummary,
  onAddIngredients,
  onImportReceipt,
  onViewShopping,
}: HealthOSGroceryFoundationCardProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard title="Grocery foundation" variant="compact">
      <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
        {grocerySummary.status}
      </Text>
      <Text style={[healthOSTypography.caption, styles.meta, { color: palette.softText }]}>
        Planned ingredients: {grocerySummary.ingredientCount}
      </Text>
      {grocerySummary.missingIngredients.length ? (
        <View style={styles.missing}>
          {grocerySummary.missingIngredients.map((item) => (
            <HealthOSPill key={item} label={item} size="sm" variant="warning" />
          ))}
        </View>
      ) : null}
      <View style={styles.actions}>
        <HealthOSPill label="View shopping list" onPress={onViewShopping} variant="glass" />
        <HealthOSPill label="Add ingredients" onPress={onAddIngredients} variant="glass" />
        <HealthOSPill label="Import receipt" onPress={onImportReceipt} variant="glass" />
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
  meta: {
    marginTop: healthOSSpacing.sm,
  },
  missing: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.md,
  },
});
