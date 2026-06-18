import { useCallback } from "react";

import { createFeedingLog, getFeedingLogs } from "./lifeStageService";
import { useLifeStageResource } from "./useLifeStageResource";
import type { FeedingLog } from "./lifeStageTypes";

export function useFeedingLogs(subjectCareProfileId?: string) {
  const loader = useCallback(() => subjectCareProfileId ? getFeedingLogs(subjectCareProfileId) : Promise.resolve({ data: [], error: "Child care profile is required.", status: "deferred" as const }), [subjectCareProfileId]);
  const create = useCallback((input: Partial<FeedingLog> & { subjectCareProfileId: string; feedingType: string }) => createFeedingLog(input), []);
  return useLifeStageResource(loader, create);
}
