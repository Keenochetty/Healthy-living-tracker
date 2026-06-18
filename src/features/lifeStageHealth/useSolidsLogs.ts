import { useCallback } from "react";

import { createSolidsLog, getSolidsLogs } from "./lifeStageService";
import { useLifeStageResource } from "./useLifeStageResource";
import type { SolidsLog } from "./lifeStageTypes";

export function useSolidsLogs(subjectCareProfileId?: string) {
  const loader = useCallback(() => subjectCareProfileId ? getSolidsLogs(subjectCareProfileId) : Promise.resolve({ data: [], error: "Child care profile is required.", status: "deferred" as const }), [subjectCareProfileId]);
  const create = useCallback((input: Partial<SolidsLog> & { subjectCareProfileId: string; foodName: string }) => createSolidsLog(input), []);
  return useLifeStageResource(loader, create);
}
