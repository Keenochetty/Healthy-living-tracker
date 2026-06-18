import AsyncStorage from "@react-native-async-storage/async-storage";

import { getCircleRoleDefinition } from "@/constants/circleRoles";
import type {
  CircleJoinRequest,
  CircleMember,
  CirclePermissionKey,
  CircleRole,
  FamilyCircle,
} from "@/types/circle";

const CIRCLE_STORAGE_KEY = "family_health_circle";
const CIRCLE_ID = "my-care-circle";

export function getAvatarInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "??";
}

function permissionsForRole(role: CircleRole) {
  return [...getCircleRoleDefinition(role).defaultPermissions];
}

export function createDefaultMockCircle(): FamilyCircle {
  const now = new Date().toISOString();

  return {
    id: CIRCLE_ID,
    members: [
      {
        avatarInitials: "YO",
        circleId: CIRCLE_ID,
        displayName: "You",
        id: "circle-owner",
        isOwner: true,
        joinedAt: now,
        permissions: [],
        requestedAt: now,
        role: "other_family",
        status: "active",
      },
    ],
    name: "My Care Circle",
    ownerName: "You",
    pendingRequests: [],
  };
}

async function writeCircle(circle: FamilyCircle) {
  await AsyncStorage.setItem(CIRCLE_STORAGE_KEY, JSON.stringify(circle));

  return circle;
}

function normaliseCircle(circle: FamilyCircle): FamilyCircle {
  return {
    ...circle,
    members: circle.members.map((member) => ({
      ...member,
      avatarInitials:
        member.avatarInitials || getAvatarInitials(member.displayName),
      circleId: member.circleId || circle.id,
      status: member.status ?? "active",
    })),
    ownerName: circle.ownerName || "You",
    pendingRequests: (circle.pendingRequests ?? []).map((request) => ({
      ...request,
      avatarInitials:
        request.avatarInitials || getAvatarInitials(request.displayName),
      circleId: request.circleId || circle.id,
      status: request.status ?? "pending",
    })),
  };
}

export async function getMockCircle() {
  try {
    const storedCircle = await AsyncStorage.getItem(CIRCLE_STORAGE_KEY);

    if (!storedCircle) {
      return writeCircle(createDefaultMockCircle());
    }

    return normaliseCircle(JSON.parse(storedCircle) as FamilyCircle);
  } catch {
    return writeCircle(createDefaultMockCircle());
  }
}

export async function saveMockCircle(circle: FamilyCircle) {
  return writeCircle(normaliseCircle(circle));
}

export async function getPendingRequests() {
  const circle = await getMockCircle();

  return circle.pendingRequests.filter(
    (request) => request.status === "pending",
  );
}

export async function addPendingRequest(request: CircleJoinRequest) {
  const circle = await getMockCircle();
  const nextRequest: CircleJoinRequest = {
    ...request,
    avatarInitials:
      request.avatarInitials || getAvatarInitials(request.displayName),
    circleId: request.circleId || circle.id,
    requestedAt: request.requestedAt || new Date().toISOString(),
    status: "pending",
  };
  const pendingRequests = [
    nextRequest,
    ...circle.pendingRequests.filter((item) => item.id !== nextRequest.id),
  ];

  return saveMockCircle({ ...circle, pendingRequests });
}

export async function approveJoinRequest(requestId: string) {
  const circle = await getMockCircle();
  const request = circle.pendingRequests.find((item) => item.id === requestId);

  if (!request) {
    return circle;
  }

  const member: CircleMember = {
    avatarInitials: request.avatarInitials,
    circleId: request.circleId,
    displayName: request.displayName,
    id: `member-${request.id}`,
    joinedAt: new Date().toISOString(),
    permissions: [...request.permissions],
    requestedAt: request.requestedAt,
    role: request.role,
    status: "active",
  };

  return saveMockCircle({
    ...circle,
    members: [
      member,
      ...circle.members.filter((item) => item.id !== member.id),
    ],
    pendingRequests: circle.pendingRequests.filter(
      (item) => item.id !== requestId,
    ),
  });
}

export async function declineJoinRequest(requestId: string) {
  const circle = await getMockCircle();

  return saveMockCircle({
    ...circle,
    pendingRequests: circle.pendingRequests.map((request) =>
      request.id === requestId ? { ...request, status: "declined" } : request,
    ),
  });
}

export async function updateMemberPermissions(
  memberId: string,
  permissions: CirclePermissionKey[],
) {
  const circle = await getMockCircle();

  return saveMockCircle({
    ...circle,
    members: circle.members.map((member) =>
      member.id === memberId
        ? { ...member, permissions: Array.from(new Set(permissions)) }
        : member,
    ),
  });
}

export async function removeCircleMember(memberId: string) {
  const circle = await getMockCircle();
  const member = circle.members.find((item) => item.id === memberId);

  if (member?.isOwner) {
    return circle;
  }

  return saveMockCircle({
    ...circle,
    members: circle.members.map((item) =>
      item.id === memberId ? { ...item, status: "removed" } : item,
    ),
  });
}
