import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";

import type { HealthOSMedicationData } from "./HealthOSMedicationTypes";
import { EmptyState, MedicationAction, MedicationText, medicationSharedStyles } from "./HealthOSMedicationShared";

type Props = {
  notes: HealthOSMedicationData["missedAndSideEffects"];
  onLogSideEffect: () => void;
};

export function HealthOSMissedSideEffectNotesCard({ notes, onLogSideEffect }: Props) {
  return (
    <HealthOSCard title="Missed / side-effect notes" subtitle="User-entered notes for review.">
      <View style={medicationSharedStyles.row}>
        {notes.latestNotes.length ? (
          notes.latestNotes.map((note) => (
            <MedicationText key={note.id} muted>
              {"status" in note
                ? `${note.status}${note.sideEffectNote ? ` - ${note.sideEffectNote}` : ""}`
                : note.note}
            </MedicationText>
          ))
        ) : (
          <EmptyState text={notes.status} />
        )}
        <MedicationAction label="Log note" onPress={onLogSideEffect} variant="warning" />
      </View>
    </HealthOSCard>
  );
}
