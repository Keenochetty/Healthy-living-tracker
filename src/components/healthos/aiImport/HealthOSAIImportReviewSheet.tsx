import { Modal, ScrollView, StyleSheet, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { healthOSSpacing } from "@/theme/healthos";
import type { HealthOSAIImportEnvelope } from "@/features/aiImport";

import { HealthOSAIImportFieldReviewList } from "./HealthOSAIImportFieldReviewList";
import { HealthOSAIImportHeader } from "./HealthOSAIImportHeader";
import { HealthOSAIImportTargetPicker } from "./HealthOSAIImportTargetPicker";
import { HealthOSImportActionBar } from "./HealthOSImportActionBar";
import { HealthOSImportSafetyNotice } from "./HealthOSImportSafetyNotice";
import { HealthOSImportWarningsCard } from "./HealthOSImportWarningsCard";
import { HealthOSMissingFieldsCard } from "./HealthOSMissingFieldsCard";
import { HealthOSSourceEvidenceList } from "./HealthOSSourceEvidenceList";
import { AIImportAction, aiImportStyles } from "./HealthOSAIImportShared";
import { useHealthOSAIImportReview } from "./useHealthOSAIImportReview";

type Props = {
  envelope: HealthOSAIImportEnvelope | null;
  onClose: () => void;
  visible: boolean;
};

export function HealthOSAIImportReviewSheet({ envelope, onClose, visible }: Props) {
  const review = useHealthOSAIImportReview(envelope);
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <HealthOSCard title="AI Import Review" subtitle="Review before saving">
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={aiImportStyles.row}>
              <HealthOSAIImportHeader envelope={review.envelope} />
              <HealthOSImportWarningsCard warnings={review.warnings} />
              <HealthOSSourceEvidenceList envelope={review.envelope} />
              <HealthOSAIImportTargetPicker envelope={review.envelope} onSelect={review.setTarget} selectedTarget={review.selectedTarget} />
              <HealthOSMissingFieldsCard missingFields={review.missingFields} />
              <HealthOSAIImportFieldReviewList envelope={review.envelope} onConfirmField={review.confirmField} onRejectField={review.rejectField} />
              <HealthOSImportSafetyNotice safety={review.envelope?.safety} />
              <HealthOSImportActionBar
                blockingReasons={review.blockingReasons}
                canImport={review.canImport}
                onAddToCalendar={review.addToCalendar}
                onDiscard={review.discardImport}
                onImport={review.importToTarget}
                onSaveToRecords={review.saveToRecords}
                selectedTarget={review.selectedTarget}
              />
              <AIImportAction label="Close" onPress={onClose} variant="realm" />
            </View>
          </ScrollView>
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
