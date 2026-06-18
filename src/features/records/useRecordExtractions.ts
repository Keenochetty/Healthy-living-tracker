import { useCallback, useEffect, useState } from "react";

import { createRecordExtraction, getRecordExtractions } from "./recordService";
import type {
  HealthOSRecordExtraction,
  HealthOSRecordExtractionCreateInput,
  HealthOSRecordsServiceResult,
} from "./recordTypes";

export function useRecordExtractions(recordId?: string | null) {
  const [result, setResult] = useState<HealthOSRecordsServiceResult<HealthOSRecordExtraction[]>>({
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
    setResult(await getRecordExtractions(recordId));
  }, [recordId]);

  const create = useCallback(
    async (input: Omit<HealthOSRecordExtractionCreateInput, "recordId">) => {
      if (!recordId) return { data: null, error: "Record id is required.", status: "error" } as const;
      const created = await createRecordExtraction({ ...input, recordId });
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
