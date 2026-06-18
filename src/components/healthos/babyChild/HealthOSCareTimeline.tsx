import { Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";
import type { BabyCalendarEvent } from "@/types/child";

type Props = {
  events: BabyCalendarEvent[];
};

export function HealthOSCareTimeline({ events }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard subtitle="Recent parent-controlled care logs." title="Care timeline" variant="elevated">
      <View style={{ gap: healthOSSpacing.md }}>
        {events.length ? (
          events.slice(0, 8).map((event) => (
            <View key={event.id} style={{ gap: healthOSSpacing.xxs }}>
              <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>{event.label}</Text>
              <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
                {formatType(event.type)} · {formatTime(event.eventAt)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            Recent care logs will appear here.
          </Text>
        )}
      </View>
    </HealthOSCard>
  );
}

function formatType(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { day: "2-digit", hour: "2-digit", minute: "2-digit", month: "short" }).format(new Date(value));
}
