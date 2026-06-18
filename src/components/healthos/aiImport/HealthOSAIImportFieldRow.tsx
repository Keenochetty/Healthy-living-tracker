import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import type { HealthOSAIImportField } from "@/features/aiImport";

import { AIImportAction, AIImportText, aiImportStyles } from "./HealthOSAIImportShared";
import { HealthOSAIConfidenceBadge } from "./HealthOSAIConfidenceBadge";

type Props = {
  field: HealthOSAIImportField;
  onConfirm: (fieldId: string) => void;
  onReject: (fieldId: string) => void;
};

export function HealthOSAIImportFieldRow({ field, onConfirm, onReject }: Props) {
  return (
    <HealthOSCard variant="list">
      <View style={aiImportStyles.row}>
        <View style={aiImportStyles.split}>
          <AIImportText strong>{field.label}</AIImportText>
          <HealthOSAIConfidenceBadge confidence={field.confidence} />
        </View>
        <AIImportText muted>{formatFieldValue(field)}</AIImportText>
        <View style={aiImportStyles.actions}>
          <HealthOSPill label={field.reviewStatus} size="sm" variant={field.reviewStatus === "missing" ? "warning" : "glass"} />
          {field.sensitive ? <HealthOSPill label="Sensitive" size="sm" variant="warning" /> : null}
          {field.medicalRisk === "high" ? <HealthOSPill label="High review" size="sm" variant="danger" /> : null}
          <AIImportAction label="Confirm" onPress={() => onConfirm(field.fieldId)} variant="success" />
          <AIImportAction label="Reject" onPress={() => onReject(field.fieldId)} />
        </View>
      </View>
    </HealthOSCard>
  );
}

function formatFieldValue(field: HealthOSAIImportField) {
  if (field.value === null) return "Missing";
  if (Array.isArray(field.value)) return field.value.join(", ");
  return `${field.value}${field.unit ? ` ${field.unit}` : ""}`;
}
