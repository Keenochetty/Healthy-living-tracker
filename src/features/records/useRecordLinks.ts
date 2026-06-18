import { useCallback, useEffect, useState } from "react";

import { createRecordLink, getRecordLinks } from "./recordService";
import type {
  HealthOSRecordLink,
  HealthOSRecordLinkCreateInput,
  HealthOSRecordsServiceResult,
} from "./recordTypes";

export function useRecordLinks(recordId?: string | null) {
  const [result, setResult] = useState<HealthOSRecordsServiceResult<HealthOSRecordLink[]>>({
    data: null,
    error: null,
    status: "idle",
  });

  const refresh = useCallback(async () => {
    if (!recordId) {
      setResult({ data: null, error: null, status: "deferred" });
      return;
    }
    setResult((current) => ({ ...current, status: "loading" }));
    setResult(await getRecordLinks(recordId));
  }, [recordId]);

  const create = useCallback(
    async (input: Omit<HealthOSRecordLinkCreateInput, "recordId">) => {
      if (!recordId) return { data: null, error: "Record id is required.", status: "error" } as const;
      const created = await createRecordLink({ ...input, recordId });
      await refresh();
      return created;
    },
    [recordId, refresh],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, create, refresh };
}
