import { Text } from "react-native";

import { AppCard } from "@/components/ui";
import { appColors, appSpacing, typography } from "@/theme/designSystem";

type DisclaimerCardProps = {
  text: string;
  title?: string;
};

export function DisclaimerCard({
  text,
  title = "General wellness",
}: DisclaimerCardProps) {
  return (
    <AppCard variant="warning" style={{ gap: appSpacing.sm }}>
      <Text style={[typography.cardTitle, { color: appColors.text }]}>
        {title}
      </Text>
      <Text style={[typography.disclaimer, { color: appColors.textSecondary }]}>
        {text}
      </Text>
    </AppCard>
  );
}
