import { Text } from "react-native";

import { AppCard } from "@/components/ui/AppCard";

export function NutritionDisclaimerCard() {
  return (
    <AppCard backgroundColor="#f7fee7">
      <Text style={{ color: "#3f6212", fontSize: 18, fontWeight: "900" }}>
        Nutrition estimates only
      </Text>
      <Text style={{ color: "#3f6212", lineHeight: 21, marginTop: 6 }}>
        Food and vitamin values can be useful for tracking patterns, but they
        are estimates. For medical, pregnancy, baby, allergy or diet concerns,
        speak to a healthcare professional.
      </Text>
    </AppCard>
  );
}
