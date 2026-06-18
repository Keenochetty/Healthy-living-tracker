export type HealthOSSharingPermissionKey =
  | "view_profile_summary"
  | "view_calendar_shared"
  | "view_health_summary"
  | "view_medication_summary"
  | "view_records_shared"
  | "view_child_profile"
  | "view_child_logs"
  | "view_pregnancy_updates"
  | "view_womens_health_summary"
  | "view_family_updates"
  | "manage_circle"
  | "invite_members"
  | "manage_permissions"
  | "caregiver_limited_view"
  | "caregiver_add_note"
  | "emergency_packet_view";

export type HealthOSSharingPermission = {
  key: HealthOSSharingPermissionKey;
  label: string;
  description: string;
  sensitive: boolean;
  caregiverAllowed: boolean;
  requiresExplicitGrant: boolean;
};

export const healthOSSharingPermissions: Record<
  HealthOSSharingPermissionKey,
  HealthOSSharingPermission
> = {
  view_profile_summary: permission("view_profile_summary", "View profile summary", "View selected profile summary details.", true, false),
  view_calendar_shared: permission("view_calendar_shared", "View shared calendar", "View calendar items marked as shared.", true, true),
  view_health_summary: permission("view_health_summary", "View health summary", "View high-level health summaries, not full records.", true, false),
  view_medication_summary: permission("view_medication_summary", "View medication summary", "View medication summary details only when explicitly granted.", true, false),
  view_records_shared: permission("view_records_shared", "View shared records", "View records explicitly marked for sharing.", true, false),
  view_child_profile: permission("view_child_profile", "View child profile", "View child profile basics for an assigned child.", true, true),
  view_child_logs: permission("view_child_logs", "View child logs", "View selected child care logs.", true, true),
  view_pregnancy_updates: permission("view_pregnancy_updates", "View pregnancy updates", "View pregnancy updates explicitly shared by the owner.", true, false),
  view_womens_health_summary: permission("view_womens_health_summary", "View women's health summary", "View only explicitly shared women's health summaries.", true, false),
  view_family_updates: permission("view_family_updates", "View family updates", "View non-medical shared family updates.", false, true),
  manage_circle: permission("manage_circle", "Manage circle", "Manage circle settings and membership.", true, false),
  invite_members: permission("invite_members", "Invite members", "Invite new family or care participants.", true, false),
  manage_permissions: permission("manage_permissions", "Manage permissions", "Grant or revoke sharing permissions.", true, false),
  caregiver_limited_view: permission("caregiver_limited_view", "Caregiver limited view", "View only the assigned care scope.", true, true),
  caregiver_add_note: permission("caregiver_add_note", "Caregiver add note", "Add care notes for assigned people only.", true, true),
  emergency_packet_view: permission("emergency_packet_view", "Emergency packet view", "View emergency packet details in approved emergency flows.", true, true),
};

function permission(
  key: HealthOSSharingPermissionKey,
  label: string,
  description: string,
  sensitive: boolean,
  caregiverAllowed: boolean,
): HealthOSSharingPermission {
  return {
    key,
    label,
    description,
    sensitive,
    caregiverAllowed,
    requiresExplicitGrant: true,
  };
}
