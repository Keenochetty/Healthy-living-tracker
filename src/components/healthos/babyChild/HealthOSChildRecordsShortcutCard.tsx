import { HealthOSBabyChildSummaryCard } from "./HealthOSBabyChildSummaryCard";
import type { HealthOSBabyChildData } from "./HealthOSBabyChildTypes";

type Props = {
  onOpenRecords: () => void;
  onScanDocument: () => void;
  onUploadFile: () => void;
  recordsSummary: HealthOSBabyChildData["recordsSummary"];
};

export function HealthOSChildRecordsShortcutCard({ onOpenRecords, onScanDocument, onUploadFile, recordsSummary }: Props) {
  return (
    <HealthOSBabyChildSummaryCard
      actionLabel="Open Records"
      metrics={[
        { label: "Status", value: recordsSummary.status },
        { label: "Shortcuts", value: "Vaccine cards, doctor notes, prescriptions, growth reports" },
      ]}
      onAction={onOpenRecords || onScanDocument || onUploadFile}
      title="Records shortcut"
    />
  );
}
