import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Linking,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { FamilyRealmOverview } from "@/components/circle/FamilyRealmOverview";
import { AppButton, AppCard, AppChip, AppSection } from "@/components/ui";
import {
  acceptFamilyInvite,
  addFamilyCircleMember,
  canViewProfileRealm,
  convertChildToTeen,
  convertTeenToAdult,
  createCaregiverProfile,
  createEmergencyInfoCard,
  createFamilyCircle,
  createFamilyInvite,
  createHealthProfile,
  deactivateCaregiverProfile,
  getActiveProfile,
  getAuditLogsForCircle,
  getCaregiverAllowedTasks,
  getCaregiversForCircle,
  getEmergencyInfoCard,
  getFamilyCircleMembers,
  getFamilyCircles,
  getPendingInvites,
  getPermissionsForProfile,
  getProfileAccessMessage,
  getProfilesVisibleToUser,
  grantProfilePermission,
  revokeFamilyInvite,
  revokeProfilePermission,
  setActiveProfile,
  updateEmergencyInfoCard,
  updateProfilePermission,
} from "@/lib/familyPermissionsStorage";
import { getRemindersForDate } from "@/services/reminders/reminderEngine";
import { getRecordsOverviewSummary } from "@/lib/healthRecordsStorage";
import type {
  CaregiverProfile,
  EmergencyInfoCard,
  FamilyCircle,
  FamilyCircleMember,
  FamilyCircleType,
  FamilyInvite,
  FamilyRole,
  HealthAuditLog,
  HealthProfile,
  PermissionCategory,
  PermissionLevel,
  ProfilePermission,
  ProfileType,
  TeenPrivacyTransitionMode,
} from "@/types/familyPermissions";

type FamilyTab =
  | "circles"
  | "members"
  | "profiles"
  | "permissions"
  | "caregivers"
  | "invites"
  | "calendar"
  | "emergency"
  | "settings";

const FAMILY_TABS: Array<{ key: FamilyTab; label: string }> = [
  { key: "circles", label: "Circles" },
  { key: "members", label: "Members" },
  { key: "profiles", label: "Profiles" },
  { key: "permissions", label: "Permissions" },
  { key: "caregivers", label: "Caregivers" },
  { key: "invites", label: "Invites" },
  { key: "calendar", label: "Shared Calendar" },
  { key: "emergency", label: "Emergency Info" },
  { key: "settings", label: "Settings" },
];

const CIRCLE_TYPES: Array<{ key: FamilyCircleType; label: string }> = [
  { key: "household", label: "Household" },
  { key: "partner", label: "Partner / Couple" },
  { key: "children", label: "Children" },
  { key: "parents_elders", label: "Parents / Elders" },
  { key: "care_team", label: "Care Team" },
  { key: "custom", label: "Custom" },
];

const PROFILE_TYPES: Array<{ key: ProfileType; label: string }> = [
  { key: "partner", label: "Partner" },
  { key: "child", label: "Child" },
  { key: "teen", label: "Teen" },
  { key: "adult", label: "Adult" },
  { key: "elder", label: "Elder" },
  { key: "dependent", label: "Dependent" },
];

const FAMILY_ROLES: Array<{ key: FamilyRole; label: string }> = [
  { key: "owner", label: "Owner" },
  { key: "admin", label: "Admin" },
  { key: "adult_member", label: "Adult Member" },
  { key: "partner", label: "Partner" },
  { key: "parent_guardian", label: "Parent / Guardian" },
  { key: "child", label: "Child" },
  { key: "teen", label: "Teen" },
  { key: "elder", label: "Elder" },
  { key: "caregiver", label: "Caregiver" },
  { key: "viewer", label: "Viewer" },
  { key: "emergency_contact", label: "Emergency Contact" },
];

const PERMISSION_CATEGORIES: Array<{ key: PermissionCategory; label: string }> =
  [
    { key: "overview", label: "Overview" },
    { key: "nutrition", label: "Food / Nutrition" },
    { key: "workout", label: "Workout" },
    { key: "biometrics", label: "Biometrics" },
    { key: "medication", label: "Medication" },
    { key: "supplements", label: "Supplements" },
    { key: "records", label: "Records" },
    { key: "calendar", label: "Calendar / Timeline" },
    { key: "device_sync", label: "Device Sync" },
    { key: "notes", label: "Notes" },
    { key: "reminders", label: "Reminders" },
    { key: "emergency_info", label: "Emergency Info" },
  ];

const PERMISSION_LEVELS: Array<{ key: PermissionLevel; label: string }> = [
  { key: "none", label: "None" },
  { key: "view", label: "View" },
  { key: "add", label: "Add" },
  { key: "edit", label: "Edit" },
  { key: "manage", label: "Manage" },
  { key: "emergency_only", label: "Emergency Only" },
];

const TEEN_MODES: Array<{ key: TeenPrivacyTransitionMode; label: string }> = [
  { key: "parent_full_input", label: "Parent full input" },
  { key: "parent_view_only", label: "Parent view only" },
  { key: "request_access", label: "Request access" },
  { key: "teen_selected_areas", label: "Teen selected areas" },
];

const INPUT_STYLE = {
  backgroundColor: "#ffffff",
  borderColor: "#e2e8f0",
  borderRadius: 16,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 50,
  paddingHorizontal: 14,
};

export default function FamilyScreen() {
  const [activeTab, setActiveTab] = useState<FamilyTab>("circles");
  const [circles, setCircles] = useState<FamilyCircle[]>([]);
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  const [members, setMembers] = useState<FamilyCircleMember[]>([]);
  const [profiles, setProfiles] = useState<HealthProfile[]>([]);
  const [activeProfile, setActiveProfileState] = useState<HealthProfile | null>(
    null,
  );
  const [permissions, setPermissions] = useState<ProfilePermission[]>([]);
  const [caregivers, setCaregivers] = useState<CaregiverProfile[]>([]);
  const [invites, setInvites] = useState<FamilyInvite[]>([]);
  const [emergencyCard, setEmergencyCard] = useState<EmergencyInfoCard | null>(
    null,
  );
  const [auditLogs, setAuditLogs] = useState<HealthAuditLog[]>([]);
  const [sharedReminderCount, setSharedReminderCount] = useState(0);
  const [sharedRecordsCount, setSharedRecordsCount] = useState(0);
  const selectedCircle = useMemo(
    () =>
      circles.find((circle) => circle.id === selectedCircleId) ??
      circles[0] ??
      null,
    [circles, selectedCircleId],
  );

  const loadFamily = useCallback(async () => {
    const nextCircles = await getFamilyCircles();
    const nextSelectedCircle =
      nextCircles.find((circle) => circle.id === selectedCircleId) ??
      nextCircles[0] ??
      null;
    const nextProfiles = await getProfilesVisibleToUser();
    const nextActiveProfile = await getActiveProfile();
    const profileId = nextActiveProfile?.id ?? nextProfiles[0]?.id;
    const [
      nextMembers,
      nextPermissions,
      nextCaregivers,
      nextInvites,
      nextEmergencyCard,
      nextAuditLogs,
      todayReminders,
      recordsSummary,
    ] = await Promise.all([
      nextSelectedCircle
        ? getFamilyCircleMembers(nextSelectedCircle.id)
        : Promise.resolve([]),
      profileId ? getPermissionsForProfile(profileId) : Promise.resolve([]),
      nextSelectedCircle
        ? getCaregiversForCircle(nextSelectedCircle.id)
        : Promise.resolve([]),
      getPendingInvites(),
      profileId ? getEmergencyInfoCard(profileId) : Promise.resolve(null),
      nextSelectedCircle
        ? getAuditLogsForCircle(nextSelectedCircle.id)
        : Promise.resolve([]),
      getRemindersForDate(new Date()),
      getRecordsOverviewSummary().catch(() => null),
    ]);

    setCircles(nextCircles);
    setSelectedCircleId(nextSelectedCircle?.id ?? null);
    setMembers(nextMembers);
    setProfiles(nextProfiles);
    setActiveProfileState(nextActiveProfile);
    setPermissions(nextPermissions);
    setCaregivers(nextCaregivers);
    setInvites(nextInvites);
    setEmergencyCard(nextEmergencyCard);
    setAuditLogs(nextAuditLogs);
    setSharedReminderCount(
      todayReminders.filter((reminder) => reminder.source !== "manual").length,
    );
    setSharedRecordsCount(recordsSummary?.upcomingReminders.length ?? 0);
  }, [selectedCircleId]);

  useFocusEffect(
    useCallback(() => {
      Promise.resolve()
        .then(loadFamily)
        .catch(() => undefined);
    }, [loadFamily]),
  );

  async function changeActiveProfile(profileId: string) {
    const profile = await setActiveProfile(profileId);
    if (profile) setActiveProfileState(profile);
    await loadFamily();
  }

  return (
    <AppMainLayout subtitle="Private family health" title="Family">
      <FamilyRealmOverview
        activeProfile={activeProfile}
        auditLogs={auditLogs}
        caregivers={caregivers}
        circle={selectedCircle}
        invites={invites}
        members={members}
        onCalendar={() => setActiveTab("calendar")}
        onCaregivers={() => setActiveTab("caregivers")}
        onCircles={() => setActiveTab("circles")}
        onInvites={() => setActiveTab("invites")}
        onJoin={() => router.push("/scan-invite" as Href)}
        onMembers={() => setActiveTab("members")}
        onPermissions={() => setActiveTab("permissions")}
        onProfiles={() => setActiveTab("profiles")}
        permissions={permissions}
        profiles={profiles}
        sharedRecordsCount={sharedRecordsCount}
        sharedReminderCount={sharedReminderCount}
      />

      <ProfileSwitcher
        activeProfile={activeProfile}
        onSelect={changeActiveProfile}
        profiles={profiles}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -4 }}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
      >
        {FAMILY_TABS.map((tab) => (
          <TouchableOpacity
            activeOpacity={0.85}
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={{
              backgroundColor: activeTab === tab.key ? "#0f172a" : "#ffffff",
              borderColor: "#e2e8f0",
              borderRadius: 999,
              borderWidth: 1,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
          >
            <Text
              style={{
                color: activeTab === tab.key ? "#ffffff" : "#475569",
                fontWeight: "900",
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {activeTab === "circles" ? (
        <CirclesTab
          circles={circles}
          onCreated={loadFamily}
          onSelect={setSelectedCircleId}
          selectedCircleId={selectedCircle?.id}
        />
      ) : null}
      {activeTab === "members" ? (
        <MembersTab
          circle={selectedCircle}
          members={members}
          onChanged={loadFamily}
          profiles={profiles}
        />
      ) : null}
      {activeTab === "profiles" ? (
        <ProfilesTab
          activeProfile={activeProfile}
          onChanged={loadFamily}
          profiles={profiles}
        />
      ) : null}
      {activeTab === "permissions" ? (
        <PermissionsTab
          activeProfile={activeProfile}
          circle={selectedCircle}
          onChanged={loadFamily}
          permissions={permissions}
          profiles={profiles}
        />
      ) : null}
      {activeTab === "caregivers" ? (
        <CaregiversTab
          caregivers={caregivers}
          circle={selectedCircle}
          onChanged={loadFamily}
          profiles={profiles}
        />
      ) : null}
      {activeTab === "invites" ? (
        <InvitesTab
          circle={selectedCircle}
          invites={invites}
          onChanged={loadFamily}
        />
      ) : null}
      {activeTab === "calendar" ? (
        <SharedCalendarTab
          sharedRecordsCount={sharedRecordsCount}
          sharedReminderCount={sharedReminderCount}
        />
      ) : null}
      {activeTab === "emergency" ? (
        <EmergencyTab
          activeProfile={activeProfile}
          card={emergencyCard}
          onChanged={loadFamily}
        />
      ) : null}
      {activeTab === "settings" ? <SettingsTab auditLogs={auditLogs} /> : null}
    </AppMainLayout>
  );
}

function ProfileSwitcher({
  activeProfile,
  onSelect,
  profiles,
}: {
  activeProfile: HealthProfile | null;
  onSelect: (profileId: string) => void;
  profiles: HealthProfile[];
}) {
  return (
    <AppSection
      title="Active Health Profile"
      subtitle="Caregivers are managed as contact cards, not switchable health profiles."
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -4 }}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
      >
        {profiles.map((profile) => (
          <TouchableOpacity
            activeOpacity={0.85}
            key={profile.id}
            onPress={() => onSelect(profile.id)}
            style={{
              backgroundColor:
                activeProfile?.id === profile.id ? "#0f172a" : "#ffffff",
              borderColor: "#e2e8f0",
              borderRadius: 18,
              borderWidth: 1,
              minWidth: 128,
              padding: 12,
            }}
          >
            <Text
              style={{
                color: activeProfile?.id === profile.id ? "#ffffff" : "#0f172a",
                fontWeight: "900",
              }}
            >
              {profile.displayName}
            </Text>
            <Text
              style={{
                color: activeProfile?.id === profile.id ? "#cbd5e1" : "#64748b",
                marginTop: 4,
              }}
            >
              {formatValue(profile.profileType)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </AppSection>
  );
}

function CirclesTab({
  circles,
  onCreated,
  onSelect,
  selectedCircleId,
}: {
  circles: FamilyCircle[];
  onCreated: () => void;
  onSelect: (circleId: string) => void;
  selectedCircleId?: string;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<FamilyCircleType>("household");
  const [description, setDescription] = useState("");

  async function saveCircle() {
    if (!name.trim()) return;
    await createFamilyCircle({ description, name, type });
    setName("");
    setDescription("");
    await onCreated();
  }

  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title="Family circles"
        subtitle="Start with your personal health profile, or create a family circle when you are ready."
      />
      {circles.map((circle) => (
        <AppCard
          key={circle.id}
          backgroundColor={
            selectedCircleId === circle.id ? "#ede9fe" : "#ffffff"
          }
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onSelect(circle.id)}
          >
            <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
              {circle.name}
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 4 }}>
              {formatValue(circle.type)} -{" "}
              {formatValue(circle.defaultPrivacyLevel)}
            </Text>
            {circle.description ? (
              <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
                {circle.description}
              </Text>
            ) : null}
          </TouchableOpacity>
        </AppCard>
      ))}
      <FormCard
        title="Create Family Circle"
        onSave={saveCircle}
        saveLabel="Create Circle"
      >
        <TextInput
          onChangeText={setName}
          placeholder="Circle name"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={name}
        />
        <ChipGroup
          current={type}
          onSelect={(value) => setType(value as FamilyCircleType)}
          options={CIRCLE_TYPES}
        />
        <TextInput
          multiline
          onChangeText={setDescription}
          placeholder="Description optional"
          placeholderTextColor="#94a3b8"
          style={{ ...INPUT_STYLE, minHeight: 80, paddingTop: 13 }}
          value={description}
        />
      </FormCard>
    </View>
  );
}

function MembersTab({
  circle,
  members,
  onChanged,
  profiles,
}: {
  circle: FamilyCircle | null;
  members: FamilyCircleMember[];
  onChanged: () => void;
  profiles: HealthProfile[];
}) {
  const [profileId, setProfileId] = useState(profiles[0]?.id ?? "");
  const [role, setRole] = useState<FamilyRole>("adult_member");

  async function addMember() {
    const profile = profiles.find((item) => item.id === profileId);
    if (!circle || !profile) return;
    await addFamilyCircleMember({
      circleId: circle.id,
      displayName: profile.displayName,
      profileId: profile.id,
      role,
    });
    await onChanged();
  }

  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title="Members"
        subtitle="Add family members when you want to share selected health information."
      />
      {members.length ? (
        members.map((member) => (
          <AppCard key={member.id}>
            <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
              {member.displayName}
            </Text>
            <Text style={{ color: "#64748b", marginTop: 4 }}>
              {formatValue(member.role)} - {formatValue(member.inviteStatus)}
            </Text>
          </AppCard>
        ))
      ) : (
        <EmptyCard text="Add family members when you want to share selected health information." />
      )}
      <FormCard
        title="Add Existing Profile To Circle"
        onSave={addMember}
        saveLabel="Add Member"
      >
        <ChipGroup
          current={profileId}
          onSelect={setProfileId}
          options={profiles.map((profile) => ({
            key: profile.id,
            label: profile.displayName,
          }))}
        />
        <ChipGroup
          current={role}
          onSelect={(value) => setRole(value as FamilyRole)}
          options={FAMILY_ROLES}
        />
      </FormCard>
    </View>
  );
}

function ProfilesTab({
  activeProfile,
  onChanged,
  profiles,
}: {
  activeProfile: HealthProfile | null;
  onChanged: () => void;
  profiles: HealthProfile[];
}) {
  const [displayName, setDisplayName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [profileType, setProfileType] = useState<ProfileType>("adult");
  const [teenMode, setTeenMode] =
    useState<TeenPrivacyTransitionMode>("parent_full_input");

  async function saveProfile() {
    if (!displayName.trim()) return;
    await createHealthProfile({ dateOfBirth, displayName, profileType });
    setDisplayName("");
    setDateOfBirth("");
    await onChanged();
  }

  async function applyTeenMode() {
    if (!activeProfile) return;
    if (activeProfile.profileType === "child")
      await convertChildToTeen(activeProfile.id, teenMode);
    else if (activeProfile.profileType === "teen")
      await convertChildToTeen(activeProfile.id, teenMode);
    await onChanged();
  }

  async function adultConversion() {
    if (!activeProfile) return;
    await convertTeenToAdult(activeProfile.id);
    await onChanged();
  }

  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title="Profiles"
        subtitle="Adult profiles control their own health information. Family members can only access what is shared with them."
      />
      {profiles.map((profile) => (
        <AppCard
          key={profile.id}
          backgroundColor={profile.isAdultControlled ? "#f8fafc" : "#ffffff"}
        >
          <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
            {profile.displayName}
          </Text>
          <Text style={{ color: "#64748b", marginTop: 4 }}>
            {formatValue(profile.profileType)} -{" "}
            {profile.isManagedProfile ? "Managed profile" : "Adult controlled"}
          </Text>
          {profile.profileType === "adult" &&
          profile.adultControlActivatedAt ? (
            <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
              This profile is now adult-controlled. Access requires permission
              from the adult user.
            </Text>
          ) : null}
        </AppCard>
      ))}
      <FormCard
        title="Create Health Profile"
        onSave={saveProfile}
        saveLabel="Create Profile"
      >
        <TextInput
          onChangeText={setDisplayName}
          placeholder="Display name"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={displayName}
        />
        <TextInput
          onChangeText={setDateOfBirth}
          placeholder="Date of birth optional YYYY-MM-DD"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={dateOfBirth}
        />
        <ChipGroup
          current={profileType}
          onSelect={(value) => setProfileType(value as ProfileType)}
          options={PROFILE_TYPES}
        />
      </FormCard>
      <AppCard backgroundColor="#fdf2f8">
        <Text style={{ color: "#be185d", fontSize: 18, fontWeight: "900" }}>
          Teen privacy transition
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
          Parent or guardian controls can help manage a child profile. Access
          should change as children become older and independent.
        </Text>
        <ChipGroup
          current={teenMode}
          onSelect={(value) => setTeenMode(value as TeenPrivacyTransitionMode)}
          options={TEEN_MODES}
        />
        <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
          <SmallButton label="Apply transition" onPress={applyTeenMode} />
          <SmallButton label="Convert to adult" onPress={adultConversion} />
        </View>
      </AppCard>
    </View>
  );
}

function PermissionsTab({
  activeProfile,
  circle,
  onChanged,
  permissions,
  profiles,
}: {
  activeProfile: HealthProfile | null;
  circle: FamilyCircle | null;
  onChanged: () => void;
  permissions: ProfilePermission[];
  profiles: HealthProfile[];
}) {
  const [targetProfileId, setTargetProfileId] = useState(
    activeProfile?.id ?? profiles[0]?.id ?? "",
  );
  const [category, setCategory] = useState<PermissionCategory>("overview");
  const [level, setLevel] = useState<PermissionLevel>("view");
  const [permissionMessage, setPermissionMessage] = useState<string | null>(
    null,
  );

  async function grantPermission() {
    const targetProfile = profiles.find(
      (profile) => profile.id === targetProfileId,
    );
    if (!targetProfile) return;
    await grantProfilePermission({
      category,
      circleId: circle?.id,
      grantedToUserId: "local-user",
      permissionLevel: level,
      targetProfileId: targetProfile.id,
    });
    setPermissionMessage(null);
    await onChanged();
  }

  async function checkAccess() {
    const allowed = targetProfileId
      ? await canViewProfileRealm(targetProfileId, category)
      : false;
    setPermissionMessage(
      allowed
        ? "Access is allowed for this profile."
        : getProfileAccessMessage(),
    );
  }

  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title="Permissions"
        subtitle="This profile is private. Share selected areas when you are ready."
      />
      <FormCard
        title="Grant Profile Permission"
        onSave={grantPermission}
        saveLabel="Grant Permission"
      >
        <ChipGroup
          current={targetProfileId}
          onSelect={setTargetProfileId}
          options={profiles.map((profile) => ({
            key: profile.id,
            label: profile.displayName,
          }))}
        />
        <ChipGroup
          current={category}
          onSelect={(value) => setCategory(value as PermissionCategory)}
          options={PERMISSION_CATEGORIES}
        />
        <ChipGroup
          current={level}
          onSelect={(value) => setLevel(value as PermissionLevel)}
          options={PERMISSION_LEVELS}
        />
        <SmallButton label="Check access" onPress={checkAccess} />
        {permissionMessage ? (
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            {permissionMessage}
          </Text>
        ) : null}
      </FormCard>
      {permissions.length ? (
        permissions.map((permission) => (
          <AppCard key={permission.id}>
            <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
              {formatValue(permission.category)}
            </Text>
            <Text style={{ color: "#64748b", marginTop: 4 }}>
              {formatValue(permission.permissionLevel)}
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <SmallButton
                label="Make view only"
                onPress={() =>
                  updateProfilePermission(permission.id, {
                    permissionLevel: "view",
                  }).then(onChanged)
                }
              />
              <SmallButton
                label="Revoke"
                onPress={() =>
                  revokeProfilePermission(permission.id).then(onChanged)
                }
              />
            </View>
          </AppCard>
        ))
      ) : (
        <EmptyCard text="This profile is private. Share selected areas when you are ready." />
      )}
    </View>
  );
}

function CaregiversTab({
  caregivers,
  circle,
  onChanged,
  profiles,
}: {
  caregivers: CaregiverProfile[];
  circle: FamilyCircle | null;
  onChanged: () => void;
  profiles: HealthProfile[];
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [assignedProfileId, setAssignedProfileId] = useState(
    profiles[0]?.id ?? "",
  );
  const [ratePerHour, setRatePerHour] = useState("");
  const [ratePerDay, setRatePerDay] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
  const [isEmergencyContact, setIsEmergencyContact] = useState(false);

  async function saveCaregiver() {
    if (!name.trim()) return;
    await createCaregiverProfile({
      assignedProfileId,
      availableFrom,
      availableTo,
      circleId: circle?.id,
      email,
      isEmergencyContact,
      name,
      phone,
      ratePerDay: Number(ratePerDay),
      ratePerHour: Number(ratePerHour),
    });
    setName("");
    await onChanged();
  }

  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title="Caregivers"
        subtitle="Caregivers only see the care information you allow."
      />
      {caregivers.length ? (
        caregivers.map((caregiver) => (
          <CaregiverCard
            key={caregiver.id}
            caregiver={caregiver}
            onChanged={onChanged}
          />
        ))
      ) : (
        <EmptyCard text="No caregivers added yet. Add a caregiver if someone helps with care tasks." />
      )}
      <FormCard
        title="Add Caregiver"
        onSave={saveCaregiver}
        saveLabel="Save Caregiver"
      >
        <TextInput
          onChangeText={setName}
          placeholder="Name"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={name}
        />
        <TextInput
          onChangeText={setPhone}
          placeholder="Phone"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={phone}
        />
        <TextInput
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={email}
        />
        <ChipGroup
          current={assignedProfileId}
          onSelect={setAssignedProfileId}
          options={profiles.map((profile) => ({
            key: profile.id,
            label: profile.displayName,
          }))}
        />
        <TextInput
          onChangeText={setRatePerHour}
          placeholder="Rate per hour optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={ratePerHour}
        />
        <TextInput
          onChangeText={setRatePerDay}
          placeholder="Rate per day optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={ratePerDay}
        />
        <TextInput
          onChangeText={setAvailableFrom}
          placeholder="Available from HH:MM"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={availableFrom}
        />
        <TextInput
          onChangeText={setAvailableTo}
          placeholder="Available to HH:MM"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={availableTo}
        />
        <ToggleRow
          label="Emergency contact"
          onChange={setIsEmergencyContact}
          value={isEmergencyContact}
        />
      </FormCard>
    </View>
  );
}

function CaregiverCard({
  caregiver,
  onChanged,
}: {
  caregiver: CaregiverProfile;
  onChanged: () => void;
}) {
  const [tasks, setTasks] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      getCaregiverAllowedTasks(caregiver.id)
        .then(setTasks)
        .catch(() => undefined);
    }, [caregiver.id]),
  );

  return (
    <AppCard backgroundColor={caregiver.isActive ? "#ffffff" : "#f8fafc"}>
      <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
        {caregiver.name}
      </Text>
      <Text style={{ color: "#64748b", marginTop: 4 }}>
        {caregiver.relationship ?? caregiver.role ?? "Caregiver"} -{" "}
        {caregiver.isActive ? "Active" : "Inactive"}
      </Text>
      <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
        {caregiver.ratePerHour ? `$${caregiver.ratePerHour}/hour ` : ""}
        {caregiver.ratePerDay ? `$${caregiver.ratePerDay}/day ` : ""}
        {caregiver.availableFrom || caregiver.availableTo
          ? `Available ${caregiver.availableFrom ?? ""}-${caregiver.availableTo ?? ""}`
          : ""}
      </Text>
      {tasks.length ? (
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
          Allowed: {tasks.join(", ")}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 10,
        }}
      >
        {caregiver.phone ? (
          <SmallButton
            label="Call"
            onPress={() =>
              Linking.openURL(`tel:${caregiver.phone}`).catch(() => undefined)
            }
          />
        ) : null}
        {caregiver.email ? (
          <SmallButton
            label="Email"
            onPress={() =>
              Linking.openURL(`mailto:${caregiver.email}`).catch(
                () => undefined,
              )
            }
          />
        ) : null}
        <SmallButton
          label="View tasks"
          onPress={() => router.push("/health-calendar" as Href)}
        />
        <SmallButton
          label="Add care note"
          onPress={() => router.push("/records" as Href)}
        />
        {caregiver.isActive ? (
          <SmallButton
            label="Deactivate"
            onPress={() =>
              deactivateCaregiverProfile(caregiver.id).then(onChanged)
            }
          />
        ) : null}
      </View>
    </AppCard>
  );
}

function InvitesTab({
  circle,
  invites,
  onChanged,
}: {
  circle: FamilyCircle | null;
  invites: FamilyInvite[];
  onChanged: () => void;
}) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [role, setRole] = useState<FamilyRole>("adult_member");

  async function saveInvite() {
    if (!circle || (!email.trim() && !phone.trim())) return;
    await createFamilyInvite({
      circleId: circle.id,
      invitedEmail: email,
      invitedPhone: phone,
      message,
      role,
    });
    setEmail("");
    setPhone("");
    setMessage("");
    await onChanged();
  }

  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title="Invites"
        subtitle="Adults must accept an invite and choose what to share."
      />
      <FormCard
        title="Invite Member"
        onSave={saveInvite}
        saveLabel="Create Invite"
      >
        <TextInput
          onChangeText={setEmail}
          placeholder="Email optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={email}
        />
        <TextInput
          onChangeText={setPhone}
          placeholder="Phone optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={phone}
        />
        <ChipGroup
          current={role}
          onSelect={(value) => setRole(value as FamilyRole)}
          options={FAMILY_ROLES}
        />
        <TextInput
          multiline
          onChangeText={setMessage}
          placeholder="Message optional"
          placeholderTextColor="#94a3b8"
          style={{ ...INPUT_STYLE, minHeight: 80, paddingTop: 13 }}
          value={message}
        />
      </FormCard>
      {invites.length ? (
        invites.map((invite) => (
          <AppCard key={invite.id}>
            <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
              {invite.invitedEmail ?? invite.invitedPhone ?? "Invite"}
            </Text>
            <Text style={{ color: "#64748b", marginTop: 4 }}>
              {formatValue(invite.role)} - {formatValue(invite.status)}
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <SmallButton
                label="Accept locally"
                onPress={() => acceptFamilyInvite(invite.id).then(onChanged)}
              />
              <SmallButton
                label="Revoke"
                onPress={() => revokeFamilyInvite(invite.id).then(onChanged)}
              />
            </View>
          </AppCard>
        ))
      ) : (
        <EmptyCard text="No pending invites." />
      )}
    </View>
  );
}

function SharedCalendarTab({
  sharedRecordsCount,
  sharedReminderCount,
}: {
  sharedRecordsCount: number;
  sharedReminderCount: number;
}) {
  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title="Shared Calendar"
        subtitle="Only shared reminders and visible timeline items appear here."
      />
      <MetricCard label="Shared reminders" value={`${sharedReminderCount}`} />
      <MetricCard
        label="Shared record follow-ups"
        value={`${sharedRecordsCount}`}
      />
      <AppCard>
        <Text style={{ color: "#64748b", lineHeight: 21 }}>
          No shared records yet. Shared records will appear here when allowed.
        </Text>
      </AppCard>
      <AppButton
        onPress={() => router.push("/health-calendar" as Href)}
        title="Open Calendar / Timeline"
      />
    </View>
  );
}

function EmergencyTab({
  activeProfile,
  card,
  onChanged,
}: {
  activeProfile: HealthProfile | null;
  card: EmergencyInfoCard | null;
  onChanged: () => void;
}) {
  const [fullName, setFullName] = useState(
    card?.fullName ?? activeProfile?.displayName ?? "",
  );
  const [bloodType, setBloodType] = useState(card?.bloodType ?? "");
  const [doctorClinic, setDoctorClinic] = useState(card?.doctorClinic ?? "");
  const [medicalNotes, setMedicalNotes] = useState(card?.medicalNotes ?? "");
  const [visibility, setVisibility] = useState<EmergencyInfoCard["visibility"]>(
    card?.visibility ?? "private",
  );

  async function saveEmergencyCard() {
    if (!activeProfile || !fullName.trim()) return;
    if (card) {
      await updateEmergencyInfoCard(activeProfile.id, {
        bloodType,
        doctorClinic,
        fullName,
        medicalNotes,
        visibility,
      });
    } else {
      await createEmergencyInfoCard({
        bloodType,
        doctorClinic,
        fullName,
        medicalNotes,
        profileId: activeProfile.id,
        visibility,
      });
    }
    await onChanged();
  }

  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title="Emergency Info"
        subtitle="Emergency info is sensitive. You control what appears."
      />
      <FormCard
        title="Emergency Card"
        onSave={saveEmergencyCard}
        saveLabel="Save Emergency Info"
      >
        <TextInput
          onChangeText={setFullName}
          placeholder="Full name"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={fullName}
        />
        <TextInput
          onChangeText={setBloodType}
          placeholder="Blood type optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={bloodType}
        />
        <TextInput
          onChangeText={setDoctorClinic}
          placeholder="Doctor / clinic optional"
          placeholderTextColor="#94a3b8"
          style={INPUT_STYLE}
          value={doctorClinic}
        />
        <TextInput
          multiline
          onChangeText={setMedicalNotes}
          placeholder="Medical notes optional"
          placeholderTextColor="#94a3b8"
          style={{ ...INPUT_STYLE, minHeight: 88, paddingTop: 13 }}
          value={medicalNotes}
        />
        <ChipGroup
          current={visibility}
          onSelect={(value) =>
            setVisibility(value as EmergencyInfoCard["visibility"])
          }
          options={[
            { key: "private", label: "Private" },
            { key: "circle_admins", label: "Circle admins" },
            { key: "emergency_contacts", label: "Emergency contacts" },
            { key: "caregiver_allowed", label: "Caregiver allowed" },
            { key: "locked", label: "Locked" },
          ]}
        />
      </FormCard>
    </View>
  );
}

function SettingsTab({ auditLogs }: { auditLogs: HealthAuditLog[] }) {
  return (
    <View style={{ gap: 12 }}>
      <AppSection
        title="Family Settings"
        subtitle="Privacy-first sharing controls."
      />
      <AppCard backgroundColor="#f8fafc">
        <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
          Privacy
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
          Your health information is private by default. You choose what to
          share, who can see it, and who can update it.
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
          Adult profiles control their own health information. Family members
          can only access what is shared with them.
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
          Parent or guardian controls can help manage a child profile. Access
          should change as children become older and independent.
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
          Caregivers only see the care information you allow.
        </Text>
      </AppCard>
      <AppSection
        title="Audit Log"
        subtitle="Recent sensitive local actions."
      />
      {auditLogs.length ? (
        auditLogs.slice(0, 12).map((log) => (
          <AppCard key={log.id}>
            <Text style={{ color: "#0f172a", fontWeight: "900" }}>
              {formatValue(log.action)}
            </Text>
            <Text style={{ color: "#64748b", marginTop: 4 }}>
              {new Date(log.createdAt).toLocaleString()}
            </Text>
          </AppCard>
        ))
      ) : (
        <EmptyCard text="No sensitive actions logged yet." />
      )}
    </View>
  );
}

function FormCard({
  children,
  onSave,
  saveLabel,
  title,
}: {
  children: React.ReactNode;
  onSave: () => void;
  saveLabel: string;
  title: string;
}) {
  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
          {title}
        </Text>
        {children}
        <AppButton onPress={onSave} title={saveLabel} />
      </View>
    </AppCard>
  );
}

function ChipGroup({
  current,
  onSelect,
  options,
}: {
  current: string;
  onSelect: (key: string) => void;
  options: Array<{ key: string; label: string }>;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map((option) => (
        <TouchableOpacity
          activeOpacity={0.85}
          key={option.key}
          onPress={() => onSelect(option.key)}
          style={{
            backgroundColor: current === option.key ? "#0f172a" : "#f8fafc",
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 9,
          }}
        >
          <Text
            style={{
              color: current === option.key ? "#ffffff" : "#475569",
              fontWeight: "900",
            }}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ToggleRow({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: boolean) => void;
  value: boolean;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: "#f8fafc",
        borderRadius: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 12,
      }}
    >
      <Text style={{ color: "#0f172a", fontWeight: "900" }}>{label}</Text>
      <Switch onValueChange={onChange} value={value} />
    </View>
  );
}

function SmallButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor: "#f8fafc",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 9,
      }}
    >
      <Text style={{ color: "#475569", fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderColor: "#e2e8f0",
        borderRadius: 18,
        borderWidth: 1,
        flexGrow: 1,
        minWidth: "45%",
        padding: 14,
      }}
    >
      <Text style={{ color: "#64748b", fontSize: 12, fontWeight: "900" }}>
        {label}
      </Text>
      <Text
        numberOfLines={2}
        style={{
          color: "#0f172a",
          fontSize: 20,
          fontWeight: "900",
          marginTop: 4,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <AppCard>
      <Text style={{ color: "#64748b", lineHeight: 21 }}>{text}</Text>
    </AppCard>
  );
}

function formatValue(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
