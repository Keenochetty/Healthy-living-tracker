import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";

import { MedicationAction, MedicationText, medicationSharedStyles } from "./HealthOSMedicationShared";

type Props = {
  onManageSharing: () => void;
  status: string;
};

export function HealthOSMedicationSharingCard({ onManageSharing, status }: Props) {
  return (
    <HealthOSCard title="Sharing" subtitle="Private by default.">
      <View style={medicationSharedStyles.row}>
        <MedicationText muted>{status}</MedicationText>
        <MedicationText muted>Caregiver, partner, or family access must be explicitly enabled by the user.</MedicationText>
        <MedicationAction label="Manage sharing" onPress={onManageSharing} variant="realm" />
      </View>
    </HealthOSCard>
  );
}
