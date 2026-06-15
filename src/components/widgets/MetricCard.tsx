import { Text, View } from "react-native";

import { AppCard, AppIcon } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import { appSpacing, typography } from "@/theme/designSystem";
import { useAppTheme } from "@/theme/ThemeProvider";

type MetricCardProps = {
  helper?: string;
  icon?: AppIconName;
  label: string;
  value: string;
};

export function MetricCard({ helper, icon, label, value }: MetricCardProps) {
  const { theme } = useAppTheme();

  return (
    <AppCard padding="md">
      <View style={{ gap: appSpacing.sm }}>
        {icon ? <AppIcon name={icon} size={20} variant="primary" /> : null}
        <Text style={[typography.caption, { color: theme.mutedText }]}>
          {label}
        </Text>
        <Text style={[typography.metricValue, { color: theme.text }]}>
          {value}
        </Text>
        {helper ? (
          <Text style={[typography.helper, { color: theme.mutedText }]}>
            {helper}
          </Text>
        ) : null}
      </View>
    </AppCard>
  );
}
