import { HealthOSBabyChildSummaryCard } from "./HealthOSBabyChildSummaryCard";
import type { HealthOSBabyChildData } from "./HealthOSBabyChildTypes";

type Props = {
  onAddGrowth: () => void;
  summary: HealthOSBabyChildData["growthSummary"];
};

export function HealthOSGrowthChartCard({ onAddGrowth, summary }: Props) {
  return (
    <HealthOSBabyChildSummaryCard
      actionLabel="Add growth"
      metrics={[
        { label: "Status", value: summary.status },
        { label: "Weight", value: summary.latest?.weight ? `${summary.latest.weight} ${summary.latest.weightUnit}` : "No weight" },
        { label: "Length / height", value: summary.latest?.height ? `${summary.latest.height} ${summary.latest.heightUnit}` : "No height" },
        { label: "Head", value: summary.latest?.headCircumference ? `${summary.latest.headCircumference} ${summary.latest.headCircumferenceUnit}` : "No head measurement" },
      ]}
      onAction={onAddGrowth}
      safetyNote={summary.sourceStatus}
      subtitle="Growth trends only. No fake percentiles."
      title="Growth chart foundation"
    />
  );
}
