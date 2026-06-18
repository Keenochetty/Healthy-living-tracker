import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { HEALTHOS_AI_IMPORT_TARGETS, type HealthOSAIImportEnvelope, type HealthOSAIImportTarget } from "@/features/aiImport";

import { AIImportText, aiImportStyles } from "./HealthOSAIImportShared";

type Props = {
  envelope: HealthOSAIImportEnvelope | null;
  onSelect: (target: HealthOSAIImportTarget) => void;
  selectedTarget: HealthOSAIImportTarget;
};

export function HealthOSAIImportTargetPicker({ envelope, onSelect, selectedTarget }: Props) {
  const allowed = envelope
    ? HEALTHOS_AI_IMPORT_TARGETS.filter((target) => target.allowedImportTypes.includes(envelope.detectedType))
    : [];
  const sorted = [...allowed].sort((left, right) => {
    const leftSuggested = envelope?.suggestedTargets.includes(left.key) ? 0 : 1;
    const rightSuggested = envelope?.suggestedTargets.includes(right.key) ? 0 : 1;
    return leftSuggested - rightSuggested;
  });
  return (
    <HealthOSCard title="Import target" subtitle="Suggested targets first. Every target requires review.">
      <View style={aiImportStyles.row}>
        {sorted.length ? (
          <View style={aiImportStyles.actions}>
            {sorted.map((target) => (
              <HealthOSPill
                key={target.key}
                label={`${target.label}${target.sensitive ? " - sensitive" : ""}`}
                onPress={() => onSelect(target.key)}
                selected={selectedTarget === target.key}
                size="sm"
                variant={target.sensitive ? "warning" : "glass"}
              />
            ))}
          </View>
        ) : (
          <AIImportText muted>No safe import target is available for this payload.</AIImportText>
        )}
      </View>
    </HealthOSCard>
  );
}
