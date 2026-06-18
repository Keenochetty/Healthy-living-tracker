import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSSectionHeader } from "@/components/healthos/HealthOSSectionHeader";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSNutritionContentItem } from "./HealthOSNutritionTypes";

type HealthOSNutritionContentSectionProps = {
  items: HealthOSNutritionContentItem[];
  onOpenSource: (sourceUrl: string) => void;
};

export function HealthOSNutritionContentSection({
  items,
  onOpenSource,
}: HealthOSNutritionContentSectionProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <>
      <HealthOSSectionHeader
        subtitle="Source-backed nutrition learning when available."
        title="Recipes and articles"
      />
      {items.length ? (
        items.map((item) => (
          <HealthOSCard key={item.id} variant="compact">
            <View style={styles.cardHeader}>
              <HealthOSPill label={item.topic} size="sm" variant="realm" realmColor={palette.nutrition} />
              <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
                {item.sourceName}
              </Text>
            </View>
            <Text style={[healthOSTypography.cardTitle, styles.title, { color: palette.inkText }]}>
              {item.title}
            </Text>
            <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
              {item.summary}
            </Text>
            <View style={styles.actions}>
              <HealthOSPill label="Open source" onPress={() => onOpenSource(item.sourceUrl)} variant="glass" />
              <HealthOSPill disabled label="Save later" variant="glass" />
            </View>
          </HealthOSCard>
        ))
      ) : (
        <HealthOSCard variant="compact">
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            Nutrition articles and recipes will appear when your interests are connected.
          </Text>
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
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    justifyContent: "space-between",
  },
  title: {
    marginTop: healthOSSpacing.sm,
  },
});
