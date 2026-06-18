import { Href, router } from "expo-router";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { AppIcon } from "@/components/ui";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { HealthOSWidget } from "@/components/healthos/HealthOSWidget";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthOSHomeTimelineItem } from "./HealthOSHomeTypes";

type WidgetProps = {
  items?: HealthOSHomeTimelineItem[];
  onLongPress?: () => void;
};

export function HealthOSTodayTimelineWidget({
  items = [],
  onLongPress,
}: WidgetProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSWidget
      onLongPress={onLongPress}
      onPress={() => router.push("/(tabs)/calendar" as Href)}
      removable
      rightAccessory={<HealthOSPill label="View calendar" size="sm" variant="glass" />}
      subtitle="Compact schedule preview"
      title="Today"
      variant="elevated"
      widgetKey="todayTimeline"
    >
      {items.length
        ? items.slice(0, 3).map((item) => (
            <View
              accessibilityLabel={`${item.title}. ${item.type}. ${formatTime(item.dueAt)}.`}
              key={item.id}
              style={styles.row}
            >
              <Text style={[healthOSTypography.statLabel, { color: palette.softText }]}>
                {formatTime(item.dueAt)}
              </Text>
              <View style={[styles.dot, { backgroundColor: palette.skyBlue }]} />
              <View style={styles.copy}>
                <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
                  {item.title}
                </Text>
                <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                  {item.type}
                </Text>
              </View>
            </View>
          ))
        : (
            <View accessibilityLabel="No planned health items today" style={styles.row}>
              <Text style={[healthOSTypography.statLabel, { color: palette.softText }]}>
                Now
              </Text>
              <View style={[styles.dot, { backgroundColor: palette.skyBlue }]} />
              <View style={styles.copy}>
                <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
                  No planned health items today
                </Text>
                <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                  Calendar, medication, and care tasks will appear here when they exist.
                </Text>
              </View>
            </View>
          )}
    </HealthOSWidget>
  );
}

function formatTime(isoDate: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: healthOSSpacing.xxs,
  },
  dot: {
    borderRadius: 999,
    height: 10,
    marginTop: 4,
    width: 10,
  },
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
});
