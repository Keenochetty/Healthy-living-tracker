import { Text, View } from "react-native";

import { AppButton, AppCard } from "@/components/ui";
import { SourceBadge } from "@/components/widgets/SourceBadge";
import { appColors, appSpacing, typography } from "@/theme/designSystem";

type LearnCardProps = {
  disclaimer?: string;
  lastChecked?: string;
  onOpenSource?: () => void;
  source: string;
  summary: string;
  title: string;
};

export function LearnCard({
  disclaimer,
  lastChecked,
  onOpenSource,
  source,
  summary,
  title,
}: LearnCardProps) {
  return (
    <AppCard style={{ gap: appSpacing.md }}>
      <View style={{ gap: appSpacing.sm }}>
        <SourceBadge label={source} />
        <Text style={[typography.cardTitle, { color: appColors.text }]}>
          {title}
        </Text>
        <Text style={[typography.body, { color: appColors.textSecondary }]}>
          {summary}
        </Text>
        {lastChecked ? (
          <Text style={[typography.caption, { color: appColors.textMuted }]}>
            Last checked {lastChecked}
          </Text>
        ) : null}
        {disclaimer ? (
          <Text
            style={[typography.disclaimer, { color: appColors.textSecondary }]}
          >
            {disclaimer}
          </Text>
        ) : null}
      </View>
      {onOpenSource ? (
        <AppButton
          onPress={onOpenSource}
          title="Open source"
          variant="outline"
        />
      ) : null}
    </AppCard>
  );
}
