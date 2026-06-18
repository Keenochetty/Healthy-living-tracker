import { Modal, StyleSheet, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { healthOSSpacing } from "@/theme/healthos";

import type { HealthOSMedicationDisplayItem } from "./HealthOSMedicationTypes";
import { MedicationAction, MedicationText, medicationSharedStyles } from "./HealthOSMedicationShared";

type Props = {
  item: HealthOSMedicationDisplayItem | null;
  onClose: () => void;
  onOpenRecords: () => void;
  onOpenSharing: () => void;
};

export function HealthOSMedicationDetailSheet({ item, onClose, onOpenRecords, onOpenSharing }: Props) {
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={Boolean(item)}>
      <View style={styles.overlay}>
        <HealthOSCard title={item?.name ?? "Details"} subtitle={item ? item.kind : undefined}>
          {item ? (
            <View style={medicationSharedStyles.row}>
              <MedicationText muted>{`Status: ${item.status}`}</MedicationText>
              <MedicationText muted>{`Privacy: ${item.privacyStatus}`}</MedicationText>
              <MedicationText muted>{`Source: ${item.source}`}</MedicationText>
              {item.doseText ? <MedicationText muted>{`Saved amount: ${item.doseText}`}</MedicationText> : null}
              {item.instructions ? <MedicationText muted>{item.instructions}</MedicationText> : null}
              <View style={medicationSharedStyles.actions}>
                <MedicationAction label="Records" onPress={onOpenRecords} />
                <MedicationAction label="Sharing" onPress={onOpenSharing} />
                <MedicationAction label="Close" onPress={onClose} variant="realm" />
              </View>
            </View>
          ) : null}
        </HealthOSCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: healthOSSpacing.lg,
  },
});
