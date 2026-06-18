import type {
  HealthOSFamilyCircleMember,
  HealthOSFamilyRole,
  HealthOSSharingPermission,
  HealthOSSharingPermissionKey,
} from "./familySharingTypes";

const PERMISSION_LABELS: Record<HealthOSSharingPermissionKey, string> = {
  view_profile_summary: "View profile summary",
  view_calendar_shared: "View shared calendar",
  view_health_summary: "View health summary",
  view_medication_summary: "View medication summary",
  view_records_shared: "View shared records",
  view_child_profile: "View child profile",
  view_child_logs: "View child logs",
  view_pregnancy_updates: "View pregnancy updates",
  view_womens_health_summary: "View women's health summary",
  view_family_updates: "View family updates",
  manage_circle: "Manage circle",
  invite_members: "Invite members",
  manage_permissions: "Manage permissions",
  caregiver_limited_view: "Caregiver limited view",
  caregiver_add_note: "Caregiver add note",
  emergency_packet_view: "Emergency packet view",
};

export function isFamilyAdminRole(role?: HealthOSFamilyRole | null) {
  return role === "owner" || role === "admin";
}

export function isActiveFamilyMember(member?: HealthOSFamilyCircleMember | null) {
  return member?.status === "active";
}

export function canManageCircle(member?: HealthOSFamilyCircleMember | null) {
  return isActiveFamilyMember(member) && isFamilyAdminRole(member?.role);
}

export function canInviteMembers(
  member?: HealthOSFamilyCircleMember | null,
  permissions: HealthOSSharingPermission[] = [],
) {
  return canManageCircle(member) || hasActivePermission(permissions, "invite_members");
}

export function canManagePermissions(
  member?: HealthOSFamilyCircleMember | null,
  permissions: HealthOSSharingPermission[] = [],
) {
  return canManageCircle(member) || hasActivePermission(permissions, "manage_permissions");
}

export function canViewSharedProfileSummary(permissions: HealthOSSharingPermission[]) {
  return hasActivePermission(permissions, "view_profile_summary");
}

export function canViewSharedRecords(permissions: HealthOSSharingPermission[]) {
  return hasActivePermission(permissions, "view_records_shared");
}

export function canViewChildLogs(permissions: HealthOSSharingPermission[]) {
  return hasActivePermission(permissions, "view_child_logs");
}

export function canViewPregnancyUpdates(permissions: HealthOSSharingPermission[]) {
  return hasActivePermission(permissions, "view_pregnancy_updates");
}

export function canViewWomensHealthSummary(permissions: HealthOSSharingPermission[]) {
  return hasActivePermission(permissions, "view_womens_health_summary");
}

export function isCaregiverLimitedPermission(key: HealthOSSharingPermissionKey) {
  return key === "caregiver_limited_view" || key === "caregiver_add_note";
}

export function getPermissionLabel(key: HealthOSSharingPermissionKey) {
  return PERMISSION_LABELS[key] ?? "Unknown permission";
}

export function getPermissionPrivacyWarning(key: HealthOSSharingPermissionKey) {
  if (key === "view_records_shared") return "Records access must be explicitly granted.";
  if (key === "view_child_logs") return "Child logs require guardian approval.";
  if (key === "view_pregnancy_updates") return "Pregnancy updates are private by default.";
  if (key === "view_womens_health_summary") return "Women's health remains private unless explicitly shared.";
  if (key === "view_medication_summary") return "Medication access is summary-only unless a later batch expands it.";
  return "Family membership alone does not grant private health access.";
}

function hasActivePermission(
  permissions: HealthOSSharingPermission[],
  key: HealthOSSharingPermissionKey,
) {
  const now = Date.now();
  return permissions.some(
    (permission) =>
      permission.permissionKey === key &&
      permission.status === "active" &&
      (!permission.expiresAt ||
        new Date(permission.expiresAt).getTime() > now),
  );
}
