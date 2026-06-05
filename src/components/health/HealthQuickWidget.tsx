import { Text, View } from "react-native";

import { AppCard, AppIcon } from "@/components/ui";
import { PrivacyBadge } from "@/components/privacy";
import type { AppIconName } from "@/constants/appIcons";
import { appColors, appSpacing, typography } from "@/theme/designSystem";
import type { PrivacyBadgeType } from "@/types/designSystem";

type HealthQuickWidgetProps = {
  color: string;
  icon: AppIconName;
  label: string;
  onPress?: () => void;
  privacyBadge?: PrivacyBadgeType;
  value: string;
};

export function HealthQuickWidget({ color, icon, label, onPress, privacyBadge, value }: HealthQuickWidgetProps) {
  return (
    <AppCard
      onPress={onPress}
      padding="md"
      style={{
        borderColor: `${color}33`,
        borderWidth: 1,
        minHeight: 112,
        width: 148
      }}
    >
      <View style={{ gap: appSpacing.sm }}>
        <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
          <AppIcon color={color} name={icon} size={20} />
          {privacyBadge ? <PrivacyBadge type={privacyBadge} /> : null}
        </View>
        <Text numberOfLines={1} style={[typography.caption, { color: appColors.textSecondary }]}>
          {label}
        </Text>
        <Text numberOfLines={2} style={[typography.widgetValue, { color: appColors.text }]}>
          {value}
        </Text>
      </View>
    </AppCard>
  );
}
