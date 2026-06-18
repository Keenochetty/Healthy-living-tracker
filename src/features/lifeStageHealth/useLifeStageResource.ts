import { useCallback, useEffect, useState } from "react";

import type { HealthOSLifeStageBackendStatus, HealthOSLifeStageServiceResult } from "./lifeStageTypes";

type MaybePromise<T> = T | Promise<T>;

export function useLifeStageResource<T, CreateInput = unknown>(
  loader: () => Promise<HealthOSLifeStageServiceResult<T[]>>,
  creator?: (input: CreateInput) => MaybePromise<HealthOSLifeStageServiceResult<T>>,
) {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<HealthOSLifeStageBackendStatus>("idle");

  const refresh = useCallback(async () => {
    setStatus("loading");
    const result = await loader();
    setData(result.data ?? []);
    setError(result.error);
    setStatus(result.status);
    return result;
  }, [loader]);

  const create = useCallback(
    async (input: CreateInput) => {
      if (!creator) {
        return { data: null, error: "Creation is deferred for this resource.", status: "deferred" } satisfies HealthOSLifeStageServiceResult<T>;
      }
      const result = await Promise.resolve(creator(input));
      if (result.data) await refresh();
      return result;
    },
    [creator, refresh],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    create,
    data,
    deferredReason: status === "missingTable" || status === "deferred" ? error : null,
    error,
    loading: status === "loading",
    refresh,
    status,
  };
}

export function useLifeStageSingleton<T, CreateInput = unknown, UpdateInput = unknown>(
  loader: () => Promise<HealthOSLifeStageServiceResult<T[]>>,
  creator?: (input: CreateInput) => MaybePromise<HealthOSLifeStageServiceResult<T>>,
  updater?: (id: string, input: UpdateInput) => MaybePromise<HealthOSLifeStageServiceResult<T>>,
) {
  const resource = useLifeStageResource(loader, creator);
  const item = resource.data[0] ?? null;

  const update = useCallback(
    async (input: UpdateInput) => {
      if (!item || !("id" in (item as object)) || typeof (item as { id?: unknown }).id !== "string" || !updater) {
        return { data: null, error: "Update is deferred until a saved profile exists.", status: "deferred" } satisfies HealthOSLifeStageServiceResult<T>;
      }
      const result = await Promise.resolve(updater((item as unknown as { id: string }).id, input));
      if (result.data) await resource.refresh();
      return result;
    },
    [item, resource, updater],
  );

  return { ...resource, data: item, update };
}
