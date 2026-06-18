import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";

import type { HealthOSMedicationKind } from "./HealthOSMedicationTypes";
import { MedicationAction, medicationSharedStyles } from "./HealthOSMedicationShared";

type Props = {
  activeFocus: HealthOSMedicationKind;
  onAddItem: (kind: HealthOSMedicationKind) => void;
  onAskAI: () => void;
  onLogSideEffect: () => void;
  onOpenRecords: () => void;
  onScanLabel: () => void;
};

export function HealthOSMedicationQuickActions({
  activeFocus,
  onAddItem,
  onAskAI,
  onLogSideEffect,
  onOpenRecords,
  onScanLabel,
}: Props) {
  return (
    <HealthOSCard title="Quick actions" variant="compact">
      <View style={medicationSharedStyles.actions}>
        <MedicationAction label={`Add ${activeFocus}`} onPress={() => onAddItem(activeFocus)} variant="realm" />
        <MedicationAction label="Scan label" onPress={onScanLabel} />
        <MedicationAction label="Log side effect" onPress={onLogSideEffect} />
        <MedicationAction label="Records" onPress={onOpenRecords} />
        <MedicationAction label="Ask AI" onPress={onAskAI} variant="ai" />
      </View>
    </HealthOSCard>
  );
}
