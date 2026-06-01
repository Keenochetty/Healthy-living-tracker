import type {
  CircleMemberRole,
  CirclePermission,
  CircleRelationship
} from "@/types/circles";
export {
  AGE_ACCESS_STAGES,
  CARE_PROFILE_TYPES,
  ageAccessStageLabels,
  careProfileTypeLabels
} from "@/constants/care-profiles";

export const CIRCLE_MEMBER_ROLES = [
  "owner",
  "admin",
  "member",
  "dependent",
  "caregiver",
  "viewer"
] as const satisfies readonly CircleMemberRole[];

export const CIRCLE_RELATIONSHIPS = [
  "father",
  "mother",
  "guardian",
  "partner",
  "husband",
  "wife",
  "son",
  "daughter",
  "grandparent",
  "sibling",
  "in_law",
  "caregiver",
  "other"
] as const satisfies readonly CircleRelationship[];

export const CIRCLE_PERMISSIONS = [
  "manage_circle",
  "manage_members",
  "manage_dependents",
  "invite_caregivers",
  "view_safe_summary",
  "view_private_records"
] as const satisfies readonly CirclePermission[];

export const circleRoleLabels = {
  admin: "Admin",
  caregiver: "Caregiver",
  dependent: "Dependent",
  member: "Member",
  owner: "Owner",
  viewer: "Viewer"
} as const satisfies Record<CircleMemberRole, string>;

export const circleRelationshipLabels = {
  caregiver: "Caregiver",
  daughter: "Daughter",
  father: "Father",
  grandparent: "Grandparent",
  guardian: "Guardian",
  husband: "Husband",
  in_law: "In-law",
  mother: "Mother",
  other: "Other",
  partner: "Partner",
  sibling: "Sibling",
  son: "Son",
  wife: "Wife"
} as const satisfies Record<CircleRelationship, string>;

export const circlePermissionLabels = {
  invite_caregivers: "Invite caregivers",
  manage_circle: "Manage circle",
  manage_dependents: "Manage dependents",
  manage_members: "Manage members",
  view_private_records: "View private records",
  view_safe_summary: "View safe summary"
} as const satisfies Record<CirclePermission, string>;

export function canManageCircleMembers(role: CircleMemberRole) {
  return role === "owner" || role === "admin";
}

export function getCircleRoleTone(role: CircleMemberRole) {
  if (role === "owner" || role === "admin") {
    return "success" as const;
  }

  if (role === "dependent" || role === "caregiver") {
    return "ai" as const;
  }

  if (role === "viewer") {
    return "warning" as const;
  }

  return "default" as const;
}
