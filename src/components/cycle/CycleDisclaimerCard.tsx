import { Text } from "react-native";

import { CYCLE_DISCLAIMER } from "@/constants/cycleOptions";
import { AppCard } from "@/components/ui/AppCard";

export function CycleDisclaimerCard() {
  return (
    <AppCard backgroundColor="#fff7ed">
      <Text style={{ color: "#9a3412", fontSize: 18, fontWeight: "900" }}>
        Patterns, not diagnosis
      </Text>
      <Text style={{ color: "#9a3412", lineHeight: 21, marginTop: 6 }}>
        {CYCLE_DISCLAIMER}
      </Text>
      <Text style={{ color: "#9a3412", lineHeight: 21, marginTop: 6 }}>
        This app does not diagnose pregnancy, fertility issues or medical
        conditions.
      </Text>
    </AppCard>
  );
}
