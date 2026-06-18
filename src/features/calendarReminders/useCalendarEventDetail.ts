import { useCallback, useEffect, useState } from "react";

import { getCalendarEventById, getCalendarEventLinks } from "./calendarReminderService";
import type { HealthOSCalendarEvent, HealthOSCalendarEventLink, HealthOSCalendarReminderServiceResult } from "./calendarReminderTypes";

export function useCalendarEventDetail(eventId?: string) {
  const [eventResult, setEventResult] = useState<HealthOSCalendarReminderServiceResult<HealthOSCalendarEvent>>({
    data: null,
    error: null,
    status: "idle",
  });
  const [linksResult, setLinksResult] = useState<HealthOSCalendarReminderServiceResult<HealthOSCalendarEventLink[]>>({
    data: null,
    error: null,
    status: "idle",
  });

  const refresh = useCallback(async () => {
    if (!eventId) return;
    setEventResult((current) => ({ ...current, status: "loading" }));
    setLinksResult((current) => ({ ...current, status: "loading" }));
    setEventResult(await getCalendarEventById(eventId));
    setLinksResult(await getCalendarEventLinks(eventId));
  }, [eventId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data: eventResult.data,
    error: eventResult.error ?? linksResult.error,
    links: linksResult.data ?? [],
    refresh,
    status: eventResult.status === "ready" ? linksResult.status : eventResult.status,
  };
}
