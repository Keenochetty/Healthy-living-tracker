import * as Localization from "expo-localization";

import { defaultSettingsPreferences } from "@/constants/settings";
import { supabase } from "@/lib/supabase";
import type { DeviceSettingsDefaults, SettingsPreferences, UnitsPreferences } from "@/types/settings";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isImperialMeasurementSystem(value: string | null | undefined) {
  return value === "us" || value === "uk";
}

export function getDeviceSettingsDefaults(): DeviceSettingsDefaults {
  const locale = Localization.getLocales()[0];
  const calendar = Localization.getCalendars()[0];
  const measurementSystem = isImperialMeasurementSystem(locale.measurementSystem) ? "imperial" : "metric";
  const region = locale.regionCode?.toUpperCase() ?? null;
  const uses24hourClock = calendar.uses24hourClock ?? measurementSystem === "metric";

  return {
    dateFormat: region === "US" ? "mm_dd_yyyy" : "dd_mm_yyyy",
    distance: measurementSystem === "metric" ? "km" : "miles",
    height: measurementSystem === "metric" ? "cm" : "ft_in",
    locale: locale.languageTag,
    measurementSystem,
    region,
    temperature: locale.temperatureUnit === "fahrenheit" ? "fahrenheit" : "celsius",
    timeFormat: uses24hourClock ? "24_hour" : "12_hour",
    weight: measurementSystem === "metric" ? "kg" : "lb"
  };
}

export function normalizeSettingsPreferences(value: unknown): SettingsPreferences {
  const preferences = isRecord(value) ? value : {};
  const units = isRecord(preferences.units) ? preferences.units : {};
  const appearance = isRecord(preferences.appearance) ? preferences.appearance : {};
  const notifications = isRecord(preferences.notifications) ? preferences.notifications : {};
  const privacy = isRecord(preferences.privacy) ? preferences.privacy : {};
  const ai = isRecord(preferences.ai) ? preferences.ai : {};

  return {
    ai: {
      allowSafeSummaries:
        typeof ai.allowSafeSummaries === "boolean"
          ? ai.allowSafeSummaries
          : defaultSettingsPreferences.ai.allowSafeSummaries,
      logActionsToAudit:
        typeof ai.logActionsToAudit === "boolean"
          ? ai.logActionsToAudit
          : defaultSettingsPreferences.ai.logActionsToAudit
    },
    appearance: {
      reduceMotion:
        typeof appearance.reduceMotion === "boolean"
          ? appearance.reduceMotion
          : defaultSettingsPreferences.appearance.reduceMotion,
      theme:
        appearance.theme === "light" || appearance.theme === "dark" || appearance.theme === "device_default"
          ? appearance.theme
          : defaultSettingsPreferences.appearance.theme
    },
    notifications: {
      lockSensitiveNotifications:
        typeof notifications.lockSensitiveNotifications === "boolean"
          ? notifications.lockSensitiveNotifications
          : defaultSettingsPreferences.notifications.lockSensitiveNotifications,
      showSafePreviews:
        typeof notifications.showSafePreviews === "boolean"
          ? notifications.showSafePreviews
          : defaultSettingsPreferences.notifications.showSafePreviews
    },
    privacy: {
      caregiverSharingEnabled:
        typeof privacy.caregiverSharingEnabled === "boolean"
          ? privacy.caregiverSharingEnabled
          : defaultSettingsPreferences.privacy.caregiverSharingEnabled,
      emergencyAccessLogging:
        typeof privacy.emergencyAccessLogging === "boolean"
          ? privacy.emergencyAccessLogging
          : defaultSettingsPreferences.privacy.emergencyAccessLogging,
      partnerSharingEnabled:
        typeof privacy.partnerSharingEnabled === "boolean"
          ? privacy.partnerSharingEnabled
          : defaultSettingsPreferences.privacy.partnerSharingEnabled
    },
    units: normalizeUnitsPreferences(units)
  };
}

export function normalizeUnitsPreferences(value: unknown): UnitsPreferences {
  const units = isRecord(value) ? value : {};

  return {
    dateFormat:
      units.dateFormat === "dd_mm_yyyy" || units.dateFormat === "mm_dd_yyyy" || units.dateFormat === "device_default"
        ? units.dateFormat
        : defaultSettingsPreferences.units.dateFormat,
    distance:
      units.distance === "km" || units.distance === "miles" || units.distance === "device_default"
        ? units.distance
        : defaultSettingsPreferences.units.distance,
    height:
      units.height === "cm" || units.height === "ft_in" || units.height === "device_default"
        ? units.height
        : defaultSettingsPreferences.units.height,
    system:
      units.system === "metric" || units.system === "imperial" || units.system === "device_default"
        ? units.system
        : defaultSettingsPreferences.units.system,
    temperature:
      units.temperature === "celsius" || units.temperature === "fahrenheit" || units.temperature === "device_default"
        ? units.temperature
        : defaultSettingsPreferences.units.temperature,
    timeFormat:
      units.timeFormat === "12_hour" || units.timeFormat === "24_hour" || units.timeFormat === "device_default"
        ? units.timeFormat
        : defaultSettingsPreferences.units.timeFormat,
    weight:
      units.weight === "kg" || units.weight === "lb" || units.weight === "device_default"
        ? units.weight
        : defaultSettingsPreferences.units.weight
  };
}

export async function getSettingsPreferences(profileId: string | null | undefined) {
  if (!profileId) {
    return normalizeSettingsPreferences(defaultSettingsPreferences);
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select("preferences")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return normalizeSettingsPreferences(data?.preferences);
}

export async function updateSettingsPreferences(
  profileId: string | null | undefined,
  preferences: SettingsPreferences
) {
  if (!profileId) {
    throw new Error("Sign in before updating settings.");
  }

  const normalizedPreferences = normalizeSettingsPreferences(preferences);
  const { data, error } = await supabase
    .from("user_settings")
    .upsert({
      preferences: normalizedPreferences,
      profile_id: profileId
    })
    .select("preferences")
    .single();

  if (error) {
    throw error;
  }

  return normalizeSettingsPreferences(data.preferences);
}
