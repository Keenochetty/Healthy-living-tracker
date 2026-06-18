import { useCallback, useEffect, useState } from "react";

import { archiveSupplement, createSupplementDraft, getSupplements, reviewSupplement, updateSupplement } from "./medicationService";
import type { HealthOSMedicationServiceResult, HealthOSSupplement, HealthOSSupplementCreateInput, HealthOSSupplementUpdateInput } from "./medicationTypes";

export function useSupplements() {
  const [result, setResult] = useState<HealthOSMedicationServiceResult<HealthOSSupplement[]>>({ data: null, error: null, status: "idle" });

  const refresh = useCallback(async () => {
    setResult((current) => ({ ...current, status: "loading" }));
    setResult(await getSupplements());
  }, []);

  const createDraft = useCallback(async (input: Partial<HealthOSSupplementCreateInput> & { displayName: string }) => {
    const created = await createSupplementDraft(input);
    await refresh();
    return created;
  }, [refresh]);

  const update = useCallback(async (id: string, input: HealthOSSupplementUpdateInput) => {
    const updated = await updateSupplement(id, input);
    await refresh();
    return updated;
  }, [refresh]);

  const review = useCallback(async (id: string) => {
    const reviewed = await reviewSupplement(id);
    await refresh();
    return reviewed;
  }, [refresh]);

  const archive = useCallback(async (id: string) => {
    const archived = await archiveSupplement(id);
    await refresh();
    return archived;
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, archive, createDraft, refresh, review, update };
}
