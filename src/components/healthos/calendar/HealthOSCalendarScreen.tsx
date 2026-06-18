import { Href, router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSAppShell } from "@/components/healthos/shell/HealthOSAppShell";
import {
  getHealthOSPalette,
  healthOSLayout,
  healthOSSafeArea,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import { HealthOSCalendarFilterRow } from "./HealthOSCalendarFilterRow";
import { HealthOSCalendarHeader } from "./HealthOSCalendarHeader";
import { HealthOSCalendarLegend } from "./HealthOSCalendarLegend";
import { HealthOSDaySummaryCard } from "./HealthOSDaySummaryCard";
import { HealthOSDayTimelineSheet } from "./HealthOSDayTimelineSheet";
import { HealthOSMonthCalendar } from "./HealthOSMonthCalendar";
import { HealthOSQuickLogSheet } from "./HealthOSQuickLogSheet";
import type {
  HealthOSCalendarDisplayEvent,
  HealthOSCalendarFilter,
} from "./HealthOSCalendarTypes";
import { useHealthOSCalendarEvents } from "./useHealthOSCalendarEvents";
import { useHealthOSCalendarState } from "./useHealthOSCalendarState";

export function HealthOSCalendarScreen() {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const [eventLoadMonth, setEventLoadMonth] = useState(() => new Date());
  const calendarEvents = useHealthOSCalendarEvents(eventLoadMonth);
  const calendarState = useHealthOSCalendarState(calendarEvents.eventsByDate);

  useEffect(() => {
    setEventLoadMonth(calendarState.currentMonth);
  }, [calendarState.currentMonth]);

  const selectedEvents = calendarEvents.filterEvents(
    calendarEvents.getEventsForDate(calendarState.selectedDate),
    calendarState.activeFilters,
  );
  const activeFilterCount = calendarState.activeFilters.length;

  function handleEventPress(event: HealthOSCalendarDisplayEvent) {
    if (event.routeTarget) router.push(event.routeTarget as Href);
  }

  return (
    <HealthOSAppShell
      activeNavKey="calendar"
      showAICommandBar={false}
      showBottomNav={false}
      subtitle="Plan your day"
      testID="healthos-calendar-screen"
      title="Calendar"
      withBottomNavSpace={false}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <HealthOSCalendarHeader
            activeFilterCount={activeFilterCount}
            collapsed={calendarState.collapsed}
            currentMonth={calendarState.currentMonth}
            eventCountThisWeek={countWeekEvents(
              calendarEvents.events,
              calendarState.selectedDate,
              calendarState.activeFilters,
              calendarEvents.filterEvents,
            )}
            onAdd={() => calendarState.openQuickLogSheet()}
            onFilter={() =>
              activeFilterCount ? calendarState.clearFilters() : undefined
            }
            onNextMonth={() => calendarState.changeMonth(1)}
            onPreviousMonth={() => calendarState.changeMonth(-1)}
            onToday={calendarState.goToToday}
            onToggleCollapsed={calendarState.toggleCollapsed}
          />
          <HealthOSCalendarFilterRow
            activeFilters={calendarState.activeFilters}
            onClearFilters={calendarState.clearFilters}
            onToggleFilter={calendarState.toggleFilter}
          />
          {calendarEvents.error ? (
            <HealthOSCard variant="danger">
              <Text style={[healthOSTypography.bodySmall, { color: palette.danger }]}>
                {calendarEvents.error}
              </Text>
            </HealthOSCard>
          ) : null}
          {calendarEvents.loading ? (
            <HealthOSCard variant="compact">
              <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
                Loading calendar items...
              </Text>
            </HealthOSCard>
          ) : null}
          <HealthOSMonthCalendar
            activeFilters={calendarState.activeFilters}
            collapsed={calendarState.collapsed}
            currentMonth={calendarState.currentMonth}
            getIndicatorsForDate={calendarEvents.getIndicatorsForDate}
            onChangeMonth={calendarState.changeMonth}
            onLongPressDate={calendarState.longPressDate}
            onSelectDate={calendarState.selectDate}
            selectedDate={calendarState.selectedDate}
            testID="healthos-month-calendar"
          />
          <HealthOSDaySummaryCard
            date={calendarState.selectedDate}
            events={selectedEvents}
            onAdd={() => calendarState.openQuickLogSheet()}
            onViewFullDay={calendarState.openDaySheet}
          />
          <HealthOSCalendarLegend />
          <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
            Private and shared markers are visual-ready. Existing women’s health overlays stay private unless their existing data marks them shared.
          </Text>
        </View>
      </ScrollView>
      <HealthOSDayTimelineSheet
        date={calendarState.selectedDate}
        events={selectedEvents}
        onAddItem={() => {
          calendarState.closeDaySheet();
          calendarState.openQuickLogSheet();
        }}
        onClose={calendarState.closeDaySheet}
        onEventPress={handleEventPress}
        testID="healthos-day-timeline-sheet"
        visible={calendarState.daySheetVisible}
      />
      <HealthOSQuickLogSheet
        date={calendarState.selectedDate}
        onClose={calendarState.closeQuickLogSheet}
        testID="healthos-quick-log-sheet"
        visible={calendarState.quickLogSheetVisible}
      />
    </HealthOSAppShell>
  );
}

function countWeekEvents(
  events: HealthOSCalendarDisplayEvent[],
  selectedDate: Date,
  activeFilters: HealthOSCalendarFilter[],
  filterEvents: (
    events: HealthOSCalendarDisplayEvent[],
    activeFilters: HealthOSCalendarFilter[],
  ) => HealthOSCalendarDisplayEvent[],
) {
  const first = new Date(selectedDate);
  first.setDate(selectedDate.getDate() - selectedDate.getDay());
  const last = new Date(first);
  last.setDate(first.getDate() + 6);
  return filterEvents(events, activeFilters).filter((event) => {
    const eventDate = new Date(`${event.date}T12:00:00`);
    return eventDate >= first && eventDate <= last;
  }).length;
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    gap: healthOSSpacing.lg,
    maxWidth: healthOSLayout.screenMaxWidth,
    width: "100%",
  },
  scrollContent: {
    paddingBottom: healthOSSafeArea.bottomNavSpace + 28,
    paddingHorizontal: healthOSSafeArea.screenHorizontal,
    paddingTop: healthOSSpacing.md,
  },
});
