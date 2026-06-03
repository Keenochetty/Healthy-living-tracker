import AsyncStorage from "@react-native-async-storage/async-storage";

import { APP_MODULES, CORE_MODULE_KEYS } from "@/constants/modules";
import { getEnabledModules, saveEnabledModules } from "@/lib/profilePreferences";
import type { AppModuleKey, LocalProfileSettings } from "@/types/app";

const PROFILE_SETTINGS_STORAGE_KEY = "@healthy-living-tracker/profile-settings";
const moduleKeys = new Set<AppModuleKey>(APP_MODULES.map((module) => module.key));

export const defaultProfileSettings: LocalProfileSettings = {
  displayName: "",
  schemaVersion: 1,
  selectedModuleIds: CORE_MODULE_KEYS,
  updatedAt: null
};

function isAppModuleKey(value: unknown): value is AppModuleKey {
  return typeof value === "string" && moduleKeys.has(value as AppModuleKey);
}

function parseStoredSettings(value: string | null): LocalProfileSettings {
  if (!value) {
    return defaultProfileSettings;
  }

  try {
    const stored = JSON.parse(value) as Partial<LocalProfileSettings>;
    const selectedModuleIds = Array.isArray(stored.selectedModuleIds)
      ? stored.selectedModuleIds.filter(isAppModuleKey)
      : defaultProfileSettings.selectedModuleIds;

    return {
      displayName: typeof stored.displayName === "string" ? stored.displayName : "",
      schemaVersion: 1,
      selectedModuleIds,
      updatedAt: typeof stored.updatedAt === "string" ? stored.updatedAt : null
    };
  } catch {
    return defaultProfileSettings;
  }
}

export async function readLocalProfileSettings() {
  const storedProfileSettings = await AsyncStorage.getItem(PROFILE_SETTINGS_STORAGE_KEY);
  const parsedProfileSettings = parseStoredSettings(storedProfileSettings);
  const selectedModuleIds = await getEnabledModules();
  const migratedModuleIds = Array.from(
    new Set([...selectedModuleIds, ...parsedProfileSettings.selectedModuleIds])
  ).filter(isAppModuleKey);

  return {
    ...parsedProfileSettings,
    selectedModuleIds: await saveEnabledModules(migratedModuleIds)
  };
}

export async function writeLocalProfileSettings(
  settings: Pick<LocalProfileSettings, "displayName" | "selectedModuleIds">
) {
  const selectedModuleIds = await saveEnabledModules(
    settings.selectedModuleIds.filter(isAppModuleKey)
  );
  const nextSettings: LocalProfileSettings = {
    displayName: settings.displayName.trim(),
    schemaVersion: 1,
    selectedModuleIds,
    updatedAt: new Date().toISOString()
  };

  await AsyncStorage.setItem(PROFILE_SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));

  return nextSettings;
}
