export type CircleRole =
  | "partner"
  | "spouse"
  | "close_friend"
  | "parent"
  | "grandparent"
  | "child"
  | "adult_child"
  | "caregiver"
  | "elder"
  | "other_family";

export type CirclePermissionKey =
  | "view_profile"
  | "view_schedule"
  | "add_schedule"
  | "view_health_summary"
  | "view_medications"
  | "view_allergies"
  | "view_emergency_contacts"
  | "add_care_notes"
  | "add_health_updates"
  | "upload_documents"
  | "manage_child_profile"
  | "manage_elder_profile"
  | "emergency_access";

export type CircleMemberStatus = "pending" | "active" | "declined" | "removed";

export type CircleInvite = {
  circleId: string;
  circleName: string;
  createdAt: string;
  inviteLink: string;
  joinRequestedAt?: string;
  permissions: CirclePermissionKey[];
  role: CircleRole;
  status: "open" | "join_requested";
  token: string;
};

export type CircleMember = {
  assignedProfileIds?: string[];
  avatarInitials: string;
  circleId: string;
  displayName: string;
  id: string;
  invitedByMemberId?: string;
  isOwner?: boolean;
  joinedAt?: string;
  permissions: CirclePermissionKey[];
  requestedAt?: string;
  role: CircleRole;
  status: CircleMemberStatus;
};

export type CircleJoinRequest = {
  avatarInitials: string;
  circleId: string;
  displayName: string;
  id: string;
  message?: string;
  permissions: CirclePermissionKey[];
  requestedAt: string;
  role: CircleRole;
  status: Extract<CircleMemberStatus, "pending" | "declined">;
};

export type FamilyCircle = {
  id: string;
  members: CircleMember[];
  name: string;
  ownerName: string;
  pendingRequests: CircleJoinRequest[];
};
