import { Text, View } from "react-native";

import { AppIcon } from "@/components/ui/AppIcon";
import { appColors, appRadius, appSpacing, typography } from "@/theme/designSystem";
import type { PrivacyBadgeType } from "@/types/designSystem";

type PrivacyBadgeProps = {
  label?: string;
  type?: PrivacyBadgeType;
};

const LABELS: Record<PrivacyBadgeType, string> = {
  private: "Private",
  shared_partner: "Shared with partner",
  shared_family: "Shared with family",
  shared_caregiver: "Shared with caregiver",
  emergency_only: "Emergency only",
  locked: "Locked"
};

export function PrivacyBadge({ label, type = "private" }: PrivacyBadgeProps) {
  const isLocked = type === "locked";
  return (
    <View
      accessibilityLabel={label ?? LABELS[type]}
      style={{
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: isLocked ? appColors.lockedSoft : appColors.surfaceWarm,
        borderColor: isLocked ? appColors.locked : appColors.border,
        borderRadius: appRadius.pill,
        borderWidth: 1,
        flexDirection: "row",
        gap: appSpacing.xs,
        minHeight: 28,
        paddingHorizontal: appSpacing.sm
      }}
    >
      <AppIcon name={isLocked ? "privacy" : "safety"} size={13} variant={isLocked ? "private" : "muted"} />
      <Text style={[typography.privacyLabel, { color: isLocked ? appColors.locked : appColors.textSecondary }]}>
        {label ?? LABELS[type]}
      </Text>
    </View>
  );
}
