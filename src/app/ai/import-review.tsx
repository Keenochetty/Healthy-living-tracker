import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

import { HealthOSAIImportReviewScreen } from "@/components/healthos/aiImport";
import {
  createEmptyAIImportEnvelope,
  useAIImportEnvelope,
  useAIImportQueue,
} from "@/features/aiImport";

export default function AIImportReviewRoute() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const envelope = useAIImportEnvelope(id);
  const queue = useAIImportQueue();

  if (!id) {
    return (
      <View style={{ flex: 1, gap: 12, padding: 24, paddingTop: 72 }}>
        <Text style={{ color: "#0f172a", fontSize: 28, fontWeight: "900" }}>
          AI Import Review
        </Text>
        <Text style={{ color: "#64748b", fontSize: 16 }}>
          {queue.status === "missingTable"
            ? "AI import persistence is not available yet."
            : queue.data.length
              ? `${queue.data.length} AI import candidate${queue.data.length === 1 ? "" : "s"} waiting for review.`
              : "No AI imports waiting for review."}
        </Text>
        <Text style={{ color: "#64748b", fontSize: 14 }}>
          No data was saved. Open this route with an import envelope id to review persisted fields.
        </Text>
      </View>
    );
  }

  return (
    <HealthOSAIImportReviewScreen
      envelope={
        envelope.data
          ? createEmptyAIImportEnvelope({
              importId: envelope.data.id ?? id,
              rawBackendJobId: envelope.data.extractionJobId ?? undefined,
              summary: envelope.data.summaryPrivacySafe ?? "This import needs review before saving.",
              title: envelope.data.title ?? "AI import review",
            })
          : null
      }
    />
  );
}
