import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getActiveProfile,
  getAuditLogsForCircle,
  getCaregiversForCircle,
  getFamilyCircleMembers,
  getFamilyCircles,
  getPendingInvites,
  getPermissionsForProfile,
  getProfilesVisibleToUser,
} from "@/lib/familyPermissionsStorage";
import type {
  CaregiverProfile,
  FamilyCircle,
  FamilyCircleMember,
  FamilyInvite,
  HealthAuditLog,
  HealthProfile,
  PermissionCategory,
  ProfilePermission,
} from "@/types/familyPermissions";

import type {
  HealthOSCaregiverDisplay,
  HealthOSFamilyCircleDisplay,
  HealthOSFamilyMemberDisplay,
  HealthOSFamilyMemberRole,
  HealthOSMemberNotificationDisplay,
  HealthOSSharedEventDisplay,
  HealthOSSharedModule,
  HealthOSSharedUpdateDisplay,
} from "./HealthOSFamilyTypes";

type FamilySourceState = {
  activeProfile: HealthProfile | null;
  auditLogs: HealthAuditLog[];
  caregivers: CaregiverProfile[];
  circle: FamilyCircle | null;
  invites: FamilyInvite[];
  members: FamilyCircleMember[];
  permissions: ProfilePermission[];
  profiles: HealthProfile[];
};

const INITIAL_SOURCE: FamilySourceState = {
  activeProfile: null,
  auditLogs: [],
  caregivers: [],
  circle: null,
  invites: [],
  members: [],
  permissions: [],
  profiles: [],
};

export function useHealthOSFamilyCircle() {
  const [source, setSource] = useState<FamilySourceState>(INITIAL_SOURCE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const circles = await getFamilyCircles();
      const circle = circles[0] ?? null;
      const profiles = await getProfilesVisibleToUser();
      const activeProfile = await getActiveProfile();
      const profileId = activeProfile?.id ?? profiles[0]?.id;
      const [members, permissions, caregivers, invites, auditLogs] =
        await Promise.all([
          circle ? getFamilyCircleMembers(circle.id) : Promise.resolve([]),
          profileId ? getPermissionsForProfile(profileId) : Promise.resolve([]),
          circle ? getCaregiversForCircle(circle.id) : Promise.resolve([]),
          getPendingInvites(),
          circle ? getAuditLogsForCircle(circle.id) : Promise.resolve([]),
        ]);

      setSource({
        activeProfile,
        auditLogs,
        caregivers,
        circle,
        invites,
        members,
        permissions,
        profiles,
      });
    } catch {
      setError("Family circle data is unavailable right now.");
      setSource(INITIAL_SOURCE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const circle: HealthOSFamilyCircleDisplay = useMemo(
    () => ({
      id: source.circle?.id,
      name: source.circle?.name ?? "Start your family circle",
      privacyLabel: source.circle
        ? formatLabel(source.circle.defaultPrivacyLevel)
        : "Private by default",
      statusLine: source.circle
        ? `${source.members.length} member${source.members.length === 1 ? "" : "s"} connected`
        : "Invite people when you are ready to share care, reminders, and events.",
    }),
    [source.circle, source.members.length],
  );

  const members = useMemo(
    () =>
      source.members.map((member): HealthOSFamilyMemberDisplay => {
        const memberPermissions = source.permissions.filter(
          (permission) =>
            permission.grantedToProfileId === member.profileId ||
            permission.role === member.role,
        );
        const sharedModules = memberPermissions.map((permission) =>
          mapPermissionToModule(permission.category),
        );

        return {
          id: member.id,
          initials: initials(member.displayName),
          joinedAt: member.joinedAt,
          name: member.displayName,
          notificationSummary: "Notification controls pending",
          permissionLabel: sharedModules.length
            ? `${sharedModules.length} shared area${sharedModules.length === 1 ? "" : "s"}`
            : "Private by default",
          relationshipLabel: formatLabel(member.role),
          role: mapFamilyRole(member.role),
          sharedModules,
          statusLine: formatLabel(member.inviteStatus),
        };
      }),
    [source.members, source.permissions],
  );

  const sharedUpdates = useMemo(
    () =>
      source.auditLogs
        .filter((log) => log.relatedRealm === "family" || log.relatedRealm === "permissions")
        .slice(0, 4)
        .map((log): HealthOSSharedUpdateDisplay => ({
          id: log.id,
          subtitle: log.relatedRealm ? formatLabel(log.relatedRealm) : undefined,
          timeLabel: new Date(log.createdAt).toLocaleDateString(),
          title: formatLabel(log.action),
          type: log.relatedRealm === "permissions" ? "record" : "note",
          visibility: "limited",
        })),
    [source.auditLogs],
  );

  const sharedEvents: HealthOSSharedEventDisplay[] = [];

  const caregivers = useMemo(
    () =>
      source.caregivers.map((caregiver): HealthOSCaregiverDisplay => ({
        availabilityLabel:
          caregiver.availableFrom || caregiver.availableTo
            ? `${caregiver.availableFrom ?? ""}-${caregiver.availableTo ?? ""}`
            : undefined,
        contactEmail: caregiver.email,
        contactPhone: caregiver.phone,
        id: caregiver.id,
        initials: initials(caregiver.name),
        linkedMemberName: source.profiles.find(
          (profile) => profile.id === caregiver.assignedProfileId,
        )?.displayName,
        name: caregiver.name,
        notes: caregiver.notes,
        rateLabel:
          caregiver.ratePerHour || caregiver.ratePerDay
            ? [
                caregiver.ratePerHour ? `$${caregiver.ratePerHour}/hour` : null,
                caregiver.ratePerDay ? `$${caregiver.ratePerDay}/day` : null,
              ]
                .filter(Boolean)
                .join(" | ")
            : undefined,
        roleLabel: caregiver.relationship ?? caregiver.role ?? "Caregiver",
      })),
    [source.caregivers, source.profiles],
  );

  function getMemberById(id: string) {
    return members.find((member) => member.id === id) ?? null;
  }

  function getSharedModulesForMember(id: string): HealthOSSharedModule[] {
    return getMemberById(id)?.sharedModules ?? [];
  }

  function getMemberNotifications(id: string): HealthOSMemberNotificationDisplay {
    const member = getMemberById(id);
    if (!member) return {};
    return {
      caregiverNotes: member.role === "caregiver" ? "Foundation" : "Not configured",
      moodUpdates: "Not configured",
      recordShares: member.sharedModules?.includes("records") ? "Foundation" : "Off",
      sharedEvents: member.sharedModules?.includes("calendar") ? "Foundation" : "Off",
    };
  }

  return {
    caregivers,
    circle,
    emptyState: source.circle
      ? "Shared updates will appear here when family members choose to share."
      : "Invite family when you are ready.",
    error,
    getMemberById,
    getMemberNotifications,
    getSharedModulesForMember,
    loading,
    members,
    pendingInvites: source.invites,
    refresh,
    sharedEvents,
    sharedUpdates,
    source,
  };
}

function mapFamilyRole(role: string): HealthOSFamilyMemberRole {
  if (role === "owner" || role === "partner" || role === "child" || role === "elder" || role === "caregiver") {
    return role;
  }
  if (role === "parent_guardian") return "parent";
  return "familyMember";
}

function mapPermissionToModule(category: PermissionCategory): HealthOSSharedModule {
  if (category === "workout") return "fitness";
  if (category === "baby_child") return "babyChild";
  if (category === "womens_health") return "womenHealth";
  if (category === "calendar" || category === "medication" || category === "records" || category === "nutrition" || category === "pregnancy" || category === "notes") {
    return category;
  }
  return "notes";
}

export function initials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

