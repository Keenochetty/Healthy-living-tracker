import type { Session, User } from "@supabase/supabase-js";

import { APP_WIDGETS } from "@/constants/widgets";
import { getLocalOnboardingBackup } from "@/lib/authStorage";
import { supabase } from "@/lib/supabase";
import type { AppModuleKey, WidgetKey } from "@/types/app";
import type {
  ProfileModuleRow,
  ProfileRow,
  ProfileSettingsRow,
  ProfileWidgetRow,
} from "@/types/database";
import type { UserPreferences } from "@/types/profile";

type SyncResult<T> = {
  data: T | null;
  error: string | null;
};

function friendlyError(fallback: string, error?: unknown) {
  if (!error) return fallback;

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string" && message) return message;
  }

  return fallback;
}

function ok<T>(data: T | null): SyncResult<T> {
  return { data, error: null };
}

function fail<T>(fallback: string, error?: unknown): SyncResult<T> {
  return { data: null, error: friendlyError(fallback, error) };
}

function chooseUnit<T extends string>(
  value: string | null | undefined,
  fallback: T,
): T {
  return (value ?? fallback) as T;
}

function getFullNameFromUser(
  user: User,
  preferences?: Partial<UserPreferences>,
) {
  const metadataName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : "";

  return (
    preferences?.displayName?.trim() ||
    metadataName ||
    user.email?.split("@")[0] ||
    "User"
  );
}

export function getDefaultWidgetKeys(moduleKeys: AppModuleKey[]) {
  return APP_WIDGETS.filter((widget) =>
    moduleKeys.includes(widget.moduleKey),
  ).map((widget) => widget.key);
}

export async function getCurrentSession(): Promise<SyncResult<Session>> {
  const { data, error } = await supabase.auth.getSession();

  if (error) return fail("Session expired. Please sign in again.", error);

  return ok(data.session);
}

export async function getCurrentUser(): Promise<SyncResult<User>> {
  const { data, error } = await supabase.auth.getUser();

  if (error) return fail("Session expired. Please sign in again.", error);

  return ok(data.user);
}

export async function getCurrentSupabaseUser() {
  const { data } = await getCurrentUser();

  return data;
}

export async function signUpWithEmail({
  email,
  fullName,
  password,
}: {
  email: string;
  fullName: string;
  password: string;
}): Promise<SyncResult<User>> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    options: {
      data: {
        full_name: fullName.trim() || undefined,
      },
    },
    password,
  });

  if (error) return fail("Could not create account. Please try again.", error);

  if (data.user) {
    await upsertProfile(data.user.id, {
      email: data.user.email,
      full_name: fullName.trim() || null,
    });
  }

  return ok(data.user);
}

export async function signInWithEmail({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<SyncResult<Session>> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error)
    return fail("Could not sign in. Please check your details.", error);

  return ok(data.session);
}

export async function signOut(): Promise<SyncResult<boolean>> {
  const { error } = await supabase.auth.signOut();

  if (error) return fail("Could not sign out right now.", error);

  return ok(true);
}

export async function getProfile(
  userId: string,
): Promise<SyncResult<ProfileRow>> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) return fail("Could not load your profile.", error);

  return ok(data as ProfileRow | null);
}

export async function upsertProfile(
  userId: string,
  data: Partial<ProfileRow & { displayName?: string }>,
): Promise<SyncResult<ProfileRow>> {
  const userResult = await getCurrentUser();
  const user = userResult.data;
  const payload = {
    avatar_url: data.avatar_url,
    country: data.country,
    email: data.email ?? user?.email ?? null,
    full_name:
      data.full_name ??
      data.displayName ??
      (user ? getFullNameFromUser(user) : null),
    id: userId,
    language: data.language,
    timezone: data.timezone,
    updated_at: new Date().toISOString(),
  };

  const { data: row, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) return fail("Could not save your profile.", error);

  return ok(row as ProfileRow);
}

export async function getProfileSettings(
  userId: string,
): Promise<SyncResult<ProfileSettingsRow>> {
  const { data, error } = await supabase
    .from("profile_settings")
    .select("*")
    .eq("profile_id", userId)
    .maybeSingle();

  if (error) return fail("Could not load your profile settings.", error);

  return ok(data as ProfileSettingsRow | null);
}

export async function upsertProfileSettings(
  userId: string,
  settings: Partial<ProfileSettingsRow>,
): Promise<SyncResult<ProfileSettingsRow>> {
  const { data, error } = await supabase
    .from("profile_settings")
    .upsert(
      {
        ...settings,
        profile_id: userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "profile_id" },
    )
    .select("*")
    .single();

  if (error) return fail("Could not save your profile settings.", error);

  return ok(data as ProfileSettingsRow);
}

export async function getProfileModules(
  userId: string,
): Promise<SyncResult<ProfileModuleRow[]>> {
  const { data, error } = await supabase
    .from("profile_modules")
    .select("*")
    .eq("profile_id", userId)
    .eq("enabled", true);

  if (error) return fail("Could not load your modules.", error);

  return ok((data ?? []) as ProfileModuleRow[]);
}

export async function syncProfileModules(
  userId: string,
  enabledModules: AppModuleKey[],
): Promise<SyncResult<ProfileModuleRow[]>> {
  const rows = enabledModules.map((moduleKey) => ({
    enabled: true,
    module_key: moduleKey,
    profile_id: userId,
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from("profile_modules")
    .upsert(rows, { onConflict: "profile_id,module_key" })
    .select("*");

  if (error) return fail("Could not sync your modules.", error);

  return ok((data ?? []) as ProfileModuleRow[]);
}

export async function getProfileWidgets(
  userId: string,
): Promise<SyncResult<ProfileWidgetRow[]>> {
  const { data, error } = await supabase
    .from("profile_widgets")
    .select("*")
    .eq("profile_id", userId)
    .eq("enabled", true)
    .order("sort_order", { ascending: true });

  if (error) return fail("Could not load your widgets.", error);

  return ok((data ?? []) as ProfileWidgetRow[]);
}

export async function syncProfileWidgets(
  userId: string,
  widgets: WidgetKey[],
): Promise<SyncResult<ProfileWidgetRow[]>> {
  const rows = widgets.map((widgetKey, sortOrder) => ({
    enabled: true,
    profile_id: userId,
    size: "medium",
    sort_order: sortOrder,
    updated_at: new Date().toISOString(),
    widget_key: widgetKey,
  }));

  const { data, error } = await supabase
    .from("profile_widgets")
    .upsert(rows, { onConflict: "profile_id,widget_key" })
    .select("*");

  if (error) return fail("Could not sync your widgets.", error);

  return ok((data ?? []) as ProfileWidgetRow[]);
}

export async function saveOnboardingToCloud(
  userId: string,
  preferences: UserPreferences,
): Promise<SyncResult<UserPreferences>> {
  const profile = await upsertProfile(userId, {
    country: preferences.country,
    displayName: preferences.displayName,
    language: preferences.language,
    timezone: preferences.timezone,
  });

  if (profile.error)
    return fail(
      "Could not sync right now. Your local settings are still saved.",
      profile.error,
    );

  const settings = await upsertProfileSettings(userId, {
    currency: preferences.currency,
    date_format: preferences.units.dateFormat,
    distance_unit: preferences.units.distanceUnit,
    height_unit: preferences.units.heightUnit,
    liquid_unit: preferences.units.liquidUnit,
    onboarding_complete: true,
    speed_unit: preferences.units.speedUnit,
    temperature_unit: preferences.units.temperatureUnit,
    theme_key: preferences.themeKey,
    weight_unit: preferences.units.weightUnit,
  });

  if (settings.error)
    return fail(
      "Could not sync right now. Your local settings are still saved.",
      settings.error,
    );

  const modules = await syncProfileModules(userId, preferences.enabledModules);

  if (modules.error)
    return fail(
      "Could not sync right now. Your local settings are still saved.",
      modules.error,
    );

  const enabledWidgets = preferences.enabledWidgets.length
    ? preferences.enabledWidgets
    : getDefaultWidgetKeys(preferences.enabledModules);
  const widgets = await syncProfileWidgets(userId, enabledWidgets);

  if (widgets.error)
    return fail(
      "Could not sync right now. Your local settings are still saved.",
      widgets.error,
    );

  return ok({
    ...preferences,
    enabledWidgets,
    onboardingComplete: true,
  });
}

export async function loadCloudPreferences(
  userId: string,
): Promise<SyncResult<UserPreferences>> {
  const local = await getLocalOnboardingBackup();
  const [profile, settings, modules, widgets] = await Promise.all([
    getProfile(userId),
    getProfileSettings(userId),
    getProfileModules(userId),
    getProfileWidgets(userId),
  ]);

  if (profile.error || settings.error || modules.error || widgets.error) {
    return fail(
      "Could not load cloud settings. Your local settings are still available.",
      profile.error ?? settings.error ?? modules.error ?? widgets.error,
    );
  }

  if (!profile.data && !settings.data && !modules.data?.length) {
    return ok(local);
  }

  const enabledModules = modules.data?.length
    ? modules.data.map((row) => row.module_key)
    : local.enabledModules;
  const enabledWidgets = widgets.data?.length
    ? widgets.data.map((row) => row.widget_key)
    : local.enabledWidgets.length
      ? local.enabledWidgets
      : getDefaultWidgetKeys(enabledModules);

  return ok({
    ...local,
    country: profile.data?.country ?? local.country,
    currency: settings.data?.currency ?? local.currency,
    displayName: profile.data?.full_name ?? local.displayName,
    enabledModules,
    enabledWidgets,
    language: profile.data?.language ?? local.language,
    onboardingComplete:
      settings.data?.onboarding_complete ?? local.onboardingComplete,
    themeKey: settings.data?.theme_key ?? local.themeKey,
    timezone: profile.data?.timezone ?? local.timezone,
    units: {
      ...local.units,
      dateFormat: chooseUnit(
        settings.data?.date_format,
        local.units.dateFormat,
      ),
      distanceUnit: chooseUnit(
        settings.data?.distance_unit,
        local.units.distanceUnit,
      ),
      heightUnit: chooseUnit(
        settings.data?.height_unit,
        local.units.heightUnit,
      ),
      liquidUnit: chooseUnit(
        settings.data?.liquid_unit,
        local.units.liquidUnit,
      ),
      speedUnit: chooseUnit(settings.data?.speed_unit, local.units.speedUnit),
      temperatureUnit: chooseUnit(
        settings.data?.temperature_unit,
        local.units.temperatureUnit,
      ),
      weightUnit: chooseUnit(
        settings.data?.weight_unit,
        local.units.weightUnit,
      ),
    },
  });
}

export async function syncLocalPreferencesToCloud(
  userId: string,
): Promise<SyncResult<UserPreferences>> {
  const preferences = await getLocalOnboardingBackup();

  return saveOnboardingToCloud(userId, preferences);
}

export async function savePreferencesToSupabase(preferences: UserPreferences) {
  const user = await getCurrentSupabaseUser();

  if (!user) return null;

  const result = await saveOnboardingToCloud(user.id, preferences);

  if (result.error) {
    throw new Error(result.error);
  }

  return result.data;
}

export async function fetchRemotePreferences() {
  const user = await getCurrentSupabaseUser();

  if (!user) return null;

  const result = await loadCloudPreferences(user.id);

  if (result.error) {
    throw new Error(result.error);
  }

  return result.data;
}

export async function syncRemotePreferencesToLocal() {
  const remote = await fetchRemotePreferences();

  if (!remote) return null;

  const { saveUserPreferences } = await import("@/lib/userPreferences");

  return saveUserPreferences(remote, {
    skipRemoteSync: true,
  });
}
