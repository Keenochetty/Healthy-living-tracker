import { useCallback, useEffect, useState } from "react";

import {
  getAIImportEnvelopeById,
  markAIImportDismissed,
  markAIImportImported,
  markAIImportInReview,
  markAIImportReviewed,
} from "./aiImportService";
import type { HealthOSAIImportBackendStatus, HealthOSAIImportEnvelope } from "./aiImportTypes";

export function useAIImportEnvelope(id?: string | null) {
  const [data, setData] = useState<HealthOSAIImportEnvelope | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<HealthOSAIImportBackendStatus>("idle");
  const [deferredReason, setDeferredReason] = useState<string | undefined>();

  const refresh = useCallback(async () => {
    if (!id) {
      setStatus("deferred");
      setData(null);
      return;
    }
    setStatus("loading");
    const result = await getAIImportEnvelopeById(id);
    setData(result.data);
    setError(result.error);
    setStatus(result.status);
    setDeferredReason(result.deferredReason);
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function run(action: () => Promise<{ data: HealthOSAIImportEnvelope | null; error: string | null; status: HealthOSAIImportBackendStatus; deferredReason?: string }>) {
    const result = await action();
    setData(result.data);
    setError(result.error);
    setStatus(result.status);
    setDeferredReason(result.deferredReason);
    return result;
  }

  return {
    data,
    loading: status === "loading",
    error,
    status,
    deferredReason,
    refresh,
    markInReview: () => (id ? run(() => markAIImportInReview(id)) : Promise.resolve(null)),
    markReviewed: () => (id ? run(() => markAIImportReviewed(id)) : Promise.resolve(null)),
    markDismissed: () => (id ? run(() => markAIImportDismissed(id)) : Promise.resolve(null)),
    markImported: () => (data ? run(() => markAIImportImported(data)) : Promise.resolve(null)),
  };
}
