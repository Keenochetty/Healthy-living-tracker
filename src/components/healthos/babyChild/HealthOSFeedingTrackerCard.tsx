import { HealthOSBabyChildSummaryCard } from "./HealthOSBabyChildSummaryCard";
import type { HealthOSBabyChildData } from "./HealthOSBabyChildTypes";

type Props = {
  onAddFeed: () => void;
  summary: HealthOSBabyChildData["feedingSummary"];
};

export function HealthOSFeedingTrackerCard({ onAddFeed, summary }: Props) {
  return (
    <HealthOSBabyChildSummaryCard
      actionLabel="Add feed"
      metrics={[
        { label: "Status", value: summary.status },
        { label: "Feeds today", value: `${summary.countToday}` },
        { label: "Amount logged", value: summary.totalAmountMl ? `${summary.totalAmountMl} ml` : "No amount" },
        { label: "Feeding type", value: summary.latest?.feedingType ?? summary.latest?.feedType ?? "No feed" },
      ]}
      onAction={onAddFeed}
      safetyNote="Support breast, formula, mixed, pumped, bottle, and solids without judgement."
      subtitle="Feeding needs vary by baby."
      title="Feeding tracker"
    />
  );
}
