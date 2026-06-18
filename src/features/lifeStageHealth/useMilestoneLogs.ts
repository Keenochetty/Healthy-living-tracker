import { useCallback } from "react";

import { createMilestoneLog, getMilestoneLogs } from "./lifeStageService";
import { useLifeStageResource } from "./useLifeStageResource";
import type { MilestoneLog } from "./lifeStageTypes";

export function useMilestoneLogs(subjectCareProfileId?: string) {
  const loader = useCallback(() => subjectCareProfileId ? getMilestoneLogs(subjectCareProfileId) : Promise.resolve({ data: [], error: "Child care profile is required.", status: "deferred" as const }), [subjectCareProfileId]);
  const create = useCallback((input: Partial<MilestoneLog> & { subjectCareProfileId: string; milestoneKey: string; milestoneLabel: string }) => createMilestoneLog(input), []);
  return useLifeStageResource(loader, create);
}
