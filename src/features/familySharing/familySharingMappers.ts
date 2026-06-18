import type {
  HealthOSCaregiverAssignment,
  HealthOSCaregiverAssignmentAccessLevel,
  HealthOSCaregiverAssignmentCreateInput,
  HealthOSCaregiverAssignmentStatus,
  HealthOSFamilyCircle,
  HealthOSFamilyCircleCreateInput,
  HealthOSFamilyCirclePrivacyScope,
  HealthOSFamilyCircleStatus,
  HealthOSFamilyCircleUpdateInput,
  HealthOSFamilyCircleMember,
  HealthOSFamilyInvite,
  HealthOSFamilyInviteCreateInput,
  HealthOSFamilyMemberCreateInput,
  HealthOSFamilyMemberStatus,
  HealthOSFamilyRole,
  HealthOSSharingPermission,
  HealthOSSharingPermissionCreateInput,
  HealthOSSharingPermissionScope,
  HealthOSSharingPermissionStatus,
} from "./familySharingTypes";

type Row = Record<string, unknown>;

export function mapFamilyCircleRowToCircle(row: Row): HealthOSFamilyCircle {
  return {
    id: nullableString(row.id) ?? undefined,
    createdBy: stringValue(row.created_by),
    name: stringValue(row.name, "Family circle"),
    description: nullableString(row.description),
    avatarUrl: nullableString(row.avatar_url),
    privacyScope: toCirclePrivacy(row.privacy_scope),
    status: toCircleStatus(row.status),
    createdAt: nullableString(row.created_at),
    updatedAt: nullableString(row.updated_at),
  };
}

export function mapFamilyMemberRowToMember(
  row: Row,
): HealthOSFamilyCircleMember {
  return {
    id: nullableString(row.id) ?? undefined,
    circleId: stringValue(row.circle_id),
    userId: nullableString(row.user_id),
    careProfileId: nullableString(row.care_profile_id),
    displayName: nullableString(row.display_name),
    email: nullableString(row.email),
    relationshipLabel: nullableString(row.relationship_label),
    role: toFamilyRole(row.role),
    status: toMemberStatus(row.status),
    joinedAt: nullableString(row.joined_at),
    invitedBy: nullableString(row.invited_by),
    createdAt: nullableString(row.created_at),
    updatedAt: nullableString(row.updated_at),
  };
}

export function mapFamilyInviteRowToInvite(row: Row): HealthOSFamilyInvite {
  return {
    id: nullableString(row.id) ?? undefined,
    circleId: nullableString(row.circle_id),
    invitedEmail: nullableString(row.invited_email),
    invitedPhone: nullableString(row.invited_phone),
    invitedUserId: nullableString(row.invited_user_id),
    invitedCareProfileId: nullableString(row.invited_care_profile_id),
    invitedBy: nullableString(row.invited_by) ?? nullableString(row.invited_by_user_id),
    role: toFamilyRole(row.role),
    status: toMemberStatus(row.status),
    expiresAt: nullableString(row.expires_at),
    acceptedAt: nullableString(row.accepted_at),
    createdAt: nullableString(row.created_at),
    updatedAt: nullableString(row.updated_at),
  };
}

export function mapSharingPermissionRowToPermission(
  row: Row,
): HealthOSSharingPermission {
  return {
    id: nullableString(row.id) ?? undefined,
    circleId: stringValue(row.circle_id),
    subjectCareProfileId: nullableString(row.subject_care_profile_id),
    grantedBy: stringValue(row.granted_by),
    grantedToUserId: nullableString(row.granted_to_user_id),
    grantedToMemberId: nullableString(row.granted_to_member_id),
    permissionKey: toPermissionKey(row.permission_key),
    scope: toPermissionScope(row.scope),
    status: toPermissionStatus(row.status),
    expiresAt: nullableString(row.expires_at),
    createdAt: nullableString(row.created_at),
    updatedAt: nullableString(row.updated_at),
  };
}

export function mapCaregiverAssignmentRowToAssignment(
  row: Row,
): HealthOSCaregiverAssignment {
  return {
    id: nullableString(row.id) ?? undefined,
    circleId: nullableString(row.circle_id),
    caregiverUserId: nullableString(row.caregiver_user_id),
    caregiverProfileId: nullableString(row.caregiver_profile_id),
    subjectCareProfileId: stringValue(row.subject_care_profile_id),
    assignedBy: stringValue(row.assigned_by),
    status: toCaregiverAssignmentStatus(row.status),
    accessLevel: toCaregiverAccessLevel(row.access_level),
    canAddNotes: row.can_add_notes === true,
    canViewSchedule: row.can_view_schedule !== false,
    canViewRecords: row.can_view_records === true,
    canViewMedicationSummary: row.can_view_medication_summary === true,
    startAt: nullableString(row.start_at),
    endAt: nullableString(row.end_at),
    createdAt: nullableString(row.created_at),
    updatedAt: nullableString(row.updated_at),
  };
}

export function mapCircleToInsert(
  userId: string,
  input: HealthOSFamilyCircleCreateInput,
) {
  return {
    created_by: userId,
    name: input.name.trim(),
    description: clean(input.description),
    avatar_url: clean(input.avatarUrl),
    privacy_scope: input.privacyScope ?? "private",
  };
}

export function mapCircleToUpdate(input: HealthOSFamilyCircleUpdateInput) {
  return {
    name: input.name?.trim(),
    description: input.description,
    avatar_url: input.avatarUrl,
    privacy_scope: input.privacyScope,
    status: input.status,
  };
}

export function mapMemberToInsert(
  userId: string,
  input: HealthOSFamilyMemberCreateInput,
) {
  return {
    circle_id: input.circleId,
    user_id: input.userId,
    care_profile_id: input.careProfileId,
    display_name: clean(input.displayName),
    email: clean(input.email),
    relationship_label: clean(input.relationshipLabel),
    role: input.role ?? "member",
    status: input.status ?? "invited",
    invited_by: userId,
    joined_at: input.status === "active" ? new Date().toISOString() : null,
  };
}

export function mapInviteToInsert(
  userId: string,
  input: HealthOSFamilyInviteCreateInput,
) {
  return {
    circle_id: input.circleId,
    invited_email: clean(input.invitedEmail),
    invited_phone: clean(input.invitedPhone),
    invited_user_id: input.invitedUserId,
    invited_care_profile_id: input.invitedCareProfileId,
    invited_by: userId,
    role: input.role ?? "member",
    status: "pending",
    expires_at: input.expiresAt,
  };
}

export function mapSharingPermissionToInsert(
  userId: string,
  input: HealthOSSharingPermissionCreateInput,
) {
  return {
    circle_id: input.circleId,
    subject_care_profile_id: input.subjectCareProfileId,
    granted_by: userId,
    granted_to_user_id: input.grantedToUserId,
    granted_to_member_id: input.grantedToMemberId,
    permission_key: input.permissionKey,
    scope: input.scope ?? "summary",
    status: "active",
    expires_at: input.expiresAt,
  };
}

export function mapCaregiverAssignmentToInsert(
  userId: string,
  input: HealthOSCaregiverAssignmentCreateInput,
) {
  return {
    circle_id: input.circleId,
    caregiver_user_id: input.caregiverUserId,
    caregiver_profile_id: input.caregiverProfileId,
    subject_care_profile_id: input.subjectCareProfileId,
    assigned_by: userId,
    status: "active",
    access_level: fromCaregiverAccessLevel(input.accessLevel ?? "limited"),
    can_add_notes: Boolean(input.canAddNotes),
    can_view_schedule: input.canViewSchedule !== false,
    can_view_records: Boolean(input.canViewRecords),
    can_view_medication_summary: Boolean(input.canViewMedicationSummary),
    start_at: input.startAt,
    end_at: input.endAt,
  };
}

function toCirclePrivacy(value: unknown): HealthOSFamilyCirclePrivacyScope {
  if (value === "private" || value === "circle" || value === "selected") return value;
  return "unknown";
}

function toCircleStatus(value: unknown): HealthOSFamilyCircleStatus {
  if (value === "active" || value === "inactive" || value === "archived") return value;
  return "unknown";
}

function toFamilyRole(value: unknown): HealthOSFamilyRole {
  if (value === "owner" || value === "admin" || value === "member" || value === "caregiver" || value === "viewer") return value;
  return "member";
}

function toMemberStatus(value: unknown): HealthOSFamilyMemberStatus {
  if (value === "accepted") return "active";
  if (value === "revoked" || value === "expired") return "removed";
  if (value === "active" || value === "pending" || value === "invited" || value === "declined" || value === "removed" || value === "inactive") return value;
  return "unknown";
}

function toPermissionKey(value: unknown): HealthOSSharingPermission["permissionKey"] {
  const key = typeof value === "string" ? value : "";
  if (
    key === "view_profile_summary" ||
    key === "view_calendar_shared" ||
    key === "view_health_summary" ||
    key === "view_medication_summary" ||
    key === "view_records_shared" ||
    key === "view_child_profile" ||
    key === "view_child_logs" ||
    key === "view_pregnancy_updates" ||
    key === "view_womens_health_summary" ||
    key === "view_family_updates" ||
    key === "manage_circle" ||
    key === "invite_members" ||
    key === "manage_permissions" ||
    key === "caregiver_limited_view" ||
    key === "caregiver_add_note" ||
    key === "emergency_packet_view"
  ) {
    return key;
  }
  return "view_family_updates";
}

function toPermissionScope(value: unknown): HealthOSSharingPermissionScope {
  if (value === "summary" || value === "limited" || value === "details" || value === "emergency" || value === "manage") return value;
  return "unknown";
}

function toPermissionStatus(value: unknown): HealthOSSharingPermissionStatus {
  if (value === "active" || value === "inactive" || value === "expired" || value === "revoked") return value;
  return "unknown";
}

function toCaregiverAssignmentStatus(value: unknown): HealthOSCaregiverAssignmentStatus {
  if (value === "active" || value === "inactive" || value === "ended") return value;
  return "unknown";
}

function toCaregiverAccessLevel(value: unknown): HealthOSCaregiverAssignmentAccessLevel {
  if (value === "schedule_only") return "scheduleOnly";
  if (value === "notes_only") return "notesOnly";
  if (value === "limited" || value === "custom") return value;
  return "unknown";
}

function fromCaregiverAccessLevel(value: HealthOSCaregiverAssignmentAccessLevel) {
  if (value === "scheduleOnly") return "schedule_only";
  if (value === "notesOnly") return "notes_only";
  if (value === "unknown") return "limited";
  return value;
}

function nullableString(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function clean(value?: string | null) {
  return value?.trim() || null;
}
