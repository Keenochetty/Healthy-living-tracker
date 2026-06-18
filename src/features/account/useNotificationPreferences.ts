import { useCallback, useEffect, useState } from "react";

import {
  getNotificationPreferences,
  upsertNotificationPreferences,
} from "./accountService";
import type {
  HealthOSAccountBackendStatus,
  HealthOSNotificationPreferences,
  HealthOSNotificationPreferencesUpdate,
} from "./accountTypes";

export function useNotificationPreferences() {
  const [preferences, setPreferences] =
    useState<HealthOSNotificationPreferences | null>(null);
  const [status, setStatus] = useState<HealthOSAccountBackendStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus("loading");
    const result = await getNotificationPreferences();
    setPreferences(result.data);
    setError(result.error);
    setStatus(result.status);
    return result;
  }, []);

  const updatePreferences = useCallback(
    async (update: HealthOSNotificationPreferencesUpdate) => {
      setStatus("loading");
      const result = await upsertNotificationPreferences(update);
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

