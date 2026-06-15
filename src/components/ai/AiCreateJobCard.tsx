import { Href, router } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { AI_JOB_TYPE_OPTIONS } from "@/constants/aiOptions";
import { callAiExtractFunction } from "@/lib/aiBackend";
import { attachDraftToJob, createAiJob, updateAiJob } from "@/lib/aiStorage";
import { processMockAiJob } from "@/lib/mockAiProcessor";
import type { AiJobType } from "@/types/ai";
import { AppCard } from "@/components/ui/AppCard";
import { AiInputPickerCard, type AiInputSelection } from "./AiInputPickerCard";
import { AiJobTypeCard } from "./AiJobTypeCard";

type AiCreateJobCardProps = {
  onCreated?: () => void;
};

export function AiCreateJobCard({ onCreated }: AiCreateJobCardProps) {
  const [input, setInput] = useState<AiInputSelection>({ inputType: "text" });
  const [jobType, setJobType] = useState<AiJobType>("doctor_report_scan");
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");

  async function createDraft() {
    if (!input.localUri && !input.textInput?.trim()) return;

    const job = await createAiJob({
      fileName: input.fileName,
      inputType: input.inputType,
      jobType,
      localUri: input.localUri,
      mimeType: input.mimeType,
      status: "processing",
      textInput: input.textInput,
      title: title.trim() || "AI draft",
    });
    try {
      const response = await callAiExtractFunction({
        fileName: input.fileName,
        inputType: input.inputType,
        jobId: job.id,
        jobType,
        localUri: input.localUri,
        mimeType: input.mimeType,
        textInput: input.textInput,
      });

      await attachDraftToJob(job.id, response.draft);
      await updateAiJob(job.id, { extractionMode: response.mode });
    } catch {
      const draft = processMockAiJob(job);
      await attachDraftToJob(job.id, draft);
      await updateAiJob(job.id, { extractionMode: "mock" });
      setMessage("Backend unavailable. Showing mock draft for UI testing.");
    }

    onCreated?.();
    router.push(`/ai/review/${job.id}` as Href);
  }

  return (
    <AppCard>
      <View style={{ gap: 14 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Create AI draft
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
            Uses backend extraction when available. Falls back to mock drafts
            for UI testing.
          </Text>
        </View>

        {message ? (
          <Text style={{ color: "#9a3412", lineHeight: 20 }}>{message}</Text>
        ) : null}

        {AI_JOB_TYPE_OPTIONS.map((option) => (
          <AiJobTypeCard
            key={option.key}
            description={option.description}
            emoji={option.emoji}
            label={option.label}
            onSelect={setJobType}
            selected={jobType === option.key}
            value={option.key}
          />
        ))}

        <TextInput
          onChangeText={setTitle}
          placeholder="Optional title"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={title}
        />

        <AiInputPickerCard onChange={setInput} selection={input} />

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={createDraft}
          style={buttonStyle}
        >
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>
            Create draft
          </Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );
}

const inputStyle = {
  backgroundColor: "#f8fafc",
  borderColor: "#e2e8f0",
  borderRadius: 18,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 50,
  paddingHorizontal: 14,
};

const buttonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#7c3aed",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52,
};
