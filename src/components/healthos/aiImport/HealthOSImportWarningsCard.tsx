import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import type { HealthOSAIImportWarning } from "@/features/aiImport";

import { AIImportText, aiImportStyles } from "./HealthOSAIImportShared";

type Props = {
  warnings: HealthOSAIImportWarning[];
};

export function HealthOSImportWarningsCard({ warnings }: Props) {
  return (
    <HealthOSCard title="Warnings" subtitle="Warnings do not replace professional advice.">
      <View style={aiImportStyles.row}>
        {warnings.length ? (
          warnings.map((warning) => (
            <View key={warning.warningId} style={aiImportStyles.row}>
              <HealthOSPill label={warning.blocking ? "Blocking" : warning.severity} size="sm" variant={warning.severity === "danger" ? "danger" : warning.severity === "warning" ? "warning" : "default"} />
              <AIImportText strong>{warning.title}</AIImportText>
              <AIImportText muted>{warning.message}</AIImportText>
            </View>
          ))
        ) : (
          <AIImportText muted>No warnings were provided. Review is still required.</AIImportText>
        )}
      </View>
    </HealthOSCard>
  );
}
