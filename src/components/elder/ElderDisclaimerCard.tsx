import { Text } from "react-native";

import { ELDER_CARE_DISCLAIMER } from "@/constants/elderOptions";
import { AppCard } from "@/components/ui/AppCard";

export function ElderDisclaimerCard() {
  return (
    <AppCard backgroundColor="#fff7ed">
      <Text style={{ color: "#9a3412", fontSize: 18, fontWeight: "900" }}>
        Care support, not medical advice
      </Text>
      <Text style={{ color: "#9a3412", lineHeight: 21, marginTop: 6 }}>
        {ELDER_CARE_DISCLAIMER}
      </Text>
    </AppCard>
  );
}
