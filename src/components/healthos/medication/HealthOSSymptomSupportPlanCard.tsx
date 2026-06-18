import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";

import { MedicationAction, MedicationText, medicationSharedStyles } from "./HealthOSMedicationShared";

type Props = {
  onLogSideEffect: () => void;
  status: string;
};

export function HealthOSSymptomSupportPlanCard({ onLogSideEffect, status }: Props) {
  return (
    <HealthOSCard title="Symptom support planning" subtitle="Notes to discuss with a professional.">
      <View style={medicationSharedStyles.row}>
        <MedicationText muted>{status}</MedicationText>
        <MedicationText muted>
          This section does not recommend dose changes, stopping medication, or treatment decisions.
        </MedicationText>
        <MedicationAction label="Add note" onPress={onLogSideEffect} />
      </View>
    </HealthOSCard>
  );
}
