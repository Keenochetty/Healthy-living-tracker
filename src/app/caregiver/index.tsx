import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Text, View } from "react-native";

import { AddCaregiverProfileCard } from "@/components/caregiver/AddCaregiverProfileCard";
import { CaregiverDisclaimerCard } from "@/components/caregiver/CaregiverDisclaimerCard";
import { CaregiverPrivacyCard } from "@/components/caregiver/CaregiverPrivacyCard";
import { CaregiverProfileCard } from "@/components/caregiver/CaregiverProfileCard";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import { getAllCaregiverSummaries } from "@/lib/caregiverStorage";
import { getUserPreferences } from "@/lib/userPreferences";
import type { CaregiverSummary } from "@/types/caregiver";

export default function CaregiverIndexScreen() {
  const [moduleEnabled, setModuleEnabled] = useState(false);
  const [summaries, setSummaries] = useState<CaregiverSummary[]>([]);

  const loadCaregivers = useCallback(async () => {
    const [preferences, nextSummaries] = await Promise.all([
      getUserPreferences(),
      getAllCaregiverSummaries(),
    ]);
    setModuleEnabled(preferences.enabledModules.includes("caregiver"));
    setSummaries(nextSummaries);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCaregivers();
    }, [loadCaregivers]),
  );

  if (!moduleEnabled) {
    return (
      <ScreenWrapper>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          Caregiver
        </Text>
        <AppCard>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            This module is turned off
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
            Enable Caregiver in Profile modules only if it helps your care
            circle.
          </Text>
        </AppCard>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#64748b", fontSize: 14 }}>Care manager</Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          Caregiver
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 20 }}>
          Create caregiver cards, manage care requests and keep families
          updated.
        </Text>
      </View>

      <CaregiverDisclaimerCard />
      <CaregiverPrivacyCard />

      {summaries.length ? (
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#0f172a", fontSize: 22, fontWeight: "900" }}>
            Caregiver profiles
          </Text>
          {summaries.map((summary) => (
            <CaregiverProfileCard
              key={summary.caregiver.id}
              onBook={() =>
                router.push(`/caregiver/${summary.caregiver.id}` as Href)
              }
              onInvite={() =>
                router.push(`/caregiver/${summary.caregiver.id}` as Href)
              }
              onOpen={() =>
                router.push(`/caregiver/${summary.caregiver.id}` as Href)
              }
              summary={summary}
            />
          ))}
        </View>
      ) : (
        <AppCard backgroundColor="#eef2ff">
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            No caregiver profile yet
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
            Add one only if this helps your care circle. No caregiver gets
            access automatically.
          </Text>
        </AppCard>
      )}

      <AddCaregiverProfileCard onCreated={loadCaregivers} />
    </ScreenWrapper>
  );
}
