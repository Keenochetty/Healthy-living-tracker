import { Linking } from "react-native";
import { type Href, router } from "expo-router";

import type { HealthOSMealDisplay, HealthOSMealPlanDisplay, HealthOSNutritionCaution } from "./HealthOSNutritionTypes";

export function useHealthOSNutritionActions({
  onOpenMeal,
}: {
  onOpenMeal?: (meal: HealthOSMealDisplay) => void;
} = {}) {
  function go(route: Href) {
    router.push(route);
  }

  return {
    activateMealPlan(_plan?: HealthOSMealPlanDisplay) {
      go("/food/smart-log" as Href);
    },
    addIngredientsToShoppingList() {
      go("/food/recipe" as Href);
    },
    addToCalendar() {
      go("/(tabs)/calendar");
    },
    addWater() {
      go({ pathname: "/(tabs)/food", params: { tab: "water" } } as Href);
    },
    askAI() {
      go("/ai" as Href);
    },
    editMeal(meal?: HealthOSMealDisplay) {
      if (meal?.rawEntry.sourceRefId) {
        go(`/food/library-item?type=recipe&id=${meal.rawEntry.sourceRefId}` as Href);
        return;
      }
      go({ pathname: "/(tabs)/food", params: { tab: "diary" } } as Href);
    },
    importRecipe() {
      go("/food/smart-log" as Href);
    },
    logMeal() {
      go({ pathname: "/(tabs)/food", params: { tab: "add" } } as Href);
    },
    openContentSource(sourceUrl: string) {
      void Linking.openURL(sourceUrl);
    },
    openGroceryList() {
      go("/food/recipe" as Href);
    },
    openMeal(meal: HealthOSMealDisplay) {
      onOpenMeal?.(meal);
    },
    planMeal() {
      go("/food/recipe" as Href);
    },
    reviewCaution(_caution?: HealthOSNutritionCaution) {
      go("/ai" as Href);
    },
    saveFavorite() {
      go("/food/saved-meal" as Href);
    },
    scanLabel() {
      go("/food/barcode-scanner" as Href);
    },
    shareMealPlan() {
      go("/(tabs)/circle");
    },
  };
}
