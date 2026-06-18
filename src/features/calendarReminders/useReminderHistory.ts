import { useCallback, useEffect, useState } from "react";

import { createReminderHistoryEvent, getReminderHistory } from "./calendarReminderService";
import type {
  HealthOSCalendarReminderServiceResult,
  HealthOSReminderHistory,
  HealthOSReminderHistoryCreateInput,
} from "./calendarReminderTypes";

export function useReminderHistory(reminderId?: string) {
  const [result, setResult] = useState<HealthOSCalendarReminderServiceResult<HealthOSReminderHistory[]>>({
    data: null,
    error: null,
    status: "idle",
  });

  const refresh = useCallback(async () => {
    if (!reminderId) return;
    setResult((current) => ({ ...current, status: "loading" }));
    setResult(await getReminderHistory(reminderId));
  }, [reminderId]);

  const addEvent = useCallback(async (input: Omit<HealthOSReminderHistoryCreateInput, "reminderId">) => {
    if (!reminderId) return { data: null, error: "Reminder ID is required.", status: "error" } as const;
    const created = await createReminderHistoryEvent({ ...input, reminderId });
    await refresh();
    return created;
  }, [refresh, reminderId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, addEvent, refresh };
}
