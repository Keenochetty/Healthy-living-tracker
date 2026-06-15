import { Text } from "react-native";

import { AppButton, AppCard } from "@/components/ui";
import { appColors, appSpacing, typography } from "@/theme/designSystem";

type LockedStateCardProps = {
  actionLabel?: string;
  message?: string;
  onAction?: () => void;
  title?: string;
};

export function LockedStateCard({
  actionLabel,
  message = "You do not have access to this information.",
  onAction,
  title = "Private information",
}: LockedStateCardProps) {
  return (
    <AppCard style={{ gap: appSpacing.md }}>
      <Text style={[typography.cardTitle, { color: appColors.text }]}>
        {title}
      </Text>
      <Text style={[typography.body, { color: appColors.textSecondary }]}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <AppButton onPress={onAction} title={actionLabel} variant="secondary" />
      ) : null}
    </AppCard>
  );
}
