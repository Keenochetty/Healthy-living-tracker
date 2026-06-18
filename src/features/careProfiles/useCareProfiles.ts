import { useCallback, useEffect, useState } from "react";

import {
  getCareProfilesForCurrentUser,
  type HealthOSCareProfileServiceResult,
} from ".";
import type { HealthOSCareProfile } from "./careProfileTypes";

export function useCareProfiles() {
  const [result, setResult] = useState<
    HealthOSCareProfileServiceResult<HealthOSCareProfile[]>
  >({ data: null, error: null, status: "idle" });

  const refresh = useCallback(async () => {
    setResult((current) => ({ ...current, status: "loading" }));
    setResult(await getCareProfilesForCurrentUser());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, refresh };
}
