import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Text, View } from "react-native";

import { AddElderProfileCard } from "@/components/elder/AddElderProfileCard";
import { ElderDisclaimerCard } from "@/components/elder/ElderDisclaimerCard";
import { ElderProfileCard } from "@/components/elder/ElderProfileCard";
import { ElderSummaryCard } from "@/components/elder/ElderSummaryCard";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import { getAllElderSummaries } from "@/lib/elderStorage";
import { getUserPreferences } from "@/lib/userPreferences";
import type { ElderSummary } from "@/types/elder";

export default function ElderIndexScreen() {
  const [moduleEnabled, setModuleEnabled] = useState(false);
  const [summaries, setSummaries] = useState<ElderSummary[]>([]);

  const loadElderScreen = useCallback(async () => {
    const [preferences, nextSummaries] = await Promise.all([
      getUserPreferences(),
      getAllElderSummaries()
    ]);

    setModuleEnabled(preferences.enabledModules.includes("elder_care"));
    setSummaries(nextSummaries);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadElderScreen();
    }, [loadElderScreen])
  );

  if (!moduleEnabled) {
    return (
      <ScreenWrapper>
        <View style={{ gap: 4 }}>
          <Text style={{ color: "#64748b", fontSize: 14 }}>Optional module</Text>
          <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
            Elder Care
          </Text>
        </View>
        <AppCard>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            This module is turned off
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
            Enable Elder Care in Profile modules only if it helps your family.
          </Text>
        </AppCard>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#64748b", fontSize: 14 }}>Consent-first care</Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          Elder Care
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 20 }}>
          Check-ins, reminders and care notes for older loved ones.
        </Text>
      </View>

      <ElderDisclaimerCard />

      {summaries.length ? (
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#0f172a", fontSize: 22, fontWeight: "900" }}>
            Elder profiles
          </Text>
          <ElderSummaryCard summary={summaries[0]} />
          {summaries.map((summary) => (
            <ElderProfileCard
              key={summary.elder.id}
              onOpen={() => router.push(`/elder/${summary.elder.id}` as Href)}
              summary={summary}
            />
          ))}
        </View>
      ) : (
        <AppCard backgroundColor="#ecfdf5">
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            No elder profile yet
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
            Add one only if this helps your care circle. No profile is created
            automatically.
          </Text>
        </AppCard>
      )}

      <AddElderProfileCard onCreated={loadElderScreen} />
    </ScreenWrapper>
  );
}
