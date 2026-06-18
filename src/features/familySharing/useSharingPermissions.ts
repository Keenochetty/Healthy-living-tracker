import { useCallback, useEffect, useState } from "react";

import {
  getSharingPermissions,
  grantSharingPermission,
  revokeSharingPermission,
} from "./familySharingService";
import type {
  HealthOSFamilySharingServiceResult,
  HealthOSSharingPermission,
  HealthOSSharingPermissionCreateInput,
} from "./familySharingTypes";

export function useSharingPermissions(circleId?: string | null) {
  const [result, setResult] = useState<
    HealthOSFamilySharingServiceResult<HealthOSSharingPermission[]>
  >({ data: null, error: null, status: "idle" });

  const refresh = useCallback(async () => {
    if (!circleId) {
      setResult({ data: [], error: null, status: "deferred" });
      return;
    }
    setResult((current) => ({ ...current, status: "loading" }));
    setResult(await getSharingPermissions(circleId));
  }, [circleId]);

  const grantPermission = useCallback(
    async (input: HealthOSSharingPermissionCreateInput) => {
      const granted = await grantSharingPermission(input);
      await refresh();
      return granted;
    },
    [refresh],
  );

  const revokePermission = useCallback(
    async (permissionId: string) => {
      const revoked = await revokeSharingPermission(permissionId);
      await refresh();
      return revoked;
    },
    [refresh],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, grantPermission, refresh, revokePermission };
}
