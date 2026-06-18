import { useCallback } from "react";

import { createContraceptionLog, getContraceptionLogs } from "./lifeStageService";
import { useLifeStageResource } from "./useLifeStageResource";
import type { ContraceptionLog } from "./lifeStageTypes";

export function useContraceptionLogs(subjectCareProfileId?: string) {
  const loader = useCallback(() => getContraceptionLogs(subjectCareProfileId), [subjectCareProfileId]);
  const create = useCallback((input: Partial<ContraceptionLog> & { methodType: string }) => createContraceptionLog(input), []);
  return useLifeStageResource(loader, create);
}
