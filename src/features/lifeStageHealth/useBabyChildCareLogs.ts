import { useCallback } from "react";

import { createChildCareLog, getChildCareLogs } from "./lifeStageService";
import { useLifeStageResource } from "./useLifeStageResource";
import type { ChildCareLog } from "./lifeStageTypes";

export function useBabyChildCareLogs(subjectCareProfileId?: string) {
  const loader = useCallback(() => subjectCareProfileId ? getChildCareLogs(subjectCareProfileId) : Promise.resolve({ data: [], error: "Child care profile is required.", status: "deferred" as const }), [subjectCareProfileId]);
  const create = useCallback((input: Partial<ChildCareLog> & { subjectCareProfileId: string; logType: string }) => createChildCareLog(input), []);
  return useLifeStageResource(loader, create);
}
