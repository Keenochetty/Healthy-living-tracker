import { useState } from "react";

import { HealthOSGlassMenu } from "@/components/healthos/HealthOSGlassMenu";
import { HealthOSSectionHeader } from "@/components/healthos/HealthOSSectionHeader";

import { HealthOSMealTimelineSection } from "./HealthOSMealTimelineSection";
import type { HealthOSMealDisplay, HealthOSMealTimelineSectionDisplay } from "./HealthOSNutritionTypes";

type HealthOSMealTimelineProps = {
  sections: HealthOSMealTimelineSectionDisplay[];
  onAddMeal: () => void;
  onAddToCalendar: () => void;
  onAskAI: () => void;
  onEditMeal: (meal?: HealthOSMealDisplay) => void;
  onOpenMeal: (meal: HealthOSMealDisplay) => void;
  onShopping: () => void;
};

export function HealthOSMealTimeline({
  onAddMeal,
  onAddToCalendar,
  onAskAI,
  onEditMeal,
  onOpenMeal,
  onShopping,
  sections,
}: HealthOSMealTimelineProps) {
  const [menuMeal, setMenuMeal] = useState<HealthOSMealDisplay | null>(null);

  return (
    <>
      <HealthOSSectionHeader
        actionLabel="Add"
        onAction={onAddMeal}
        subtitle="Today meals, ordered by meal type."
        title="Meal timeline"
      />
      {sections.map((section) => (
        <HealthOSMealTimelineSection
          key={section.key}
          onAddMeal={onAddMeal}
          onMealLongPress={setMenuMeal}
          onMealPress={onOpenMeal}
          section={section}
        />
      ))}
      <HealthOSGlassMenu
        items={[
          { key: "view", label: "View details", onPress: () => menuMeal && onOpenMeal(menuMeal) },
          { key: "edit", label: "Edit meal", onPress: () => onEditMeal(menuMeal ?? undefined) },
          { key: "calendar", label: "Add to calendar", onPress: onAddToCalendar },
          { key: "shopping", label: "Add ingredients to shopping list", onPress: onShopping },
          { key: "ai", label: "Ask AI about this meal", onPress: onAskAI },
          {
            destructive: true,
            disabled: true,
            key: "remove",
            label: "Remove meal",
            subtitle: "Disabled in this UI foundation pass.",
          },
        ]}
        mode="menu"
        onClose={() => setMenuMeal(null)}
        visible={Boolean(menuMeal)}
      />
    </>
  );
}
