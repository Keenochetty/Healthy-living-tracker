import { Text } from "react-native";

import { AppCard } from "@/components/ui/AppCard";

export function AiDisclaimerCard() {
  return (
    <AppCard backgroundColor="#f5f3ff">
      <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
        AI helps organise, not diagnose
      </Text>
      <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
        AI can help summarise reports, labels and notes, but it can make mistakes.
        Review everything before saving. For medical concerns, contact a healthcare
        professional.
      </Text>
    </AppCard>
  );
}
