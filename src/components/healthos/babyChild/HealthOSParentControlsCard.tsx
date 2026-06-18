import { HealthOSBabyChildSummaryCard } from "./HealthOSBabyChildSummaryCard";
import type { HealthOSBabyChildData } from "./HealthOSBabyChildTypes";

type Props = {
  onManage: () => void;
  parentControls: HealthOSBabyChildData["parentControls"];
};

export function HealthOSParentControlsCard({ onManage, parentControls }: Props) {
  return (
    <HealthOSBabyChildSummaryCard
      actionLabel="Manage permissions"
      metrics={[
        { label: "Current state", value: parentControls.controlState },
        { label: "Parent/guardian", value: "Controls input" },
        { label: "Teen participation", value: "Later foundation" },
        { label: "Adult ownership", value: "At 18 foundation" },
      ]}
      onAction={onManage}
      safetyNote={parentControls.status}
      title="Parent controls and age permissions"
    />
  );
}
