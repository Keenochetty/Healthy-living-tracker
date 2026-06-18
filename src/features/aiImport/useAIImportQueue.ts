import { useCallback, useEffect, useState } from "react";

import { getAIImportQueue } from "./aiImportService";
import type { HealthOSAIImportBackendStatus, HealthOSAIImportEnvelope } from "./aiImportTypes";

export function useAIImportQueue() {
  const [data, setData] = useState<HealthOSAIImportEnvelope[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<HealthOSAIImportBackendStatus>("idle");
  const [deferredReason, setDeferredReason] = useState<string | undefined>();

  const refresh = useCallback(async () => {
    setStatus("loading");
    const result = await getAIImportQueue();
    setData(result.data ?? []);
    setError(result.error);
    setStatus(result.status);
    setDeferredReason(result.deferredReason);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading: status === "loading", error, status, deferredReason, refresh };
}
