import { Modal, StyleSheet, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { healthOSSpacing } from "@/theme/healthos";

import { MedicationAction, MedicationText, medicationSharedStyles } from "./HealthOSMedicationShared";

type Props = {
  onClose: () => void;
  onSavePreview: () => void;
  status: string;
  visible: boolean;
};

export function HealthOSMedicationExtractionReview({ onClose, onSavePreview, status, visible }: Props) {
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <HealthOSCard title="Import preview" subtitle="Review before saving">
          <View style={medicationSharedStyles.row}>
            <MedicationText muted>{status}</MedicationText>
            <MedicationText muted>
              Confirm name, instructions, schedule, dose, source, and privacy before creating any item.
            </MedicationText>
            <View style={medicationSharedStyles.actions}>
              <MedicationAction label="Create preview" onPress={onSavePreview} variant="realm" />
              <MedicationAction label="Close" onPress={onClose} />
            </View>
          </View>
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
