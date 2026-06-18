import { HealthOSBabyChildSummaryCard } from "./HealthOSBabyChildSummaryCard";
import type { HealthOSBabyChildData } from "./HealthOSBabyChildTypes";

type Props = {
  onAddMedication: () => void;
  onLogSymptom: () => void;
  onLogTemperature: () => void;
  onScanScript: () => void;
  onUploadRecord: () => void;
  summary: HealthOSBabyChildData["medicationSymptomsSummary"];
};

export function HealthOSChildMedicationSymptomsCard({
  onAddMedication,
  onLogSymptom,
  onLogTemperature,
  onScanScript,
  onUploadRecord,
  summary,
}: Props) {
  return (
    <HealthOSBabyChildSummaryCard
      actionLabel="Add medication note"
      metrics={[
        { label: "Status", value: summary.status },
        { label: "Due", value: `${summary.medicineDueCount}` },
        { label: "Latest medicine", value: summary.recentMedicine?.medicineName ?? "No medicine note" },
        { label: "Temperature", value: summary.temperatureStatus },
      ]}
      onAction={onAddMedication || onLogSymptom || onLogTemperature || onScanScript || onUploadRecord}
      safetyNote="Do not use HealthOS for doses or diagnosis. Follow professional guidance."
      title="Medication, symptoms, and temperature"
    />
  );
}
