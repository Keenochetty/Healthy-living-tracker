import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import type { HealthOSAISafetySummary } from "@/features/aiImport";

import { AIImportText, aiImportStyles } from "./HealthOSAIImportShared";

type Props = {
  safety?: HealthOSAISafetySummary;
};

export function HealthOSImportSafetyNotice({ safety }: Props) {
  const notes = safety?.safetyNotes.length
    ? safety.safetyNotes
    : ["Review extracted information before saving.", "AI extraction can make mistakes.", "This does not replace medical advice."];
  return (
    <HealthOSCard title="Safety notice" variant="danger">
      <View style={aiImportStyles.row}>
        {notes.map((note) => (
          <AIImportText key={note} muted>{note}</AIImportText>
        ))}
        <AIImportText muted>Auto-save is disabled for AI imports.</AIImportText>
      </View>
    </HealthOSCard>
  );
}
