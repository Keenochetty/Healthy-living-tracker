import { useMemo, useState } from "react";

import type {
  HealthOSCalendarDisplayEvent,
  HealthOSCalendarFilter,
} from "./HealthOSCalendarTypes";
import { filterCalendarEvents, toDateKey } from "./useHealthOSCalendarEvents";

export function useHealthOSCalendarState(
  eventsByDate: Record<string, HealthOSCalendarDisplayEvent[]>,
) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [activeFilters, setActiveFilters] = useState<HealthOSCalendarFilter[]>([]);
  const [daySheetVisible, setDaySheetVisible] = useState(false);
  const [quickLogSheetVisible, setQuickLogSheetVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const selectedDateEvents = useMemo(
    () =>
      filterCalendarEvents(
        eventsByDate[toDateKey(selectedDate)] ?? [],
        activeFilters,
      ),
    [activeFilters, eventsByDate, selectedDate],
  );

  function selectDate(date: Date) {
    setSelectedDate(date);
    setCurrentMonth(startOfMonth(date));
  }

  function longPressDate(date: Date) {
    selectDate(date);
    setQuickLogSheetVisible(true);
  }

  function closeDaySheet() {
    setDaySheetVisible(false);
  }

  function closeQuickLogSheet() {
    setQuickLogSheetVisible(false);
  }

  function openDaySheet() {
    setDaySheetVisible(true);
  }

  function openQuickLogSheet(date = selectedDate) {
    selectDate(date);
    setQuickLogSheetVisible(true);
  }

  function toggleFilter(filter: HealthOSCalendarFilter) {
    setActiveFilters((current) => {
      if (filter === "all") return [];
      if (current.includes(filter)) {
        return current.filter((item) => item !== filter);
      }
      return [...current.filter((item) => item !== "all"), filter];
    });
  }

  function clearFilters() {
    setActiveFilters([]);
  }

  function goToToday() {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(startOfMonth(today));
  }

  function changeMonth(directionOrDate: number | Date) {
    if (directionOrDate instanceof Date) {
      setCurrentMonth(startOfMonth(directionOrDate));
      return;
    }
    setCurrentMonth((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + directionOrDate);
      return startOfMonth(next);
    });
  }

  function toggleCollapsed() {
    setCollapsed((current) => !current);
  }

  return {
    activeFilters,
    clearFilters,
    closeDaySheet,
    closeQuickLogSheet,
    collapsed,
    currentMonth,
    daySheetVisible,
    goToToday,
    longPressDate,
    openDaySheet,
    openQuickLogSheet,
    quickLogSheetVisible,
    selectedDate,
    selectedDateEvents,
    selectDate,
    changeMonth,
    toggleCollapsed,
    toggleFilter,
  };
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12);
}
