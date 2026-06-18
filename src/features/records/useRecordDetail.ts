import { useCallback, useEffect, useState } from "react";

import { archiveRecord, getRecordById, updateRecord } from "./recordService";
import type {
  HealthOSRecord,
  HealthOSRecordUpdateInput,
  HealthOSRecordsServiceResult,
} from "./recordTypes";

export function useRecordDetail(recordId?: string | null) {
  const [result, setResult] = useState<HealthOSRecordsServiceResult<HealthOSRecord>>({
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
    setResult(await getRecordById(recordId));
  }, [recordId]);

  const update = useCallback(
    async (input: HealthOSRecordUpdateInput) => {
      if (!recordId) return { data: null, error: "Record id is required.", status: "error" } as const;
      const updated = await updateRecord(recordId, input);
      await refresh();
      return updated;
    },
    [recordId, refresh],
  );

  const archive = useCallback(async () => {
    if (!recordId) return { data: null, error: "Record id is required.", status: "error" } as const;
    const archived = await archiveRecord(recordId);
    await refresh();
    return archived;
  }, [recordId, refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, archive, refresh, update };
}
