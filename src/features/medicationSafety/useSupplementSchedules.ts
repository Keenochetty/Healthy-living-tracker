import { useCallback, useEffect, useState } from "react";

import { createSupplementScheduleDraft, getSupplementSchedules, reviewSupplementSchedule } from "./medicationService";
import type { HealthOSMedicationServiceResult, HealthOSSupplementSchedule, HealthOSSupplementScheduleCreateInput } from "./medicationTypes";

export function useSupplementSchedules(supplementId?: string) {
  const [result, setResult] = useState<HealthOSMedicationServiceResult<HealthOSSupplementSchedule[]>>({ data: null, error: null, status: "idle" });

  const refresh = useCallback(async () => {
    if (!supplementId) return;
    setResult((current) => ({ ...current, status: "loading" }));
    setResult(await getSupplementSchedules(supplementId));
  }, [supplementId]);

  const createDraft = useCallback(async (input: Partial<HealthOSSupplementScheduleCreateInput>) => {
    if (!supplementId) return { data: null, error: "Supplement ID is required.", status: "error" } as const;
    const created = await createSupplementScheduleDraft({ ...input, supplementId });
    await refresh();
    return created;
  }, [refresh, supplementId]);

  const review = useCallback(async (scheduleId: string) => {
    const reviewed = await reviewSupplementSchedule(scheduleId);
    await refresh();
    return reviewed;
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, createDraft, refresh, review };
}
