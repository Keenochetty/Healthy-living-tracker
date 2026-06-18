import { Linking, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import type { HealthOSAIImportEnvelope } from "@/features/aiImport";

import { AIImportAction, AIImportText, aiImportStyles } from "./HealthOSAIImportShared";

type Props = {
  envelope: HealthOSAIImportEnvelope | null;
};

export function HealthOSSourceEvidenceList({ envelope }: Props) {
  return (
    <HealthOSCard title="Source evidence" subtitle="Evidence is shown without exposing storage paths.">
      <View style={aiImportStyles.row}>
        {envelope ? (
          <>
            <AIImportText muted>
              {[envelope.source.fileName, envelope.source.mimeType, envelope.source.sourceName]
                .filter(Boolean)
                .join(" - ") || `Source type: ${envelope.source.sourceType}`}
            </AIImportText>
            {envelope.evidence.length ? (
              envelope.evidence.map((evidence) => (
                <View key={evidence.evidenceId} style={aiImportStyles.row}>
                  <View style={aiImportStyles.actions}>
                    <HealthOSPill label={evidence.kind === "model_inference" ? "AI inferred" : evidence.kind} size="sm" variant={evidence.kind === "model_inference" ? "warning" : "glass"} />
                    {evidence.confidence !== undefined ? <HealthOSPill label={`${Math.round(evidence.confidence * 100)}%`} size="sm" /> : null}
                  </View>
                  {evidence.text ? <AIImportText muted>{evidence.text}</AIImportText> : null}
                  {evidence.sourceUrl ? <AIImportAction label={evidence.sourceName ?? "Open source"} onPress={() => void Linking.openURL(evidence.sourceUrl!)} /> : null}
                </View>
              ))
            ) : (
              <AIImportText muted>No source evidence is attached.</AIImportText>
            )}
          </>
        ) : (
          <AIImportText muted>No source is available yet.</AIImportText>
        )}
      </View>
    </HealthOSCard>
  );
}
