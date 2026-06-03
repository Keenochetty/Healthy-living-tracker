import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";

import { getCircleRoleDefinition } from "@/constants/circleRoles";
import {
  addPendingRequest,
  createDefaultMockCircle,
  getAvatarInitials
} from "@/lib/circleStorage";
import type { CircleInvite, CircleRole, FamilyCircle } from "@/types/circle";

const CIRCLE_INVITES_STORAGE_KEY = "family_health_circle_invites";
const MOCK_CIRCLE_ID = "my-care-circle";

export const MOCK_FAMILY_CIRCLE: FamilyCircle = createDefaultMockCircle();

function normaliseInviteLink(url: string, token: string) {
  if (!url.startsWith("familyhealth:")) {
    return `familyhealth://join/${token}`;
  }

  return url.replace("familyhealth:///join/", "familyhealth://join/");
}

async function readInvites() {
  try {
    const storedInvites = await AsyncStorage.getItem(CIRCLE_INVITES_STORAGE_KEY);
    const parsedInvites = storedInvites ? JSON.parse(storedInvites) : [];

    return Array.isArray(parsedInvites) ? (parsedInvites as CircleInvite[]) : [];
  } catch {
    return [];
  }
}

async function writeInvites(invites: CircleInvite[]) {
  await AsyncStorage.setItem(CIRCLE_INVITES_STORAGE_KEY, JSON.stringify(invites));
}

export function createInviteToken() {
  const randomPart = Math.random().toString(36).slice(2, 10);
  const timePart = Date.now().toString(36);

  return `${timePart}-${randomPart}`;
}

export function buildInviteLink(token: string) {
  return normaliseInviteLink(
    Linking.createURL(`join/${encodeURIComponent(token)}`, { scheme: "familyhealth" }),
    token
  );
}

export async function createMockCircleInvite({
  circleName,
  role
}: {
  circleName: string;
  role: CircleRole;
}) {
  const token = createInviteToken();
  const roleDefinition = getCircleRoleDefinition(role);
  const invite: CircleInvite = {
    circleId: MOCK_CIRCLE_ID,
    circleName,
    createdAt: new Date().toISOString(),
    inviteLink: buildInviteLink(token),
    permissions: [...roleDefinition.defaultPermissions],
    role,
    status: "open",
    token
  };
  const invites = await readInvites();

  await writeInvites([invite, ...invites.filter((item) => item.token !== token)]);

  return invite;
}

export async function getInviteByToken(token: string) {
  const invites = await readInvites();

  return invites.find((invite) => invite.token === token) ?? null;
}

export async function acceptInvite(token: string) {
  const invites = await readInvites();
  const invite = invites.find((item) => item.token === token);

  if (!invite) {
    return null;
  }

  const requestedAt = new Date().toISOString();
  const updatedInvite: CircleInvite = {
    ...invite,
    joinRequestedAt: requestedAt,
    status: "join_requested"
  };

  await writeInvites(
    invites.map((item) => (item.token === updatedInvite.token ? updatedInvite : item))
  );
  const roleDefinition = getCircleRoleDefinition(invite.role);
  const displayName = `New ${roleDefinition.label}`;

  await addPendingRequest({
    avatarInitials: getAvatarInitials(displayName),
    circleId: invite.circleId,
    displayName,
    id: `invite-request-${invite.token}`,
    message: "Requested through a circle invite link.",
    permissions: [...invite.permissions],
    requestedAt,
    role: invite.role,
    status: "pending"
  });

  return updatedInvite;
}
