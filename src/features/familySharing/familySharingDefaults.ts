import type {
  HealthOSCaregiverAssignmentCreateInput,
  HealthOSFamilyCircleCreateInput,
  HealthOSFamilyInviteCreateInput,
  HealthOSFamilyMemberCreateInput,
  HealthOSSharingPermissionCreateInput,
} from "./familySharingTypes";

export function createDefaultFamilyCircleInput(
  name: string,
): HealthOSFamilyCircleCreateInput {
  return {
    name,
    description: null,
    avatarUrl: null,
    privacyScope: "private",
  };
}

export function createDefaultFamilyMemberInput(
  circleId: string,
): HealthOSFamilyMemberCreateInput {
  return {
    circleId,
    role: "member",
    status: "invited",
  };
}

export function createDefaultFamilyInviteInput(
  circleId: string,
): HealthOSFamilyInviteCreateInput {
  return {
    circleId,
    role: "member",
  };
}

export function createDefaultSharingPermissionInput(
  circleId: string,
  permissionKey: HealthOSSharingPermissionCreateInput["permissionKey"],
): HealthOSSharingPermissionCreateInput {
  return {
    circleId,
    permissionKey,
    scope: "summary",
  };
}

export function createDefaultCaregiverAssignmentInput(
  subjectCareProfileId: string,
): HealthOSCaregiverAssignmentCreateInput {
  return {
    subjectCareProfileId,
    accessLevel: "limited",
    canAddNotes: false,
    canViewSchedule: true,
    canViewRecords: false,
    canViewMedicationSummary: false,
  };
}

export const EMPTY_FAMILY_CIRCLES: [] = [];
export const EMPTY_FAMILY_MEMBERS: [] = [];
export const EMPTY_FAMILY_INVITES: [] = [];
export const EMPTY_SHARING_PERMISSIONS: [] = [];
export const EMPTY_CAREGIVER_ASSIGNMENTS: [] = [];
