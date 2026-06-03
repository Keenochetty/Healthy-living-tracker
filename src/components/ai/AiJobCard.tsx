import { Href, router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

import { getAiJobTypeLabel } from "@/constants/aiOptions";
import type { AiJob } from "@/types/ai";
import { AppCard } from "@/components/ui/AppCard";

type AiJobCardProps = {
  job: AiJob;
};

export function AiJobCard({ job }: AiJobCardProps) {
  return (
    <AppCard>
      <View style={{ gap: 10 }}>
        <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
          {job.title}
        </Text>
        <Text style={{ color: "#64748b" }}>{getAiJobTypeLabel(job.jobType)}</Text>
        <Text style={{ color: "#64748b" }}>
          {job.status} - confidence {job.confidence} - {job.safetyLevel}
        </Text>
        <Text style={{ color: "#64748b" }}>
          {new Date(job.createdAt).toLocaleDateString()} - {job.warnings.length} warnings
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push(`/ai/review/${job.id}` as Href)}
          style={buttonStyle}
        >
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>Review</Text>
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
  minHeight: 46
};
