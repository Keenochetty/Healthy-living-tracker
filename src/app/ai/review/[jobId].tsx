import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { AiDraftReviewCard } from "@/components/ai/AiDraftReviewCard";
import { AiReviewWarningCard } from "@/components/ai/AiReviewWarningCard";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import { approveAiJob, discardAiJob, getAiJob } from "@/lib/aiStorage";
import type { AiJob } from "@/types/ai";

export default function AiReviewScreen() {
  const params = useLocalSearchParams<{ jobId?: string }>();
  const jobId = Array.isArray(params.jobId) ? params.jobId[0] : params.jobId;
  const [job, setJob] = useState<AiJob | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!jobId) return;

    let isActive = true;
    getAiJob(jobId).then((nextJob) => {
      if (isActive) setJob(nextJob);
    });
    return () => {
      isActive = false;
    };
  }, [jobId]);

  async function approve() {
    if (!jobId) return;
    const updated = await approveAiJob(jobId);
    setJob(updated);
    setMessage("Draft approved. Saving into health records will be connected in a later step.");
  }

  async function discard() {
    if (!jobId) return;
    const updated = await discardAiJob(jobId);
    setJob(updated);
    setMessage("Draft discarded.");
  }

  if (!job) {
    return (
      <ScreenWrapper>
        <AppCard>
          <Text style={{ color: "#64748b" }}>AI job not found.</Text>
        </AppCard>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#64748b", fontSize: 14 }}>Review draft</Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          {job.title}
        </Text>
      </View>

      <AiReviewWarningCard />

      {job.localUri ? (
        <AppCard>
          <Text style={{ color: "#0f172a", fontWeight: "900", marginBottom: 10 }}>
            Input preview
          </Text>
          {job.inputType === "image" ? (
            <Image
              alt="AI input preview"
              source={{ uri: job.localUri }}
              style={{ borderRadius: 18, height: 220, width: "100%" }}
            />
          ) : (
            <Text style={{ color: "#64748b" }}>{job.fileName ?? job.localUri}</Text>
          )}
        </AppCard>
      ) : null}

      <AiDraftReviewCard
        draft={job.extractedDraft}
        mode={job.extractionMode}
        onApprove={approve}
        onDiscard={discard}
      />

      {message ? (
        <AppCard backgroundColor="#ecfdf5">
          <Text style={{ color: "#047857", fontWeight: "900" }}>{message}</Text>
        </AppCard>
      ) : null}

      <TouchableOpacity activeOpacity={0.85} onPress={() => router.back()} style={backButtonStyle}>
        <Text style={{ color: "#7c3aed", fontWeight: "900" }}>Back</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const backButtonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#f5f3ff",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52
};
