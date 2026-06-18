import { useCallback, useEffect, useState } from "react";

import {
  getOnboardingPreferences,
  markOnboardingComplete,
  upsertOnboardingPreferences,
} from "./accountService";
import type {
  HealthOSAccountBackendStatus,
  HealthOSOnboardingPreferences,
  HealthOSOnboardingPreferencesUpdate,
} from "./accountTypes";

export function useOnboardingPreferences() {
  const [preferences, setPreferences] =
    useState<HealthOSOnboardingPreferences | null>(null);
  const [status, setStatus] = useState<HealthOSAccountBackendStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus("loading");
    const result = await getOnboardingPreferences();
    setPreferences(result.data);
    setError(result.error);
    setStatus(result.status);
    return result;
  }, []);

  const updatePreferences = useCallback(
    async (update: HealthOSOnboardingPreferencesUpdate) => {
      setStatus("loading");
      const result = await upsertOnboardingPreferences(update);
      setPreferences(result.data);
      setError(result.error);
      setStatus(result.status);
      return result;
    },
    [],
  );

  const markComplete = useCallback(async () => {
    setStatus("loading");
    const result = await markOnboardingComplete();
    setPreferences(result.data);
    setError(result.error);
    setStatus(result.status);
    return result;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    error,
    loading: status === "loading" || status === "idle",
    markComplete,
    preferences,
    refresh,
    status,
    updatePreferences,
  };
}

