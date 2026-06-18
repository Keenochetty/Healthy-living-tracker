import { HealthOSBabyChildSummaryCard } from "./HealthOSBabyChildSummaryCard";
import type { HealthOSBabyChildData } from "./HealthOSBabyChildTypes";

type Props = {
  onPrimaryAction: () => void;
  summary: HealthOSBabyChildData["todaySummary"];
};

export function HealthOSChildTodaySummary({ onPrimaryAction, summary }: Props) {
  return (
    <HealthOSBabyChildSummaryCard
      actionLabel="Quick log"
      metrics={[
        { label: "Last feed", value: summary.lastFeed },
        { label: "Last sleep", value: summary.lastSleep },
        { label: "Last diaper", value: summary.lastDiaper },
        { label: "Medication", value: summary.medicationDue },
        { label: "Vaccine / appointment", value: summary.vaccineOrAppointment },
        { label: "Caregiver", value: summary.caregiverUpdate },
      ]}
      onAction={onPrimaryAction}
      subtitle="What needs attention today, based only on saved logs."
      title="Today care summary"
    />
  );
}
