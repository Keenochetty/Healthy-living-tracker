import { useCallback, useEffect, useState } from "react";

import { createMedicationLog, getMedicationLogs } from "./medicationService";
import type { HealthOSMedicationLog, HealthOSMedicationLogCreateInput, HealthOSMedicationServiceResult } from "./medicationTypes";

export function useMedicationLogs(medicationId?: string) {
  const [result, setResult] = useState<HealthOSMedicationServiceResult<HealthOSMedicationLog[]>>({ data: null, error: null, status: "idle" });

  const refresh = useCallback(async () => {
    if (!medicationId) return;
    setResult((current) => ({ ...current, status: "loading" }));
    setResult(await getMedicationLogs(medicationId));
  }, [medicationId]);

  const create = useCallback(async (input: Omit<HealthOSMedicationLogCreateInput, "medicationId">) => {
    if (!medicationId) return { data: null, error: "Medication ID is required.", status: "error" } as const;
    const created = await createMedicationLog({ ...input, medicationId });
    await refresh();
    return created;
  }, [medicationId, refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, create, refresh };
}
