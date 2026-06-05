import type { WidgetKey } from "@/types/app";

export type FamilyCircleType =
  | "household"
  | "partner"
  | "children"
  | "parents_elders"
  | "care_team"
  | "custom";

export type FamilyRole =
  | "owner"
  | "admin"
  | "adult_member"
  | "partner"
  | "parent_guardian"
  | "child"
  | "teen"
  | "elder"
  | "caregiver"
  | "viewer"
  | "emergency_contact";

export type ProfileType =
  | "self"
  | "partner"
  | "child"
  | "teen"
  | "adult"
  | "elder"
  | "caregiver_contact"
  | "dependent";

export type PermissionCategory =
  | "overview"
  | "nutrition"
  | "workout"
  | "biometrics"
  | "medication"
  | "supplements"
  | "records"
  | "calendar"
  | "womens_health"
  | "mens_health"
  | "pregnancy"
  | "baby_child"
  | "device_sync"
  | "notes"
  | "reminders"
  | "emergency_info";

export type PermissionLevel =
  | "none"
  | "view"
  | "add"
  | "edit"
  | "manage"
  | "emergency_only";

export type InviteStatus = "active" | "pending" | "accepted" | "declined" | "expired" | "revoked";
export type DefaultPrivacyLevel = "private" | "shared_summary" | "shared_selected";
export type TeenPrivacyTransitionMode = "parent_full_input" | "parent_view_only" | "request_access" | "teen_selected_areas";

export type FamilyCircle = {
  createdAt: string;
  defaultPrivacyLevel: DefaultPrivacyLevel;
  description?: string;
  id: string;
  name: string;
  ownerUserId: string;
  type: FamilyCircleType;
  updatedAt: string;
};

export type HealthProfile = {
  adultControlActivatedAt?: string;
  avatarUrl?: string;
  createdAt: string;
  createdByUserId: string;
  dateOfBirth?: string;
  displayName: string;
  gender?: string;
  id: string;
  isAdultControlled: boolean;
  isManagedProfile: boolean;
  legacySource?: "self" | "child" | "elder" | "manual";
  legacySourceId?: string;
  profileType: ProfileType;
  teenPrivacyTransitionMode?: TeenPrivacyTransitionMode;
  updatedAt: string;
  userId?: string;
};

export type FamilyCircleMember = {
  circleId: string;
  createdAt: string;
  displayName: string;
  id: string;
  inviteStatus: InviteStatus;
  joinedAt?: string;
  profileId?: string;
  role: FamilyRole;
  updatedAt: string;
  userId?: string;
};

export type ProfilePermission = {
  canAdd: boolean;
  canEdit: boolean;
  canManage: boolean;
  canView: boolean;
  category: PermissionCategory;
  circleId?: string;
  createdAt: string;
  expiresAt?: string;
  grantedToProfileId?: string;
  grantedToUserId?: string;
  id: string;
  permissionLevel: PermissionLevel;
  role?: FamilyRole;
  targetProfileId: string;
  updatedAt: string;
};

export type CaregiverProfile = {
  assignedProfileId?: string;
  availableDays?: number[];
  availableFrom?: string;
  availableTo?: string;
  circleId?: string;
  createdAt: string;
  email?: string;
  id: string;
  isActive: boolean;
  isEmergencyContact: boolean;
  name: string;
  notes?: string;
  permissions: PermissionCategory[];
  phone?: string;
  ratePerDay?: number;
  ratePerHour?: number;
  relationship?: string;
  role?: string;
  updatedAt: string;
};

export type FamilyInvite = {
  circleId: string;
  createdAt: string;
  expiresAt?: string;
  id: string;
  invitedByUserId: string;
  invitedEmail?: string;
  invitedPhone?: string;
  message?: string;
  role: FamilyRole;
  status: Exclude<InviteStatus, "active">;
  updatedAt: string;
};

export type EmergencyInfoCard = {
  allergiesJson?: Record<string, unknown>;
  bloodType?: string;
  createdAt: string;
  dateOfBirth?: string;
  doctorClinic?: string;
  emergencyContactsJson?: Record<string, unknown>;
  fullName: string;
  id: string;
  insuranceInfo?: string;
  medicalNotes?: string;
  medicationSummary?: string;
  profileId: string;
  updatedAt: string;
  visibility: "private" | "circle_admins" | "emergency_contacts" | "caregiver_allowed" | "locked";
};

export type HealthAuditLog = {
  action: string;
  actorUserId: string;
  circleId?: string;
  createdAt: string;
  id: string;
  metadata?: Record<string, unknown>;
  relatedId?: string;
  relatedRealm?: string;
  targetProfileId?: string;
};

export type ProfileWidgetPreference = {
  createdAt: string;
  profileId: string;
  updatedAt: string;
  widgetKeys: WidgetKey[];
};
