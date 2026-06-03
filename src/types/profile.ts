import type { AppModuleKey } from "@/types/app";
import type { WidgetKey } from "@/types/app";

export type UserThemeKey =
  | "soft_lavender"
  | "zest_green"
  | "peach_parenting"
  | "clean_blue"
  | "calm_dark"
  | "premium_dark_health";

export type UnitPreferences = {
  dateFormat: "dd/mm/yyyy" | "mm/dd/yyyy" | "yyyy/mm/dd";
  distanceUnit: "km" | "miles";
  heightUnit: "cm" | "in";
  liquidUnit: "ml" | "oz";
  speedUnit: "kmh" | "mph";
  temperatureUnit: "celsius" | "fahrenheit";
  weightUnit: "kg" | "lb";
};

export type UserPreferences = {
  country: string;
  currency: string;
  displayName: string;
  enabledModules: AppModuleKey[];
  enabledWidgets: WidgetKey[];
  language: string;
  onboardingComplete: boolean;
  themeKey: UserThemeKey;
  timezone: string;
  units: UnitPreferences;
};

export type RemoteProfileSyncState = {
  lastError?: string;
  lastSyncedAt?: string;
  status: "idle" | "syncing" | "synced" | "offline" | "error";
};
