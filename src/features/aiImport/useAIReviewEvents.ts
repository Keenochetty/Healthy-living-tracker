import { useCallback, useEffect, useState } from "react";

import { createAIReviewEvent, getAIReviewEvents } from "./aiImportService";
import type { HealthOSAIImportBackendStatus, HealthOSAIReviewEvent } from "./aiImportTypes";

export function useAIReviewEvents(importEnvelopeId?: string | null) {
  const [data, setData] = useState<HealthOSAIReviewEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<HealthOSAIImportBackendStatus>("idle");
  const [deferredReason, setDeferredReason] = useState<string | undefined>();

  const refresh = useCallback(async () => {
    if (!importEnvelopeId) {
      setStatus("deferred");
      setData([]);
      return;
    }
    setStatus("loading");
    const result = await getAIReviewEvents(importEnvelopeId);
    setData(result.data ?? []);
    setError(result.error);
    setStatus(result.status);
    setDeferredReason(result.deferredReason);
  }, [importEnvelopeId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data,
    loading: status === "loading",
    error,
    status,
    deferredReason,
    refresh,
    createEvent: async (event: HealthOSAIReviewEvent) => {
      const result = await createAIReviewEvent(event);
      await refresh();
      return result;
    },
  };
}
