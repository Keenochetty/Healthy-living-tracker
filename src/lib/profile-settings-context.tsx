import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

import {
  defaultProfileSettings,
  readLocalProfileSettings,
  writeLocalProfileSettings
} from "@/lib/profile-settings";
import { subscribeToEnabledModules } from "@/lib/profilePreferences";
import type { LocalProfileSettings } from "@/types/app";

type SaveProfileSettingsInput = Pick<LocalProfileSettings, "displayName" | "selectedModuleIds">;

type ProfileSettingsContextValue = {
  errorMessage: string | null;
  isLoading: boolean;
  isSaving: boolean;
  saveSettings: (settings: SaveProfileSettingsInput) => Promise<void>;
  settings: LocalProfileSettings;
};

const ProfileSettingsContext = createContext<ProfileSettingsContextValue | null>(null);

export function ProfileSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaultProfileSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    readLocalProfileSettings()
      .then((storedSettings) => {
        if (isActive) {
          setSettings(storedSettings);
        }
      })
      .catch(() => {
        if (isActive) {
          setErrorMessage("Your saved profile settings could not be loaded.");
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(
    () =>
      subscribeToEnabledModules((selectedModuleIds) => {
        setSettings((currentSettings) => ({
          ...currentSettings,
          selectedModuleIds
        }));
      }),
    []
  );

  async function saveSettings(input: SaveProfileSettingsInput) {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      setSettings(await writeLocalProfileSettings(input));
    } catch {
      setErrorMessage("Your profile settings could not be saved.");
      throw new Error("Unable to save local profile settings.");
    } finally {
      setIsSaving(false);
    }
  }

  const value = useMemo(
    () => ({
      errorMessage,
      isLoading,
      isSaving,
      saveSettings,
      settings
    }),
    [errorMessage, isLoading, isSaving, settings]
  );

  return <ProfileSettingsContext.Provider value={value}>{children}</ProfileSettingsContext.Provider>;
}

export function useProfileSettings() {
  const context = useContext(ProfileSettingsContext);

  if (!context) {
    throw new Error("useProfileSettings must be used within ProfileSettingsProvider.");
  }

  return context;
}
