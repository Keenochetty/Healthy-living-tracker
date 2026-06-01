import {
  PERMISSION_CATEGORIES,
  adultControlledPermissions,
  childManagedPermissions,
  circleAdminPermissions,
  permissionPresetDescriptions,
  permissionPresetGrants,
  permissionPresetLabels,
  teenTransitionPermissions
} from "@/constants/permissions";
import { calculateAge, determineDefaultAgeAccessStage } from "@/lib/care-profiles";
import type { AgeAccessStage, CareProfileType } from "@/types/care-profiles";
import type { CareProfile } from "@/types/care-profiles";
import type { CircleMemberRole } from "@/types/circles";
import type {
  PermissionAuditEvent,
  PermissionCategory,
  PermissionGrant,
  PermissionPreset,
  PermissionPresetName,
  PermissionRuleContext,
  PermissionSummary,
  PrivacyResourceType,
  PrivacyLevel
} from "@/types/permissions";

export function canManageCirclePrivacy(role: CircleMemberRole) {
  return role === "owner" || role === "admin";
}

export function canManageCircle(memberRole: CircleMemberRole) {
  return memberRole === "owner" || memberRole === "admin";
}

export function canViewAdultPrivateData(permissionSet: readonly PermissionCategory[]) {
  return permissionSet.includes("view_health_summary") || permissionSet.includes("view_medication") || permissionSet.includes("view_documents");
}

export function canCaregiverAccess(permissionSet: readonly PermissionCategory[], permissionKey: PermissionCategory) {
  return permissionSet.includes(permissionKey);
}

export function getSafePreview(text: string | null | undefined, isSensitive: boolean) {
  if (!text) {
    return "No preview available";
  }

  if (isSensitive) {
    return "Private information hidden";
  }

  return text.length > 96 ? `${text.slice(0, 93)}...` : text;
}

export function getAgeAccessStage(dateOfBirth: string | null | undefined): AgeAccessStage {
  return determineDefaultAgeAccessStage(calculateAge(dateOfBirth));
}

export function shouldRequireConsent(profileType: CareProfileType, ageStage: AgeAccessStage) {
  return ageStage === "adult_controlled" || profileType === "adult_member" || profileType === "adult_dependent" || profileType === "elderly_dependent";
}

export function getDefaultPrivacyLevel(
  resourceType: PrivacyResourceType,
  profileType: CareProfileType | undefined,
  ageStage: AgeAccessStage
): PrivacyLevel {
  if (resourceType === "document" || resourceType === "care_note") {
    return ageStage === "adult_controlled" ? "private" : "circle_shared";
  }

  if (resourceType === "calendar_event") {
    return "circle_shared";
  }

  if (profileType && shouldRequireConsent(profileType, ageStage)) {
    return "private";
  }

  if (ageStage === "teen_transition") {
    return "circle_shared";
  }

  return ageStage === "parent_managed" ? "circle_shared" : "private";
}

export function getPrivacyLevelForCareProfile(profile: CareProfile): PrivacyLevel {
  if (profile.privacyStatus === "adult_private") {
    return "private";
  }

  if (profile.privacyStatus === "shared_with_circle") {
    return "circle_shared";
  }

  if (profile.privacyStatus === "teen_limited") {
    return "circle_shared";
  }

  return "circle_shared";
}

export function getDefaultPermissionsForAgeStage(ageAccessStage: PermissionRuleContext["ageAccessStage"]) {
  if (ageAccessStage === "parent_managed") {
    return [...childManagedPermissions];
  }

  if (ageAccessStage === "teen_transition") {
    return [...teenTransitionPermissions];
  }

  return [...adultControlledPermissions];
}

export function getDefaultPermissionsForPrivacyLevel(privacyLevel: PrivacyLevel): PermissionCategory[] {
  if (privacyLevel === "private") {
    return [...adultControlledPermissions];
  }

  if (privacyLevel === "emergency_only") {
    return ["view_emergency_info"];
  }

  if (privacyLevel === "caregiver_shared") {
    return ["view_calendar", "view_health_summary", "view_emergency_info", "view_care_notes", "create_care_logs"];
  }

  if (privacyLevel === "partner_shared") {
    return ["view_calendar", "view_health_summary", "view_medication", "view_documents", "view_emergency_info", "view_care_notes"];
  }

  return ["view_calendar", "view_health_summary", "view_emergency_info", "view_care_notes"];
}

export function buildPermissionSummary(context: PermissionRuleContext): PermissionSummary {
  const stagePermissions = getDefaultPermissionsForAgeStage(context.ageAccessStage);
  const privacyPermissions = getDefaultPermissionsForPrivacyLevel(context.privacyLevel);
  const adminPermissions = canManageCirclePrivacy(context.currentUserRole) ? [...circleAdminPermissions] : [];
  const defaultPermissions = Array.from(new Set([...stagePermissions, ...privacyPermissions, ...adminPermissions]));
  const restrictedPermissions = PERMISSION_CATEGORIES.filter((permission) => !defaultPermissions.includes(permission));
  const adultConsentRequired = context.ageAccessStage === "adult_controlled" && !context.isSelfManagedAdult;
  const teenTransitionRequired = context.ageAccessStage === "teen_transition";
  const caregiverAssignmentRequired = context.privacyLevel === "caregiver_shared" && !context.isAssignedCaregiver;
  const ruleNotes = [
    "Admins can manage the circle but do not automatically see adult private health data.",
    "Adults control their own health sharing unless they grant access.",
    "Caregivers only see assigned care profiles and granted fields."
  ];

  if (teenTransitionRequired) {
    ruleNotes.push("Teen profiles use transition controls for gradually shared access.");
  }

  if (context.ageAccessStage === "parent_managed") {
    ruleNotes.push("Children ages 0-12 default to parent/admin managed access.");
  }

  return {
    adultConsentRequired,
    caregiverAssignmentRequired,
    defaultPermissions,
    privacyLevel: context.privacyLevel,
    restrictedPermissions,
    ruleNotes,
    teenTransitionRequired
  };
}

export function toPermissionGrants(enabledPermissions: PermissionCategory[], lockedPermissions: PermissionCategory[] = []): PermissionGrant[] {
  return PERMISSION_CATEGORIES.map((category) => ({
    category,
    enabled: enabledPermissions.includes(category),
    locked: lockedPermissions.includes(category)
  }));
}

export function buildPermissionPreset(presetName: PermissionPresetName): PermissionPreset {
  return {
    description: permissionPresetDescriptions[presetName],
    grants: [...permissionPresetGrants[presetName]],
    name: presetName,
    title: permissionPresetLabels[presetName]
  };
}

export function createPermissionAuditPlaceholder(
  category: PermissionCategory,
  enabled: boolean,
  actorId = "local-user",
  profileId?: string
): PermissionAuditEvent {
  return {
    actorId,
    category,
    createdAt: new Date().toISOString(),
    enabled,
    profileId,
    source: "placeholder"
  };
}
