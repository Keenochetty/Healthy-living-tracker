import { Text, View } from "react-native";

import { AppCard, AppIcon } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import { appColors, appSpacing, typography } from "@/theme/designSystem";

type MetricCardProps = {
  helper?: string;
  icon?: AppIconName;
  label: string;
  value: string;
};

export function MetricCard({ helper, icon, label, value }: MetricCardProps) {
  return (
    <AppCard padding="md">
      <View style={{ gap: appSpacing.sm }}>
        {icon ? <AppIcon name={icon} size={20} variant="primary" /> : null}
        <Text style={[typography.caption, { color: appColors.textSecondary }]}>
          {label}
        </Text>
        <Text style={[typography.metricValue, { color: appColors.text }]}>
          {value}
        </Text>
        {helper ? (
          <Text style={[typography.helper, { color: appColors.textSecondary }]}>
            {helper}
          </Text>
        ) : null}
      </View>
    </AppCard>
  );
}
