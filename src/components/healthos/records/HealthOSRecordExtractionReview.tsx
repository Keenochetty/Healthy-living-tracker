import { Modal, StyleSheet, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { healthOSSpacing } from "@/theme/healthos";

import type { HealthOSRecordDisplay } from "./HealthOSRecordsTypes";
import { RecordsAction, RecordsText, recordsSharedStyles } from "./HealthOSRecordsShared";

type Props = {
  onClose: () => void;
  onSavePreview: () => void;
  record: HealthOSRecordDisplay | null;
  visible: boolean;
};

export function HealthOSRecordExtractionReview({ onClose, onSavePreview, record, visible }: Props) {
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <HealthOSCard title="Extraction review" subtitle={record?.title ?? "No record selected"}>
          <View style={recordsSharedStyles.row}>
            <RecordsText muted>
              Review extracted information before saving. AI extraction can make mistakes. This does not replace medical advice.
            </RecordsText>
            <RecordsText muted>{reviewFields(record)}</RecordsText>
            <View style={recordsSharedStyles.actions}>
              <RecordsAction label="Save reviewed preview" onPress={onSavePreview} variant="ai" />
              <RecordsAction label="Close" onPress={onClose} />
            </View>
          </View>
        </HealthOSCard>
      </View>
    </Modal>
  );
}

function reviewFields(record: HealthOSRecordDisplay | null) {
  if (!record) return "Select a scanned or uploaded record to review extracted fields.";
  if (record.category === "prescription" || record.category === "medicationLabel") {
    return "Medication/script fields: name, strength, dose instructions, frequency, provider, refill info.";
  }
  if (record.category === "vaccineCard") return "Vaccine fields: vaccine name, date, provider, next due only if confirmed.";
  if (record.category === "labReport") return "Lab fields: report name, date, provider, key notes only. No diagnostic interpretation.";
  if (record.category === "pregnancy") return "Pregnancy fields: appointment, scan report, doctor note, due date only if confirmed.";
  if (record.category === "babyChild") return "Baby/child fields: vaccine card, growth report, doctor note, prescription.";
  return "General note fields: date, provider, summary, follow-up reminder.";
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: healthOSSpacing.lg,
  },
});
