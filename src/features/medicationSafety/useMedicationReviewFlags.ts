import { useCallback, useEffect, useState } from "react";

import { createMedicationReviewFlag, getMedicationReviewFlags } from "./medicationService";
import type { HealthOSMedicationReviewFlag, HealthOSMedicationReviewFlagCreateInput, HealthOSMedicationServiceResult } from "./medicationTypes";

export function useMedicationReviewFlags() {
  const [result, setResult] = useState<HealthOSMedicationServiceResult<HealthOSMedicationReviewFlag[]>>({ data: null, error: null, status: "idle" });

  const refresh = useCallback(async () => {
    setResult((current) => ({ ...current, status: "loading" }));
    setResult(await getMedicationReviewFlags());
  }, []);

  const create = useCallback(async (input: HealthOSMedicationReviewFlagCreateInput) => {
    const created = await createMedicationReviewFlag(input);
    await refresh();
    return created;
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, create, refresh };
}
