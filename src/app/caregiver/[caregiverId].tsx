import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";

import { CaregiverAvailabilityCard } from "@/components/caregiver/CaregiverAvailabilityCard";
import { CaregiverBookingRequestCard } from "@/components/caregiver/CaregiverBookingRequestCard";
import { CaregiverCheckInCard } from "@/components/caregiver/CaregiverCheckInCard";
import { CaregiverInviteQRCard } from "@/components/caregiver/CaregiverInviteQRCard";
import { CaregiverPrivacyCard } from "@/components/caregiver/CaregiverPrivacyCard";
import { CaregiverProfileCard } from "@/components/caregiver/CaregiverProfileCard";
import { CaregiverRateCard } from "@/components/caregiver/CaregiverRateCard";
import { CaregiverUpdateNotesCard } from "@/components/caregiver/CaregiverUpdateNotesCard";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import { getCaregiverSummary } from "@/lib/caregiverStorage";
import type { CaregiverSummary } from "@/types/caregiver";

export default function CaregiverDetailScreen() {
  const params = useLocalSearchParams<{ caregiverId?: string }>();
  const caregiverId = Array.isArray(params.caregiverId) ? params.caregiverId[0] : params.caregiverId;
  const [summary, setSummary] = useState<CaregiverSummary | null>(null);

  const loadSummary = useCallback(async () => {
    if (!caregiverId) return;
    setSummary(await getCaregiverSummary(caregiverId));
  }, [caregiverId]);

  useEffect(() => {
    if (!caregiverId) return;
    let isActive = true;
    getCaregiverSummary(caregiverId).then((nextSummary) => {
      if (isActive) setSummary(nextSummary);
    });
    return () => {
      isActive = false;
    };
  }, [caregiverId]);

  if (!caregiverId || !summary) {
    return (
      <ScreenWrapper>
        <AppCard>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Caregiver not found
          </Text>
        </AppCard>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#64748b", fontSize: 14 }}>Caregiver profile</Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          {summary.caregiver.displayName}
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 20 }}>
          Parent/adult approval is required before access starts.
        </Text>
      </View>

      <CaregiverPrivacyCard />
      <CaregiverProfileCard summary={summary} />
      <CaregiverRateCard caregiverId={caregiverId} currency={summary.caregiver.currency} onChange={loadSummary} />
      <CaregiverAvailabilityCard caregiverId={caregiverId} onChange={loadSummary} />
      <CaregiverInviteQRCard caregiverId={caregiverId} />
      <CaregiverBookingRequestCard caregiverId={caregiverId} onChange={loadSummary} />
      <CaregiverCheckInCard caregiverId={caregiverId} onChange={loadSummary} />
      <CaregiverUpdateNotesCard caregiverId={caregiverId} onChange={loadSummary} />
    </ScreenWrapper>
  );
}
