import { useCallback } from "react";

import { createWomenHealthLog, getWomenHealthLogs } from "./lifeStageService";
import { useLifeStageResource } from "./useLifeStageResource";
import type { WomenHealthLog } from "./lifeStageTypes";

export function useWomenHealthLogs(subjectCareProfileId?: string) {
  const loader = useCallback(() => getWomenHealthLogs(subjectCareProfileId), [subjectCareProfileId]);
  const create = useCallback((input: Partial<WomenHealthLog>) => createWomenHealthLog(input), []);
  return useLifeStageResource(loader, create);
}
