import { useCallback, useEffect, useState } from "react";

import {
  addFamilyMember,
  getFamilyMembers,
  updateFamilyMemberStatus,
} from "./familySharingService";
import type {
  HealthOSFamilyCircleMember,
  HealthOSFamilyMemberCreateInput,
  HealthOSFamilyMemberStatus,
  HealthOSFamilySharingServiceResult,
} from "./familySharingTypes";

export function useFamilyMembers(circleId?: string | null) {
  const [result, setResult] = useState<
    HealthOSFamilySharingServiceResult<HealthOSFamilyCircleMember[]>
  >({ data: null, error: null, status: "idle" });

  const refresh = useCallback(async () => {
    if (!circleId) {
      setResult({ data: [], error: null, status: "deferred" });
      return;
    }
    setResult((current) => ({ ...current, status: "loading" }));
    setResult(await getFamilyMembers(circleId));
  }, [circleId]);

  const addMember = useCallback(
    async (input: HealthOSFamilyMemberCreateInput) => {
      const created = await addFamilyMember(input);
      await refresh();
      return created;
    },
    [refresh],
  );

  const setMemberStatus = useCallback(
    async (
      memberId: string,
      status: Exclude<HealthOSFamilyMemberStatus, "unknown">,
    ) => {
      const updated = await updateFamilyMemberStatus(memberId, status);
      await refresh();
      return updated;
    },
    [refresh],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, addMember, refresh, setMemberStatus };
}
