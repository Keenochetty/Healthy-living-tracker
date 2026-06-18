import { HealthOSBabyChildSummaryCard } from "./HealthOSBabyChildSummaryCard";
import type { HealthOSBabyChildData } from "./HealthOSBabyChildTypes";

type Props = {
  caregiverNotes: HealthOSBabyChildData["caregiverNotes"];
  onContactCaregiver: () => void;
};

export function HealthOSCaregiverNotesCard({ caregiverNotes, onContactCaregiver }: Props) {
  return (
    <HealthOSBabyChildSummaryCard
      actionLabel="Open family"
      metrics={[
        { label: "Shared notes", value: `${caregiverNotes.count}` },
        { label: "Status", value: caregiverNotes.status },
      ]}
      onAction={onContactCaregiver}
      safetyNote="Only shared caregiver notes should appear here."
      title="Caregiver notes"
    />
  );
}
