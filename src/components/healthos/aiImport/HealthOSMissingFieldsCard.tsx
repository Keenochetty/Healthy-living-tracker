import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import type { HealthOSMissingField } from "@/features/aiImport";

import { AIImportText, aiImportStyles } from "./HealthOSAIImportShared";

type Props = {
  missingFields: HealthOSMissingField[];
};

export function HealthOSMissingFieldsCard({ missingFields }: Props) {
  return (
    <HealthOSCard title="Missing fields" subtitle="Blocking fields must be resolved before import.">
      <View style={aiImportStyles.row}>
        {missingFields.length ? (
          missingFields.map((field) => (
            <View key={field.fieldId} style={aiImportStyles.row}>
              <HealthOSPill label={field.severity} size="sm" variant={field.severity === "blocking" ? "danger" : "warning"} />
              <AIImportText strong>{field.label}</AIImportText>
              <AIImportText muted>{field.reason}</AIImportText>
            </View>
          ))
        ) : (
          <AIImportText muted>No missing fields are blocking this review right now.</AIImportText>
        )}
      </View>
    </HealthOSCard>
  );
}
