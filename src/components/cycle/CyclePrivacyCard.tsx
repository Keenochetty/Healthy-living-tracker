import { Lock } from "lucide-react-native";
import { Text, View } from "react-native";

import { CYCLE_PRIVACY_DISCLAIMER } from "@/constants/cycleOptions";
import { AppCard } from "@/components/ui/AppCard";

export function CyclePrivacyCard() {
  return (
    <AppCard backgroundColor="#f5f3ff">
      <View style={{ alignItems: "center", flexDirection: "row", gap: 12 }}>
        <View
          style={{
            alignItems: "center",
            backgroundColor: "#7c3aed",
            borderRadius: 18,
            height: 46,
            justifyContent: "center",
            width: 46
          }}
        >
          <Lock color="#ffffff" size={22} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
            Private by default
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
            {CYCLE_PRIVACY_DISCLAIMER}
          </Text>
        </View>
      </View>
    </AppCard>
  );
}
