import { Text, View } from "react-native";

import { appColors, appRadius, appSpacing, typography } from "@/theme/designSystem";

type SharedProfileIndicatorProps = {
  avatarLabel?: string;
  label: string;
  relationship?: string;
};

export function SharedProfileIndicator({ avatarLabel, label, relationship }: SharedProfileIndicatorProps) {
  return (
    <View
      accessibilityLabel={`Viewing shared data for ${label}`}
      style={{ alignItems: "center", flexDirection: "row", gap: appSpacing.sm }}
    >
      <View
        style={{
          alignItems: "center",
          backgroundColor: appColors.secondarySoft,
          borderRadius: appRadius.pill,
          height: 34,
          justifyContent: "center",
          width: 34
        }}
      >
        <Text style={{ color: appColors.secondary, fontWeight: "900" }}>{avatarLabel ?? label.slice(0, 1)}</Text>
      </View>
      <View>
        <Text style={[typography.helper, { color: appColors.text }]}>Viewing shared data</Text>
        <Text style={[typography.caption, { color: appColors.textSecondary }]}>
          {relationship ? `${label} · ${relationship}` : label}
        </Text>
      </View>
    </View>
  );
}
