import { HealthOSBabyChildSummaryCard } from "./HealthOSBabyChildSummaryCard";
import type { HealthOSBabyChildData } from "./HealthOSBabyChildTypes";

type Props = {
  onAddMilestone: () => void;
  summary: HealthOSBabyChildData["milestoneSummary"];
};

export function HealthOSMilestoneTrackerCard({ onAddMilestone, summary }: Props) {
  const latest = summary.logs[0];
  return (
    <HealthOSBabyChildSummaryCard
      actionLabel="Add milestone"
      metrics={[
        { label: "Status", value: summary.status },
        { label: "Observed", value: `${summary.observedCount}` },
        { label: "Tracked", value: `${summary.totalCount}` },
        { label: "Latest", value: latest?.title ?? "No milestone" },
      ]}
      onAction={onAddMilestone}
      safetyNote="Milestones are guidance, not diagnosis. Discuss concerns with a healthcare professional."
      title="Milestone tracker"
    />
  );
}
