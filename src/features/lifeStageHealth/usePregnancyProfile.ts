import { useCallback } from "react";

import { createPregnancyProfileDraft, getPregnancyProfile, updatePregnancyProfile } from "./lifeStageService";
import { useLifeStageSingleton } from "./useLifeStageResource";
import type { PregnancyProfile } from "./lifeStageTypes";

export function usePregnancyProfile() {
  const loader = useCallback(() => getPregnancyProfile(), []);
  const create = useCallback((input: Partial<PregnancyProfile>) => createPregnancyProfileDraft(input), []);
  const update = useCallback((id: string, input: Partial<PregnancyProfile>) => updatePregnancyProfile(id, input), []);
  return useLifeStageSingleton<PregnancyProfile, Partial<PregnancyProfile>, Partial<PregnancyProfile>>(loader, create, update);
}
