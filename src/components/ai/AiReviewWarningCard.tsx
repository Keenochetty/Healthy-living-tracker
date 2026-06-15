import { Text } from "react-native";

import { AppCard } from "@/components/ui/AppCard";

export function AiReviewWarningCard() {
  return (
    <AppCard backgroundColor="#fff7ed">
      <Text style={{ color: "#9a3412", fontSize: 18, fontWeight: "900" }}>
        Please review carefully
      </Text>
      <Text style={{ color: "#9a3412", lineHeight: 21, marginTop: 6 }}>
        AI can misread photos, documents, handwriting, medication names, dates
        and dosages.
      </Text>
    </AppCard>
  );
}
