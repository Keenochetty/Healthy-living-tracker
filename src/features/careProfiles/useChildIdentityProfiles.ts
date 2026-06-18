import { useCallback, useEffect, useState } from "react";

import { getChildIdentityProfiles } from "./careProfileService";
import type {
  HealthOSCareProfile,
  HealthOSCareProfileServiceResult,
} from "./careProfileTypes";

export function useChildIdentityProfiles() {
  const [result, setResult] = useState<
    HealthOSCareProfileServiceResult<HealthOSCareProfile[]>
  >({ data: null, error: null, status: "idle" });

  const refresh = useCallback(async () => {
    setResult((current) => ({ ...current, status: "loading" }));
    setResult(await getChildIdentityProfiles());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, refresh };
}
