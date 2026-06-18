import { useCallback, useEffect, useState } from "react";

import {
  createRecordFileMetadata,
  createSignedRecordFileUrl,
  getRecordFiles,
} from "./recordService";
import type {
  HealthOSRecordFile,
  HealthOSRecordFileCreateInput,
  HealthOSRecordsServiceResult,
} from "./recordTypes";

export function useRecordFiles(recordId?: string | null) {
  const [result, setResult] = useState<HealthOSRecordsServiceResult<HealthOSRecordFile[]>>({
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
    setResult(await getRecordFiles(recordId));
  }, [recordId]);

  const createMetadata = useCallback(
    async (input: Omit<HealthOSRecordFileCreateInput, "recordId">) => {
      if (!recordId) return { data: null, error: "Record id is required.", status: "error" } as const;
      const created = await createRecordFileMetadata({ ...input, recordId });
      await refresh();
      return created;
    },
    [recordId, refresh],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...result, createMetadata, createSignedUrl: createSignedRecordFileUrl, refresh };
}
