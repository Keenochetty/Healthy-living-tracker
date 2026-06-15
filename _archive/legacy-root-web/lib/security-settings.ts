import { supabase } from "@/lib/supabase";

export type SecurityPreferences = {
  appPinEnabled: boolean;
  biometricUnlockEnabled: boolean;
  lockSensitiveNotifications: boolean;
  hideSensitivePreviews: boolean;
  sessionTimeoutMinutes: number;
  emergencyAccessLoggingEnabled: boolean;
  aiAccessPermissionsEnabled: boolean;
};

export const defaultSecurityPreferences: SecurityPreferences = {
  aiAccessPermissionsEnabled: false,
  appPinEnabled: false,
  biometricUnlockEnabled: false,
  emergencyAccessLoggingEnabled: true,
  hideSensitivePreviews: true,
  lockSensitiveNotifications: true,
  sessionTimeoutMinutes: 15,
};

function normalizeSecurityPreferences(value: unknown): SecurityPreferences {
  const preferences =
    typeof value === "object" && value !== null
      ? (value as Partial<SecurityPreferences>)
      : {};

  return {
    aiAccessPermissionsEnabled:
      preferences.aiAccessPermissionsEnabled ??
      defaultSecurityPreferences.aiAccessPermissionsEnabled,
    appPinEnabled:
      preferences.appPinEnabled ?? defaultSecurityPreferences.appPinEnabled,
    biometricUnlockEnabled:
      preferences.biometricUnlockEnabled ??
      defaultSecurityPreferences.biometricUnlockEnabled,
    emergencyAccessLoggingEnabled:
      preferences.emergencyAccessLoggingEnabled ??
      defaultSecurityPreferences.emergencyAccessLoggingEnabled,
    hideSensitivePreviews:
      preferences.hideSensitivePreviews ??
      defaultSecurityPreferences.hideSensitivePreviews,
    lockSensitiveNotifications:
      preferences.lockSensitiveNotifications ??
      defaultSecurityPreferences.lockSensitiveNotifications,
    sessionTimeoutMinutes:
      preferences.sessionTimeoutMinutes ??
      defaultSecurityPreferences.sessionTimeoutMinutes,
  };
}

export async function getSecurityPreferences(
  profileId: string | null | undefined,
) {
  if (!profileId) {
    return defaultSecurityPreferences;
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select("security_preferences")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return normalizeSecurityPreferences(data?.security_preferences);
}

export async function updateSecurityPreferences(
  profileId: string | null | undefined,
  preferences: SecurityPreferences,
) {
  if (!profileId) {
    throw new Error("Sign in before updating security settings.");
  }

  const { data, error } = await supabase
    .from("user_settings")
    .upsert({
      profile_id: profileId,
      security_preferences: preferences,
    })
    .select("security_preferences")
    .single();

  if (error) {
    throw error;
  }

  return normalizeSecurityPreferences(data.security_preferences);
}
