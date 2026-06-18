import { HealthOSBabyChildSummaryCard } from "./HealthOSBabyChildSummaryCard";
import type { HealthOSBabyChildData } from "./HealthOSBabyChildTypes";

type Props = {
  familySharing: HealthOSBabyChildData["familySharing"];
  onManageSharing: () => void;
};

export function HealthOSChildFamilySharingCard({ familySharing, onManageSharing }: Props) {
  return (
    <HealthOSBabyChildSummaryCard
      actionLabel="Manage sharing"
      metrics={[
        { label: "Shared with family", value: `${familySharing.sharedCount}` },
        { label: "Status", value: familySharing.status },
      ]}
      onAction={onManageSharing}
      safetyNote="No automatic sharing. You choose what family can see."
      title="Family sharing"
    />
  );
}
