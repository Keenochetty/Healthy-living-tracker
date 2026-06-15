import * as Localization from "expo-localization";

import { supabase } from "@/lib/supabase";

export type MeasurementSystemPreference =
  | "device_default"
  | "metric"
  | "imperial";
export type WeightUnitPreference = "device_default" | "kg" | "lb";
export type HeightUnitPreference = "device_default" | "cm" | "ft_in";
export type TemperatureUnitPreference =
  | "device_default"
  | "celsius"
  | "fahrenheit";
export type DistanceUnitPreference = "device_default" | "km" | "miles";
export type TimeFormatPreference = "device_default" | "12_hour" | "24_hour";
export type DateFormatPreference =
  | "device_default"
  | "dd_mm_yyyy"
  | "mm_dd_yyyy";

export type MeasurementPreferences = {
  system: MeasurementSystemPreference;
  weight: WeightUnitPreference;
  height: HeightUnitPreference;
  temperature: TemperatureUnitPreference;
  distance: DistanceUnitPreference;
  timeFormat: TimeFormatPreference;
  dateFormat: DateFormatPreference;
};

export type DeviceMeasurementDefaults = {
  dateFormat: Exclude<DateFormatPreference, "device_default">;
  distance: Exclude<DistanceUnitPreference, "device_default">;
  height: Exclude<HeightUnitPreference, "device_default">;
  locale: string;
  system: Exclude<MeasurementSystemPreference, "device_default">;
  temperature: Exclude<TemperatureUnitPreference, "device_default">;
  timeFormat: Exclude<TimeFormatPreference, "device_default">;
  weight: Exclude<WeightUnitPreference, "device_default">;
};

export const defaultMeasurementPreferences: MeasurementPreferences = {
  dateFormat: "device_default",
  distance: "device_default",
  height: "device_default",
  system: "device_default",
  temperature: "device_default",
  timeFormat: "device_default",
  weight: "device_default",
};

function isImperialLocale(measurementSystem: string | null | undefined) {
  return measurementSystem === "us" || measurementSystem === "uk";
}

export function getDeviceMeasurementDefaults(): DeviceMeasurementDefaults {
  const locale = Localization.getLocales()[0];
  const calendar = Localization.getCalendars()[0];
  const system = isImperialLocale(locale.measurementSystem)
    ? "imperial"
    : "metric";
  const region = locale.regionCode?.toUpperCase();
  const uses24hourClock = calendar.uses24hourClock ?? system === "metric";

  return {
    dateFormat: region === "US" ? "mm_dd_yyyy" : "dd_mm_yyyy",
    distance: system === "metric" ? "km" : "miles",
    height: system === "metric" ? "cm" : "ft_in",
    locale: locale.languageTag,
    system,
    temperature:
      locale.temperatureUnit === "fahrenheit" ? "fahrenheit" : "celsius",
    timeFormat: uses24hourClock ? "24_hour" : "12_hour",
    weight: system === "metric" ? "kg" : "lb",
  };
}

function normalizeMeasurementPreferences(
  value: unknown,
): MeasurementPreferences {
  const preferences =
    typeof value === "object" && value !== null
      ? (value as Partial<MeasurementPreferences>)
      : {};

  return {
    dateFormat:
      preferences.dateFormat ?? defaultMeasurementPreferences.dateFormat,
    distance: preferences.distance ?? defaultMeasurementPreferences.distance,
    height: preferences.height ?? defaultMeasurementPreferences.height,
    system: preferences.system ?? defaultMeasurementPreferences.system,
    temperature:
      preferences.temperature ?? defaultMeasurementPreferences.temperature,
    timeFormat:
      preferences.timeFormat ?? defaultMeasurementPreferences.timeFormat,
    weight: preferences.weight ?? defaultMeasurementPreferences.weight,
  };
}

export async function getMeasurementPreferences(
  profileId: string | null | undefined,
) {
  if (!profileId) {
    return defaultMeasurementPreferences;
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select("measurement_preferences")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return normalizeMeasurementPreferences(data?.measurement_preferences);
}

export async function updateMeasurementPreferences(
  profileId: string | null | undefined,
  preferences: MeasurementPreferences,
) {
  if (!profileId) {
    throw new Error("Sign in before updating measurement settings.");
  }

  const { data, error } = await supabase
    .from("user_settings")
    .upsert({
      measurement_preferences: preferences,
      profile_id: profileId,
    })
    .select("measurement_preferences")
    .single();

  if (error) {
    throw error;
  }

  return normalizeMeasurementPreferences(data.measurement_preferences);
}
