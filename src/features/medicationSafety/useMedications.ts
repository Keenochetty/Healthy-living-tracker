import { useCallback, useEffect, useState } from "react";

import { archiveMedication, createMedicationDraft, getMedications, reviewMedication, updateMedication } from "./medicationService";
import type { HealthOSMedication, HealthOSMedicationCreateInput, HealthOSMedicationServiceResult, HealthOSMedicationUpdateInput } from "./medicationTypes";

export function useMedications() {
  const [result, setResult] = useState<HealthOSMedicationServiceResult<HealthOSMedication[]>>({ data: null, error: null, status: "idle" });

  const refresh = useCallback(async () => {
    setResult((current) => ({ ...current, status: "loading" }));
    setResult(await getMedications());
  }, []);

  const createDraft = useCallback(async (input: Partial<HealthOSMedicationCreateInput> & { displayName: string }) => {
    const created = await createMedicationDraft(input);
    await refresh();
    return created;
  }, [refresh]);

  const update = useCallback(async (id: string, input: HealthOSMedicationUpdateInput) => {
    const updated = await updateMedication(id, input);
    await refresh();
    return updated;
  }, [refresh]);

  const review = useCallback(async (id: string) => {
    const reviewed = await reviewMedication(id);
    await refresh();
    return reviewed;
  }, [refresh]);

  const archive = useCallback(async (id: string) => {
    const archived = await archiveMedication(id);
    await refresh();
    return archived;
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, archive, createDraft, refresh, review, update };
}
