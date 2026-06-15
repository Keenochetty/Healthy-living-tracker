import type {
  PermissionCategory,
  PermissionGroupKey,
  PermissionPresetName,
  PrivacyLevel,
} from "@/types/permissions";

export const PERMISSION_CATEGORIES = [
  "view_calendar",
  "view_health_summary",
  "view_medication",
  "view_documents",
  "view_emergency_info",
  "view_care_notes",
  "create_care_logs",
  "edit_care_logs",
  "manage_profile",
  "manage_circle",
  "invite_members",
  "assign_caregivers",
  "manage_privacy",
  "approve_events",
  "view_activity_logs",
] as const satisfies readonly PermissionCategory[];

export const PRIVACY_LEVELS = [
  "private",
  "circle_shared",
  "partner_shared",
  "caregiver_shared",
  "emergency_only",
] as const satisfies readonly PrivacyLevel[];

export const permissionCategoryLabels = {
  assign_caregivers: "Assign caregivers",
  create_care_logs: "Create care logs",
  edit_care_logs: "Edit care logs",
  invite_members: "Invite members",
  manage_circle: "Manage circle",
  manage_privacy: "Manage privacy",
  manage_profile: "Manage profile",
  approve_events: "Approve events",
  view_activity_logs: "View activity logs",
  view_calendar: "View calendar",
  view_care_notes: "View care notes",
  view_documents: "View documents",
  view_emergency_info: "View emergency info",
  view_health_summary: "View health summary",
  view_medication: "View medication",
} as const satisfies Record<PermissionCategory, string>;

export const permissionCategoryDescriptions = {
  assign_caregivers: "Assign caregivers to specific care profiles.",
  create_care_logs: "Add care updates and routine notes.",
  edit_care_logs: "Edit existing care log entries.",
  invite_members: "Invite new circle members.",
  manage_circle: "Manage circle settings and membership.",
  manage_privacy: "Adjust sharing rules after consent checks.",
  manage_profile: "Manage a care profile's settings.",
  approve_events: "Approve suggested or shared events.",
  view_activity_logs: "Review permission and access change history.",
  view_calendar: "See shared calendar items.",
  view_care_notes: "See care notes and handoff context.",
  view_documents: "See shared documents.",
  view_emergency_info: "See emergency contacts and critical notes.",
  view_health_summary: "See safe health summaries.",
  view_medication: "See medication reminders and summaries.",
} as const satisfies Record<PermissionCategory, string>;

export const privacyLevelLabels = {
  caregiver_shared: "Caregiver shared",
  circle_shared: "Circle shared",
  emergency_only: "Emergency only",
  partner_shared: "Partner shared",
  private: "Private",
} as const satisfies Record<PrivacyLevel, string>;

export const privacyLevelDescriptions = {
  caregiver_shared: "Only assigned caregivers see granted care fields.",
  circle_shared: "Circle members see granted fields.",
  emergency_only: "Only emergency information is visible.",
  partner_shared: "Shared with a partner or explicitly selected trusted adult.",
  private: "Private unless the adult owner grants access.",
} as const satisfies Record<PrivacyLevel, string>;

export const childManagedPermissions = [
  "view_calendar",
  "view_health_summary",
  "view_medication",
  "view_documents",
  "view_emergency_info",
  "view_care_notes",
  "create_care_logs",
  "edit_care_logs",
  "manage_profile",
  "manage_privacy",
] as const satisfies readonly PermissionCategory[];

export const teenTransitionPermissions = [
  "view_calendar",
  "view_health_summary",
  "view_emergency_info",
  "view_care_notes",
  "create_care_logs",
] as const satisfies readonly PermissionCategory[];

export const adultControlledPermissions = [
  "view_emergency_info",
] as const satisfies readonly PermissionCategory[];

export const circleAdminPermissions = [
  "manage_circle",
  "invite_members",
  "assign_caregivers",
  "approve_events",
  "view_activity_logs",
] as const satisfies readonly PermissionCategory[];

export const permissionGroupLabels = {
  calendar: "Calendar",
  care_logs: "Care Logs",
  documents: "Documents",
  emergency: "Emergency",
  health: "Health",
  management: "Management",
} as const satisfies Record<PermissionGroupKey, string>;

export const permissionGroups = {
  calendar: ["view_calendar", "approve_events"],
  care_logs: ["view_care_notes", "create_care_logs", "edit_care_logs"],
  documents: ["view_documents"],
  emergency: ["view_emergency_info"],
  health: ["view_health_summary", "view_medication"],
  management: [
    "manage_profile",
    "manage_circle",
    "invite_members",
    "assign_caregivers",
    "manage_privacy",
    "view_activity_logs",
  ],
} as const satisfies Record<PermissionGroupKey, readonly PermissionCategory[]>;

export const PERMISSION_PRESETS = [
  "parent_guardian",
  "adult_family_member",
  "teen_limited_sharing",
  "caregiver_assigned_only",
  "viewer",
  "custom",
] as const satisfies readonly PermissionPresetName[];

export const permissionPresetLabels = {
  adult_family_member: "Adult Family Member",
  caregiver_assigned_only: "Caregiver Assigned Only",
  custom: "Custom",
  parent_guardian: "Parent / Guardian",
  teen_limited_sharing: "Teen Limited Sharing",
  viewer: "Viewer",
} as const satisfies Record<PermissionPresetName, string>;

export const permissionPresetDescriptions = {
  adult_family_member:
    "Shared calendar and safe updates only. Adult private health details stay private unless consent is granted.",
  caregiver_assigned_only:
    "Assigned care profiles only, with granted care fields. No full circle access.",
  custom: "Manual placeholder for future granular permission editing.",
  parent_guardian:
    "Parent-managed access for children and dependents, including emergency info and schedule management.",
  teen_limited_sharing:
    "Gradual sharing for teens with clear transition controls.",
  viewer: "Read-only shared circle context with no private health access.",
} as const satisfies Record<PermissionPresetName, string>;

export const permissionPresetGrants = {
  adult_family_member: ["view_calendar", "view_emergency_info"],
  caregiver_assigned_only: [
    "view_calendar",
    "view_emergency_info",
    "view_care_notes",
    "create_care_logs",
  ],
  custom: [],
  parent_guardian: [
    "view_calendar",
    "view_health_summary",
    "view_medication",
    "view_documents",
    "view_emergency_info",
    "view_care_notes",
    "create_care_logs",
    "edit_care_logs",
    "manage_profile",
    "manage_privacy",
  ],
  teen_limited_sharing: [
    "view_calendar",
    "view_health_summary",
    "view_emergency_info",
    "view_care_notes",
  ],
  viewer: ["view_calendar"],
} as const satisfies Record<
  PermissionPresetName,
  readonly PermissionCategory[]
>;
