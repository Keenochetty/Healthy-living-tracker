import { router } from "expo-router";
import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import { formatEventTime, getCalendarCategoryColor } from "./calendarVisuals";
import type { HealthOSCalendarDisplayEvent } from "./HealthOSCalendarTypes";

type HealthOSCalendarEventRowProps = {
  event: HealthOSCalendarDisplayEvent;
  onPress?: (event: HealthOSCalendarDisplayEvent) => void;
};

export function HealthOSCalendarEventRow({
  event,
  onPress,
}: HealthOSCalendarEventRowProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const color = getCalendarCategoryColor(event.category, mode);
  const routeTarget = event.routeTarget ? String(event.routeTarget) : null;
  const isInteractive = Boolean(routeTarget) || Boolean(onPress);
  const accessibilityRole = isInteractive ? "button" : undefined;

  function handlePress() {
    if (onPress) {
      onPress(event);
      return;
    }
    if (routeTarget) router.push(routeTarget as never);
  }

  return (
    <Pressable
      accessibilityLabel={`${formatEventTime(event.startTime)}. ${event.title}. ${event.privacy}.`}
      accessibilityRole={accessibilityRole}
      onPress={isInteractive ? handlePress : undefined}
      style={({ pressed }) => [
        styles.row,
        { borderColor: palette.borderSubtle },
        pressed && { opacity: 0.72 },
      ]}
    >
      <Text style={[healthOSTypography.statLabel, styles.time, { color: palette.softText }]}>
        {formatEventTime(event.startTime)}
      </Text>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.copy}>
        <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>
          {event.title}
        </Text>
        {event.subtitle ? (
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            {event.subtitle}
          </Text>
        ) : null}
      </View>
      <HealthOSPill
        label={event.privacy === "shared" ? "Shared" : event.privacy}
        size="sm"
        variant={event.privacy === "private" ? "realm" : "glass"}
        realmColor={event.privacy === "private" ? palette.medication : undefined}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: healthOSSpacing.xxs,
    minWidth: 0,
  },
  dot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  row: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    minHeight: 58,
    padding: healthOSSpacing.sm,
  },
  time: {
    width: 58,
  },
});
