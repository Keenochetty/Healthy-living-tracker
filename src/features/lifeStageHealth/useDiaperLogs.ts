import { useCallback } from "react";

import { createDiaperLog, getDiaperLogs } from "./lifeStageService";
import { useLifeStageResource } from "./useLifeStageResource";
import type { DiaperLog } from "./lifeStageTypes";

export function useDiaperLogs(subjectCareProfileId?: string) {
  const loader = useCallback(() => subjectCareProfileId ? getDiaperLogs(subjectCareProfileId) : Promise.resolve({ data: [], error: "Child care profile is required.", status: "deferred" as const }), [subjectCareProfileId]);
  const create = useCallback((input: Partial<DiaperLog> & { subjectCareProfileId: string; diaperType: string }) => createDiaperLog(input), []);
  return useLifeStageResource(loader, create);
}
