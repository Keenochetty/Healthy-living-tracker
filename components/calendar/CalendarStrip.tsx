import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon, StatusPill } from "@/components/ui";
import { calendarColorSoftTokens, calendarColorTokens } from "@/constants/calendar";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import { toCalendarDateKey } from "@/lib/calendar";
import type { CalendarEvent, CalendarViewMode } from "@/types/calendar";

type CalendarStripProps = {
  eventCountByDay: Record<string, number>;
  eventsByDay?: Record<string, CalendarEvent[]>;
  mode: CalendarViewMode;
  onModeChange: (mode: CalendarViewMode) => void;
  onOpenDayMenu?: (date: Date) => void;
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
};

function buildDays(selectedDate: Date, mode: CalendarViewMode) {
  const start = new Date(selectedDate);
  const dayCount = mode === "week" ? 7 : 14;
  start.setDate(selectedDate.getDate() - (mode === "week" ? selectedDate.getDay() : 3));

  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function formatDayName(date: Date) {
  return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
}

export function CalendarStrip({ eventCountByDay, eventsByDay = {}, mode, onModeChange, onOpenDayMenu, onSelectDate, selectedDate }: CalendarStripProps) {
  const days = buildDays(selectedDate, mode);
  const selectedKey = toCalendarDateKey(selectedDate);

  return (
    <View style={styles.container}>
      <View style={styles.selector}>
        <Pressable accessibilityRole="button" onPress={() => onModeChange("week")} style={[styles.modeButton, mode === "week" && styles.modeButtonActive]}>
          <Text style={[styles.modeText, mode === "week" && styles.modeTextActive]}>Week</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => onModeChange("month")} style={[styles.modeButton, mode === "month" && styles.modeButtonActive]}>
          <Text style={[styles.modeText, mode === "month" && styles.modeTextActive]}>Month</Text>
        </Pressable>
      </View>

      <View style={styles.days}>
        {days.map((date) => {
          const key = toCalendarDateKey(date);
          const selected = key === selectedKey;
          const count = eventCountByDay[key] ?? 0;
          const dayEvents = (eventsByDay[key] ?? []).slice(0, 2);

          return (
            <Pressable
              accessibilityRole="button"
              key={key}
              onLongPress={() => onOpenDayMenu?.(date)}
              onPress={() => onSelectDate(date)}
              style={[styles.dayButton, selected && styles.dayButtonActive]}
            >
              <Pressable
                accessibilityLabel="Open day actions"
                accessibilityRole="button"
                onPress={() => onOpenDayMenu?.(date)}
                style={({ pressed }) => [styles.dayMenuButton, pressed && styles.pressed]}
              >
                <AppIcon color={colors.text.muted} name="more" size={16} />
              </Pressable>
              <Text style={[styles.dayName, selected && styles.dayTextActive]}>{formatDayName(date)}</Text>
              <Text style={[styles.dayNumber, selected && styles.dayTextActive]}>{date.getDate()}</Text>
              <View style={styles.eventPillStack}>
                {dayEvents.map((event) => (
                  <View key={event.id} style={[styles.eventPill, { backgroundColor: calendarColorSoftTokens[event.colour] }]}>
                    <View style={[styles.eventPillDot, { backgroundColor: calendarColorTokens[event.colour] }]} />
                    <Text numberOfLines={1} style={styles.eventPillText}>{event.title}</Text>
                  </View>
                ))}
                {count > dayEvents.length ? <StatusPill label={`+${count - dayEvents.length}`} tone={selected ? "success" : "default"} /> : null}
                {count === 0 ? <View style={styles.emptyDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm
  },
  dayButton: {
    alignItems: "center",
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 116,
    minWidth: 82,
    padding: spacing.sm
  },
  dayButtonActive: {
    backgroundColor: colors.brand.primarySoft,
    borderColor: colors.brand.primary
  },
  dayName: {
    color: colors.text.muted,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  dayMenuButton: {
    alignItems: "center",
    alignSelf: "flex-end",
    borderRadius: 999,
    height: 24,
    justifyContent: "center",
    width: 24
  },
  dayNumber: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: "900"
  },
  days: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  dayTextActive: {
    color: colors.brand.primary
  },
  emptyDot: {
    height: 18
  },
  eventPill: {
    alignItems: "center",
    borderRadius: 999,
    flexDirection: "row",
    gap: spacing.xs,
    maxWidth: "100%",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3
  },
  eventPillDot: {
    borderRadius: 999,
    height: 6,
    width: 6
  },
  eventPillStack: {
    alignItems: "center",
    gap: spacing.xs,
    width: "100%"
  },
  eventPillText: {
    color: colors.text.primary,
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "800",
    maxWidth: 64
  },
  modeButton: {
    alignItems: "center",
    borderRadius: 999,
    flex: 1,
    minHeight: 38,
    justifyContent: "center"
  },
  modeButtonActive: {
    backgroundColor: colors.brand.primary
  },
  modeText: {
    color: colors.text.secondary,
    fontSize: 15,
    fontWeight: "900"
  },
  modeTextActive: {
    color: colors.text.inverse
  },
  pressed: {
    opacity: 0.75
  },
  selector: {
    backgroundColor: colors.background.mist,
    borderRadius: 999,
    flexDirection: "row",
    gap: spacing.xs,
    padding: spacing.xs
  }
});
