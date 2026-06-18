import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";

import type { HealthOSMedicationData } from "./HealthOSMedicationTypes";
import { EmptyState, MedicationAction, MedicationText, medicationSharedStyles } from "./HealthOSMedicationShared";

type Props = {
  documents: HealthOSMedicationData["documents"];
  onOpenRecords: () => void;
  onScan: () => void;
};

export function HealthOSMedicationRecordsCard({ documents, onOpenRecords, onScan }: Props) {
  return (
    <HealthOSCard title="Records" subtitle="Prescriptions, labels, doctor notes, and pharmacy notes.">
      <View style={medicationSharedStyles.row}>
        {documents.length ? (
          documents.slice(0, 3).map((document) => (
            <MedicationText key={document.id} muted>
              {document.title}
            </MedicationText>
          ))
        ) : (
          <EmptyState text="No medication or supplement records are linked yet." />
        )}
        <View style={medicationSharedStyles.actions}>
          <MedicationAction label="Open records" onPress={onOpenRecords} variant="realm" />
          <MedicationAction label="Scan record" onPress={onScan} />
        </View>
      </View>
    </HealthOSCard>
  );
}
