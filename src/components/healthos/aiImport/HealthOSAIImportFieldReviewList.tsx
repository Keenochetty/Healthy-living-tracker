import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import type { HealthOSAIImportEnvelope } from "@/features/aiImport";

import { AIImportText } from "./HealthOSAIImportShared";
import { HealthOSAIImportFieldRow } from "./HealthOSAIImportFieldRow";

type Props = {
  envelope: HealthOSAIImportEnvelope | null;
  onConfirmField: (fieldId: string) => void;
  onRejectField: (fieldId: string) => void;
};

export function HealthOSAIImportFieldReviewList({ envelope, onConfirmField, onRejectField }: Props) {
  return (
    <HealthOSCard title="Field review" subtitle="Confirm, edit, or reject fields before import.">
      <View>
        {envelope?.items.length ? (
          envelope.items.map((item) => (
            <View key={item.itemId}>
              <AIImportText strong>{item.title}</AIImportText>
              {item.fields.map((field) => (
                <HealthOSAIImportFieldRow
                  field={field}
                  key={field.fieldId}
                  onConfirm={onConfirmField}
                  onReject={onRejectField}
                />
              ))}
            </View>
          ))
        ) : (
          <AIImportText muted>No extracted fields are available.</AIImportText>
        )}
      </View>
    </HealthOSCard>
  );
}
