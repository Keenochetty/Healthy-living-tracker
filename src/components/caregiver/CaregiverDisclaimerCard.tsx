import { Text } from "react-native";

import { CAREGIVER_DISCLAIMER } from "@/constants/caregiverOptions";
import { AppCard } from "@/components/ui/AppCard";

export function CaregiverDisclaimerCard() {
  return (
    <AppCard backgroundColor="#fff7ed">
      <Text style={{ color: "#9a3412", fontSize: 18, fontWeight: "900" }}>
        Care support, not verification
      </Text>
      <Text style={{ color: "#9a3412", lineHeight: 21, marginTop: 6 }}>
        {CAREGIVER_DISCLAIMER}
      </Text>
    </AppCard>
  );
}
