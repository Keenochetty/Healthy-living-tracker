import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";

import type { HealthOSMedicationData } from "./HealthOSMedicationTypes";
import { EmptyState, MedicationAction, MedicationText, medicationSharedStyles } from "./HealthOSMedicationShared";

type Props = {
  onOpenRecords: () => void;
  refillSummary: HealthOSMedicationData["refillSummary"];
};

export function HealthOSRefillReminderCard({ onOpenRecords, refillSummary }: Props) {
  return (
    <HealthOSCard title="Refill reminders" subtitle="No refill dates are inferred.">
      <View style={medicationSharedStyles.row}>
        {refillSummary.items.length ? (
          refillSummary.items.map((item) => <MedicationText key={item.id}>{`${item.name}: ${item.status}`}</MedicationText>)
        ) : (
          <EmptyState text={refillSummary.status} />
        )}
        <MedicationAction label="Open records" onPress={onOpenRecords} />
      </View>
    </HealthOSCard>
  );
}
