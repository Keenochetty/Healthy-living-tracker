import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSNutritionCaution } from "./HealthOSNutritionTypes";

type HealthOSNutritionCautionsCardProps = {
  cautions: HealthOSNutritionCaution[];
  onAskAI: () => void;
  onReview: (caution?: HealthOSNutritionCaution) => void;
};

export function HealthOSNutritionCautionsCard({
  cautions,
  onAskAI,
  onReview,
}: HealthOSNutritionCautionsCardProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard title="Nutrition cautions" variant="compact">
      <View style={styles.stack}>
        {cautions.map((caution) => (
          <View key={caution.id} style={[styles.caution, { borderColor: palette.borderSubtle }]}>
            <HealthOSPill label={typeLabel(caution.type)} size="sm" variant="warning" />
            <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
              {caution.title}
            </Text>
            <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
              {caution.body}
            </Text>
            <HealthOSPill label="Review" onPress={() => onReview(caution)} size="sm" variant="glass" />
          </View>
        ))}
      </View>
      <Text style={[healthOSTypography.caption, styles.safety, { color: palette.softText }]}>
        For guidance only. Review health changes, pregnancy, child nutrition, diabetes, allergy, or medication concerns with a professional.
      </Text>
      <View style={styles.actions}>
        <HealthOSPill label="Ask AI" onPress={onAskAI} variant="ai" />
        <HealthOSPill label="Review settings" onPress={() => onReview()} variant="glass" />
      </View>
    </HealthOSCard>
  );
}

function typeLabel(type: HealthOSNutritionCaution["type"]) {
  switch (type) {
    case "missingData":
      return "Setup";
    case "diabetic":
      return "Diabetes caution";
    default:
      return type;
  }
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.md,
  },
  caution: {
    borderRadius: 18,
    borderWidth: 1,
    gap: healthOSSpacing.sm,
    padding: healthOSSpacing.md,
  },
  safety: {
    marginTop: healthOSSpacing.md,
  },
  stack: {
    gap: healthOSSpacing.sm,
  },
});
