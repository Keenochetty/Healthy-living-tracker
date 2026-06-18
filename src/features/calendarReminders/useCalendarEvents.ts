import { useCallback, useEffect, useState } from "react";

import { cancelCalendarEvent, createCalendarEvent, getCalendarEvents, updateCalendarEvent } from "./calendarReminderService";
import type {
  HealthOSCalendarEvent,
  HealthOSCalendarEventCreateInput,
  HealthOSCalendarEventUpdateInput,
  HealthOSCalendarReminderServiceResult,
} from "./calendarReminderTypes";

export function useCalendarEvents() {
  const [result, setResult] = useState<HealthOSCalendarReminderServiceResult<HealthOSCalendarEvent[]>>({
    data: null,
    error: null,
    status: "idle",
  });

  const refresh = useCallback(async () => {
    setResult((current) => ({ ...current, status: "loading" }));
    setResult(await getCalendarEvents());
  }, []);

  const create = useCallback(async (input: HealthOSCalendarEventCreateInput) => {
    const created = await createCalendarEvent(input);
    await refresh();
    return created;
  }, [refresh]);

  const update = useCallback(async (eventId: string, input: HealthOSCalendarEventUpdateInput) => {
    const updated = await updateCalendarEvent(eventId, input);
    await refresh();
    return updated;
  }, [refresh]);

  const cancel = useCallback(async (eventId: string) => {
    const cancelled = await cancelCalendarEvent(eventId);
    await refresh();
    return cancelled;
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, cancel, create, refresh, update };
}
