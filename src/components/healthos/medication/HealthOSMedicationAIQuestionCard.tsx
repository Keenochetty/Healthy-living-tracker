import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";

import { MedicationAction, MedicationText, medicationSharedStyles } from "./HealthOSMedicationShared";

type Props = {
  onAskAI: () => void;
};

export function HealthOSMedicationAIQuestionCard({ onAskAI }: Props) {
  return (
    <HealthOSCard title="Ask HealthSync AI" subtitle="Organization help, not medical advice." variant="ai">
      <View style={medicationSharedStyles.row}>
        <MedicationText muted>
          Ask about where to add records, how to organize a medication list, or how to prepare questions for a pharmacist or doctor.
        </MedicationText>
        <MedicationAction label="Ask AI" onPress={onAskAI} variant="ai" />
      </View>
    </HealthOSCard>
  );
}
