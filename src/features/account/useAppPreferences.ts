import { useCallback, useEffect, useState } from "react";

import { getAppPreferences, upsertAppPreferences } from "./accountService";
import type {
  HealthOSAccountBackendStatus,
  HealthOSAppPreferences,
  HealthOSAppPreferencesUpdate,
} from "./accountTypes";

export function useAppPreferences() {
  const [preferences, setPreferences] = useState<HealthOSAppPreferences | null>(null);
  const [status, setStatus] = useState<HealthOSAccountBackendStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus("loading");
    const result = await getAppPreferences();
    setPreferences(result.data);
    setError(result.error);
    setStatus(result.status);
    return result;
  }, []);

  const updatePreferences = useCallback(
    async (update: HealthOSAppPreferencesUpdate) => {
      setStatus("loading");
      const result = await upsertAppPreferences(update);
      setPreferences(result.data);
      setError(result.error);
      setStatus(result.status);
      return result;
    },
    [],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    error,
    loading: status === "loading" || status === "idle",
    preferences,
    refresh,
    status,
    updatePreferences,
  };
}

