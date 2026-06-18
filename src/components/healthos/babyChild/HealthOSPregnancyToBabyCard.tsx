import { HealthOSBabyChildSummaryCard } from "./HealthOSBabyChildSummaryCard";
import type { HealthOSBabyChildData } from "./HealthOSBabyChildTypes";

type Props = {
  onCreateFromPregnancy: () => void;
  pregnancyConnection: HealthOSBabyChildData["pregnancyConnection"];
};

export function HealthOSPregnancyToBabyCard({ onCreateFromPregnancy, pregnancyConnection }: Props) {
  return (
    <HealthOSBabyChildSummaryCard
      actionLabel="Open pregnancy"
      metrics={[
        { label: "Status", value: pregnancyConnection.status },
        { label: "Due date", value: pregnancyConnection.dueDate ?? "No due date connected" },
        { label: "Gender", value: "Unknown / update later supported" },
      ]}
      onAction={onCreateFromPregnancy}
      title="Pregnancy to baby profile"
    />
  );
}
