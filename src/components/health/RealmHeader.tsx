import { Text, View } from "react-native";

import { AppButton, AppIcon } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import { appColors, appSpacing, typography } from "@/theme/designSystem";

type RealmHeaderProps = {
  actionLabel?: string;
  icon: AppIconName;
  onAction?: () => void;
  privacy?: React.ReactNode;
  subtitle?: string;
  title: string;
};

export function RealmHeader({
  actionLabel,
  icon,
  onAction,
  privacy,
  subtitle,
  title,
}: RealmHeaderProps) {
  return (
    <View style={{ gap: appSpacing.md }}>
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          gap: appSpacing.md,
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            alignItems: "center",
            flex: 1,
            flexDirection: "row",
            gap: appSpacing.md,
          }}
        >
          <AppIcon container name={icon} size={24} variant="primary" />
          <View style={{ flex: 1 }}>
            <Text style={[typography.screenTitle, { color: appColors.text }]}>
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={[typography.body, { color: appColors.textSecondary }]}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        {actionLabel && onAction ? (
          <AppButton onPress={onAction} size="sm" title={actionLabel} />
        ) : null}
      </View>
      {privacy}
    </View>
  );
}
