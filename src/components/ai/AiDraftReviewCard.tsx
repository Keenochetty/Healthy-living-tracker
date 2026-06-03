import { Text, TouchableOpacity, View } from "react-native";

import type { AiExtractedDraft } from "@/types/ai";
import { AppCard } from "@/components/ui/AppCard";

type AiDraftReviewCardProps = {
  draft?: AiExtractedDraft;
  mode?: "real" | "mock";
  onApprove: () => void;
  onDiscard: () => void;
};

export function AiDraftReviewCard({
  draft,
  mode,
  onApprove,
  onDiscard
}: AiDraftReviewCardProps) {
  if (!draft) {
    return (
      <AppCard>
        <Text style={{ color: "#64748b" }}>No draft attached to this job.</Text>
      </AppCard>
    );
  }

  const fieldEntries = Object.entries(draft.fields).filter(([key]) => key !== "warnings");

  return (
    <AppCard>
      <View style={{ gap: 14 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 22, fontWeight: "900" }}>
            {draft.title}
          </Text>
          <Text style={{ color: "#7c3aed", fontWeight: "900", marginTop: 4 }}>
            Confidence: {draft.confidence}
          </Text>
          <Text style={{ color: "#64748b", fontWeight: "900", marginTop: 4 }}>
            Mode: {mode ?? "unknown"}
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
            {draft.summary ?? "Review extracted fields before approval."}
          </Text>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ color: "#0f172a", fontWeight: "900" }}>Warnings</Text>
          {draft.warnings.map((warning) => (
            <Text key={warning} style={{ color: "#9a3412", lineHeight: 20 }}>
              {warning}
            </Text>
          ))}
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ color: "#0f172a", fontWeight: "900" }}>Extracted fields</Text>
          {fieldEntries.map(([key, value]) => (
            <View key={key} style={{ backgroundColor: "#f8fafc", borderRadius: 14, padding: 12 }}>
              <Text style={{ color: "#64748b", fontSize: 12, fontWeight: "900" }}>{key}</Text>
              <Text style={{ color: "#0f172a", marginTop: 4 }}>
                {Array.isArray(value) ? value.join(", ") : String(value)}
              </Text>
            </View>
          ))}
        </View>

        {draft.suggestedActions?.length ? (
          <View style={{ gap: 8 }}>
            <Text style={{ color: "#0f172a", fontWeight: "900" }}>Suggested actions</Text>
            {draft.suggestedActions.map((action) => (
              <Text key={action} style={{ color: "#64748b" }}>{action}</Text>
            ))}
          </View>
        ) : null}

        {draft.remindersDraft?.length ? (
          <View style={{ gap: 8 }}>
            <Text style={{ color: "#0f172a", fontWeight: "900" }}>Reminder drafts</Text>
            {draft.remindersDraft.map((reminder) => (
              <Text key={reminder.id} style={{ color: "#64748b" }}>
                {reminder.title} - requires confirmation
              </Text>
            ))}
          </View>
        ) : null}

        <Text style={{ color: "#94a3b8", lineHeight: 20 }}>
          TODO: Save doctor visit draft, medication schedule draft, food log draft,
          vaccination draft, and create reminders only after user approval in later steps.
        </Text>

        <TouchableOpacity activeOpacity={0.85} onPress={onApprove} style={buttonStyle}>
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.85} style={secondaryButtonStyle}>
          <Text style={{ color: "#7c3aed", fontWeight: "900" }}>Edit later placeholder</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.85} onPress={onDiscard} style={discardButtonStyle}>
          <Text style={{ color: "#9a3412", fontWeight: "900" }}>Discard</Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );
}

const buttonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#7c3aed",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52
};

const secondaryButtonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#f5f3ff",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52
};

const discardButtonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#fff7ed",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52
};
