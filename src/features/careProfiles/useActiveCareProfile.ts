import { useCallback, useEffect, useState } from "react";

import {
  getActiveCareProfilePreference,
  setActiveCareProfilePreference,
} from "./careProfileService";
import type {
  HealthOSActiveCareProfilePreference,
  HealthOSCareProfileServiceResult,
} from "./careProfileTypes";

export function useActiveCareProfile() {
  const [result, setResult] = useState<
    HealthOSCareProfileServiceResult<HealthOSActiveCareProfilePreference>
  >({ data: null, error: null, status: "idle" });

  const refresh = useCallback(async () => {
    setResult((current) => ({ ...current, status: "loading" }));
    setResult(await getActiveCareProfilePreference());
  }, []);

  const setActiveCareProfile = useCallback(
    async (careProfileId: string | null) => {
      const next = await setActiveCareProfilePreference(careProfileId);
      setResult(next);
      return next;
    },
    [],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, refresh, setActiveCareProfile };
}
