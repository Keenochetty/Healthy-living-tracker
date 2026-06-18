import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import { formatMonthYear } from "./calendarVisuals";

type HealthOSCalendarHeaderProps = {
  activeFilterCount: number;
  collapsed: boolean;
  currentMonth: Date;
  eventCountThisWeek: number;
  onAdd: () => void;
  onFilter: () => void;
  onNextMonth: () => void;
  onPreviousMonth: () => void;
  onToday: () => void;
  onToggleCollapsed: () => void;
};

export function HealthOSCalendarHeader({
  activeFilterCount,
  collapsed,
  currentMonth,
  eventCountThisWeek,
  onAdd,
  onFilter,
  onNextMonth,
  onPreviousMonth,
  onToday,
  onToggleCollapsed,
}: HealthOSCalendarHeaderProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Text style={[healthOSTypography.screenTitle, { color: palette.inkText }]}>
            {formatMonthYear(currentMonth)}
          </Text>
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            {eventCountThisWeek
              ? `${eventCountThisWeek} item${eventCountThisWeek === 1 ? "" : "s"} this week`
              : "No planned items this week"}
          </Text>
        </View>
        <View style={styles.actions}>
          <HealthOSPill label="-" onPress={onPreviousMonth} size="sm" variant="glass" />
          <HealthOSPill label="+" onPress={onNextMonth} size="sm" variant="glass" />
        </View>
      </View>
      <View style={styles.actionRow}>
        <HealthOSPill label="Today" onPress={onToday} size="sm" variant="glass" />
        <HealthOSPill
          label={activeFilterCount ? `Filter ${activeFilterCount}` : "Filter"}
          onPress={onFilter}
          size="sm"
          variant={activeFilterCount ? "active" : "glass"}
        />
        <HealthOSPill
          label={collapsed ? "Month" : "Week"}
          onPress={onToggleCollapsed}
          size="sm"
          variant="glass"
        />
        <HealthOSPill label="Add" onPress={onAdd} size="sm" variant="active" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  actions: {
    flexDirection: "row",
    gap: healthOSSpacing.xs,
  },
  container: {
    gap: healthOSSpacing.md,
  },
  titleBlock: {
    flex: 1,
    gap: healthOSSpacing.xxs,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.md,
    justifyContent: "space-between",
  },
});
