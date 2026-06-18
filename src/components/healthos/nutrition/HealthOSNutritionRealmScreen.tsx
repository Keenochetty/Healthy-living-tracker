import { useState } from "react";
import { ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSAppShell } from "@/components/healthos/shell/HealthOSAppShell";
import { getHealthOSPalette, healthOSLayout, healthOSSafeArea, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import { HealthOSDietGoalsSection } from "./HealthOSDietGoalsSection";
import { HealthOSGroceryFoundationCard } from "./HealthOSGroceryFoundationCard";
import { HealthOSMealDetailSheet } from "./HealthOSMealDetailSheet";
import { HealthOSMealPlanCards } from "./HealthOSMealPlanCards";
import { HealthOSMealTimeline } from "./HealthOSMealTimeline";
import { HealthOSNutritionCalendarSharingCard } from "./HealthOSNutritionCalendarSharingCard";
import { HealthOSNutritionCautionsCard } from "./HealthOSNutritionCautionsCard";
import { HealthOSNutritionContentSection } from "./HealthOSNutritionContentSection";
import { HealthOSNutritionHeader } from "./HealthOSNutritionHeader";
import { HealthOSNutritionHero } from "./HealthOSNutritionHero";
import { HealthOSNutritionQuickActions } from "./HealthOSNutritionQuickActions";
import { HealthOSNutritionScanImportCard } from "./HealthOSNutritionScanImportCard";
import type { HealthOSMealDisplay } from "./HealthOSNutritionTypes";
import { useHealthOSNutritionActions } from "./useHealthOSNutritionActions";
import { useHealthOSNutritionData } from "./useHealthOSNutritionData";

export function HealthOSNutritionRealmScreen() {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const nutrition = useHealthOSNutritionData();
  const [selectedMeal, setSelectedMeal] = useState<HealthOSMealDisplay | null>(null);
  const actions = useHealthOSNutritionActions({ onOpenMeal: setSelectedMeal });

  return (
    <HealthOSAppShell
      activeNavKey="health"
      showAICommandBar={false}
      showBottomNav={false}
      subtitle="Meals, goals, and planning"
      title="Nutrition"
      withBottomNavSpace={false}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <HealthOSNutritionHeader
            activeGoal={nutrition.activeGoal}
            onManageGoal={actions.planMeal}
            statusLine={nutrition.emptyState ?? nutrition.dailyProgress.statusNote}
          />
          {nutrition.error ? (
            <HealthOSCard variant="danger">
              <Text style={[healthOSTypography.bodySmall, { color: palette.danger }]}>
                {nutrition.error}
              </Text>
            </HealthOSCard>
          ) : null}
          <HealthOSNutritionHero
            hasLoggedFood={nutrition.dailyProgress.hasLoggedFood}
            legendItems={nutrition.macroLegendItems}
            note={nutrition.dailyProgress.statusNote}
            percent={nutrition.dailyProgress.percent}
            segments={nutrition.macroSegments}
          />
          <HealthOSNutritionQuickActions
            onAddToCalendar={actions.addToCalendar}
            onAddWater={actions.addWater}
            onAskAI={actions.askAI}
            onGroceryList={actions.openGroceryList}
            onImportRecipe={actions.importRecipe}
            onLogMeal={actions.logMeal}
            onPlanMeal={actions.planMeal}
            onScanLabel={actions.scanLabel}
          />
          <HealthOSMealTimeline
            onAddMeal={actions.logMeal}
            onAddToCalendar={actions.addToCalendar}
            onAskAI={actions.askAI}
            onEditMeal={actions.editMeal}
            onOpenMeal={actions.openMeal}
            onShopping={actions.addIngredientsToShoppingList}
            sections={nutrition.mealTimeline}
          />
          <HealthOSMealPlanCards
            activePlan={nutrition.activeMealPlan}
            onActivatePlan={actions.activateMealPlan}
            onAddIngredients={actions.addIngredientsToShoppingList}
            onAskAI={actions.askAI}
            onSchedule={actions.addToCalendar}
            onShare={actions.shareMealPlan}
            suggestedPlans={nutrition.suggestedMealPlans}
          />
          <HealthOSNutritionScanImportCard
            onImportRecipe={actions.importRecipe}
            onScanFood={actions.scanLabel}
          />
          <HealthOSGroceryFoundationCard
            grocerySummary={nutrition.grocerySummary}
            onAddIngredients={actions.addIngredientsToShoppingList}
            onImportReceipt={actions.scanLabel}
            onViewShopping={actions.openGroceryList}
          />
          <HealthOSDietGoalsSection
            goals={nutrition.dietPreferences}
            onManageGoals={actions.planMeal}
          />
          <HealthOSNutritionCautionsCard
            cautions={nutrition.nutritionCautions}
            onAskAI={actions.askAI}
            onReview={actions.reviewCaution}
          />
          <HealthOSNutritionContentSection
            items={nutrition.contentPreview}
            onOpenSource={actions.openContentSource}
          />
          <HealthOSNutritionCalendarSharingCard
            onAddMealsToCalendar={actions.addToCalendar}
            onShareMealPlan={actions.shareMealPlan}
            onViewCalendar={actions.addToCalendar}
          />
        </View>
      </ScrollView>
      <HealthOSMealDetailSheet
        meal={selectedMeal}
        onAddIngredients={actions.addIngredientsToShoppingList}
        onAskAI={actions.askAI}
        onClose={() => setSelectedMeal(null)}
        onEdit={() => actions.editMeal(selectedMeal ?? undefined)}
        onSaveFavorite={actions.saveFavorite}
        onSchedule={actions.addToCalendar}
      />
    </HealthOSAppShell>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    gap: healthOSSpacing.lg,
    maxWidth: healthOSLayout.screenMaxWidth,
    paddingHorizontal: healthOSSafeArea.screenHorizontal,
    width: "100%",
  },
  scrollContent: {
    paddingBottom: healthOSSafeArea.bottomNavSpace + healthOSSpacing.xl,
  },
});
