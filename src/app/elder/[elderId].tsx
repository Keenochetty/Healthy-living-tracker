import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";

import { ElderAppointmentsCard } from "@/components/elder/ElderAppointmentsCard";
import { ElderCareNotesCard } from "@/components/elder/ElderCareNotesCard";
import { ElderCheckInCard } from "@/components/elder/ElderCheckInCard";
import { ElderDisclaimerCard } from "@/components/elder/ElderDisclaimerCard";
import { ElderEmergencyCard } from "@/components/elder/ElderEmergencyCard";
import { ElderMedicationCard } from "@/components/elder/ElderMedicationCard";
import { ElderSummaryCard } from "@/components/elder/ElderSummaryCard";
import { ElderVitalsCard } from "@/components/elder/ElderVitalsCard";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import { ELDER_CONSENT_DISCLAIMER } from "@/constants/elderOptions";
import { getElderSummary } from "@/lib/elderStorage";
import type { ElderSummary } from "@/types/elder";

export default function ElderDetailScreen() {
  const params = useLocalSearchParams<{ elderId?: string }>();
  const elderId = Array.isArray(params.elderId) ? params.elderId[0] : params.elderId;
  const [summary, setSummary] = useState<ElderSummary | null>(null);

  const loadSummary = useCallback(async () => {
    if (!elderId) return;

    setSummary(await getElderSummary(elderId));
  }, [elderId]);

  useEffect(() => {
    if (!elderId) return;

    let isActive = true;

    getElderSummary(elderId).then((nextSummary) => {
      if (isActive) {
        setSummary(nextSummary);
      }
    });

    return () => {
      isActive = false;
    };
  }, [elderId]);

  if (!elderId || !summary) {
    return (
      <ScreenWrapper>
        <AppCard>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Elder profile not found
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
            This local profile may have been removed.
          </Text>
        </AppCard>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#64748b", fontSize: 14 }}>Elder profile</Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          {summary.elder.displayName}
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 20 }}>
          {ELDER_CONSENT_DISCLAIMER}
        </Text>
      </View>

      <ElderDisclaimerCard />
      <ElderSummaryCard summary={summary} />
      <ElderCheckInCard elderId={elderId} onChange={loadSummary} />
      <ElderVitalsCard
        elderId={elderId}
        latestVitals={summary.latestVitals}
        onChange={loadSummary}
      />
      <ElderMedicationCard elderId={elderId} onChange={loadSummary} />
      <ElderCareNotesCard elderId={elderId} onChange={loadSummary} />
      <ElderAppointmentsCard elderId={elderId} onChange={loadSummary} />
      <ElderEmergencyCard elder={summary.elder} />
    </ScreenWrapper>
  );
}
