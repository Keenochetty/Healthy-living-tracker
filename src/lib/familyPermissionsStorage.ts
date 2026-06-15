import AsyncStorage from "@react-native-async-storage/async-storage";

import { APP_WIDGETS } from "@/constants/widgets";
import { getAllCaregiverSummaries } from "@/lib/caregiverStorage";
import { getChildProfiles } from "@/lib/childStorage";
import { getMockCircle } from "@/lib/circleStorage";
import { getUserPreferences } from "@/lib/userPreferences";
import type { WidgetKey } from "@/types/app";
import type {
  CaregiverProfile,
  DefaultPrivacyLevel,
  EmergencyInfoCard,
  FamilyCircle,
  FamilyCircleMember,
  FamilyCircleType,
  FamilyInvite,
  FamilyRole,
  HealthAuditLog,
  HealthProfile,
  InviteStatus,
  PermissionCategory,
  PermissionLevel,
  ProfilePermission,
  ProfileType,
  ProfileWidgetPreference,
  TeenPrivacyTransitionMode,
} from "@/types/familyPermissions";

const LOCAL_USER_ID = "local-user";
const LOCAL_PROFILE_ID = "local-profile";
const FAMILY_CIRCLES_KEY = "family_health_phase14_family_circles";
const HEALTH_PROFILES_KEY = "family_health_phase14_health_profiles";
const ACTIVE_PROFILE_KEY = "family_health_phase14_active_profile";
const FAMILY_MEMBERS_KEY = "family_health_phase14_family_members";
const PROFILE_PERMISSIONS_KEY = "family_health_phase14_profile_permissions";
const FAMILY_INVITES_KEY = "family_health_phase14_family_invites";
const FAMILY_CAREGIVERS_KEY = "family_health_phase14_caregiver_profiles";
const EMERGENCY_INFO_KEY = "family_health_phase14_emergency_info_cards";
const AUDIT_LOGS_KEY = "family_health_phase14_audit_logs";
const PROFILE_WIDGETS_KEY = "family_health_phase14_profile_widgets";

const VIEW_LEVELS: PermissionLevel[] = ["view", "add", "edit", "manage"];
const ADD_LEVELS: PermissionLevel[] = ["add", "edit", "manage"];
const EDIT_LEVELS: PermissionLevel[] = ["edit", "manage"];
const MANAGE_LEVELS: PermissionLevel[] = ["manage"];

type CreateFamilyCircleInput = {
  defaultPrivacyLevel?: DefaultPrivacyLevel;
  description?: string;
  name: string;
  type?: FamilyCircleType;
};

type HealthProfileInput = {
  dateOfBirth?: string;
  displayName: string;
  gender?: string;
  profileType?: ProfileType;
};

type FamilyMemberInput = {
  circleId: string;
  displayName: string;
  inviteStatus?: InviteStatus;
  profileId?: string;
  role: FamilyRole;
  userId?: string;
};

type PermissionInput = {
  category: PermissionCategory;
  circleId?: string;
  expiresAt?: string;
  grantedToProfileId?: string;
  grantedToUserId?: string;
  permissionLevel: PermissionLevel;
  role?: FamilyRole;
  targetProfileId: string;
};

type CaregiverInput = Partial<
  Omit<
    CaregiverProfile,
    | "createdAt"
    | "id"
    | "isActive"
    | "isEmergencyContact"
    | "permissions"
    | "updatedAt"
  >
> & {
  isEmergencyContact?: boolean;
  name: string;
  permissions?: PermissionCategory[];
};

type FamilyInviteInput = {
  circleId: string;
  invitedEmail?: string;
  invitedPhone?: string;
  message?: string;
  role: FamilyRole;
};

export async function createFamilyCircle(input: CreateFamilyCircleInput) {
  const now = new Date().toISOString();
  const circle: FamilyCircle = {
    createdAt: now,
    defaultPrivacyLevel: input.defaultPrivacyLevel ?? "private",
    description: clean(input.description),
    id: createId("family-circle"),
    name: input.name.trim(),
    ownerUserId: LOCAL_USER_ID,
    type: input.type ?? "household",
    updatedAt: now,
  };
  const circles = await getFamilyCircles();

  await writeJsonArray(FAMILY_CIRCLES_KEY, [
    circle,
    ...circles.filter((item) => item.id !== circle.id),
  ]);
  await addFamilyCircleMember({
    circleId: circle.id,
    displayName: "You",
    inviteStatus: "active",
    profileId: LOCAL_PROFILE_ID,
    role: "owner",
    userId: LOCAL_USER_ID,
  });
  await createHealthAuditLog({
    action: "family_circle_created",
    circleId: circle.id,
    relatedRealm: "family",
    relatedId: circle.id,
  });

  return circle;
}

export async function getFamilyCircles() {
  const circles = await readJsonArray<FamilyCircle>(FAMILY_CIRCLES_KEY);

  if (circles.length) {
    return circles.sort(sortNewest);
  }

  const legacyCircle = await getMockCircle();
  const now = new Date().toISOString();
  const defaultCircle: FamilyCircle = {
    createdAt: now,
    defaultPrivacyLevel: "private",
    description: "Your local family health circle.",
    id: legacyCircle.id,
    name: legacyCircle.name,
    ownerUserId: LOCAL_USER_ID,
    type: "household",
    updatedAt: now,
  };

  await writeJsonArray(FAMILY_CIRCLES_KEY, [defaultCircle]);

  return [defaultCircle];
}

export async function getFamilyCircleById(id: string) {
  return (await getFamilyCircles()).find((circle) => circle.id === id) ?? null;
}

export async function updateFamilyCircle(
  id: string,
  partial: Partial<Omit<FamilyCircle, "createdAt" | "id" | "ownerUserId">>,
) {
  const circles = await getFamilyCircles();
  const updated = circles.map((circle) =>
    circle.id === id
      ? { ...circle, ...partial, updatedAt: new Date().toISOString() }
      : circle,
  );

  await writeJsonArray(FAMILY_CIRCLES_KEY, updated);
  await createHealthAuditLog({
    action: "family_circle_updated",
    circleId: id,
    relatedRealm: "family",
    relatedId: id,
  });

  return updated.find((circle) => circle.id === id) ?? null;
}

export async function deleteFamilyCircle(id: string) {
  const circles = await getFamilyCircles();
  const circle = circles.find((item) => item.id === id) ?? null;

  await writeJsonArray(
    FAMILY_CIRCLES_KEY,
    circles.filter((item) => item.id !== id),
  );
  await createHealthAuditLog({
    action: "family_circle_deleted",
    circleId: id,
    relatedRealm: "family",
    relatedId: id,
  });

  return circle;
}

export async function createHealthProfile(input: HealthProfileInput) {
  const now = new Date().toISOString();
  const profileType = input.profileType ?? "adult";
  const profile: HealthProfile = {
    createdAt: now,
    createdByUserId: LOCAL_USER_ID,
    dateOfBirth: input.dateOfBirth || undefined,
    displayName: input.displayName.trim(),
    gender: input.gender,
    id: createId("health-profile"),
    isAdultControlled: isAdultProfile(profileType),
    isManagedProfile:
      profileType === "child" ||
      profileType === "teen" ||
      profileType === "dependent",
    profileType,
    teenPrivacyTransitionMode:
      profileType === "teen" ? "parent_full_input" : undefined,
    updatedAt: now,
    userId: profileType === "self" ? LOCAL_USER_ID : undefined,
  };
  const profiles = await getStoredProfiles();

  await writeJsonArray(HEALTH_PROFILES_KEY, [profile, ...profiles]);
  await createHealthAuditLog({
    action: "health_profile_created",
    relatedRealm: "profiles",
    relatedId: profile.id,
    targetProfileId: profile.id,
  });

  return profile;
}

export async function getProfilesForUser() {
  return getProfilesVisibleToUser();
}

export async function getProfileById(id: string) {
  return (
    (await getAllHealthProfiles()).find((profile) => profile.id === id) ?? null
  );
}

export async function updateHealthProfile(
  id: string,
  partial: Partial<Omit<HealthProfile, "createdAt" | "createdByUserId" | "id">>,
) {
  const profiles = await getAllHealthProfiles();
  const updated = profiles.map((profile) =>
    profile.id === id
      ? normalizeProfileAge({
          ...profile,
          ...partial,
          updatedAt: new Date().toISOString(),
        })
      : profile,
  );

  await writeJsonArray(HEALTH_PROFILES_KEY, updated);
  await createHealthAuditLog({
    action: "health_profile_updated",
    relatedRealm: "profiles",
    relatedId: id,
    targetProfileId: id,
  });

  return updated.find((profile) => profile.id === id) ?? null;
}

export async function convertChildToTeen(
  profileId: string,
  mode: TeenPrivacyTransitionMode = "parent_full_input",
) {
  return updateHealthProfile(profileId, {
    isAdultControlled: false,
    isManagedProfile: true,
    profileType: "teen",
    teenPrivacyTransitionMode: mode,
  });
}

export async function convertTeenToAdult(profileId: string) {
  const now = new Date().toISOString();
  await revokeManagedProfilePermissions(profileId);

  return updateHealthProfile(profileId, {
    adultControlActivatedAt: now,
    isAdultControlled: true,
    isManagedProfile: false,
    profileType: "adult",
  });
}

export async function getProfilesVisibleToUser() {
  const profiles = await getAllHealthProfiles();

  return profiles.filter(
    (profile) => profile.profileType !== "caregiver_contact",
  );
}

export async function getActiveProfile() {
  const profiles = await getProfilesVisibleToUser();

  try {
    const activeProfileId = await AsyncStorage.getItem(ACTIVE_PROFILE_KEY);
    const active = profiles.find((profile) => profile.id === activeProfileId);

    if (active) return active;
  } catch {
    // Fall through to default profile.
  }

  const self =
    profiles.find((profile) => profile.profileType === "self") ??
    profiles[0] ??
    null;

  if (self) {
    await setActiveProfile(self.id);
  }

  return self;
}

export async function setActiveProfile(profileId: string) {
  const profile = await getProfileById(profileId);

  if (!profile || profile.profileType === "caregiver_contact") {
    return null;
  }

  await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
  await createHealthAuditLog({
    action: "active_profile_changed",
    relatedRealm: "profiles",
    relatedId: profileId,
    targetProfileId: profileId,
  });

  return profile;
}

export async function addFamilyCircleMember(input: FamilyMemberInput) {
  const now = new Date().toISOString();
  const member: FamilyCircleMember = {
    circleId: input.circleId,
    createdAt: now,
    displayName: input.displayName.trim(),
    id: createId("family-member"),
    inviteStatus: input.inviteStatus ?? "active",
    joinedAt:
      input.inviteStatus === "active" || !input.inviteStatus ? now : undefined,
    profileId: input.profileId,
    role: input.role,
    updatedAt: now,
    userId: input.userId,
  };
  const members = await getAllFamilyCircleMembers();

  await writeJsonArray(FAMILY_MEMBERS_KEY, [member, ...members]);
  await createHealthAuditLog({
    action: "family_member_added",
    circleId: input.circleId,
    relatedRealm: "family",
    relatedId: member.id,
    targetProfileId: input.profileId,
  });

  return member;
}

export async function getFamilyCircleMembers(circleId?: string) {
  const members = await getAllFamilyCircleMembers();

  return circleId
    ? members.filter((member) => member.circleId === circleId)
    : members;
}

export async function updateFamilyMemberRole(
  memberId: string,
  role: FamilyRole,
) {
  const members = await getAllFamilyCircleMembers();
  const updated = members.map((member) =>
    member.id === memberId
      ? { ...member, role, updatedAt: new Date().toISOString() }
      : member,
  );
  const member = updated.find((item) => item.id === memberId);

  await writeJsonArray(FAMILY_MEMBERS_KEY, updated);
  await createHealthAuditLog({
    action: "family_member_role_updated",
    circleId: member?.circleId,
    relatedRealm: "family",
    relatedId: memberId,
    targetProfileId: member?.profileId,
  });

  return member ?? null;
}

export async function removeFamilyCircleMember(memberId: string) {
  const members = await getAllFamilyCircleMembers();
  const member = members.find((item) => item.id === memberId) ?? null;

  await writeJsonArray(
    FAMILY_MEMBERS_KEY,
    members.filter((item) => item.id !== memberId),
  );
  await createHealthAuditLog({
    action: "family_member_removed",
    circleId: member?.circleId,
    relatedRealm: "family",
    relatedId: memberId,
    targetProfileId: member?.profileId,
  });

  return member;
}

export async function createFamilyInvite(input: FamilyInviteInput) {
  const now = new Date().toISOString();
  const invite: FamilyInvite = {
    circleId: input.circleId,
    createdAt: now,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    id: createId("family-invite"),
    invitedByUserId: LOCAL_USER_ID,
    invitedEmail: clean(input.invitedEmail),
    invitedPhone: clean(input.invitedPhone),
    message: clean(input.message),
    role: input.role,
    status: "pending",
    updatedAt: now,
  };
  const invites = await getFamilyInvites();

  await writeJsonArray(FAMILY_INVITES_KEY, [invite, ...invites]);
  await createHealthAuditLog({
    action: "family_invite_created",
    circleId: input.circleId,
    relatedRealm: "invites",
    relatedId: invite.id,
  });

  return invite;
}

export async function getPendingInvites() {
  return (await getFamilyInvites()).filter(
    (invite) => invite.status === "pending",
  );
}

export async function acceptFamilyInvite(inviteId: string) {
  return updateInviteStatus(inviteId, "accepted");
}

export async function declineFamilyInvite(inviteId: string) {
  return updateInviteStatus(inviteId, "declined");
}

export async function revokeFamilyInvite(inviteId: string) {
  return updateInviteStatus(inviteId, "revoked");
}

export async function grantProfilePermission(input: PermissionInput) {
  const now = new Date().toISOString();
  const permission: ProfilePermission = {
    ...permissionBooleans(input.permissionLevel),
    category: input.category,
    circleId: input.circleId,
    createdAt: now,
    expiresAt: input.expiresAt,
    grantedToProfileId: input.grantedToProfileId,
    grantedToUserId: input.grantedToUserId,
    id: createId("profile-permission"),
    permissionLevel: input.permissionLevel,
    role: input.role,
    targetProfileId: input.targetProfileId,
    updatedAt: now,
  };
  const permissions = await getProfilePermissions();

  await writeJsonArray(PROFILE_PERMISSIONS_KEY, [
    permission,
    ...permissions.filter(
      (item) =>
        !(
          item.targetProfileId === input.targetProfileId &&
          item.category === input.category &&
          item.grantedToUserId === input.grantedToUserId &&
          item.grantedToProfileId === input.grantedToProfileId &&
          item.role === input.role
        ),
    ),
  ]);
  await createHealthAuditLog({
    action: "profile_permission_granted",
    circleId: input.circleId,
    relatedRealm: "permissions",
    relatedId: permission.id,
    targetProfileId: input.targetProfileId,
  });

  return permission;
}

export async function updateProfilePermission(
  id: string,
  partial: Partial<Omit<ProfilePermission, "createdAt" | "id">>,
) {
  const permissions = await getProfilePermissions();
  const updated = permissions.map((permission) =>
    permission.id === id
      ? {
          ...permission,
          ...partial,
          ...(partial.permissionLevel
            ? permissionBooleans(partial.permissionLevel)
            : {}),
          updatedAt: new Date().toISOString(),
        }
      : permission,
  );
  const permission = updated.find((item) => item.id === id);

  await writeJsonArray(PROFILE_PERMISSIONS_KEY, updated);
  await createHealthAuditLog({
    action: "profile_permission_updated",
    circleId: permission?.circleId,
    relatedRealm: "permissions",
    relatedId: id,
    targetProfileId: permission?.targetProfileId,
  });

  return permission ?? null;
}

export async function revokeProfilePermission(id: string) {
  const permissions = await getProfilePermissions();
  const permission = permissions.find((item) => item.id === id) ?? null;

  await writeJsonArray(
    PROFILE_PERMISSIONS_KEY,
    permissions.filter((item) => item.id !== id),
  );
  await createHealthAuditLog({
    action: "profile_permission_revoked",
    circleId: permission?.circleId,
    relatedRealm: "permissions",
    relatedId: id,
    targetProfileId: permission?.targetProfileId,
  });

  return permission;
}

export async function getPermissionsForProfile(profileId: string) {
  return (await getProfilePermissions()).filter(
    (permission) => permission.targetProfileId === profileId,
  );
}

export async function getPermissionsForUser(userId = LOCAL_USER_ID) {
  return (await getProfilePermissions()).filter(
    (permission) => permission.grantedToUserId === userId,
  );
}

export async function canViewProfileRealm(
  profileId: string,
  category: PermissionCategory,
  userId = LOCAL_USER_ID,
) {
  return hasPermission(profileId, category, VIEW_LEVELS, userId);
}

export async function canAddToProfileRealm(
  profileId: string,
  category: PermissionCategory,
  userId = LOCAL_USER_ID,
) {
  return hasPermission(profileId, category, ADD_LEVELS, userId);
}

export async function canEditProfileRealm(
  profileId: string,
  category: PermissionCategory,
  userId = LOCAL_USER_ID,
) {
  return hasPermission(profileId, category, EDIT_LEVELS, userId);
}

export async function canManageProfileRealm(
  profileId: string,
  category: PermissionCategory,
  userId = LOCAL_USER_ID,
) {
  return hasPermission(profileId, category, MANAGE_LEVELS, userId);
}

export async function filterDataByPermission<
  T extends { profileId?: string; userId?: string },
>(items: T[], category: PermissionCategory, userId = LOCAL_USER_ID) {
  const allowed = await Promise.all(
    items.map(async (item) => {
      const profileId = item.profileId ?? LOCAL_PROFILE_ID;
      return canViewProfileRealm(profileId, category, userId);
    }),
  );

  return items.filter((_, index) => allowed[index]);
}

export async function createCaregiverProfile(input: CaregiverInput) {
  const now = new Date().toISOString();
  const caregiver: CaregiverProfile = {
    assignedProfileId: input.assignedProfileId,
    availableDays: input.availableDays,
    availableFrom: input.availableFrom,
    availableTo: input.availableTo,
    circleId: input.circleId,
    createdAt: now,
    email: clean(input.email),
    id: createId("family-caregiver"),
    isActive: true,
    isEmergencyContact: Boolean(input.isEmergencyContact),
    name: input.name.trim(),
    notes: clean(input.notes),
    permissions: input.permissions ?? ["reminders"],
    phone: clean(input.phone),
    ratePerDay: numberOrUndefined(input.ratePerDay),
    ratePerHour: numberOrUndefined(input.ratePerHour),
    relationship: clean(input.relationship),
    role: clean(input.role),
    updatedAt: now,
  };
  const caregivers = await getAllFamilyCaregivers();

  await writeJsonArray(FAMILY_CAREGIVERS_KEY, [caregiver, ...caregivers]);
  await createHealthAuditLog({
    action: "caregiver_profile_created",
    circleId: caregiver.circleId,
    relatedRealm: "caregivers",
    relatedId: caregiver.id,
    targetProfileId: caregiver.assignedProfileId,
  });

  return caregiver;
}

export async function getCaregiversForCircle(circleId: string) {
  return (await getAllFamilyCaregivers()).filter(
    (caregiver) => caregiver.circleId === circleId,
  );
}

export async function getCaregiversForProfile(profileId: string) {
  return (await getAllFamilyCaregivers()).filter(
    (caregiver) => caregiver.assignedProfileId === profileId,
  );
}

export async function updateCaregiverProfile(
  id: string,
  partial: Partial<Omit<CaregiverProfile, "createdAt" | "id">>,
) {
  const caregivers = await getAllFamilyCaregivers();
  const updated = caregivers.map((caregiver) =>
    caregiver.id === id
      ? { ...caregiver, ...partial, updatedAt: new Date().toISOString() }
      : caregiver,
  );
  const caregiver = updated.find((item) => item.id === id);

  await writeJsonArray(FAMILY_CAREGIVERS_KEY, updated);
  await createHealthAuditLog({
    action: "caregiver_profile_updated",
    circleId: caregiver?.circleId,
    relatedRealm: "caregivers",
    relatedId: id,
    targetProfileId: caregiver?.assignedProfileId,
  });

  return caregiver ?? null;
}

export async function deactivateCaregiverProfile(id: string) {
  return updateCaregiverProfile(id, { isActive: false });
}

export async function getCaregiverAllowedTasks(caregiverId: string) {
  const caregiver = (await getAllFamilyCaregivers()).find(
    (item) => item.id === caregiverId,
  );

  if (!caregiver || !caregiver.isActive) {
    return [] as string[];
  }

  return [
    caregiver.permissions.includes("reminders")
      ? "View assigned reminders"
      : null,
    caregiver.permissions.includes("medication")
      ? "Mark allowed medication reminders"
      : null,
    caregiver.permissions.includes("records") ? "View allowed records" : null,
    caregiver.permissions.includes("notes") ? "Add care notes" : null,
  ].filter(Boolean) as string[];
}

export async function createEmergencyInfoCard(
  input: Partial<Omit<EmergencyInfoCard, "createdAt" | "id" | "updatedAt">> & {
    fullName: string;
    profileId: string;
  },
) {
  const now = new Date().toISOString();
  const card: EmergencyInfoCard = {
    allergiesJson: input.allergiesJson,
    bloodType: clean(input.bloodType),
    createdAt: now,
    dateOfBirth: input.dateOfBirth,
    doctorClinic: clean(input.doctorClinic),
    emergencyContactsJson: input.emergencyContactsJson,
    fullName: input.fullName.trim(),
    id: createId("emergency-info"),
    insuranceInfo: clean(input.insuranceInfo),
    medicalNotes: clean(input.medicalNotes),
    medicationSummary: clean(input.medicationSummary),
    profileId: input.profileId,
    updatedAt: now,
    visibility: input.visibility ?? "private",
  };
  const cards = await getEmergencyInfoCards();

  await writeJsonArray(EMERGENCY_INFO_KEY, [
    card,
    ...cards.filter((item) => item.profileId !== card.profileId),
  ]);
  await createHealthAuditLog({
    action: "emergency_info_created",
    relatedRealm: "emergency_info",
    relatedId: card.id,
    targetProfileId: card.profileId,
  });

  return card;
}

export async function getEmergencyInfoCard(profileId: string) {
  return (
    (await getEmergencyInfoCards()).find(
      (card) => card.profileId === profileId,
    ) ?? null
  );
}

export async function updateEmergencyInfoCard(
  profileId: string,
  partial: Partial<Omit<EmergencyInfoCard, "createdAt" | "id" | "profileId">>,
) {
  const current = await getEmergencyInfoCard(profileId);

  if (!current) {
    return null;
  }

  const cards = await getEmergencyInfoCards();
  const updated = cards.map((card) =>
    card.profileId === profileId
      ? { ...card, ...partial, updatedAt: new Date().toISOString() }
      : card,
  );

  await writeJsonArray(EMERGENCY_INFO_KEY, updated);
  await createHealthAuditLog({
    action: "emergency_info_updated",
    relatedRealm: "emergency_info",
    relatedId: current.id,
    targetProfileId: profileId,
  });

  return updated.find((card) => card.profileId === profileId) ?? null;
}

export async function getEmergencyInfoForViewer(
  profileId: string,
  viewerUserId = LOCAL_USER_ID,
) {
  const card = await getEmergencyInfoCard(profileId);

  if (!card) return null;
  if (card.visibility === "locked") return null;
  if (card.visibility === "private" && profileId !== LOCAL_PROFILE_ID)
    return null;
  if (
    card.visibility === "emergency_contacts" ||
    card.visibility === "caregiver_allowed"
  ) {
    const allowed = await canViewProfileRealm(
      profileId,
      "emergency_info",
      viewerUserId,
    );
    return allowed ? card : null;
  }

  return card;
}

export async function createHealthAuditLog(
  input: Omit<HealthAuditLog, "actorUserId" | "createdAt" | "id"> & {
    actorUserId?: string;
  },
) {
  const log: HealthAuditLog = {
    ...input,
    actorUserId: input.actorUserId ?? LOCAL_USER_ID,
    createdAt: new Date().toISOString(),
    id: createId("health-audit"),
  };
  const logs = await readJsonArray<HealthAuditLog>(AUDIT_LOGS_KEY);

  await writeJsonArray(AUDIT_LOGS_KEY, [log, ...logs].slice(0, 500));

  return log;
}

export async function getAuditLogsForProfile(profileId: string) {
  return (await readJsonArray<HealthAuditLog>(AUDIT_LOGS_KEY)).filter(
    (log) => log.targetProfileId === profileId,
  );
}

export async function getAuditLogsForCircle(circleId: string) {
  return (await readJsonArray<HealthAuditLog>(AUDIT_LOGS_KEY)).filter(
    (log) => log.circleId === circleId,
  );
}

export async function getPinnedHealthWidgetsForProfile(
  profileId: string,
  fallbackWidgetKeys: WidgetKey[],
) {
  const preferences = await getProfileWidgetPreferences();
  const profilePreference = preferences.find(
    (item) => item.profileId === profileId,
  );

  return uniqueWidgetKeys(
    profilePreference?.widgetKeys.length
      ? profilePreference.widgetKeys
      : fallbackWidgetKeys,
  );
}

export async function pinHealthWidgetForProfile(
  profileId: string,
  widgetKey: WidgetKey,
  fallbackWidgetKeys: WidgetKey[],
) {
  const current = await getPinnedHealthWidgetsForProfile(
    profileId,
    fallbackWidgetKeys,
  );

  if (current.includes(widgetKey)) return current;

  return saveProfileWidgetKeys(profileId, [...current, widgetKey]);
}

export async function unpinHealthWidgetForProfile(
  profileId: string,
  widgetKey: WidgetKey,
  fallbackWidgetKeys: WidgetKey[],
) {
  const current = await getPinnedHealthWidgetsForProfile(
    profileId,
    fallbackWidgetKeys,
  );

  return saveProfileWidgetKeys(
    profileId,
    current.filter((key) => key !== widgetKey),
  );
}

export async function reorderHealthWidgetsForProfile(
  profileId: string,
  widgetKeys: WidgetKey[],
) {
  return saveProfileWidgetKeys(profileId, uniqueWidgetKeys(widgetKeys));
}

export async function calculateWidgetValueWithPermissions({
  calculate,
  category,
  profileId,
  widgetKey,
}: {
  calculate: (widgetKey: WidgetKey) => Promise<string>;
  category: PermissionCategory;
  profileId: string;
  widgetKey: WidgetKey;
}) {
  const allowed = await canViewProfileRealm(profileId, category);

  if (!allowed) {
    return "Locked";
  }

  return calculate(widgetKey);
}

export function getPermissionCategoryForWidget(
  widgetKey: WidgetKey,
): PermissionCategory {
  if (
    [
      "calories_today",
      "protein_today",
      "water_today",
      "food_diary_status",
      "food_log",
      "water",
    ].includes(widgetKey)
  )
    return "nutrition";
  if (["workout", "steps", "workout_plan"].includes(widgetKey))
    return "workout";
  if (
    [
      "medication",
      "medication_due_today",
      "next_medication",
      "medication_taken_today",
      "missed_medication",
      "medication_schedule_status",
      "medication_schedule",
    ].includes(widgetKey)
  )
    return "medication";
  if (widgetKey.includes("supplement")) return "supplements";
  if (
    [
      "recent_record",
      "upcoming_follow_up",
      "prescription_refill",
      "next_vaccine",
      "lab_follow_up",
      "pinned_health_record",
      "records_needing_attention",
    ].includes(widgetKey)
  )
    return "records";
  if (
    [
      "today_reminders",
      "next_reminder",
      "overdue_items",
      "upcoming_appointment",
      "timeline_today",
    ].includes(widgetKey)
  )
    return "calendar";
  if (
    [
      "cycle",
      "cycle_private",
      "cycle_day",
      "period_expected",
      "period_active",
      "fertile_window_estimate",
      "estimated_ovulation",
      "symptoms_today",
      "mood_today",
      "contraception_reminder",
      "contraception_status",
      "contraception_caution",
      "womens_health_privacy_status",
    ].includes(widgetKey)
  )
    return "womens_health";
  if (
    [
      "mens_health_check_in",
      "mens_energy_stress",
      "testicular_check_reminder",
      "prostate_discussion_reminder",
      "fertility_note",
      "mens_doctor_question",
      "mens_private_reminder",
      "mens_health_privacy_status",
    ].includes(widgetKey)
  )
    return "mens_health";
  if (
    [
      "pregnancy_week",
      "pregnancy_due_date",
      "pregnancy_next_appointment",
      "pregnancy_symptom_log",
      "pregnancy_medication_review",
      "pregnancy_question",
      "pregnancy_record",
      "pregnancy_privacy_status",
    ].includes(widgetKey)
  )
    return "pregnancy";
  if (
    [
      "baby_feed",
      "next_feed",
      "last_feed",
      "sleep_today",
      "last_sleep",
      "last_diaper",
      "weight_latest",
      "growth_check",
      "baby_medicine_due",
      "solid_food_tried",
      "milestone_check",
      "baby_note",
      "baby_today",
    ].includes(widgetKey)
  )
    return "baby_child";
  if (
    [
      "steps_today",
      "distance_today",
      "last_synced_workout",
      "sleep_last_night",
      "active_calories",
      "synced_weight",
      "sync_status",
    ].includes(widgetKey)
  )
    return "device_sync";
  if (
    [
      "weight",
      "biometric_goal_weight",
      "sleep",
      "energy",
      "mood",
      "resting_heart_rate",
      "blood_pressure",
      "blood_glucose",
      "digestion",
      "symptoms",
    ].includes(widgetKey)
  )
    return "biometrics";
  return "overview";
}

export function getProfileAccessMessage() {
  return "You do not have access to this information.";
}

async function hasPermission(
  profileId: string,
  category: PermissionCategory,
  levels: PermissionLevel[],
  userId: string,
) {
  const profile = await getProfileById(profileId);

  if (!profile) return false;
  if (
    profile.id === LOCAL_PROFILE_ID ||
    profile.userId === userId ||
    profile.createdByUserId === userId
  )
    return true;
  if (profile.isManagedProfile && !profile.isAdultControlled) return true;
  if (category === "device_sync" && profile.id !== LOCAL_PROFILE_ID)
    return false;

  const permissions = await getPermissionsForProfile(profileId);
  const now = Date.now();

  return permissions.some(
    (permission) =>
      permission.category === category &&
      levels.includes(permission.permissionLevel) &&
      (!permission.expiresAt ||
        new Date(permission.expiresAt).getTime() > now) &&
      (permission.grantedToUserId === userId ||
        permission.grantedToProfileId === LOCAL_PROFILE_ID ||
        permission.role),
  );
}

async function getAllHealthProfiles() {
  const stored = await getStoredProfiles();
  const [preferences, children] = await Promise.all([
    getUserPreferences(),
    getChildProfiles(),
  ]);
  const now = new Date().toISOString();
  const selfProfile: HealthProfile = {
    createdAt: now,
    createdByUserId: LOCAL_USER_ID,
    displayName: preferences.displayName || "You",
    id: LOCAL_PROFILE_ID,
    isAdultControlled: true,
    isManagedProfile: false,
    legacySource: "self",
    profileType: "self",
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
  const childProfiles = children.map<HealthProfile>((child) =>
    normalizeProfileAge({
      createdAt: child.createdAt,
      createdByUserId: LOCAL_USER_ID,
      dateOfBirth: child.dateOfBirth,
      displayName: child.displayName,
      gender: child.gender,
      id: `child-profile-${child.id}`,
      isAdultControlled: false,
      isManagedProfile: true,
      legacySource: "child",
      legacySourceId: child.id,
      profileType: child.profileType === "teen" ? "teen" : "child",
      teenPrivacyTransitionMode:
        child.profileType === "teen" ? "parent_full_input" : undefined,
      updatedAt: child.updatedAt,
    }),
  );
  const merged = [
    selfProfile,
    ...childProfiles,
    ...stored.filter(
      (profile) =>
        profile.id !== LOCAL_PROFILE_ID && profile.legacySource !== "child",
    ),
  ];
  const unique = new Map<string, HealthProfile>();

  merged.forEach((profile) =>
    unique.set(profile.id, normalizeProfileAge(profile)),
  );

  return Array.from(unique.values()).sort(sortNewest);
}

async function getStoredProfiles() {
  return readJsonArray<HealthProfile>(HEALTH_PROFILES_KEY);
}

async function getAllFamilyCircleMembers() {
  const storedMembers =
    await readJsonArray<FamilyCircleMember>(FAMILY_MEMBERS_KEY);

  if (storedMembers.length) return storedMembers.sort(sortNewest);

  const [circle, profiles] = await Promise.all([
    getFamilyCircles().then((circles) => circles[0]),
    getProfilesVisibleToUser(),
  ]);
  const now = new Date().toISOString();
  const members = profiles.map<FamilyCircleMember>((profile) => ({
    circleId: circle.id,
    createdAt: now,
    displayName: profile.displayName,
    id: `member-${profile.id}`,
    inviteStatus: "active",
    joinedAt: now,
    profileId: profile.id,
    role:
      profile.profileType === "self"
        ? "owner"
        : profile.profileType === "teen"
          ? "teen"
          : profile.profileType === "child"
            ? "child"
            : "adult_member",
    updatedAt: now,
    userId: profile.userId,
  }));

  await writeJsonArray(FAMILY_MEMBERS_KEY, members);

  return members;
}

async function getFamilyInvites() {
  return readJsonArray<FamilyInvite>(FAMILY_INVITES_KEY);
}

async function updateInviteStatus(
  inviteId: string,
  status: FamilyInvite["status"],
) {
  const invites = await getFamilyInvites();
  const updated = invites.map((invite) =>
    invite.id === inviteId
      ? { ...invite, status, updatedAt: new Date().toISOString() }
      : invite,
  );
  const invite = updated.find((item) => item.id === inviteId);

  await writeJsonArray(FAMILY_INVITES_KEY, updated);
  await createHealthAuditLog({
    action: `family_invite_${status}`,
    circleId: invite?.circleId,
    relatedRealm: "invites",
    relatedId: inviteId,
  });

  return invite ?? null;
}

async function getProfilePermissions() {
  return readJsonArray<ProfilePermission>(PROFILE_PERMISSIONS_KEY);
}

async function revokeManagedProfilePermissions(profileId: string) {
  const permissions = await getProfilePermissions();

  await writeJsonArray(
    PROFILE_PERMISSIONS_KEY,
    permissions.filter(
      (permission) => permission.targetProfileId !== profileId,
    ),
  );
}

async function getAllFamilyCaregivers() {
  const [stored, legacySummaries] = await Promise.all([
    readJsonArray<CaregiverProfile>(FAMILY_CAREGIVERS_KEY),
    getAllCaregiverSummaries().catch(() => []),
  ]);
  const legacy = legacySummaries.map<CaregiverProfile>((summary) => ({
    availableDays: summary.availability.map((item) => item.dayOfWeek),
    availableFrom: summary.availability[0]?.startTime,
    availableTo: summary.availability[0]?.endTime,
    createdAt: summary.caregiver.createdAt,
    email: summary.caregiver.email,
    id: `legacy-caregiver-${summary.caregiver.id}`,
    isActive: true,
    isEmergencyContact: false,
    name: summary.caregiver.displayName,
    notes: summary.caregiver.bio,
    permissions: ["reminders", "notes"],
    phone: summary.caregiver.phone,
    ratePerDay: summary.rates.find((rate) => rate.rateType === "daily")?.amount,
    ratePerHour: summary.rates.find((rate) => rate.rateType === "hourly")
      ?.amount,
    role: summary.caregiver.services[0],
    updatedAt: summary.caregiver.updatedAt,
  }));
  const byId = new Map<string, CaregiverProfile>();

  [...legacy, ...stored].forEach((caregiver) =>
    byId.set(caregiver.id, caregiver),
  );

  return Array.from(byId.values()).sort(sortNewest);
}

async function getEmergencyInfoCards() {
  return readJsonArray<EmergencyInfoCard>(EMERGENCY_INFO_KEY);
}

async function getProfileWidgetPreferences() {
  return readJsonArray<ProfileWidgetPreference>(PROFILE_WIDGETS_KEY);
}

async function saveProfileWidgetKeys(
  profileId: string,
  widgetKeys: WidgetKey[],
) {
  const now = new Date().toISOString();
  const allowed = new Set(APP_WIDGETS.map((widget) => widget.key));
  const uniqueKeys = uniqueWidgetKeys(widgetKeys);
  const preference: ProfileWidgetPreference = {
    createdAt: now,
    profileId,
    updatedAt: now,
    widgetKeys: uniqueKeys.filter((key) => allowed.has(key)),
  };
  const preferences = await getProfileWidgetPreferences();

  await writeJsonArray(PROFILE_WIDGETS_KEY, [
    preference,
    ...preferences.filter((item) => item.profileId !== profileId),
  ]);

  return preference.widgetKeys;
}

function uniqueWidgetKeys(widgetKeys: WidgetKey[]) {
  return Array.from(new Set(widgetKeys));
}

function normalizeProfileAge(profile: HealthProfile): HealthProfile {
  const age = getAge(profile.dateOfBirth);

  if (age === null) return profile;
  if (
    age >= 18 &&
    (profile.profileType === "child" ||
      profile.profileType === "teen" ||
      profile.isManagedProfile)
  ) {
    return {
      ...profile,
      adultControlActivatedAt:
        profile.adultControlActivatedAt ?? new Date().toISOString(),
      isAdultControlled: true,
      isManagedProfile: false,
      profileType: "adult",
    };
  }
  if (age >= 13 && profile.profileType === "child") {
    return {
      ...profile,
      profileType: "teen",
      teenPrivacyTransitionMode:
        profile.teenPrivacyTransitionMode ?? "parent_full_input",
    };
  }

  return profile;
}

function getAge(dateOfBirth?: string) {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()))
    age -= 1;

  return age;
}

function isAdultProfile(profileType: ProfileType) {
  return (
    profileType === "self" ||
    profileType === "adult" ||
    profileType === "partner" ||
    profileType === "elder"
  );
}

function permissionBooleans(permissionLevel: PermissionLevel) {
  return {
    canAdd: ADD_LEVELS.includes(permissionLevel),
    canEdit: EDIT_LEVELS.includes(permissionLevel),
    canManage: MANAGE_LEVELS.includes(permissionLevel),
    canView:
      VIEW_LEVELS.includes(permissionLevel) ||
      permissionLevel === "emergency_only",
  };
}

function sortNewest<T extends { createdAt: string }>(left: T, right: T) {
  return (
    new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

function numberOrUndefined(value?: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function clean(value?: string) {
  return value?.trim() || undefined;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readJsonArray<T>(key: string) {
  try {
    const stored = await AsyncStorage.getItem(key);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function writeJsonArray<T>(key: string, value: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
  return value;
}
