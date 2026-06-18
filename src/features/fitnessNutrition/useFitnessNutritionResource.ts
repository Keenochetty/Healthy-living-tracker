import { useCallback, useEffect, useState } from "react";

import type { HealthOSFitnessNutritionBackendStatus, HealthOSFitnessNutritionServiceResult } from "./fitnessNutritionTypes";

type MaybePromise<T> = T | Promise<T>;

export function useFitnessNutritionResource<T, CreateInput = unknown>(
  loader: () => Promise<HealthOSFitnessNutritionServiceResult<T[]>>,
  creator?: (input: CreateInput) => MaybePromise<HealthOSFitnessNutritionServiceResult<T>>,
) {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<HealthOSFitnessNutritionBackendStatus>("idle");

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
        return { data: null, error: "Creation is deferred for this resource.", status: "deferred" } satisfies HealthOSFitnessNutritionServiceResult<T>;
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
