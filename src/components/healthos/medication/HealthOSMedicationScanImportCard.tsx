import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";

import { MedicationAction, MedicationText, medicationSharedStyles } from "./HealthOSMedicationShared";

type Props = {
  onOpenExtractionReview: () => void;
  onScan: () => void;
  status: string;
};

export function HealthOSMedicationScanImportCard({ onOpenExtractionReview, onScan, status }: Props) {
  return (
    <HealthOSCard title="Scan / import" subtitle="Labels, prescriptions, doctor notes, and pharmacy notes.">
      <View style={medicationSharedStyles.row}>
        <MedicationText muted>{status}</MedicationText>
        <MedicationText muted>
          Extracted text becomes an import preview. Nothing is saved or scheduled until the user confirms.
        </MedicationText>
        <View style={medicationSharedStyles.actions}>
          <MedicationAction label="Scan document" onPress={onScan} variant="realm" />
          <MedicationAction label="Review extraction" onPress={onOpenExtractionReview} />
        </View>
      </View>
    </HealthOSCard>
  );
}
