import { useCallback, useEffect, useState } from "react";

import { ensureSelfCareProfile, getSelfCareProfile } from "./careProfileService";
import type {
  HealthOSCareProfile,
  HealthOSCareProfileServiceResult,
} from "./careProfileTypes";

export function useSelfCareProfile() {
  const [result, setResult] = useState<
    HealthOSCareProfileServiceResult<HealthOSCareProfile>
  >({ data: null, error: null, status: "idle" });

  const refresh = useCallback(async () => {
    setResult((current) => ({ ...current, status: "loading" }));
    setResult(await getSelfCareProfile());
  }, []);

  const ensureSelfProfile = useCallback(async (displayName?: string) => {
    const next = await ensureSelfCareProfile(displayName);
    setResult(next);
    return next;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, ensureSelfProfile, refresh };
}
