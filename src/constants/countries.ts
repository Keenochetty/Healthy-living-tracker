import type { UnitPreferences } from "@/types/profile";

export type CountryOption = {
  code: "ZA" | "US" | "GB" | "EU";
  country: string;
  currency: string;
  defaultUnits: UnitPreferences;
  timezone: string;
};

export const COUNTRY_OPTIONS: CountryOption[] = [
  {
    code: "ZA",
    country: "South Africa",
    currency: "ZAR",
    defaultUnits: {
      dateFormat: "dd/mm/yyyy",
      distanceUnit: "km",
      heightUnit: "cm",
      liquidUnit: "ml",
      speedUnit: "kmh",
      temperatureUnit: "celsius",
      weightUnit: "kg",
    },
    timezone: "Africa/Johannesburg",
  },
  {
    code: "US",
    country: "United States",
    currency: "USD",
    defaultUnits: {
      dateFormat: "mm/dd/yyyy",
      distanceUnit: "miles",
      heightUnit: "in",
      liquidUnit: "oz",
      speedUnit: "mph",
      temperatureUnit: "fahrenheit",
      weightUnit: "lb",
    },
    timezone: "America/New_York",
  },
  {
    code: "GB",
    country: "United Kingdom",
    currency: "GBP",
    defaultUnits: {
      dateFormat: "dd/mm/yyyy",
      distanceUnit: "miles",
      heightUnit: "cm",
      liquidUnit: "ml",
      speedUnit: "mph",
      temperatureUnit: "celsius",
      weightUnit: "kg",
    },
    timezone: "Europe/London",
  },
  {
    code: "EU",
    country: "European Union",
    currency: "EUR",
    defaultUnits: {
      dateFormat: "dd/mm/yyyy",
      distanceUnit: "km",
      heightUnit: "cm",
      liquidUnit: "ml",
      speedUnit: "kmh",
      temperatureUnit: "celsius",
      weightUnit: "kg",
    },
    timezone: "Europe/Paris",
  },
];

export const DEFAULT_COUNTRY = COUNTRY_OPTIONS[0];

export function getCountryByName(country: string) {
  return (
    COUNTRY_OPTIONS.find((option) => option.country === country) ??
    DEFAULT_COUNTRY
  );
}

export function getCountryByCode(code?: string | null) {
  if (!code) {
    return DEFAULT_COUNTRY;
  }

  return (
    COUNTRY_OPTIONS.find((option) => option.code === code.toUpperCase()) ??
    DEFAULT_COUNTRY
  );
}
