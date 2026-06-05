import { Text } from "react-native";

import { AppCard } from "@/components/ui";
import { appColors, appSpacing, typography } from "@/theme/designSystem";

type ReportCardProps = {
  children?: React.ReactNode;
  subtitle?: string;
  title: string;
};

export function ReportCard({ children, subtitle, title }: ReportCardProps) {
  return (
    <AppCard style={{ gap: appSpacing.md }}>
      <Text style={[typography.cardTitle, { color: appColors.text }]}>{title}</Text>
      {subtitle ? <Text style={[typography.body, { color: appColors.textSecondary }]}>{subtitle}</Text> : null}
      {children}
    </AppCard>
  );
}
