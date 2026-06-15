import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppModuleKey } from "@/types/app";
import { CORE_MODULE_KEYS } from "@/constants/modules";

const MODULE_STORAGE_KEY = "family_health_enabled_modules";
const enabledModulesListeners = new Set<(moduleKeys: AppModuleKey[]) => void>();

export function subscribeToEnabledModules(
  listener: (moduleKeys: AppModuleKey[]) => void,
) {
  enabledModulesListeners.add(listener);

  return () => {
    enabledModulesListeners.delete(listener);
  };
}

export async function getEnabledModules(): Promise<AppModuleKey[]> {
  try {
    const savedModules = await AsyncStorage.getItem(MODULE_STORAGE_KEY);

    if (!savedModules) {
      return CORE_MODULE_KEYS;
    }

    const parsed = JSON.parse(savedModules);

    if (!Array.isArray(parsed)) {
      return CORE_MODULE_KEYS;
    }

    const merged = Array.from(new Set([...CORE_MODULE_KEYS, ...parsed]));

    return merged as AppModuleKey[];
  } catch {
    return CORE_MODULE_KEYS;
  }
}

export async function saveEnabledModules(moduleKeys: AppModuleKey[]) {
  const merged = Array.from(new Set([...CORE_MODULE_KEYS, ...moduleKeys]));

  await AsyncStorage.setItem(MODULE_STORAGE_KEY, JSON.stringify(merged));
  enabledModulesListeners.forEach((listener) =>
    listener(merged as AppModuleKey[]),
  );

  return merged as AppModuleKey[];
}
