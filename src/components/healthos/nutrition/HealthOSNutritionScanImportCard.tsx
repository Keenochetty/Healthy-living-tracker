import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

type HealthOSNutritionScanImportCardProps = {
  onImportRecipe: () => void;
  onScanFood: () => void;
};

export function HealthOSNutritionScanImportCard({
  onImportRecipe,
  onScanFood,
}: HealthOSNutritionScanImportCardProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const imports = ["Nutrition label", "Meal photo", "Recipe", "Grocery receipt", "Meal plan"];

  return (
    <HealthOSCard title="Scan a food label, meal, or recipe" variant="elevated">
      <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
        Scan/import routes prepare editable drafts. Nothing is auto-extracted or auto-saved from this card.
      </Text>
      <View style={styles.chips}>
        {imports.map((item) => (
          <HealthOSPill key={item} label={item} size="sm" variant="glass" />
        ))}
      </View>
      <View style={styles.actions}>
        <HealthOSPill label="Scan food" onPress={onScanFood} variant="realm" realmColor={palette.nutrition} />
        <HealthOSPill label="Import recipe" onPress={onImportRecipe} variant="ai" />
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
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.md,
  },
});
