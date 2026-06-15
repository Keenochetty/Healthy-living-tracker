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

export type UnitsPreferences = {
  dateFormat: DateFormatPreference;
  distance: DistanceUnitPreference;
  height: HeightUnitPreference;
  system: MeasurementSystemPreference;
  temperature: TemperatureUnitPreference;
  timeFormat: TimeFormatPreference;
  weight: WeightUnitPreference;
};

export type DeviceSettingsDefaults = {
  dateFormat: Exclude<DateFormatPreference, "device_default">;
  distance: Exclude<DistanceUnitPreference, "device_default">;
  height: Exclude<HeightUnitPreference, "device_default">;
  locale: string;
  measurementSystem: Exclude<MeasurementSystemPreference, "device_default">;
  region: string | null;
  temperature: Exclude<TemperatureUnitPreference, "device_default">;
  timeFormat: Exclude<TimeFormatPreference, "device_default">;
  weight: Exclude<WeightUnitPreference, "device_default">;
};

export type AppearancePreferences = {
  reduceMotion: boolean;
  theme: "device_default" | "light" | "dark";
};

export type NotificationSettingsPreferences = {
  lockSensitiveNotifications: boolean;
  showSafePreviews: boolean;
};

export type PrivacySharingPreferences = {
  caregiverSharingEnabled: boolean;
  emergencyAccessLogging: boolean;
  partnerSharingEnabled: boolean;
};

export type AiAssistantPreferences = {
  allowSafeSummaries: boolean;
  logActionsToAudit: boolean;
};

export type SettingsPreferences = {
  ai: AiAssistantPreferences;
  appearance: AppearancePreferences;
  notifications: NotificationSettingsPreferences;
  privacy: PrivacySharingPreferences;
  units: UnitsPreferences;
};
