import { StyleSheet, Text, View, useColorScheme } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSGlassMenu, type HealthOSGlassMenuItem } from "@/components/healthos/HealthOSGlassMenu";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSWorkoutDisplay } from "./HealthOSFitnessTypes";

type HealthOSWorkoutCardProps = {
  menuVisible: boolean;
  onAddToCalendar: () => void;
  onCloseMenu: () => void;
  onLongPress: () => void;
  onMove: () => void;
  onShare: () => void;
  onStart: () => void;
  onViewDetails: () => void;
  workout: HealthOSWorkoutDisplay;
};

export function HealthOSWorkoutCard({
  menuVisible,
  onAddToCalendar,
  onCloseMenu,
  onLongPress,
  onMove,
  onShare,
  onStart,
  onViewDetails,
  workout,
}: HealthOSWorkoutCardProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const menuItems: HealthOSGlassMenuItem[] = [
    { key: "details", label: "View details", onPress: onViewDetails },
    { key: "move", label: "Move workout", onPress: onMove },
    { key: "calendar", label: "Add to calendar", onPress: onAddToCalendar },
    { key: "share", label: "Share with family", onPress: onShare },
    { destructive: true, disabled: true, key: "remove", label: "Remove from plan" },
  ];

  return (
    <>
      <HealthOSCard onLongPress={onLongPress} onPress={onViewDetails} title={workout.title} subtitle={workout.goal} variant="elevated">
        <View style={styles.pills}>
          {workout.totalMinutes ? <HealthOSPill label={`${workout.totalMinutes} min`} size="sm" variant="glass" /> : null}
          {workout.difficulty ? <HealthOSPill label={workout.difficulty} size="sm" variant="glass" /> : null}
          {workout.equipment.slice(0, 2).map((item) => (
            <HealthOSPill key={item} label={item} size="sm" variant="glass" />
          ))}
        </View>
        <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
          {workout.calendarStatus} | {workout.familyStatus}
        </Text>
        <HealthOSPill label="Start" onPress={onStart} size="sm" variant="realm" />
      </HealthOSCard>
      <HealthOSGlassMenu items={menuItems} mode="menu" onClose={onCloseMenu} visible={menuVisible} />
    </>
  );
}

const styles = StyleSheet.create({
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
});

