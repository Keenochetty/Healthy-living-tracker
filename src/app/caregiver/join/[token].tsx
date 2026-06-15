import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { CaregiverPrivacyCard } from "@/components/caregiver/CaregiverPrivacyCard";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import { getCaregiverServiceLabel } from "@/constants/caregiverOptions";
import { getCaregiverFromToken } from "@/lib/caregiverInvites";
import {
  createCaregiverConnectionRequest,
  getCaregiverRates,
} from "@/lib/caregiverStorage";
import type { CaregiverProfile, CaregiverRate } from "@/types/caregiver";

export default function CaregiverJoinScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const [caregiver, setCaregiver] = useState<CaregiverProfile | null>(null);
  const [rates, setRates] = useState<CaregiverRate[]>([]);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!token) return;
    let isActive = true;
    getCaregiverFromToken(token).then(async (profile) => {
      if (!isActive || !profile) return;
      setCaregiver(profile);
      setRates(await getCaregiverRates(profile.id));
    });
    return () => {
      isActive = false;
    };
  }, [token]);

  async function requestConnection() {
    if (!caregiver) return;
    await createCaregiverConnectionRequest({
      caregiverId: caregiver.id,
      notes: "Requested from caregiver invite link.",
      requesterName: "Family",
      targetProfileType: "family",
    });
    setSent(true);
  }

  return (
    <ScreenWrapper>
      <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
        Caregiver invite
      </Text>
      <CaregiverPrivacyCard />
      <AppCard>
        {caregiver ? (
          <View style={{ gap: 12 }}>
            <Text style={{ color: "#0f172a", fontSize: 22, fontWeight: "900" }}>
              {caregiver.displayName}
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 21 }}>
              Services:{" "}
              {caregiver.services.map(getCaregiverServiceLabel).join(", ") ||
                "Not listed"}
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 21 }}>
              Rates:{" "}
              {rates[0]
                ? `${rates[0].currency} ${rates[0].amount}/${rates[0].rateType}`
                : "Not listed"}
            </Text>
            <Text style={{ color: "#9a3412", lineHeight: 21 }}>
              Requesting a connection does not approve access. Child, elder,
              medication, allergy and health records are not shared by default.
            </Text>
            {sent ? (
              <Text style={{ color: "#059669", fontWeight: "900" }}>
                Request sent. Access only starts after approval.
              </Text>
            ) : (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={requestConnection}
                style={buttonStyle}
              >
                <Text style={{ color: "#ffffff", fontWeight: "900" }}>
                  Request connection
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity activeOpacity={0.85} style={secondaryButtonStyle}>
              <Text style={{ color: "#4f46e5", fontWeight: "900" }}>
                Not now
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={{ color: "#64748b" }}>Caregiver invite not found.</Text>
        )}
      </AppCard>
    </ScreenWrapper>
  );
}

const buttonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#4f46e5",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52,
};
const secondaryButtonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#eef2ff",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52,
};
