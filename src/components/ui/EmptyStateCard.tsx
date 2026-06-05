import { Text, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppIcon } from "@/components/ui/AppIcon";
import type { AppIconName } from "@/constants/appIcons";
import { appColors, appSpacing, typography } from "@/theme/designSystem";

type EmptyStateCardProps = {
  actionLabel?: string;
  icon?: AppIconName;
  message: string;
  onAction?: () => void;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
  title: string;
};

export function EmptyStateCard({
  actionLabel,
  icon = "health",
  message,
  onAction,
  onSecondaryAction,
  secondaryActionLabel,
  title
}: EmptyStateCardProps) {
  return (
    <AppCard style={{ alignItems: "flex-start", gap: appSpacing.md }}>
      <AppIcon container name={icon} size={22} variant="primary" />
      <View style={{ gap: appSpacing.xs }}>
        <Text style={[typography.cardTitle, { color: appColors.text }]}>{title}</Text>
        <Text style={[typography.body, { color: appColors.textSecondary }]}>{message}</Text>
      </View>
      {actionLabel && onAction ? <AppButton onPress={onAction} title={actionLabel} /> : null}
      {secondaryActionLabel && onSecondaryAction ? (
        <AppButton onPress={onSecondaryAction} title={secondaryActionLabel} variant="ghost" />
      ) : null}
    </AppCard>
  );
}
