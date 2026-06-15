import { Text } from "react-native";

import { AppCard } from "@/components/ui";
import { appColors, appSpacing, typography } from "@/theme/designSystem";

type PermissionInfoCardProps = {
  body: string;
  title?: string;
};

export function PermissionInfoCard({
  body,
  title = "Privacy first",
}: PermissionInfoCardProps) {
  return (
    <AppCard variant="soft" style={{ gap: appSpacing.sm }}>
      <Text style={[typography.cardTitle, { color: appColors.text }]}>
        {title}
      </Text>
      <Text style={[typography.body, { color: appColors.textSecondary }]}>
        {body}
      </Text>
    </AppCard>
  );
}
