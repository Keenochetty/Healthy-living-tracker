import { useCallback } from "react";

import { createVaccineRecord, getVaccineRecords } from "./lifeStageService";
import { useLifeStageResource } from "./useLifeStageResource";
import type { VaccineRecord } from "./lifeStageTypes";

export function useVaccineRecords(subjectCareProfileId?: string) {
  const loader = useCallback(() => subjectCareProfileId ? getVaccineRecords(subjectCareProfileId) : Promise.resolve({ data: [], error: "Child care profile is required.", status: "deferred" as const }), [subjectCareProfileId]);
  const create = useCallback((input: Partial<VaccineRecord> & { subjectCareProfileId: string; vaccineName: string }) => createVaccineRecord(input), []);
  return useLifeStageResource(loader, create);
}
