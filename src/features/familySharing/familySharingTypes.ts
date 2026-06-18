export type HealthOSFamilySharingBackendStatus =
  | "idle"
  | "loading"
  | "ready"
  | "missingAuth"
  | "missingTable"
  | "deferred"
  | "error";

export type HealthOSFamilySharingServiceResult<T> = {
  data: T | null;
  error: string | null;
  status: HealthOSFamilySharingBackendStatus;
};

export type HealthOSFamilyRole =
  | "owner"
  | "admin"
  | "member"
  | "caregiver"
  | "viewer";

export type HealthOSFamilyMemberStatus =
  | "active"
  | "pending"
  | "invited"
  | "declined"
  | "removed"
  | "inactive"
  | "unknown";

export type HealthOSFamilyCircleStatus =
  | "active"
  | "inactive"
  | "archived"
  | "unknown";

export type HealthOSFamilyCirclePrivacyScope =
  | "private"
  | "circle"
  | "selected"
  | "unknown";

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

export type HealthOSSharingPermissionScope =
  | "summary"
  | "limited"
  | "details"
  | "emergency"
  | "manage"
  | "unknown";

export type HealthOSSharingPermissionStatus =
  | "active"
  | "inactive"
  | "expired"
  | "revoked"
  | "unknown";

export type HealthOSCaregiverAssignmentStatus =
  | "active"
  | "inactive"
  | "ended"
  | "unknown";

export type HealthOSCaregiverAssignmentAccessLevel =
  | "limited"
  | "scheduleOnly"
  | "notesOnly"
  | "custom"
  | "unknown";

export type HealthOSFamilyCircle = {
  id?: string;
  createdBy: string;
  name: string;
  description?: string | null;
  avatarUrl?: string | null;
  privacyScope: HealthOSFamilyCirclePrivacyScope;
  status: HealthOSFamilyCircleStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type HealthOSFamilyCircleMember = {
  id?: string;
  circleId: string;
  userId?: string | null;
  careProfileId?: string | null;
  displayName?: string | null;
  email?: string | null;
  relationshipLabel?: string | null;
  role: HealthOSFamilyRole;
  status: HealthOSFamilyMemberStatus;
  joinedAt?: string | null;
  invitedBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type HealthOSFamilyInvite = {
  id?: string;
  circleId?: string | null;
  invitedEmail?: string | null;
  invitedPhone?: string | null;
  invitedUserId?: string | null;
  invitedCareProfileId?: string | null;
  invitedBy?: string | null;
  role: HealthOSFamilyRole;
  status: HealthOSFamilyMemberStatus;
  expiresAt?: string | null;
  acceptedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type HealthOSSharingPermission = {
  id?: string;
  circleId: string;
  subjectCareProfileId?: string | null;
  grantedBy: string;
  grantedToUserId?: string | null;
  grantedToMemberId?: string | null;
  permissionKey: HealthOSSharingPermissionKey;
  scope: HealthOSSharingPermissionScope;
  status: HealthOSSharingPermissionStatus;
  expiresAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type HealthOSCaregiverAssignment = {
  id?: string;
  circleId?: string | null;
  caregiverUserId?: string | null;
  caregiverProfileId?: string | null;
  subjectCareProfileId: string;
  assignedBy: string;
  status: HealthOSCaregiverAssignmentStatus;
  accessLevel: HealthOSCaregiverAssignmentAccessLevel;
  canAddNotes: boolean;
  canViewSchedule: boolean;
  canViewRecords: boolean;
  canViewMedicationSummary: boolean;
  startAt?: string | null;
  endAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type HealthOSFamilyCircleCreateInput = {
  name: string;
  description?: string | null;
  avatarUrl?: string | null;
  privacyScope?: Exclude<HealthOSFamilyCirclePrivacyScope, "unknown">;
};

export type HealthOSFamilyCircleUpdateInput = Partial<
  Omit<HealthOSFamilyCircleCreateInput, "privacyScope"> & {
    privacyScope: Exclude<HealthOSFamilyCirclePrivacyScope, "unknown">;
    status: Exclude<HealthOSFamilyCircleStatus, "unknown">;
  }
>;

export type HealthOSFamilyMemberCreateInput = {
  circleId: string;
  userId?: string | null;
  careProfileId?: string | null;
  displayName?: string | null;
  email?: string | null;
  relationshipLabel?: string | null;
  role?: HealthOSFamilyRole;
  status?: Exclude<HealthOSFamilyMemberStatus, "unknown">;
};

export type HealthOSFamilyInviteCreateInput = {
  circleId: string;
  invitedEmail?: string | null;
  invitedPhone?: string | null;
  invitedUserId?: string | null;
  invitedCareProfileId?: string | null;
  role?: HealthOSFamilyRole;
  expiresAt?: string | null;
};

export type HealthOSSharingPermissionCreateInput = {
  circleId: string;
  subjectCareProfileId?: string | null;
  grantedToUserId?: string | null;
  grantedToMemberId?: string | null;
  permissionKey: HealthOSSharingPermissionKey;
  scope?: Exclude<HealthOSSharingPermissionScope, "unknown">;
  expiresAt?: string | null;
};

export type HealthOSCaregiverAssignmentCreateInput = {
  circleId?: string | null;
  caregiverUserId?: string | null;
  caregiverProfileId?: string | null;
  subjectCareProfileId: string;
  accessLevel?: Exclude<HealthOSCaregiverAssignmentAccessLevel, "unknown">;
  canAddNotes?: boolean;
  canViewSchedule?: boolean;
  canViewRecords?: boolean;
  canViewMedicationSummary?: boolean;
  startAt?: string | null;
  endAt?: string | null;
};
