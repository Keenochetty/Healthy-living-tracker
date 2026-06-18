import { useCallback } from "react";

import { createGrowthMeasurement, getGrowthMeasurements } from "./lifeStageService";
import { useLifeStageResource } from "./useLifeStageResource";
import type { GrowthMeasurement } from "./lifeStageTypes";

export function useGrowthMeasurements(subjectCareProfileId?: string) {
  const loader = useCallback(() => subjectCareProfileId ? getGrowthMeasurements(subjectCareProfileId) : Promise.resolve({ data: [], error: "Child care profile is required.", status: "deferred" as const }), [subjectCareProfileId]);
  const create = useCallback((input: Partial<GrowthMeasurement> & { subjectCareProfileId: string }) => createGrowthMeasurement(input), []);
  return useLifeStageResource(loader, create);
}
