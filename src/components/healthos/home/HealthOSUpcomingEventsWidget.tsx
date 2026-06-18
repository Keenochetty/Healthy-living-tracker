import { Href, router } from "expo-router";
import { Text, useColorScheme } from "react-native";

import { AppIcon } from "@/components/ui";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { HealthOSWidget } from "@/components/healthos/HealthOSWidget";
import {
  getHealthOSPalette,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthOSHomeTimelineItem } from "./HealthOSHomeTypes";

type WidgetProps = {
  items?: HealthOSHomeTimelineItem[];
  onLongPress?: () => void;
};

export function HealthOSUpcomingEventsWidget({
  items = [],
  onLongPress,
}: WidgetProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSWidget
      icon={<AppIcon color={palette.family} decorative name="calendar" size={22} />}
      onLongPress={onLongPress}
      onPress={() => router.push("/(tabs)/calendar" as Href)}
      removable
      rightAccessory={<HealthOSPill label="Calendar" size="sm" variant="glass" />}
      subtitle="Soon"
      title="Upcoming Events"
      variant="list"
      widgetKey="upcomingEvents"
    >
      <Text style={[healthOSTypography.body, { color: palette.inkText }]}>
        {items[0] ? items[0].title : "No upcoming events."}
      </Text>
      <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
        {items[0]
          ? `${items[0].type} · ${formatTime(items[0].dueAt)}`
          : "Doctor visits, refills, workouts, and family events can appear here when calendar data is available."}
      </Text>
    </HealthOSWidget>
  );
}

function formatTime(isoDate: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}
