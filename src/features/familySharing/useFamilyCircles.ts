import { useCallback, useEffect, useState } from "react";

import {
  createFamilyCircle,
  getFamilyCirclesForCurrentUser,
  updateFamilyCircle,
} from "./familySharingService";
import type {
  HealthOSFamilyCircle,
  HealthOSFamilyCircleCreateInput,
  HealthOSFamilyCircleUpdateInput,
  HealthOSFamilySharingServiceResult,
} from "./familySharingTypes";

export function useFamilyCircles() {
  const [result, setResult] = useState<
    HealthOSFamilySharingServiceResult<HealthOSFamilyCircle[]>
  >({ data: null, error: null, status: "idle" });

  const refresh = useCallback(async () => {
    setResult((current) => ({ ...current, status: "loading" }));
    setResult(await getFamilyCirclesForCurrentUser());
  }, []);

  const createCircle = useCallback(async (input: HealthOSFamilyCircleCreateInput) => {
    const created = await createFamilyCircle(input);
    await refresh();
    return created;
  }, [refresh]);

  const updateCircle = useCallback(
    async (circleId: string, input: HealthOSFamilyCircleUpdateInput) => {
      const updated = await updateFamilyCircle(circleId, input);
      await refresh();
      return updated;
    },
    [refresh],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, createCircle, refresh, updateCircle };
}
