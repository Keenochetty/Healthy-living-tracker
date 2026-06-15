import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

import { supabase } from "@/lib/supabase";
import type {
  AppLockSettings,
  SecurityActivity,
  TotpEnrollment,
} from "@/types/security";

const APP_LOCK_KEY = "healthsync_app_lock_settings";
const SECURITY_ACTIVITY_KEY = "healthsync_security_activity";

export async function reauthenticate(password: string) {
  const { data: userData } = await supabase.auth.getUser();
  const email = userData.user?.email;
  if (!email)
    throw new Error(
      "Sign in with email before completing this security action.",
    );
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error)
    throw new Error("Re-authentication failed. Check your current password.");
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  await reauthenticate(currentPassword);
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error("Could not change password. Please try again.");
  await addSecurityActivity("Password changed");
}

export async function listTotpFactors() {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) throw new Error("Could not load two-step verification status.");
  return data.totp;
}

export async function getAssuranceLevel() {
  const { data, error } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) return null;
  return data.currentLevel;
}

export async function startTotpEnrollment(): Promise<TotpEnrollment> {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "HealthSync authenticator",
  });
  if (error) throw new Error("Could not start authenticator setup.");
  return {
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
    uri: data.totp.uri,
  };
}

export async function verifyTotpEnrollment(factorId: string, code: string) {
  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code: code.trim(),
  });
  if (error) throw new Error("That authenticator code was not accepted.");
  await addSecurityActivity("Two-step verification enabled");
}

export async function disableTotp(
  factorId: string,
  currentPassword: string,
  code: string,
) {
  await reauthenticate(currentPassword);
  const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code: code.trim(),
  });
  if (verifyError)
    throw new Error(
      "A fresh authenticator code is required to disable two-step verification.",
    );
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) throw new Error("Could not disable two-step verification.");
  await addSecurityActivity("Two-step verification disabled");
}

export async function getBiometricAvailability() {
  const [hasHardware, isEnrolled, types] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
    LocalAuthentication.supportedAuthenticationTypesAsync(),
  ]);
  return {
    available: hasHardware && isEnrolled,
    hasHardware,
    isEnrolled,
    types,
  };
}

export async function verifyDeviceOwner() {
  const result = await LocalAuthentication.authenticateAsync({
    cancelLabel: "Cancel",
    disableDeviceFallback: false,
    promptMessage: "Confirm to change app lock settings",
  });
  if (!result.success)
    throw new Error("Device authentication was not completed.");
}

export async function getAppLockSettings(): Promise<AppLockSettings> {
  try {
    const value = await AsyncStorage.getItem(APP_LOCK_KEY);
    return value
      ? (JSON.parse(value) as AppLockSettings)
      : { enabled: false, timing: "immediately" };
  } catch {
    return { enabled: false, timing: "immediately" };
  }
}

export async function saveAppLockSettings(settings: AppLockSettings) {
  await AsyncStorage.setItem(APP_LOCK_KEY, JSON.stringify(settings));
  await addSecurityActivity(
    settings.enabled ? "App lock enabled" : "App lock disabled",
  );
  return settings;
}

export async function getSecurityActivity(): Promise<SecurityActivity[]> {
  try {
    const value = await AsyncStorage.getItem(SECURITY_ACTIVITY_KEY);
    return value ? (JSON.parse(value) as SecurityActivity[]) : [];
  } catch {
    return [];
  }
}

export async function addSecurityActivity(title: string) {
  const current = await getSecurityActivity();
  const next = [
    {
      createdAt: new Date().toISOString(),
      id: `security-${Date.now()}`,
      title,
    },
    ...current,
  ].slice(0, 20);
  await AsyncStorage.setItem(SECURITY_ACTIVITY_KEY, JSON.stringify(next));
}
