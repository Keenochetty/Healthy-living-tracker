import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import type { HealthOSAIImportEnvelope, HealthOSAIImportTarget } from "@/features/aiImport";

import { AIImportText, aiImportStyles } from "./HealthOSAIImportShared";

type Props = {
  envelope: HealthOSAIImportEnvelope | null;
  selectedTarget: HealthOSAIImportTarget;
};

export function HealthOSImportHistoryCard({ envelope, selectedTarget }: Props) {
  return (
    <HealthOSCard title="Import history" subtitle="Foundation only.">
      <View style={aiImportStyles.row}>
        {envelope ? (
          <>
            <AIImportText muted>{`Created: ${new Date(envelope.createdAt).toLocaleString()}`}</AIImportText>
            <AIImportText muted>{`Source: ${envelope.source.sourceType}`}</AIImportText>
            <AIImportText muted>{`Target: ${selectedTarget}`}</AIImportText>
          </>
        ) : (
          <AIImportText muted>No import history is available yet.</AIImportText>
        )}
      </View>
    </HealthOSCard>
  );
}
