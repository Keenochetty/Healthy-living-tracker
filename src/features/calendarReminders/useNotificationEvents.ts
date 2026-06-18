import { useCallback, useEffect, useState } from "react";

import { getNotificationEvents, markNotificationEventRead } from "./calendarReminderService";
import type { HealthOSCalendarReminderServiceResult, HealthOSNotificationEvent } from "./calendarReminderTypes";

export function useNotificationEvents() {
  const [result, setResult] = useState<HealthOSCalendarReminderServiceResult<HealthOSNotificationEvent[]>>({
    data: null,
    error: null,
    status: "idle",
  });

  const refresh = useCallback(async () => {
    setResult((current) => ({ ...current, status: "loading" }));
    setResult(await getNotificationEvents());
  }, []);

  const markRead = useCallback(async (notificationEventId: string) => {
    const updated = await markNotificationEventRead(notificationEventId);
    await refresh();
    return updated;
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, markRead, refresh };
}
