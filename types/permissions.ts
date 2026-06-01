import type { AgeAccessStage, CareProfileType } from "@/types/care-profiles";
import type { CircleMemberRole } from "@/types/circles";

export type PermissionCategory =
  | "view_calendar"
  | "view_health_summary"
  | "view_medication"
  | "view_documents"
  | "view_emergency_info"
  | "view_care_notes"
  | "create_care_logs"
  | "edit_care_logs"
  | "manage_profile"
  | "manage_circle"
  | "invite_members"
  | "assign_caregivers"
  | "manage_privacy"
  | "approve_events"
  | "view_activity_logs";

export type PrivacyLevel =
  | "private"
  | "circle_shared"
  | "partner_shared"
  | "caregiver_shared"
  | "emergency_only";

export type PermissionGrant = {
  category: PermissionCategory;
  enabled: boolean;
  locked?: boolean;
  note?: string;
};

export type PermissionGroupKey =
  | "calendar"
  | "health"
  | "documents"
  | "emergency"
  | "care_logs"
  | "management";

export type PermissionPresetName =
  | "parent_guardian"
  | "adult_family_member"
  | "teen_limited_sharing"
  | "caregiver_assigned_only"
  | "viewer"
  | "custom";

export type PrivacyResourceType =
  | "circle"
  | "care_profile"
  | "document"
  | "calendar_event"
  | "care_note";

export type PermissionPreset = {
  description: string;
  grants: PermissionCategory[];
  name: PermissionPresetName;
  title: string;
};

export type PermissionRuleContext = {
  ageAccessStage: AgeAccessStage;
  currentUserRole: CircleMemberRole;
  isAssignedCaregiver?: boolean;
  isSelfManagedAdult?: boolean;
  privacyLevel: PrivacyLevel;
};

export type PermissionSummary = {
  adultConsentRequired: boolean;
  caregiverAssignmentRequired: boolean;
  defaultPermissions: PermissionCategory[];
  privacyLevel: PrivacyLevel;
  restrictedPermissions: PermissionCategory[];
  ruleNotes: string[];
  teenTransitionRequired: boolean;
};

export type PermissionAuditEvent = {
  actorId: string;
  category: PermissionCategory;
  createdAt: string;
  enabled: boolean;
  profileId?: string;
  source: "placeholder";
};

export type DefaultPrivacyContext = {
  ageStage: AgeAccessStage;
  profileType?: CareProfileType;
  resourceType: PrivacyResourceType;
};
