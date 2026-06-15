import {
  invitePermissionPresetDefaults,
  invitePermissionPresetLabels,
} from "@/constants/invites";
import type { CircleInvite, CreateCircleInviteInput } from "@/types/invites";

export function createPlaceholderInviteToken(circleId: string) {
  return `circle-${circleId.slice(0, 8)}-${Date.now().toString(36)}`;
}

export function buildPlaceholderInviteLink(inviteToken: string) {
  return `https://app.local/invites/${inviteToken}`;
}

export function buildPlaceholderCircleInvite(
  input: CreateCircleInviteInput & { createdBy: string },
): CircleInvite {
  const inviteToken = createPlaceholderInviteToken(input.circleId);

  return {
    circleId: input.circleId,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
    defaultPermissions: input.defaultPermissions,
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    id: `${input.circleId}-${inviteToken}`,
    invitedEmail: input.invitedEmail?.trim() || null,
    invitedPhone: input.invitedPhone?.trim() || null,
    inviteLink: buildPlaceholderInviteLink(inviteToken),
    inviteToken,
    method: input.method,
    permissionPreset: input.permissionPreset,
    recipientLabel:
      input.recipientLabel?.trim() ||
      invitePermissionPresetLabels[input.permissionPreset],
    relationship: input.relationship,
    requiresAdminApproval: true,
    role: input.role,
    source: "placeholder",
    status: "pending",
  };
}

export function getDefaultPermissionsForInvitePreset(
  preset: CreateCircleInviteInput["permissionPreset"],
) {
  return [...invitePermissionPresetDefaults[preset]];
}

export function getPlaceholderCircleInvites(circleId: string): CircleInvite[] {
  return [
    {
      circleId,
      createdAt: "2026-06-01T08:00:00.000Z",
      createdBy: "Circle admin",
      defaultPermissions: getDefaultPermissionsForInvitePreset("caregiver"),
      expiresAt: "2026-06-15T08:00:00.000Z",
      id: `${circleId}-invite-caregiver`,
      invitedEmail: "caregiver@example.com",
      invitedPhone: null,
      inviteLink: buildPlaceholderInviteLink(`${circleId}-caregiver-token`),
      inviteToken: `${circleId}-caregiver-token`,
      method: "share_link",
      permissionPreset: "caregiver",
      recipientLabel: "Caregiver invite",
      relationship: "caregiver",
      requiresAdminApproval: true,
      role: "caregiver",
      source: "placeholder",
      status: "pending",
    },
    {
      circleId,
      createdAt: "2026-06-01T08:15:00.000Z",
      createdBy: "Circle admin",
      defaultPermissions: getDefaultPermissionsForInvitePreset(
        "adult_family_member",
      ),
      expiresAt: "2026-06-15T08:15:00.000Z",
      id: `${circleId}-invite-adult-member`,
      invitedEmail: null,
      invitedPhone: "+1 555 010 2200",
      inviteLink: buildPlaceholderInviteLink(`${circleId}-adult-member-token`),
      inviteToken: `${circleId}-adult-member-token`,
      method: "qr_placeholder",
      permissionPreset: "adult_family_member",
      recipientLabel: "Adult family member invite",
      relationship: "partner",
      requiresAdminApproval: true,
      role: "member",
      source: "placeholder",
      status: "pending",
    },
  ];
}
