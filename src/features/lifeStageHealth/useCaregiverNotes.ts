import { useCallback } from "react";

import { createCaregiverNote, getCaregiverNotes } from "./lifeStageService";
import { useLifeStageResource } from "./useLifeStageResource";
import type { CaregiverNote } from "./lifeStageTypes";

export function useCaregiverNotes(subjectCareProfileId?: string) {
  const loader = useCallback(() => subjectCareProfileId ? getCaregiverNotes(subjectCareProfileId) : Promise.resolve({ data: [], error: "Child care profile is required.", status: "deferred" as const }), [subjectCareProfileId]);
  const create = useCallback((input: Partial<CaregiverNote> & { subjectCareProfileId: string; noteText: string }) => createCaregiverNote(input), []);
  return useLifeStageResource(loader, create);
}
