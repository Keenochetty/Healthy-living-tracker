import { Text } from "react-native";

import { CAREGIVER_PRIVACY_DISCLAIMER } from "@/constants/caregiverOptions";
import { AppCard } from "@/components/ui/AppCard";

export function CaregiverPrivacyCard() {
  return (
    <AppCard backgroundColor="#eef2ff">
      <Text style={{ color: "#312e81", fontSize: 18, fontWeight: "900" }}>
        Parent-controlled access
      </Text>
      <Text style={{ color: "#475569", lineHeight: 21, marginTop: 6 }}>
        {CAREGIVER_PRIVACY_DISCLAIMER} Medical details are never shared by
        default.
      </Text>
    </AppCard>
  );
}
