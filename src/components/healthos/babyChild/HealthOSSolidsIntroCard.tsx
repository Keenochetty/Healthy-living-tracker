import { HealthOSBabyChildSummaryCard } from "./HealthOSBabyChildSummaryCard";
import type { HealthOSBabyChildData } from "./HealthOSBabyChildTypes";

type Props = {
  onAddFood: () => void;
  onOpenNutrition: () => void;
  summary: HealthOSBabyChildData["solidsSummary"];
};

export function HealthOSSolidsIntroCard({ onAddFood, onOpenNutrition, summary }: Props) {
  const latest = summary.logs[0];
  return (
    <HealthOSBabyChildSummaryCard
      actionLabel={latest ? "Open Nutrition" : "Add food"}
      metrics={[
        { label: "Status", value: summary.status },
        { label: "Foods tried", value: `${summary.triedCount}` },
        { label: "Reaction notes", value: `${summary.reactionCount}` },
        { label: "Latest", value: latest?.foodName ?? "No food logged" },
      ]}
      onAction={latest ? onOpenNutrition : onAddFood}
      safetyNote="Discuss allergy concerns with a healthcare professional."
      title="Solids and food introduction"
    />
  );
}
