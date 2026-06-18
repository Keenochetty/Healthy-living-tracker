import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

import {
  mapCaregiverAssignmentRowToAssignment,
  mapCaregiverAssignmentToInsert,
  mapCircleToInsert,
  mapCircleToUpdate,
  mapFamilyCircleRowToCircle,
  mapFamilyInviteRowToInvite,
  mapFamilyMemberRowToMember,
  mapInviteToInsert,
  mapMemberToInsert,
  mapSharingPermissionRowToPermission,
  mapSharingPermissionToInsert,
} from "./familySharingMappers";
import {
  validateCaregiverAssignment,
  validateFamilyCircleName,
  validateInviteEmail,
  validateInviteRole,
  validateMemberStatus,
  validatePermissionKey,
  validatePermissionScope,
} from "./familySharingValidation";
import type {
  HealthOSCaregiverAssignment,
  HealthOSCaregiverAssignmentCreateInput,
  HealthOSFamilyCircle,
  HealthOSFamilyCircleCreateInput,
  HealthOSFamilyCircleMember,
  HealthOSFamilyCircleUpdateInput,
  HealthOSFamilyInvite,
  HealthOSFamilyInviteCreateInput,
  HealthOSFamilyMemberCreateInput,
  HealthOSFamilyMemberStatus,
  HealthOSFamilySharingServiceResult,
  HealthOSSharingPermission,
  HealthOSSharingPermissionCreateInput,
} from "./familySharingTypes";

type Row = Record<string, unknown>;
type TableName =
  | "caregiver_assignments"
  | "family_circle_members"
  | "family_circles"
  | "family_invites"
  | "sharing_permissions";

export async function getCurrentAuthUser(): Promise<
  HealthOSFamilySharingServiceResult<User>
> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return fail("Could not load the signed-in user.", error);
  if (!data.user) return { data: null, error: null, status: "missingAuth" };
  return ok(data.user);
}

export async function getFamilyCirclesForCurrentUser(): Promise<
  HealthOSFamilySharingServiceResult<HealthOSFamilyCircle[]>
> {
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase
    .from("family_circles")
    .select("*")
    .order("created_at", { ascending: true });
  if (isMissingTable(error)) return missingTable("family_circles", []);
  if (error) return fail("Could not load family circles.", error);
  return ok(toRows(data).map(mapFamilyCircleRowToCircle));
}

export async function createFamilyCircle(
  input: HealthOSFamilyCircleCreateInput,
): Promise<HealthOSFamilySharingServiceResult<HealthOSFamilyCircle>> {
  const validation = validateFamilyCircleName(input.name);
  if (!validation.valid) return validationFail(validation.error);
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase
    .from("family_circles")
    .insert(removeUndefined(mapCircleToInsert(user.data.id, input)))
    .select("*")
    .single();
  if (isMissingTable(error)) return missingTable("family_circles");
  if (error) return fail("Could not create the family circle.", error);
  return ok(mapFamilyCircleRowToCircle(data as Row));
}

export async function updateFamilyCircle(
  circleId: string,
  input: HealthOSFamilyCircleUpdateInput,
): Promise<HealthOSFamilySharingServiceResult<HealthOSFamilyCircle>> {
  if (input.name !== undefined) {
    const validation = validateFamilyCircleName(input.name);
    if (!validation.valid) return validationFail(validation.error);
  }
  const { data, error } = await supabase
    .from("family_circles")
    .update(removeUndefined(mapCircleToUpdate(input)))
    .eq("id", circleId)
    .select("*")
    .single();
  if (isMissingTable(error)) return missingTable("family_circles");
  if (error) return fail("Could not update the family circle.", error);
  return ok(mapFamilyCircleRowToCircle(data as Row));
}

export async function getFamilyMembers(
  circleId: string,
): Promise<HealthOSFamilySharingServiceResult<HealthOSFamilyCircleMember[]>> {
  const { data, error } = await supabase
    .from("family_circle_members")
    .select("*")
    .eq("circle_id", circleId)
    .order("created_at", { ascending: true });
  if (isMissingTable(error)) return missingTable("family_circle_members", []);
  if (error) return fail("Could not load family members.", error);
  return ok(toRows(data).map(mapFamilyMemberRowToMember));
}

export async function addFamilyMember(
  input: HealthOSFamilyMemberCreateInput,
): Promise<HealthOSFamilySharingServiceResult<HealthOSFamilyCircleMember>> {
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase
    .from("family_circle_members")
    .insert(removeUndefined(mapMemberToInsert(user.data.id, input)))
    .select("*")
    .single();
  if (isMissingTable(error)) return missingTable("family_circle_members");
  if (error) return fail("Could not add the family member.", error);
  return ok(mapFamilyMemberRowToMember(data as Row));
}

export async function updateFamilyMemberStatus(
  memberId: string,
  status: Exclude<HealthOSFamilyMemberStatus, "unknown">,
): Promise<HealthOSFamilySharingServiceResult<HealthOSFamilyCircleMember>> {
  const validation = validateMemberStatus(status);
  if (!validation.valid) return validationFail(validation.error);
  const { data, error } = await supabase
    .from("family_circle_members")
    .update({ status })
    .eq("id", memberId)
    .select("*")
    .single();
  if (isMissingTable(error)) return missingTable("family_circle_members");
  if (error) return fail("Could not update the family member.", error);
  return ok(mapFamilyMemberRowToMember(data as Row));
}

export async function getFamilyInvites(
  circleId: string,
): Promise<HealthOSFamilySharingServiceResult<HealthOSFamilyInvite[]>> {
  const { data, error } = await supabase
    .from("family_invites")
    .select("id,circle_id,invited_email,invited_phone,invited_user_id,invited_care_profile_id,invited_by,invited_by_user_id,role,status,expires_at,accepted_at,created_at,updated_at")
    .eq("circle_id", circleId)
    .order("created_at", { ascending: false });
  if (isMissingTable(error)) return missingTable("family_invites", []);
  if (error) return fail("Could not load family invites.", error);
  return ok(toRows(data).map(mapFamilyInviteRowToInvite));
}

export async function createFamilyInvite(
  input: HealthOSFamilyInviteCreateInput,
): Promise<HealthOSFamilySharingServiceResult<HealthOSFamilyInvite>> {
  const emailValidation = validateInviteEmail(input.invitedEmail);
  if (!emailValidation.valid) return validationFail(emailValidation.error);
  const roleValidation = validateInviteRole(input.role);
  if (!roleValidation.valid) return validationFail(roleValidation.error);
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase
    .from("family_invites")
    .insert(removeUndefined(mapInviteToInsert(user.data.id, input)))
    .select("id,circle_id,invited_email,invited_phone,invited_user_id,invited_care_profile_id,invited_by,invited_by_user_id,role,status,expires_at,accepted_at,created_at,updated_at")
    .single();
  if (isMissingTable(error)) return missingTable("family_invites");
  if (error) return fail("Could not create the family invite.", error);
  return ok(mapFamilyInviteRowToInvite(data as Row));
}

export async function acceptFamilyInvite(
  inviteId: string,
): Promise<HealthOSFamilySharingServiceResult<HealthOSFamilyInvite>> {
  const { data, error } = await supabase
    .from("family_invites")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", inviteId)
    .select("id,circle_id,invited_email,invited_phone,invited_user_id,invited_care_profile_id,invited_by,invited_by_user_id,role,status,expires_at,accepted_at,created_at,updated_at")
    .single();
  if (isMissingTable(error)) return missingTable("family_invites");
  if (error) return fail("Could not accept the family invite.", error);
  return ok(mapFamilyInviteRowToInvite(data as Row));
}

export async function getSharingPermissions(
  circleId: string,
): Promise<HealthOSFamilySharingServiceResult<HealthOSSharingPermission[]>> {
  const { data, error } = await supabase
    .from("sharing_permissions")
    .select("*")
    .eq("circle_id", circleId)
    .order("created_at", { ascending: false });
  if (isMissingTable(error)) return missingTable("sharing_permissions", []);
  if (error) return fail("Could not load sharing permissions.", error);
  return ok(toRows(data).map(mapSharingPermissionRowToPermission));
}

export async function grantSharingPermission(
  input: HealthOSSharingPermissionCreateInput,
): Promise<HealthOSFamilySharingServiceResult<HealthOSSharingPermission>> {
  const keyValidation = validatePermissionKey(input.permissionKey);
  if (!keyValidation.valid) return validationFail(keyValidation.error);
  const scopeValidation = validatePermissionScope(input.scope ?? "summary");
  if (!scopeValidation.valid) return validationFail(scopeValidation.error);
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase
    .from("sharing_permissions")
    .insert(removeUndefined(mapSharingPermissionToInsert(user.data.id, input)))
    .select("*")
    .single();
  if (isMissingTable(error)) return missingTable("sharing_permissions");
  if (error) return fail("Could not grant the sharing permission.", error);
  return ok(mapSharingPermissionRowToPermission(data as Row));
}

export async function revokeSharingPermission(
  permissionId: string,
): Promise<HealthOSFamilySharingServiceResult<HealthOSSharingPermission>> {
  const { data, error } = await supabase
    .from("sharing_permissions")
    .update({ status: "revoked" })
    .eq("id", permissionId)
    .select("*")
    .single();
  if (isMissingTable(error)) return missingTable("sharing_permissions");
  if (error) return fail("Could not revoke the sharing permission.", error);
  return ok(mapSharingPermissionRowToPermission(data as Row));
}

export async function getCaregiverAssignments(
  subjectCareProfileId?: string,
): Promise<HealthOSFamilySharingServiceResult<HealthOSCaregiverAssignment[]>> {
  let query = supabase
    .from("caregiver_assignments")
    .select("*")
    .order("created_at", { ascending: false });
  if (subjectCareProfileId) {
    query = query.eq("subject_care_profile_id", subjectCareProfileId);
  }
  const { data, error } = await query;
  if (isMissingTable(error)) return missingTable("caregiver_assignments", []);
  if (error) return fail("Could not load caregiver assignments.", error);
  return ok(toRows(data).map(mapCaregiverAssignmentRowToAssignment));
}

export async function createCaregiverAssignment(
  input: HealthOSCaregiverAssignmentCreateInput,
): Promise<HealthOSFamilySharingServiceResult<HealthOSCaregiverAssignment>> {
  const validation = validateCaregiverAssignment(input);
  if (!validation.valid) return validationFail(validation.error);
  const user = await getCurrentAuthUser();
  if (!user.data) return passStatus(user);
  const { data, error } = await supabase
    .from("caregiver_assignments")
    .insert(removeUndefined(mapCaregiverAssignmentToInsert(user.data.id, input)))
    .select("*")
    .single();
  if (isMissingTable(error)) return missingTable("caregiver_assignments");
  if (error) return fail("Could not create the caregiver assignment.", error);
  return ok(mapCaregiverAssignmentRowToAssignment(data as Row));
}

export async function updateCaregiverAssignment(
  assignmentId: string,
  patch: Partial<Pick<HealthOSCaregiverAssignment, "status" | "canAddNotes" | "canViewSchedule" | "canViewRecords" | "canViewMedicationSummary" | "startAt" | "endAt">>,
): Promise<HealthOSFamilySharingServiceResult<HealthOSCaregiverAssignment>> {
  const { data, error } = await supabase
    .from("caregiver_assignments")
    .update(
      removeUndefined({
        status: patch.status === "unknown" ? undefined : patch.status,
        can_add_notes: patch.canAddNotes,
        can_view_schedule: patch.canViewSchedule,
        can_view_records: patch.canViewRecords,
        can_view_medication_summary: patch.canViewMedicationSummary,
        start_at: patch.startAt,
        end_at: patch.endAt,
      }),
    )
    .eq("id", assignmentId)
    .select("*")
    .single();
  if (isMissingTable(error)) return missingTable("caregiver_assignments");
  if (error) return fail("Could not update the caregiver assignment.", error);
  return ok(mapCaregiverAssignmentRowToAssignment(data as Row));
}

function ok<T>(data: T): HealthOSFamilySharingServiceResult<T> {
  return { data, error: null, status: "ready" };
}

function validationFail<T>(error: string): HealthOSFamilySharingServiceResult<T> {
  return { data: null, error, status: "error" };
}

function fail<T>(
  message: string,
  error?: unknown,
): HealthOSFamilySharingServiceResult<T> {
  return { data: null, error: friendlyError(message, error), status: "error" };
}

function missingTable<T>(
  tableName: TableName,
  fallback: T | null = null,
): HealthOSFamilySharingServiceResult<T> {
  return {
    data: fallback,
    error: `${tableName} is not available until the Batch 3 migration is applied.`,
    status: "missingTable",
  };
}

function passStatus<T>(result: HealthOSFamilySharingServiceResult<T>) {
  return {
    data: null,
    error: result.error,
    status: result.status,
  } satisfies HealthOSFamilySharingServiceResult<never>;
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
