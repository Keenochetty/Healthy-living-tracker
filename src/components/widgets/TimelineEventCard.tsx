import { Text, View } from "react-native";

import { AppCard, AppIcon } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import { appColors, appSpacing, typography } from "@/theme/designSystem";

type TimelineEventCardProps = {
  icon?: AppIconName;
  meta?: string;
  title: string;
};

export function TimelineEventCard({
  icon = "calendar",
  meta,
  title,
}: TimelineEventCardProps) {
  return (
    <AppCard padding="md">
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          gap: appSpacing.md,
        }}
      >
        <AppIcon container name={icon} size={18} variant="primary" />
        <View style={{ flex: 1 }}>
          <Text style={[typography.cardTitle, { color: appColors.text }]}>
            {title}
          </Text>
          {meta ? (
            <Text
              style={[typography.helper, { color: appColors.textSecondary }]}
            >
              {meta}
            </Text>
          ) : null}
        </View>
      </View>
    </AppCard>
  );
}
