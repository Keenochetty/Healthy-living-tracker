import { Text, View } from "react-native";

import { AppCard, AppIcon } from "@/components/ui";
import { PrivacyBadge } from "@/components/privacy";
import type { AppIconName } from "@/constants/appIcons";
import {
  appColors,
  appRadius,
  appSpacing,
  typography,
} from "@/theme/designSystem";
import type { PrivacyBadgeType } from "@/types/designSystem";

type RealmCardProps = {
  accentColor: string;
  description: string;
  iconName: AppIconName;
  keyMetric?: string;
  onPress?: () => void;
  privacyBadge?: PrivacyBadgeType;
  status?: string;
  title: string;
};

export function RealmCard({
  accentColor,
  description,
  iconName,
  keyMetric,
  onPress,
  privacyBadge,
  status,
  title,
}: RealmCardProps) {
  return (
    <AppCard
      onPress={onPress}
      style={{
        borderColor: `${accentColor}33`,
        borderWidth: 1,
        flexGrow: 1,
        minHeight: 148,
        minWidth: "45%",
        opacity: onPress ? 1 : 0.72,
      }}
    >
      <View style={{ gap: appSpacing.md }}>
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              backgroundColor: `${accentColor}18`,
              borderRadius: appRadius.lg,
              padding: appSpacing.sm,
            }}
          >
            <AppIcon color={accentColor} name={iconName} size={23} />
          </View>
          {privacyBadge ? <PrivacyBadge type={privacyBadge} /> : null}
        </View>
        <View style={{ gap: appSpacing.xs }}>
          <Text style={[typography.cardTitle, { color: appColors.text }]}>
            {title}
          </Text>
          {keyMetric ? (
            <Text style={[typography.widgetValue, { color: accentColor }]}>
              {keyMetric}
            </Text>
          ) : null}
          <Text style={[typography.helper, { color: appColors.textSecondary }]}>
            {status ?? description}
          </Text>
        </View>
      </View>
    </AppCard>
  );
}
