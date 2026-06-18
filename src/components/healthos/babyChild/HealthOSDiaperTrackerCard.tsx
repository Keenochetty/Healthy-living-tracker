import { HealthOSBabyChildSummaryCard } from "./HealthOSBabyChildSummaryCard";
import type { HealthOSBabyChildData } from "./HealthOSBabyChildTypes";

type Props = {
  onAddDiaper: () => void;
  summary: HealthOSBabyChildData["diaperSummary"];
};

export function HealthOSDiaperTrackerCard({ onAddDiaper, summary }: Props) {
  return (
    <HealthOSBabyChildSummaryCard
      actionLabel="Add diaper"
      metrics={[
        { label: "Status", value: summary.status },
        { label: "Today", value: `${summary.countToday}` },
        { label: "Latest", value: summary.latest?.diaperType ?? "No diaper" },
        { label: "Concern note", value: summary.latest?.notes ?? "None" },
      ]}
      onAction={onAddDiaper}
      safetyNote="Diaper logs are tracking notes only and do not infer health issues."
      title="Diaper tracker"
    />
  );
}
