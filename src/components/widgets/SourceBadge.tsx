import { Text, View } from "react-native";

import { AppIcon } from "@/components/ui";
import { appColors, appRadius, appSpacing, typography } from "@/theme/designSystem";

type SourceBadgeProps = {
  label: string;
  qualityLabel?: string;
};

export function SourceBadge({ label, qualityLabel }: SourceBadgeProps) {
  return (
    <View
      style={{
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: appColors.accentSoft,
        borderRadius: appRadius.pill,
        flexDirection: "row",
        gap: appSpacing.xs,
        minHeight: 28,
        paddingHorizontal: appSpacing.sm
      }}
    >
      <AppIcon name="documents" size={13} variant="muted" />
      <Text style={[typography.caption, { color: appColors.text }]}>
        {qualityLabel ? `${label} · ${qualityLabel}` : label}
      </Text>
    </View>
  );
}
