import { HealthOSBabyChildSummaryCard } from "./HealthOSBabyChildSummaryCard";
import type { HealthOSBabyChildData } from "./HealthOSBabyChildTypes";

type Props = {
  onAddReminder: () => void;
  onScanCard: () => void;
  timeline: HealthOSBabyChildData["vaccineTimeline"];
};

export function HealthOSVaccineTimelineCard({ onAddReminder, onScanCard, timeline }: Props) {
  const next = timeline.records.find((record) => record.scheduledDate || record.nextDoseDate);
  return (
    <HealthOSBabyChildSummaryCard
      actionLabel="Scan vaccine card"
      metrics={[
        { label: "Status", value: timeline.status },
        { label: "Records", value: `${timeline.records.length}` },
        { label: "Next", value: next?.vaccineName ?? "No provider schedule" },
        { label: "Source", value: next?.recordSource ?? "Provider/source pending" },
      ]}
      onAction={onScanCard || onAddReminder}
      safetyNote="Confirm vaccine schedules with your healthcare provider. No universal schedule is hardcoded."
      title="Vaccine and reminder timeline"
    />
  );
}
