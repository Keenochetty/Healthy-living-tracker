import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Text, View } from "react-native";

import { AiCreateJobCard } from "@/components/ai/AiCreateJobCard";
import { AiDisclaimerCard } from "@/components/ai/AiDisclaimerCard";
import { AiJobCard } from "@/components/ai/AiJobCard";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import { getPendingReviewJobs, getRecentAiJobs } from "@/lib/aiStorage";
import { getUserPreferences } from "@/lib/userPreferences";
import type { AiJob } from "@/types/ai";

export default function AiAssistantScreen() {
  const [moduleEnabled, setModuleEnabled] = useState(false);
  const [pendingJobs, setPendingJobs] = useState<AiJob[]>([]);
  const [recentJobs, setRecentJobs] = useState<AiJob[]>([]);

  const loadAiScreen = useCallback(async () => {
    const [preferences, pending, recent] = await Promise.all([
      getUserPreferences(),
      getPendingReviewJobs(),
      getRecentAiJobs()
    ]);

    setModuleEnabled(preferences.enabledModules.includes("ai_assistant"));
    setPendingJobs(pending);
    setRecentJobs(recent);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAiScreen();
    }, [loadAiScreen])
  );

  if (!moduleEnabled) {
    return (
      <ScreenWrapper>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          AI Assistant
        </Text>
        <AppCard>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            This module is turned off
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
            Enable AI Assistant in Profile modules only if you want draft help.
          </Text>
        </AppCard>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#64748b", fontSize: 14 }}>Drafts only</Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          AI Assistant
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 20 }}>
          Scan, organise and review health information safely.
        </Text>
      </View>

      <AiDisclaimerCard />
      <AiCreateJobCard onCreated={loadAiScreen} />

      <View style={{ gap: 12 }}>
        <Text style={{ color: "#0f172a", fontSize: 22, fontWeight: "900" }}>
          Pending review
        </Text>
        {pendingJobs.length ? (
          pendingJobs.map((job) => <AiJobCard key={job.id} job={job} />)
        ) : (
          <AppCard>
            <Text style={{ color: "#64748b" }}>
              No AI drafts yet. Start with a report, label, food photo or note.
            </Text>
          </AppCard>
        )}
      </View>

      <View style={{ gap: 12 }}>
        <Text style={{ color: "#0f172a", fontSize: 22, fontWeight: "900" }}>
          Recent AI jobs
        </Text>
        {recentJobs.map((job) => (
          <AiJobCard key={job.id} job={job} />
        ))}
      </View>
    </ScreenWrapper>
  );
}
