import { useCallback, useEffect, useState } from "react";

import { getReminderById } from "./calendarReminderService";
import type { HealthOSCalendarReminderServiceResult, HealthOSReminder } from "./calendarReminderTypes";

export function useReminderDetail(reminderId?: string) {
  const [result, setResult] = useState<HealthOSCalendarReminderServiceResult<HealthOSReminder>>({
    data: null,
    error: null,
    status: "idle",
  });

  const refresh = useCallback(async () => {
    if (!reminderId) return;
    setResult((current) => ({ ...current, status: "loading" }));
    setResult(await getReminderById(reminderId));
  }, [reminderId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, refresh };
}
