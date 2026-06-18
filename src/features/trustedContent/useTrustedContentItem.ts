import { useCallback, useEffect, useState } from "react";

import { getTrustedContentItemById, recordContentOpened } from "./trustedContentService";
import type { HealthOSTrustedContentBackendItem, HealthOSTrustedContentBackendStatus } from "./trustedContentTypes";

export function useTrustedContentItem(id?: string | null) {
  const [data, setData] = useState<HealthOSTrustedContentBackendItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<HealthOSTrustedContentBackendStatus>("idle");

  const refresh = useCallback(async () => {
    if (!id) {
      setData(null);
      setStatus("deferred");
      return;
    }
    setStatus("loading");
    const result = await getTrustedContentItemById(id);
    setData(result.data);
    setError(result.error);
    setStatus(result.status);
    if (result.data) void recordContentOpened({ contentItemId: result.data.id, externalUrl: result.data.sourceUrl, sourceRealm: result.data.primaryRealm });
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, error, loading: status === "loading", refresh, status };
}
