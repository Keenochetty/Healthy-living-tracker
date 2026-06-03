import AsyncStorage from "@react-native-async-storage/async-storage";

import type { UserPreferences } from "@/types/profile";

const LOCAL_ONBOARDING_BACKUP_KEY = "family_health_local_onboarding_backup";
const LOCAL_MODE_KEY = "family_health_local_testing_mode";

export async function getLocalOnboardingBackup() {
  try {
    const { getUserPreferences } = await import("@/lib/userPreferences");
    const stored = await AsyncStorage.getItem(LOCAL_ONBOARDING_BACKUP_KEY);

    if (!stored) {
      return getUserPreferences();
    }

    return JSON.parse(stored) as UserPreferences;
  } catch {
    const { getUserPreferences } = await import("@/lib/userPreferences");

    return getUserPreferences();
  }
}

export async function saveLocalOnboardingBackup(preferences: UserPreferences) {
  const { saveUserPreferences } = await import("@/lib/userPreferences");
  const saved = await saveUserPreferences(preferences, { skipRemoteSync: true });

  await AsyncStorage.setItem(LOCAL_ONBOARDING_BACKUP_KEY, JSON.stringify(saved));

  return saved;
}

export async function clearLocalOnboardingBackup() {
  await AsyncStorage.removeItem(LOCAL_ONBOARDING_BACKUP_KEY);
}

export async function getLocalTestingMode() {
  return (await AsyncStorage.getItem(LOCAL_MODE_KEY)) === "true";
}

export async function setLocalTestingMode(enabled: boolean) {
  await AsyncStorage.setItem(LOCAL_MODE_KEY, enabled ? "true" : "false");
}
