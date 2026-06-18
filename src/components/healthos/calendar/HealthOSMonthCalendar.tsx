import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import { HealthOSCalendarDayCell } from "./HealthOSCalendarDayCell";
import type {
  HealthOSCalendarFilter,
  HealthOSCalendarIndicator,
} from "./HealthOSCalendarTypes";
import { toDateKey } from "./useHealthOSCalendarEvents";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type HealthOSMonthCalendarProps = {
  activeFilters: HealthOSCalendarFilter[];
  collapsed?: boolean;
  currentMonth: Date;
  getIndicatorsForDate: (
    date: Date,
    filters?: HealthOSCalendarFilter[],
  ) => HealthOSCalendarIndicator[];
  onChangeMonth?: (direction: number) => void;
  onLongPressDate: (date: Date) => void;
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
  testID?: string;
};

export function HealthOSMonthCalendar({
  activeFilters,
  collapsed = false,
  currentMonth,
  getIndicatorsForDate,
  onLongPressDate,
  onSelectDate,
  selectedDate,
  testID,
}: HealthOSMonthCalendarProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const days = collapsed
    ? buildWeekDays(selectedDate)
    : buildMonthDays(currentMonth);

  return (
    <HealthOSCard testID={testID} variant="elevated">
      <View style={styles.weekHeader}>
        {weekdays.map((weekday) => (
          <Text
            key={weekday}
            style={[healthOSTypography.micro, styles.weekday, { color: palette.softText }]}
          >
            {weekday}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {days.map((date) => {
          const key = toDateKey(date);
          return (
            <HealthOSCalendarDayCell
              date={date}
              indicators={getIndicatorsForDate(date, activeFilters)}
              isOutsideMonth={!sameMonth(date, currentMonth)}
              isSelected={sameDay(date, selectedDate)}
              isToday={sameDay(date, new Date())}
              key={key}
              onLongPress={() => onLongPressDate(date)}
              onPress={() => onSelectDate(date)}
              testID={`healthos-calendar-day-${key}`}
            />
          );
        })}
      </View>
      {collapsed ? (
        <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
          Week strip foundation active. Month view can be restored from the header.
        </Text>
      ) : null}
    </HealthOSCard>
  );
}

function buildMonthDays(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1, 12);
  const first = new Date(start);
  first.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const next = new Date(first);
    next.setDate(first.getDate() + index);
    return next;
  });
}

function buildWeekDays(date: Date) {
  const first = new Date(date);
  first.setDate(date.getDate() - date.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(first);
    next.setDate(first.getDate() + index);
    return next;
  });
}

function sameDay(left: Date, right: Date) {
  return toDateKey(left) === toDateKey(right);
}

function sameMonth(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth()
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  weekHeader: {
    flexDirection: "row",
    gap: 5,
    marginBottom: healthOSSpacing.sm,
  },
  weekday: {
    flex: 1,
    textAlign: "center",
  },
});
