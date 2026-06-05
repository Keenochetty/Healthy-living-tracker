import { Switch, Text, View } from "react-native";

import { appColors, appSpacing, typography } from "@/theme/designSystem";

type SharingControlRowProps = {
  enabled: boolean;
  label: string;
  onChange: (enabled: boolean) => void;
  subtitle?: string;
};

export function SharingControlRow({ enabled, label, onChange, subtitle }: SharingControlRowProps) {
  return (
    <View
      style={{
        alignItems: "center",
        flexDirection: "row",
        gap: appSpacing.md,
        justifyContent: "space-between",
        minHeight: 52
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={[typography.helper, { color: appColors.text }]}>{label}</Text>
        {subtitle ? <Text style={[typography.caption, { color: appColors.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      <Switch onValueChange={onChange} value={enabled} />
    </View>
  );
}
