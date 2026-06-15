import { Text, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import type { UnitPreferences } from "@/types/profile";
import { useAppTheme } from "@/theme/ThemeProvider";

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
  const { theme } = useAppTheme();
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
            <Text style={{ color: theme.mutedText }}>{label}</Text>
            <Text style={{ color: theme.text, fontWeight: "900" }}>{units[key]}</Text>
          </View>
        ))}
      </View>
    </AppCard>
  );
}
