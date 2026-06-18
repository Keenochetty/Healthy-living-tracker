import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

import { createDefaultActiveCareProfilePreference } from "./careProfileDefaults";
import {
  mapCareProfileCreateToInsert,
  mapCareProfileRow,
  mapCareProfileUpdateToPatch,
  mapPreferenceRow,
  mapPreferenceToUpsert,
  mapRelationshipCreateToInsert,
  mapRelationshipRow,
} from "./careProfileMappers";
import {
  validateCareProfileCreate,
  validateCareProfileUpdate,
  validateRelationshipCreate,
} from "./careProfileValidation";
import type {
  HealthOSActiveCareProfilePreference,
  HealthOSCareProfile,
  HealthOSCareProfileCreateInput,
  HealthOSCareProfileRelationship,
  HealthOSCareProfileRelationshipCreateInput,
  HealthOSCareProfileServiceResult,
  HealthOSCareProfileUpdateInput,
} from "./careProfileTypes";

type Row = Record<string, unknown>;
type TableName =
  | "active_care_profile_preferences"
  | "care_profile_relationships"
  | "care_profiles";

export async function getCurrentCareProfileAuthUser(): Promise<
  HealthOSCareProfileServiceResult<User>
> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return fail("Could not load the signed-in user.", error);
  if (!data.user) return { data: null, error: null, status: "missingAuth" };
  return ok(data.user);
}

export async function getCareProfilesForCurrentUser(): Promise<
  HealthOSCareProfileServiceResult<HealthOSCareProfile[]>
> {
  const user = await getCurrentCareProfileAuthUser();
  if (!user.data) return passStatus(user);

  const { data, error } = await supabase
    .from("care_profiles")
    .select("*")
    .order("is_primary_self", { ascending: false })
    .order("created_at", { ascending: true });

  if (isMissingTable(error)) return missingTable("care_profiles", []);
  if (error) return fail("Could not load care profiles.", error);
  return ok(toRows(data).map(mapCareProfileRow));
}

export async function getSelfCareProfile(): Promise<
  HealthOSCareProfileServiceResult<HealthOSCareProfile>
> {
  const user = await getCurrentCareProfileAuthUser();
  if (!user.data) return passStatus(user);

  const { data, error } = await supabase
    .from("care_profiles")
    .select("*")
    .eq("owner_user_id", user.data.id)
    .eq("profile_type", "self")
    .eq("is_primary_self", true)
    .neq("status", "archived")
    .maybeSingle();

  if (isMissingTable(error)) return missingTable("care_profiles");
  if (error) return fail("Could not load the self care profile.", error);
  return {
    data: data ? mapCareProfileRow(data as Row) : null,
    error: null,
    status: "ready",
  };
}

export async function ensureSelfCareProfile(
  displayName = "You",
): Promise<HealthOSCareProfileServiceResult<HealthOSCareProfile>> {
  const existing = await getSelfCareProfile();
  if (existing.status !== "ready" || existing.data) return existing;
  return createCareProfile({
    profileType: "self",
    displayName,
    relationshipLabel: "Self",
    privacyScope: "private",
    isPrimarySelf: true,
  });
}

export async function createCareProfile(
  input: HealthOSCareProfileCreateInput,
): Promise<HealthOSCareProfileServiceResult<HealthOSCareProfile>> {
  const validation = validateCareProfileCreate(input);
  if (!validation.valid) return validationFail(validation.error);

  const user = await getCurrentCareProfileAuthUser();
  if (!user.data) return passStatus(user);

  const payload = removeUndefined(
    mapCareProfileCreateToInsert(user.data.id, input),
  );
  const { data, error } = await supabase
    .from("care_profiles")
    .insert(payload)
    .select("*")
    .single();

  if (isMissingTable(error)) return missingTable("care_profiles");
  if (error) return fail("Could not create the care profile.", error);
  return ok(mapCareProfileRow(data as Row));
}

export async function updateCareProfile(
  careProfileId: string,
  input: HealthOSCareProfileUpdateInput,
): Promise<HealthOSCareProfileServiceResult<HealthOSCareProfile>> {
  const validation = validateCareProfileUpdate(input);
  if (!validation.valid) return validationFail(validation.error);

  const payload = removeUndefined(mapCareProfileUpdateToPatch(input));
  const { data, error } = await supabase
    .from("care_profiles")
    .update(payload)
    .eq("id", careProfileId)
    .select("*")
    .single();

  if (isMissingTable(error)) return missingTable("care_profiles");
  if (error) return fail("Could not update the care profile.", error);
  return ok(mapCareProfileRow(data as Row));
}

export function archiveCareProfile(careProfileId: string) {
  return updateCareProfile(careProfileId, { status: "archived" });
}

export async function getChildIdentityProfiles(): Promise<
  HealthOSCareProfileServiceResult<HealthOSCareProfile[]>
> {
  const result = await getCareProfilesForCurrentUser();
  if (result.status !== "ready" || !result.data) return result;
  return ok(
    result.data.filter(
      (profile) =>
        profile.profileType === "child" || profile.profileType === "dependent",
    ),
  );
}

export async function getCareProfileRelationships(
  careProfileId: string,
): Promise<HealthOSCareProfileServiceResult<HealthOSCareProfileRelationship[]>> {
  const { data, error } = await supabase
    .from("care_profile_relationships")
    .select("*")
    .eq("care_profile_id", careProfileId)
    .order("created_at", { ascending: true });

  if (isMissingTable(error)) return missingTable("care_profile_relationships", []);
  if (error) return fail("Could not load care profile relationships.", error);
  return ok(toRows(data).map(mapRelationshipRow));
}

export async function createCareProfileRelationship(
  input: HealthOSCareProfileRelationshipCreateInput,
): Promise<HealthOSCareProfileServiceResult<HealthOSCareProfileRelationship>> {
  const validation = validateRelationshipCreate(input);
  if (!validation.valid) return validationFail(validation.error);

  const user = await getCurrentCareProfileAuthUser();
  if (!user.data) return passStatus(user);

  const { data, error } = await supabase
    .from("care_profile_relationships")
    .insert(removeUndefined(mapRelationshipCreateToInsert(user.data.id, input)))
    .select("*")
    .single();

  if (isMissingTable(error)) return missingTable("care_profile_relationships");
  if (error) return fail("Could not create the care profile relationship.", error);
  return ok(mapRelationshipRow(data as Row));
}

export async function getActiveCareProfilePreference(): Promise<
  HealthOSCareProfileServiceResult<HealthOSActiveCareProfilePreference>
> {
  const user = await getCurrentCareProfileAuthUser();
  if (!user.data) return passStatus(user);

  const { data, error } = await supabase
    .from("active_care_profile_preferences")
    .select("*")
    .eq("user_id", user.data.id)
    .maybeSingle();

  if (isMissingTable(error)) {
    return missingTable(
      "active_care_profile_preferences",
      createDefaultActiveCareProfilePreference(user.data.id),
    );
  }
  if (error) return fail("Could not load the active care profile.", error);
  return ok(mapPreferenceRow((data ?? null) as Row | null, user.data.id));
}

export async function setActiveCareProfilePreference(
  activeCareProfileId: string | null,
): Promise<HealthOSCareProfileServiceResult<HealthOSActiveCareProfilePreference>> {
  const user = await getCurrentCareProfileAuthUser();
  if (!user.data) return passStatus(user);

  const { data, error } = await supabase
    .from("active_care_profile_preferences")
    .upsert(mapPreferenceToUpsert(user.data.id, activeCareProfileId), {
      onConflict: "user_id",
    })
    .select("*")
    .single();

  if (isMissingTable(error)) {
    return missingTable(
      "active_care_profile_preferences",
      createDefaultActiveCareProfilePreference(user.data.id),
    );
  }
  if (error) return fail("Could not save the active care profile.", error);
  return ok(mapPreferenceRow(data as Row, user.data.id));
}

function ok<T>(data: T): HealthOSCareProfileServiceResult<T> {
  return { data, error: null, status: "ready" };
}

function validationFail<T>(error: string): HealthOSCareProfileServiceResult<T> {
  return { data: null, error, status: "error" };
}

function fail<T>(
  message: string,
  error?: unknown,
): HealthOSCareProfileServiceResult<T> {
  return { data: null, error: friendlyError(message, error), status: "error" };
}

function missingTable<T>(
  tableName: TableName,
  fallback: T | null = null,
): HealthOSCareProfileServiceResult<T> {
  return {
    data: fallback,
    error: `${tableName} is not available until the Batch 2 migration is applied.`,
    status: "missingTable",
  };
}

function passStatus<T>(result: HealthOSCareProfileServiceResult<T>) {
  return {
    data: null,
    error: result.error,
    status: result.status,
  } satisfies HealthOSCareProfileServiceResult<never>;
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

function toRows(data: unknown) {
  return Array.isArray(data) ? (data as Row[]) : [];
}
