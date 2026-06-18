import { useCallback, useEffect, useState } from "react";

import { updateExtractionJobStatus } from "./aiImportService";
import type { HealthOSAIExtractionJob, HealthOSAIExtractionJobStatus, HealthOSAIImportBackendStatus } from "./aiImportTypes";

export function useAIExtractionJob(initialJob?: HealthOSAIExtractionJob | null) {
  const [data, setData] = useState<HealthOSAIExtractionJob | null>(initialJob ?? null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<HealthOSAIImportBackendStatus>(initialJob ? "ready" : "deferred");

  const refresh = useCallback(async () => {
    setStatus(data ? "ready" : "deferred");
  }, [data]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data,
    loading: status === "loading",
    error,
    status,
    refresh,
    updateStatus: async (nextStatus: HealthOSAIExtractionJobStatus) => {
      if (!data?.id) {
        setStatus("deferred");
        return null;
      }
      const result = await updateExtractionJobStatus(data.id, nextStatus);
      setData(result.data);
      setError(result.error);
      setStatus(result.status);
      return result;
    },
  };
}
