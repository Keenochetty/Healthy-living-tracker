import type {
  CircleMemberRole,
  CirclePermission,
  CircleRelationship,
} from "@/types/circles";

export type InviteMethod =
  | "share_link"
  | "qr_placeholder"
  | "email"
  | "sms_whatsapp_placeholder";

export type CircleInviteStatus = "pending" | "accepted" | "expired" | "revoked";

export type InvitePermissionPreset =
  | "adult_family_member"
  | "parent_guardian"
  | "caregiver"
  | "viewer"
  | "custom";

export type InviteRole = Exclude<CircleMemberRole, "owner">;

export type CircleInvite = {
  id: string;
  circleId: string;
  inviteToken: string;
  inviteLink: string;
  invitedEmail?: string | null;
  invitedPhone?: string | null;
  method: InviteMethod;
  relationship: CircleRelationship;
  role: InviteRole;
  permissionPreset: InvitePermissionPreset;
  defaultPermissions: CirclePermission[];
  status: CircleInviteStatus;
  recipientLabel?: string | null;
  createdBy: string;
  createdAt: string;
  expiresAt?: string | null;
  requiresAdminApproval: boolean;
  source: "placeholder";
};

export type CreateCircleInviteInput = {
  circleId: string;
  method: InviteMethod;
  relationship: CircleRelationship;
  role: InviteRole;
  permissionPreset: InvitePermissionPreset;
  defaultPermissions: CirclePermission[];
  invitedEmail?: string;
  invitedPhone?: string;
  recipientLabel?: string;
};
