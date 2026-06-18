import { useCallback, useEffect, useState } from "react";

import { getMedicationById, updateMedication } from "./medicationService";
import type { HealthOSMedication, HealthOSMedicationServiceResult, HealthOSMedicationUpdateInput } from "./medicationTypes";

export function useMedicationDetail(medicationId?: string) {
  const [result, setResult] = useState<HealthOSMedicationServiceResult<HealthOSMedication>>({ data: null, error: null, status: "idle" });

  const refresh = useCallback(async () => {
    if (!medicationId) return;
    setResult((current) => ({ ...current, status: "loading" }));
    setResult(await getMedicationById(medicationId));
  }, [medicationId]);

  const update = useCallback(async (input: HealthOSMedicationUpdateInput) => {
    if (!medicationId) return { data: null, error: "Medication ID is required.", status: "error" } as const;
    const updated = await updateMedication(medicationId, input);
    await refresh();
    return updated;
  }, [medicationId, refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, refresh, update };
}
