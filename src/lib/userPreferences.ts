import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";

import { CORE_MODULE_KEYS } from "@/constants/modules";
import { APP_WIDGETS } from "@/constants/widgets";
import { DEFAULT_COUNTRY, getCountryByCode, getCountryByName } from "@/constants/countries";
import type { AppModuleKey } from "@/types/app";
import type { UnitPreferences, UserPreferences } from "@/types/profile";
import { saveEnabledModules } from "./profilePreferences";
import { savePreferencesToSupabase } from "./profileSync";

const USER_PREFERENCES_STORAGE_KEY = "family_health_user_preferences";
const preferenceListeners = new Set<(preferences: UserPreferences) => void>();

export function subscribeToUserPreferences(
  listener: (preferences: UserPreferences) => void
) {
  preferenceListeners.add(listener);

  return () => {
    preferenceListeners.delete(listener);
  };
}

function notifyPreferenceListeners(preferences: UserPreferences) {
  preferenceListeners.forEach((listener) => listener(preferences));
}

function getDetectedDefaults() {
  try {
    const locale = Localization.getLocales()[0];
    const calendar = Localization.getCalendars()[0];
    const country = getCountryByCode(locale.regionCode);

    return {
      country,
      language: locale.languageCode ?? "en",
      timezone: calendar.timeZone ?? country.timezone
    };
  } catch {
    return {
      country: DEFAULT_COUNTRY,
      language: "en",
      timezone: DEFAULT_COUNTRY.timezone
    };
  }
}

export function getDefaultUserPreferences(): UserPreferences {
  const detected = getDetectedDefaults();
  const defaultWidgets = APP_WIDGETS.filter((widget) =>
    CORE_MODULE_KEYS.includes(widget.moduleKey)
  ).map((widget) => widget.key);

  return {
    country: detected.country.country,
    currency: detected.country.currency,
    displayName: "",
    enabledModules: CORE_MODULE_KEYS,
    enabledWidgets: defaultWidgets,
    language: detected.language,
    onboardingComplete: false,
    themeKey: "soft_lavender",
    timezone: detected.timezone,
    units: { ...detected.country.defaultUnits }
  };
}

function normalisePreferences(preferences: Partial<UserPreferences>): UserPreferences {
  const defaults = getDefaultUserPreferences();
  const country = getCountryByName(preferences.country ?? defaults.country);
  const enabledModules = Array.from(
    new Set([...CORE_MODULE_KEYS, ...(preferences.enabledModules ?? defaults.enabledModules)])
  ) as AppModuleKey[];
  const enabledWidgets = preferences.enabledWidgets?.length
    ? preferences.enabledWidgets
    : APP_WIDGETS.filter((widget) => enabledModules.includes(widget.moduleKey)).map(
        (widget) => widget.key
      );

  return {
    ...defaults,
    ...preferences,
    country: country.country,
    currency: preferences.currency ?? country.currency,
    enabledModules,
    enabledWidgets,
    timezone: preferences.timezone ?? country.timezone,
    units: {
      ...country.defaultUnits,
      ...(preferences.units ?? {})
    }
  };
}

export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    const storedPreferences = await AsyncStorage.getItem(USER_PREFERENCES_STORAGE_KEY);

    if (!storedPreferences) {
      return getDefaultUserPreferences();
    }

    return normalisePreferences(JSON.parse(storedPreferences) as Partial<UserPreferences>);
  } catch {
    return getDefaultUserPreferences();
  }
}

type SaveUserPreferencesOptions = {
  skipRemoteSync?: boolean;
};

export async function saveUserPreferences(
  preferences: UserPreferences,
  options: SaveUserPreferencesOptions = {}
) {
  const normalisedPreferences = normalisePreferences(preferences);

  await AsyncStorage.setItem(
    USER_PREFERENCES_STORAGE_KEY,
    JSON.stringify(normalisedPreferences)
  );
  await saveEnabledModules(normalisedPreferences.enabledModules);
  notifyPreferenceListeners(normalisedPreferences);

  if (!options.skipRemoteSync) {
    savePreferencesToSupabase(normalisedPreferences).catch(() => undefined);
  }

  return normalisedPreferences;
}

export async function updateUserPreferences(partial: Partial<UserPreferences>) {
  const currentPreferences = await getUserPreferences();

  return saveUserPreferences({
    ...currentPreferences,
    ...partial,
    units: partial.units
      ? ({ ...currentPreferences.units, ...partial.units } as UnitPreferences)
      : currentPreferences.units
  });
}

export async function completeOnboarding() {
  return updateUserPreferences({ onboardingComplete: true });
}

export async function resetOnboarding() {
  return updateUserPreferences({ onboardingComplete: false });
}

export async function hasCompletedOnboarding() {
  const preferences = await getUserPreferences();

  return preferences.onboardingComplete;
}
