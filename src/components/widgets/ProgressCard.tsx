import { Text, View } from "react-native";

import { AppCard } from "@/components/ui";
import { appColors, appRadius, appSpacing, typography } from "@/theme/designSystem";

type ProgressCardProps = {
  color?: string;
  label: string;
  progress: number;
  subtitle?: string;
  value: string;
};

export function ProgressCard({ color = appColors.primary, label, progress, subtitle, value }: ProgressCardProps) {
  const clamped = Math.max(0, Math.min(progress, 1));
  return (
    <AppCard padding="md" style={{ gap: appSpacing.md }}>
      <View>
        <Text style={[typography.cardTitle, { color: appColors.text }]}>{label}</Text>
        {subtitle ? <Text style={[typography.helper, { color: appColors.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      <Text style={[typography.metricValue, { color: appColors.text }]}>{value}</Text>
      <View style={{ backgroundColor: appColors.border, borderRadius: appRadius.pill, height: 9, overflow: "hidden" }}>
        <View style={{ backgroundColor: color, borderRadius: appRadius.pill, height: 9, width: `${clamped * 100}%` }} />
      </View>
    </AppCard>
  );
}
