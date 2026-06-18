import { HealthOSBabyChildSummaryCard } from "./HealthOSBabyChildSummaryCard";
import type { HealthOSBabyChildData } from "./HealthOSBabyChildTypes";

type Props = {
  onAddSleep: () => void;
  summary: HealthOSBabyChildData["sleepSummary"];
};

export function HealthOSSleepTrackerCard({ onAddSleep, summary }: Props) {
  return (
    <HealthOSBabyChildSummaryCard
      actionLabel="Add sleep"
      metrics={[
        { label: "Status", value: summary.status },
        { label: "Naps today", value: `${summary.napCount}` },
        { label: "Total today", value: summary.totalMinutes ? `${Math.round(summary.totalMinutes / 60 * 10) / 10}h` : "No total" },
        { label: "Latest type", value: summary.latest?.sleepType ?? "No sleep" },
      ]}
      onAction={onAddSleep}
      subtitle="Sleep logs will appear when saved."
      title="Sleep tracker"
    />
  );
}
