import { Modal, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, getHealthOSSurfaces, healthOSBottomSheetSizes, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSMealDisplay } from "./HealthOSNutritionTypes";

type HealthOSMealDetailSheetProps = {
  meal: HealthOSMealDisplay | null;
  onAddIngredients: () => void;
  onAskAI: () => void;
  onClose: () => void;
  onEdit: () => void;
  onSaveFavorite: () => void;
  onSchedule: () => void;
};

export function HealthOSMealDetailSheet({
  meal,
  onAddIngredients,
  onAskAI,
  onClose,
  onEdit,
  onSaveFavorite,
  onSchedule,
}: HealthOSMealDetailSheetProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={Boolean(meal)}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, surfaces.elevatedCard]}>
        <View style={styles.handle} />
        {meal ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View style={styles.titleBlock}>
                <Text style={[healthOSTypography.sectionTitle, { color: palette.inkText }]}>
                  {meal.name}
                </Text>
                <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
                  {meal.timeLabel ?? "Time not saved"} - {meal.source}
                </Text>
              </View>
              <Pressable accessibilityRole="button" onPress={onClose}>
                <Text style={[healthOSTypography.buttonLabel, { color: palette.skyBlue }]}>
                  Close
                </Text>
              </Pressable>
            </View>

            <View style={styles.chips}>
              {meal.cautions.map((caution) => (
                <HealthOSPill key={caution} label={caution} size="sm" variant="warning" />
              ))}
              {meal.source === "ai" || meal.source === "scan" ? (
                <HealthOSPill label="Review needed" size="sm" variant="ai" />
              ) : null}
            </View>

            <HealthOSCard title="Nutrition" variant="compact">
              <View style={styles.metricGrid}>
                <Metric label="Calories" value={`${Math.round(meal.calories ?? 0)} kcal`} />
                <Metric label="Protein" value={`${Math.round(meal.proteinG ?? 0)}g`} />
                <Metric label="Carbs" value={`${Math.round(meal.carbsG ?? 0)}g`} />
                <Metric label="Fat" value={`${Math.round(meal.fatG ?? 0)}g`} />
                {meal.fiberG !== undefined ? (
                  <Metric label="Fiber" value={`${Math.round(meal.fiberG)}g`} />
                ) : null}
              </View>
            </HealthOSCard>

            <HealthOSCard title="Ingredients" variant="compact">
              {meal.ingredients?.length ? (
                meal.ingredients.map((ingredient) => (
                  <Text key={ingredient} style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                    - {ingredient}
                  </Text>
                ))
              ) : (
                <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                  No ingredients saved for this meal.
                </Text>
              )}
            </HealthOSCard>

            <Text style={[healthOSTypography.caption, styles.review, { color: palette.softText }]}>
              AI or scan nutrition may be estimated. Review values before using them for health decisions.
            </Text>

            <View style={styles.actions}>
              <HealthOSPill label="Edit" onPress={onEdit} variant="glass" />
              <HealthOSPill label="Calendar" onPress={onSchedule} variant="glass" />
              <HealthOSPill label="Ingredients" onPress={onAddIngredients} variant="glass" />
              <HealthOSPill label="Favorite" onPress={onSaveFavorite} variant="glass" />
              <HealthOSPill label="Ask AI" onPress={onAskAI} variant="ai" />
            </View>
          </ScrollView>
        ) : null}
      </View>
    </Modal>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <View style={styles.metric}>
      <Text style={[healthOSTypography.caption, { color: palette.softText }]}>{label}</Text>
      <Text style={[healthOSTypography.buttonLabel, { color: palette.inkText }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.lg,
  },
  backdrop: {
    backgroundColor: "rgba(2, 6, 23, 0.32)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
    marginBottom: healthOSSpacing.md,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: "rgba(148, 163, 184, 0.4)",
    borderRadius: 999,
    height: 4,
    marginBottom: healthOSSpacing.md,
    width: 44,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: healthOSSpacing.md,
    justifyContent: "space-between",
    marginBottom: healthOSSpacing.md,
  },
  metric: {
    flexBasis: "45%",
    flexGrow: 1,
    gap: healthOSSpacing.xxs,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.md,
  },
  review: {
    marginTop: healthOSSpacing.md,
  },
  sheet: {
    borderTopLeftRadius: healthOSBottomSheetSizes.cornerRadius,
    borderTopRightRadius: healthOSBottomSheetSizes.cornerRadius,
    bottom: 0,
    left: 0,
    maxHeight: "82%",
    padding: healthOSSpacing.lg,
    position: "absolute",
    right: 0,
  },
  titleBlock: {
    flex: 1,
    gap: healthOSSpacing.xs,
  },
});
