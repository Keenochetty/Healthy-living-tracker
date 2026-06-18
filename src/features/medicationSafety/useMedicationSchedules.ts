import { useCallback, useEffect, useState } from "react";

import { createMedicationScheduleDraft, getMedicationSchedules, linkMedicationScheduleToReminder, reviewMedicationSchedule } from "./medicationService";
import type { HealthOSMedicationSchedule, HealthOSMedicationScheduleCreateInput, HealthOSMedicationServiceResult } from "./medicationTypes";

export function useMedicationSchedules(medicationId?: string) {
  const [result, setResult] = useState<HealthOSMedicationServiceResult<HealthOSMedicationSchedule[]>>({ data: null, error: null, status: "idle" });

  const refresh = useCallback(async () => {
    if (!medicationId) return;
    setResult((current) => ({ ...current, status: "loading" }));
    setResult(await getMedicationSchedules(medicationId));
  }, [medicationId]);

  const createDraft = useCallback(async (input: Partial<HealthOSMedicationScheduleCreateInput>) => {
    if (!medicationId) return { data: null, error: "Medication ID is required.", status: "error" } as const;
    const created = await createMedicationScheduleDraft({ ...input, medicationId });
    await refresh();
    return created;
  }, [medicationId, refresh]);

  const review = useCallback(async (scheduleId: string) => {
    const reviewed = await reviewMedicationSchedule(scheduleId);
    await refresh();
    return reviewed;
  }, [refresh]);

  const linkReminder = useCallback(async (scheduleId: string, reminderId: string) => {
    const linked = await linkMedicationScheduleToReminder(scheduleId, reminderId);
    await refresh();
    return linked;
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, createDraft, linkReminder, refresh, review };
}
