import { useCallback, useEffect, useState } from "react";

import {
  getAccountProfile,
  upsertAccountProfile,
} from "./accountService";
import type {
  HealthOSAccountBackendStatus,
  HealthOSAccountProfile,
  HealthOSAccountProfileUpdate,
} from "./accountTypes";

export function useAccountProfile() {
  const [profile, setProfile] = useState<HealthOSAccountProfile | null>(null);
  const [status, setStatus] = useState<HealthOSAccountBackendStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus("loading");
    const result = await getAccountProfile();
    setProfile(result.data);
    setError(result.error);
    setStatus(result.status);
    return result;
  }, []);

  const updateProfile = useCallback(
    async (update: HealthOSAccountProfileUpdate) => {
      setStatus("loading");
      const result = await upsertAccountProfile(update);
      setProfile(result.data);
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
    profile,
    refresh,
    status,
    updateProfile,
  };
}

