import { Text } from "react-native";

import { CHILD_SAFETY_DISCLAIMER } from "@/constants/childOptions";
import { AppCard } from "@/components/ui/AppCard";

export function ChildDisclaimerCard() {
  return (
    <AppCard backgroundColor="#fff7ed">
      <Text style={{ color: "#9a3412", fontSize: 16, fontWeight: "900" }}>
        Parent-controlled care notes
      </Text>
      <Text style={{ color: "#9a3412", lineHeight: 21, marginTop: 6 }}>
        {CHILD_SAFETY_DISCLAIMER}
      </Text>
      <Text style={{ color: "#9a3412", lineHeight: 21, marginTop: 6 }}>
        Child information is private by default. Sharing with a circle member
        should be explicit and permission-based.
      </Text>
    </AppCard>
  );
}
