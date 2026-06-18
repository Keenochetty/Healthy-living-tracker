import { useCallback } from "react";

import { createPregnancyLog, getPregnancyLogs } from "./lifeStageService";
import { useLifeStageResource } from "./useLifeStageResource";
import type { PregnancyLog } from "./lifeStageTypes";

export function usePregnancyLogs(pregnancyProfileId?: string) {
  const loader = useCallback(() => pregnancyProfileId ? getPregnancyLogs(pregnancyProfileId) : Promise.resolve({ data: [], error: "Pregnancy profile is required.", status: "deferred" as const }), [pregnancyProfileId]);
  const create = useCallback((input: Partial<PregnancyLog> & { pregnancyProfileId: string }) => createPregnancyLog(input), []);
  return useLifeStageResource(loader, create);
}
