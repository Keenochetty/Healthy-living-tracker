import { useCallback, useEffect, useState } from "react";

import {
  cancelReminder,
  createReminderDraft,
  getReminders,
  markReminderCompleted,
  reviewReminder,
  scheduleReminderInApp,
  snoozeReminder,
} from "./calendarReminderService";
import type {
  HealthOSCalendarReminderServiceResult,
  HealthOSReminder,
  HealthOSReminderCreateInput,
} from "./calendarReminderTypes";

export function useReminders() {
  const [result, setResult] = useState<HealthOSCalendarReminderServiceResult<HealthOSReminder[]>>({
    data: null,
    error: null,
    status: "idle",
  });

  const refresh = useCallback(async () => {
    setResult((current) => ({ ...current, status: "loading" }));
    setResult(await getReminders());
  }, []);

  const createDraft = useCallback(async (input: Partial<HealthOSReminderCreateInput> & { title?: string }) => {
    const created = await createReminderDraft(input);
    await refresh();
    return created;
  }, [refresh]);

  const review = useCallback(async (reminderId: string) => {
    const reviewed = await reviewReminder(reminderId);
    await refresh();
    return reviewed;
  }, [refresh]);

  const scheduleInApp = useCallback(async (reminderId: string, scheduledFor: string) => {
    const scheduled = await scheduleReminderInApp(reminderId, scheduledFor);
    await refresh();
    return scheduled;
  }, [refresh]);

  const complete = useCallback(async (reminderId: string) => {
    const completed = await markReminderCompleted(reminderId);
    await refresh();
    return completed;
  }, [refresh]);

  const snooze = useCallback(async (reminderId: string, scheduledFor: string) => {
    const snoozed = await snoozeReminder(reminderId, scheduledFor);
    await refresh();
    return snoozed;
  }, [refresh]);

  const cancel = useCallback(async (reminderId: string) => {
    const cancelled = await cancelReminder(reminderId);
    await refresh();
    return cancelled;
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, cancel, complete, createDraft, refresh, review, scheduleInApp, snooze };
}
