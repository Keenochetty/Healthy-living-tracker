import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";

import { MedicationAction, MedicationText, medicationSharedStyles } from "./HealthOSMedicationShared";

type Props = {
  onOpenCalendar: () => void;
  status: string;
};

export function HealthOSMedicationCalendarCard({ onOpenCalendar, status }: Props) {
  return (
    <HealthOSCard title="Calendar" subtitle="Reminders are added only after confirmation.">
      <View style={medicationSharedStyles.row}>
        <MedicationText muted>{status}</MedicationText>
        <MedicationAction label="Open calendar" onPress={onOpenCalendar} />
      </View>
    </HealthOSCard>
  );
}
