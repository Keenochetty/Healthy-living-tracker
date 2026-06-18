import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

import {
  createDefaultAppPreferences,
  createDefaultNotificationPreferences,
  createDefaultOnboardingPreferences,
} from "./accountDefaults";
import {
  mapAccountProfileToUpsert,
  mapAppPreferencesToUpsert,
  mapNotificationPreferencesToUpsert,
  mapNotificationRowToPreferences,
  mapOnboardingPreferencesToUpsert,
  mapOnboardingRowToPreferences,
  mapProfileRowToAccountProfile,
  mapSettingsRowToAppPreferences,
} from "./accountMappers";
import {
  validateAccountProfileUpdate,
  validateOnboardingPreferencesUpdate,
} from "./accountValidation";
import type {
  HealthOSAccountProfile,
  HealthOSAccountProfileUpdate,
  HealthOSAccountServiceResult,
  HealthOSAppPreferences,
  HealthOSAppPreferencesUpdate,
  HealthOSNotificationPreferences,
  HealthOSNotificationPreferencesUpdate,
  HealthOSOnboardingPreferences,
  HealthOSOnboardingPreferencesUpdate,
} from "./accountTypes";

type Row = Record<string, unknown>;
type TableName = "app_preferences" | "notification_preferences" | "onboarding_preferences" | "profiles";

export async function getCurrentAuthUser(): Promise<HealthOSAccountServiceResult<User>> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return fail("Could not load the signed-in user.", error);
  if (!data.user) return { data: null, error: null, status: "missingAuth" };
  return ok(data.user);
}

export async function getAccountProfile(): Promise<
  HealthOSAccountServiceResult<HealthOSAccountProfile>
> {
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.data.id)
    .maybeSingle();
  if (isMissingTable(error)) return missingTable("profiles");
  if (error) return fail("Could not load your account profile.", error);
  return ok(mapProfileRowToAccountProfile((data ?? null) as Row | null, user.data.id));
}

export async function ensureAccountProfile(): Promise<
  HealthOSAccountServiceResult<HealthOSAccountProfile>
> {
  const existing = await getAccountProfile();
  if (existing.status !== "ready" || existing.data) return existing;
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  return upsertAccountProfile({
    email: user.data.email ?? null,
    fullName: user.data.email?.split("@")[0] ?? null,
  });
}

export async function upsertAccountProfile(
  update: HealthOSAccountProfileUpdate,
): Promise<HealthOSAccountServiceResult<HealthOSAccountProfile>> {
  const validation = validateAccountProfileUpdate(update);
  if (!validation.valid) {
    const error = getValidationError(validation);
    return { data: null, error: error ?? "Profile update is invalid.", status: "error" };
  }
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const payload = removeUndefined(mapAccountProfileToUpsert(user.data.id, update));
  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();
  if (isMissingTable(error)) return missingTable("profiles");
  if (error) return fail("Could not save your account profile.", error);
  return ok(mapProfileRowToAccountProfile(data as Row, user.data.id));
}

export async function getOnboardingPreferences(): Promise<
  HealthOSAccountServiceResult<HealthOSOnboardingPreferences>
> {
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await selectOwn("onboarding_preferences", user.data.id);
  if (isMissingTable(error)) return missingTable("onboarding_preferences");
  if (error) return fail("Could not load onboarding preferences.", error);
  return ok(mapOnboardingRowToPreferences(data, user.data.id));
}

export async function upsertOnboardingPreferences(
  update: HealthOSOnboardingPreferencesUpdate,
): Promise<HealthOSAccountServiceResult<HealthOSOnboardingPreferences>> {
  const validation = validateOnboardingPreferencesUpdate(update);
  if (!validation.valid) {
    const error = getValidationError(validation);
    return { data: null, error: error ?? "Onboarding preferences are invalid.", status: "error" };
  }
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const payload = removeUndefined(mapOnboardingPreferencesToUpsert(user.data.id, update));
  const { data, error } = await upsertOwn("onboarding_preferences", payload);
  if (isMissingTable(error)) return missingTable("onboarding_preferences");
  if (error) return fail("Could not save onboarding preferences.", error);
  return ok(mapOnboardingRowToPreferences(data, user.data.id));
}

export async function markOnboardingComplete() {
  return upsertOnboardingPreferences({ setupCompleted: true });
}

export async function getAppPreferences(): Promise<
  HealthOSAccountServiceResult<HealthOSAppPreferences>
> {
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await selectOwn("app_preferences", user.data.id);
  if (isMissingTable(error)) return missingTable("app_preferences", createDefaultAppPreferences(user.data.id));
  if (error) return fail("Could not load app preferences.", error);
  return ok(mapSettingsRowToAppPreferences(data, user.data.id));
}

export async function upsertAppPreferences(
  update: HealthOSAppPreferencesUpdate,
): Promise<HealthOSAccountServiceResult<HealthOSAppPreferences>> {
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const payload = removeUndefined(mapAppPreferencesToUpsert(user.data.id, update));
  const { data, error } = await upsertOwn("app_preferences", payload);
  if (isMissingTable(error)) return missingTable("app_preferences", createDefaultAppPreferences(user.data.id));
  if (error) return fail("Could not save app preferences.", error);
  return ok(mapSettingsRowToAppPreferences(data, user.data.id));
}

export async function getNotificationPreferences(): Promise<
  HealthOSAccountServiceResult<HealthOSNotificationPreferences>
> {
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await selectOwn("notification_preferences", user.data.id);
  if (isMissingTable(error)) return missingTable("notification_preferences", createDefaultNotificationPreferences(user.data.id));
  if (error) return fail("Could not load notification preferences.", error);
  return ok(mapNotificationRowToPreferences(data, user.data.id));
}

export async function upsertNotificationPreferences(
  update: HealthOSNotificationPreferencesUpdate,
): Promise<HealthOSAccountServiceResult<HealthOSNotificationPreferences>> {
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const payload = removeUndefined(mapNotificationPreferencesToUpsert(user.data.id, update));
  const { data, error } = await upsertOwn("notification_preferences", payload);
  if (isMissingTable(error)) return missingTable("notification_preferences", createDefaultNotificationPreferences(user.data.id));
  if (error) return fail("Could not save notification preferences.", error);
  return ok(mapNotificationRowToPreferences(data, user.data.id));
}

function selectOwn(table: TableName, userId: string) {
  return supabase.from(table).select("*").eq("user_id", userId).maybeSingle();
}

function upsertOwn(table: TableName, payload: Record<string, unknown>) {
  return supabase
    .from(table)
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();
}

function ok<T>(data: T): HealthOSAccountServiceResult<T> {
  return { data, error: null, status: "ready" };
}

function fail<T>(message: string, error?: unknown): HealthOSAccountServiceResult<T> {
  return { data: null, error: friendlyError(message, error), status: "error" };
}

function missingTable<T>(
  tableName: string,
  fallback: T | null = null,
): HealthOSAccountServiceResult<T> {
  return {
    data: fallback,
    error: `${tableName} is not available until the Batch 1 migration is applied.`,
    status: "missingTable",
  };
}

function passStatus<T>(result: HealthOSAccountServiceResult<T>) {
  return {
    data: null,
    error: result.error,
    status: result.status,
  } satisfies HealthOSAccountServiceResult<never>;
}

function friendlyError(fallback: string, error?: unknown) {
  if (!error) return fallback;
  if (typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

function isMissingTable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; message?: string };
  return candidate.code === "42P01" || candidate.message?.includes("does not exist") === true;
}

function removeUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  );
}

function getValidationError(validation: unknown) {
  if (!validation || typeof validation !== "object" || !("error" in validation)) {
    return undefined;
  }
  const error = (validation as { error?: unknown }).error;
  return typeof error === "string" ? error : undefined;
}
