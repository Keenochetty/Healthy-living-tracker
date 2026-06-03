import { Text, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import type { UnitPreferences } from "@/types/profile";

type UnitPreviewCardProps = {
  units: UnitPreferences;
};

const UNIT_ROWS: Array<[keyof UnitPreferences, string]> = [
  ["weightUnit", "Weight"],
  ["heightUnit", "Height"],
  ["liquidUnit", "Liquid"],
  ["temperatureUnit", "Temperature"],
  ["distanceUnit", "Distance"],
  ["speedUnit", "Speed"],
  ["dateFormat", "Date format"]
];

export function UnitPreviewCard({ units }: UnitPreviewCardProps) {
  return (
    <AppCard>
      <View style={{ gap: 10 }}>
        {UNIT_ROWS.map(([key, label]) => (
          <View
            key={key}
            style={{
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "space-between"
            }}
          >
            <Text style={{ color: "#64748b" }}>{label}</Text>
            <Text style={{ color: "#0f172a", fontWeight: "900" }}>{units[key]}</Text>
          </View>
        ))}
      </View>
    </AppCard>
  );
}
