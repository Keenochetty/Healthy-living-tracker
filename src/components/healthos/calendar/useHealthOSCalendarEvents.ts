import { useCallback, useEffect, useMemo, useState } from "react";
import type { Href } from "expo-router";

import { getReminders } from "@/lib/reminderStorage";
import {
  getCalendarHaloOverlaysForDateRange,
  getWomensHealthSettings,
} from "@/lib/womensHealthStorage";
import { getFitnessCalendarReminders } from "@/services/fitnessPlanActivationService";
import type { AppReminder, ReminderType } from "@/types/reminders";
import type { CalendarHaloOverlay } from "@/types/womensHealth";
import type {
  HealthOSCalendarDisplayEvent,
  HealthOSCalendarEventCategory,
  HealthOSCalendarFilter,
  HealthOSCalendarIndicator,
} from "./HealthOSCalendarTypes";

export function useHealthOSCalendarEvents(currentMonth: Date) {
  const [events, setEvents] = useState<HealthOSCalendarDisplayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [reminders, fitnessReminders, womensSettings, overlays] =
        await Promise.all([
          getReminders(),
          getFitnessCalendarReminders().catch(() => []),
          getWomensHealthSettings().catch(() => null),
          getCalendarHaloOverlaysForDateRange(
            addDays(monthStart, -7),
            addDays(monthEnd, 7),
          ).catch(() => []),
        ]);

      const canShowWomensOverlays = Boolean(
        womensSettings?.trackingEnabled && womensSettings.overlayEnabled,
      );

      setEvents([
        ...[...reminders, ...fitnessReminders].map(reminderToEvent),
        ...(canShowWomensOverlays ? overlays.map(overlayToEvent) : []),
      ]);
    } catch {
      setError("Calendar data could not be loaded.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [monthEnd, monthStart]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const eventsByDate = useMemo(() => groupEventsByDate(events), [events]);

  const getEventsForDate = useCallback(
    (date: Date) => eventsByDate[toDateKey(date)] ?? [],
    [eventsByDate],
  );

  const filterEvents = useCallback(
    (
      nextEvents: HealthOSCalendarDisplayEvent[],
      activeFilters: HealthOSCalendarFilter[],
    ) => filterCalendarEvents(nextEvents, activeFilters),
    [],
  );

  const getIndicatorsForDate = useCallback(
    (date: Date, activeFilters: HealthOSCalendarFilter[] = []) => {
      const filtered = filterCalendarEvents(getEventsForDate(date), activeFilters);
      return buildIndicators(filtered);
    },
    [getEventsForDate],
  );

  return {
    error,
    events,
    eventsByDate,
    filterEvents,
    getEventsForDate,
    getIndicatorsForDate,
    loading,
    reload: loadEvents,
  };
}

export function filterCalendarEvents(
  events: HealthOSCalendarDisplayEvent[],
  activeFilters: HealthOSCalendarFilter[],
) {
  if (!activeFilters.length || activeFilters.includes("all")) return events;

  return events.filter((event) =>
    activeFilters.some((filter) => {
      if (filter === "babyChild") {
        return event.category === "baby" || event.category === "child";
      }
      if (filter === "women") {
        return event.category === "cycle";
      }
      if (filter === "private") {
        return event.privacy === "private";
      }
      return event.category === filter;
    }),
  );
}

function reminderToEvent(reminder: AppReminder): HealthOSCalendarDisplayEvent {
  const category = reminderTypeToCategory(reminder.type);
  return {
    category,
    date: toDateKey(new Date(reminder.dueAt)),
    id: `reminder-${reminder.id}`,
    privacy: isPrivateCategory(category) ? "private" : "public",
    routeTarget: reminderRoute(reminder.type),
    source: "reminder",
    startTime: reminder.dueAt,
    subtitle: reminder.notes ?? labelType(reminder.type),
    title: reminder.title,
  };
}

function overlayToEvent(overlay: CalendarHaloOverlay): HealthOSCalendarDisplayEvent {
  return {
    category: overlay.type.includes("pregnancy") ? "pregnancy" : "cycle",
    date: overlay.date,
    id: `overlay-${overlay.id}`,
    memberInitials: overlay.profileAvatarLabel,
    privacy: overlay.isShared ? "shared" : "private",
    sharedBy: overlay.isShared ? overlay.profileName : undefined,
    source: "women_health_overlay",
    subtitle: overlay.isShared ? "Shared overlay" : "Private women’s health overlay",
    title: overlay.label,
  };
}

function buildIndicators(events: HealthOSCalendarDisplayEvent[]) {
  const indicators: HealthOSCalendarIndicator[] = [];

  for (const event of events) {
    const existing = indicators.find(
      (indicator) =>
        indicator.category === event.category && indicator.privacy === event.privacy,
    );
    if (existing) {
      existing.count = (existing.count ?? 1) + 1;
      continue;
    }
    indicators.push({
      category: event.category,
      initials: event.memberInitials,
      privacy: event.privacy,
      warning: event.category === "warning",
    });
  }

  return indicators.slice(0, 4);
}

function groupEventsByDate(events: HealthOSCalendarDisplayEvent[]) {
  return events.reduce<Record<string, HealthOSCalendarDisplayEvent[]>>(
    (groups, event) => {
      groups[event.date] = [...(groups[event.date] ?? []), event].sort(
        (left, right) =>
          new Date(left.startTime ?? left.date).getTime() -
          new Date(right.startTime ?? right.date).getTime(),
      );
      return groups;
    },
    {},
  );
}

function reminderTypeToCategory(
  type: ReminderType,
): HealthOSCalendarEventCategory {
  if (type === "medication") return "medication";
  if (type === "fitness") return "fitness";
  if (type === "food") return "nutrition";
  if (type === "family" || type === "caregiver" || type === "elder_care") {
    return "family";
  }
  if (type === "child_baby") return "baby";
  if (type === "doctor_visit") return "appointment";
  if (type === "work") return "work";
  return "personal";
}

function reminderRoute(type: ReminderType): Href {
  if (type === "medication") return "/medication" as Href;
  if (type === "fitness") return "/(tabs)/fitness" as Href;
  if (type === "food") return "/(tabs)/food" as Href;
  if (type === "child_baby") return "/baby-child" as Href;
  if (type === "family" || type === "caregiver") return "/(tabs)/circle" as Href;
  return "/(tabs)/calendar" as Href;
}

function isPrivateCategory(category: HealthOSCalendarEventCategory) {
  return [
    "cycle",
    "health",
    "medication",
    "pregnancy",
    "records",
  ].includes(category);
}

function labelType(type: string) {
  return type
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 12);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
