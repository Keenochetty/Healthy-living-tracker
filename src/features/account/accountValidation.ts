import type {
  HealthOSAccountProfileUpdate,
  HealthOSOnboardingPreferencesUpdate,
} from "./accountTypes";

export function isValidThemeMode(value: unknown): value is "system" | "light" | "dark" {
  return value === "system" || value === "light" || value === "dark";
}

export function isValidUnitsSystem(value: unknown): value is "metric" | "imperial" {
  return value === "metric" || value === "imperial";
}

export function isValidTimeFormat(value: unknown): value is "12h" | "24h" {
  return value === "12h" || value === "24h";
}

export function normalizeSelectedGoals(values: unknown): string[] {
  return normalizeStringArray(values);
}

export function normalizeSelectedModules(values: unknown): string[] {
  return normalizeStringArray(values);
}

export function validateDisplayName(value: unknown) {
  if (value == null || value === "") return { valid: true, value: null };
  if (typeof value !== "string") return { valid: false, error: "Display name must be text." };
  const trimmed = value.trim();
  if (trimmed.length > 80) return { valid: false, error: "Display name is too long." };
  return { valid: true, value: trimmed || null };
}

export function validateQuietHours(start?: string | null, end?: string | null) {
  const valid = (value?: string | null) =>
    !value || /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  return valid(start) && valid(end);
}

export function validateAccountProfileUpdate(update: HealthOSAccountProfileUpdate) {
  const displayName = validateDisplayName(update.displayName);
  if (!displayName.valid) return displayName;
  if (update.email && !/^\S+@\S+\.\S+$/.test(update.email)) {
    return { valid: false, error: "Email format is invalid." };
  }
  if (update.phone && update.phone.length > 40) {
    return { valid: false, error: "Phone number is too long." };
  }
  return { valid: true };
}

export function validateOnboardingPreferencesUpdate(
  update: HealthOSOnboardingPreferencesUpdate,
) {
  if (update.selectedGoals) normalizeSelectedGoals(update.selectedGoals);
  if (update.selectedModules) normalizeSelectedModules(update.selectedModules);
  return { valid: true };
}

function normalizeStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return Array.from(
    new Set(
      values
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

