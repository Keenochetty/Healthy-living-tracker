import { useCallback } from "react";

import { createSleepLog, getSleepLogs } from "./lifeStageService";
import { useLifeStageResource } from "./useLifeStageResource";
import type { SleepLog } from "./lifeStageTypes";

export function useSleepLogs(subjectCareProfileId?: string) {
  const loader = useCallback(() => subjectCareProfileId ? getSleepLogs(subjectCareProfileId) : Promise.resolve({ data: [], error: "Child care profile is required.", status: "deferred" as const }), [subjectCareProfileId]);
  const create = useCallback((input: Partial<SleepLog> & { subjectCareProfileId: string }) => createSleepLog(input), []);
  return useLifeStageResource(loader, create);
}
