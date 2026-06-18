import type {
  HealthOSCaregiverAssignmentCreateInput,
  HealthOSFamilyMemberStatus,
  HealthOSFamilyRole,
  HealthOSSharingPermissionKey,
  HealthOSSharingPermissionScope,
} from "./familySharingTypes";

type ValidationResult = { valid: true } | { error: string; valid: false };

const FAMILY_ROLES: HealthOSFamilyRole[] = ["owner", "admin", "member", "caregiver", "viewer"];
const MEMBER_STATUSES: HealthOSFamilyMemberStatus[] = ["active", "pending", "invited", "declined", "removed", "inactive", "unknown"];
const PERMISSION_SCOPES: HealthOSSharingPermissionScope[] = ["summary", "limited", "details", "emergency", "manage", "unknown"];
const PERMISSION_KEYS: HealthOSSharingPermissionKey[] = [
  "view_profile_summary",
  "view_calendar_shared",
  "view_health_summary",
  "view_medication_summary",
  "view_records_shared",
  "view_child_profile",
  "view_child_logs",
  "view_pregnancy_updates",
  "view_womens_health_summary",
  "view_family_updates",
  "manage_circle",
  "invite_members",
  "manage_permissions",
  "caregiver_limited_view",
  "caregiver_add_note",
  "emergency_packet_view",
];

export function validateFamilyCircleName(name: string): ValidationResult {
  if (!name.trim()) return { error: "Family circle name is required.", valid: false };
  if (name.trim().length > 80) return { error: "Family circle name is too long.", valid: false };
  return { valid: true };
}

export function validateInviteEmail(email?: string | null): ValidationResult {
  if (!email) return { valid: true };
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? { valid: true }
    : { error: "Invite email is invalid.", valid: false };
}

export function validateInviteRole(role?: HealthOSFamilyRole): ValidationResult {
  if (!role) return { valid: true };
  return validateFamilyRole(role);
}

export function validateFamilyRole(role: string): ValidationResult {
  return FAMILY_ROLES.includes(role as HealthOSFamilyRole)
    ? { valid: true }
    : { error: "Family role is invalid.", valid: false };
}

export function validatePermissionKey(key: string): ValidationResult {
  return PERMISSION_KEYS.includes(key as HealthOSSharingPermissionKey)
    ? { valid: true }
    : { error: "Sharing permission key is invalid.", valid: false };
}

export function validatePermissionScope(scope: string): ValidationResult {
  return PERMISSION_SCOPES.includes(scope as HealthOSSharingPermissionScope)
    ? { valid: true }
    : { error: "Sharing permission scope is invalid.", valid: false };
}

export function validateCaregiverAssignment(
  input: HealthOSCaregiverAssignmentCreateInput,
): ValidationResult {
  if (!input.subjectCareProfileId) {
    return { error: "Caregiver assignment subject is required.", valid: false };
  }
  if (!input.caregiverUserId && !input.caregiverProfileId) {
    return { error: "Caregiver assignment requires a caregiver.", valid: false };
  }
  return { valid: true };
}

export function validateMemberStatus(status: string): ValidationResult {
  return MEMBER_STATUSES.includes(status as HealthOSFamilyMemberStatus)
    ? { valid: true }
    : { error: "Family member status is invalid.", valid: false };
}
