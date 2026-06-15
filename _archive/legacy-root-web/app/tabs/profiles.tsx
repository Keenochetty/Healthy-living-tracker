import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";

import { CareProfileCard } from "@/components/care-profiles/CareProfileCard";
import { CircleCard } from "@/components/circles/CircleCard";
import { CircleMemberCard } from "@/components/circles/CircleMemberCard";
import { CircleSwitcher } from "@/components/circles/CircleSwitcher";
import {
  AccessControlRow,
  AppHeader,
  AppIcon,
  AppScreen,
  NativeEmptyState,
  NativeSkeletonCard,
  QuickActionButton,
  StatusPill,
  StatusSurface,
  WidgetCard,
} from "@/components/ui";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import {
  getMockCaregiverAssignments,
  summarizeCaregiverPermissions,
} from "@/lib/caregiver-assignments";
import {
  canCreateOrEditChildProfiles,
  createChildProfile,
  getChildAge,
  getChildFullName,
  listChildrenInSelectedFamily,
  openChildProfile,
  type ChildProfile,
} from "@/lib/children";
import { listMyCirclesFromContext } from "@/lib/circles";
import { useProfileContext } from "@/lib/profile-context";

function openRoute(route: string) {
  router.push(route as Parameters<typeof router.push>[0]);
}

const profileSections = [
  {
    accentColor: colors.brand.primary,
    avatar: "M",
    name: "Me",
    privacy: "Private by default",
    role: "Parent profile",
    route: "/settings/profile",
  },
  {
    accentColor: colors.status.success,
    avatar: "P",
    name: "Partner / shared profile",
    privacy: "Shared with family",
    role: "Family access",
    route: "/settings/family",
  },
  {
    accentColor: colors.status.ai,
    avatar: "C",
    name: "Caregiver profiles",
    privacy: "Parent approved",
    role: "Care team",
    route: "/settings/caregiver-access",
  },
];

const careQuickLogs = [
  { icon: "food" as const, label: "Feed", tone: colors.status.success },
  { icon: "sleep" as const, label: "Nap", tone: colors.brand.primary },
  {
    icon: "medication" as const,
    label: "Medication",
    tone: colors.status.warning,
  },
  { icon: "note" as const, label: "Note", tone: colors.status.system },
  {
    icon: "emergency" as const,
    label: "Emergency",
    tone: colors.status.emergency,
  },
];

const assignmentSummaries = getMockCaregiverAssignments(
  "placeholder-dad-care-profile",
);

export default function ProfilesScreen() {
  const { families, profile, selectedFamily, switchFamily } =
    useProfileContext();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [placeholderMessage, setPlaceholderMessage] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const canManageChildren = canCreateOrEditChildProfiles(
    profile,
    selectedFamily,
  );
  const circles = listMyCirclesFromContext(families);
  const selectedCircleId = selectedFamily?.id ?? circles[0]?.id ?? null;
  const selectedCircle =
    circles.find((circle) => circle.id === selectedCircleId) ?? null;

  const loadChildren = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextChildren = await listChildrenInSelectedFamily(
        selectedFamily?.id,
      );
      setChildren(nextChildren);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load child profiles.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedFamily]);

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      loadChildren();
    }, 0);

    return () => {
      clearTimeout(loadTimer);
    };
  }, [loadChildren]);

  async function handleCreateChild() {
    if (!selectedFamily) {
      setErrorMessage("Select a family before creating a child profile.");
      return;
    }

    setIsCreating(true);
    setErrorMessage(null);

    try {
      await createChildProfile({
        dateOfBirth,
        familyId: selectedFamily.id,
        firstName,
        gender,
        lastName,
      });
      setFirstName("");
      setLastName("");
      setDateOfBirth("");
      setGender("");
      await loadChildren();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create child profile.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleCircleSelect(circleId: string) {
    const circle = circles.find((item) => item.id === circleId);

    if (!circle || circle.source === "placeholder") {
      openRoute(`/circles/${circleId}`);
      return;
    }

    await switchFamily(circleId);
  }

  return (
    <View style={styles.root}>
      <AppScreen>
        <AppHeader
          action={
            <StatusPill
              label={selectedFamily?.name ?? "No family"}
              tone={selectedFamily ? "success" : "warning"}
            />
          }
          eyebrow="Profiles"
          subtitle="Profiles are scoped to the selected Family Circle. Caregiver work lives here; Health Monitor stays separate."
          title="Circle profiles"
        />

        <StatusSurface
          action={<StatusPill label="Trusted circle" tone="success" />}
          description="Members, care profiles, and assigned caregiver work stay tied to the selected circle."
          icon="family"
          title="Circle access"
          tone="connected"
        />

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <WidgetCard
          accentColor={colors.status.success}
          action={<StatusPill label={`${circles.length} circles`} />}
          subtitle="Switch which circle supplies the profile list and child/dependent context."
          title="Family Circle switcher"
        >
          <View style={styles.circleStack}>
            <CircleSwitcher
              circles={circles}
              onManage={() =>
                openRoute(
                  selectedCircleId
                    ? `/circles/${selectedCircleId}`
                    : "/circles",
                )
              }
              onSelectCircle={handleCircleSelect}
              selectedCircleId={selectedCircleId}
            />
            <QuickActionButton
              icon={
                <AppIcon
                  color={colors.status.success}
                  name="family"
                  size={20}
                />
              }
              label="Manage all circles"
              onPress={() => openRoute("/circles")}
              toneColor={colors.status.success}
            />
          </View>
        </WidgetCard>

        <WidgetCard
          accentColor={colors.brand.primary}
          action={<StatusPill label="Circle-scoped" tone="success" />}
          subtitle="Each circle can have a different relationship and permission model."
          title="Selected Circle"
        >
          {selectedCircle ? (
            <View style={styles.circleStack}>
              <CircleCard
                circle={selectedCircle}
                onPress={() => openRoute(`/circles/${selectedCircle.id}`)}
                selected
              />
              <View style={styles.memberList}>
                {selectedCircle.members.map((member) => (
                  <CircleMemberCard
                    currentUserRole={selectedCircle.currentUserRole}
                    key={member.id}
                    member={member}
                    onManage={() => openRoute(`/circles/${selectedCircle.id}`)}
                    onView={() => openRoute(`/circles/${selectedCircle.id}`)}
                  />
                ))}
              </View>
              <View style={styles.memberList}>
                {selectedCircle.careProfiles.map((careProfile) => (
                  <CareProfileCard
                    key={careProfile.id}
                    onCalendar={() => openRoute("/tabs/calendar")}
                    onCareNotes={() =>
                      openRoute(`/care-profiles/${careProfile.id}`)
                    }
                    onEmergency={() =>
                      openRoute("/settings/emergency-contacts")
                    }
                    onView={() => openRoute(`/care-profiles/${careProfile.id}`)}
                    profile={careProfile}
                  />
                ))}
                <QuickActionButton
                  icon={
                    <AppIcon color={colors.status.ai} name="child" size={20} />
                  }
                  label="Add care profile"
                  onPress={() =>
                    openRoute(
                      `/care-profiles/create?circleId=${selectedCircle.id}`,
                    )
                  }
                  toneColor={colors.status.ai}
                />
              </View>
            </View>
          ) : (
            <Text style={styles.muted}>
              Select a Family Circle to view members and relationships.
            </Text>
          )}
        </WidgetCard>

        <WidgetCard
          accentColor={colors.status.success}
          action={<StatusPill label="Care lives here" tone="success" />}
          subtitle="Caregiver work and assigned-only care tools are grouped under Profiles, not the Home switcher."
          title="Care"
        >
          <View style={styles.careGrid}>
            <Pressable
              accessibilityRole="button"
              onPress={() => openRoute("/caregiver/work-mode")}
              style={({ pressed }) => [
                styles.careTile,
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.careIcon,
                  { backgroundColor: colors.status.successSoft },
                ]}
              >
                <AppIcon
                  color={colors.status.success}
                  name="caregiver"
                  size={22}
                />
              </View>
              <View style={styles.careCopy}>
                <Text style={styles.childName}>Caregiver Work Mode</Text>
                <Text style={styles.muted}>
                  Assigned profiles, quick logs, and approved instructions.
                </Text>
              </View>
            </Pressable>

            {assignmentSummaries.map((assignment) => (
              <Pressable
                accessibilityRole="button"
                key={assignment.id}
                onPress={() =>
                  openRoute(`/care-profiles/${assignment.careProfileId}`)
                }
                style={({ pressed }) => [
                  styles.careTile,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.careIcon,
                    { backgroundColor: colors.brand.primarySoft },
                  ]}
                >
                  <AppIcon
                    color={colors.brand.primary}
                    name="shield"
                    size={22}
                  />
                </View>
                <View style={styles.careCopy}>
                  <Text style={styles.childName}>
                    {assignment.careProfileName ?? "Assigned care profile"}
                  </Text>
                  <Text style={styles.muted}>
                    {summarizeCaregiverPermissions(assignment.permissions)}. No
                    full circle browsing.
                  </Text>
                </View>
                <StatusPill
                  label={assignment.status}
                  tone={assignment.status === "active" ? "success" : "warning"}
                />
              </Pressable>
            ))}
          </View>

          <View style={styles.careSection}>
            <Text style={styles.careSectionTitle}>Quick logs</Text>
            <View style={styles.quickLogGrid}>
              {careQuickLogs.map((log) => (
                <QuickActionButton
                  icon={<AppIcon color={log.tone} name={log.icon} size={18} />}
                  key={log.label}
                  label={log.label}
                  onPress={() =>
                    log.label === "Emergency"
                      ? openRoute("/settings/emergency-contacts")
                      : setPlaceholderMessage(
                          `${log.label} care log will open caregiver work mode when activity logging is connected.`,
                        )
                  }
                  toneColor={log.tone}
                />
              ))}
            </View>
          </View>

          <View style={styles.careTile}>
            <View
              style={[
                styles.careIcon,
                { backgroundColor: colors.background.mist },
              ]}
            >
              <AppIcon color={colors.text.secondary} name="note" size={22} />
            </View>
            <View style={styles.careCopy}>
              <Text style={styles.childName}>Care instructions</Text>
              <Text style={styles.muted}>
                Daily routine and health instructions use safe summaries until
                opened intentionally.
              </Text>
            </View>
            <QuickActionButton
              label="Open"
              onPress={() => openRoute("/caregiver/work-mode")}
              toneColor={colors.brand.primary}
            />
          </View>

          <View style={styles.careSection}>
            <Text style={styles.careSectionTitle}>Access controls</Text>
            <AccessControlRow
              description="Caregivers only see assigned profiles and approved fields."
              icon="shield"
              label="Assigned-only care"
              onPress={() => openRoute("/caregiver/profile")}
              statusLabel="Protected"
              tone="success"
            />
            <AccessControlRow
              description="Adult private health details require explicit consent."
              icon="privacy"
              label="Adult consent"
              onPress={() => openRoute("/privacy/permissions")}
              statusLabel="Consent first"
              tone="private"
            />
          </View>
        </WidgetCard>

        <WidgetCard
          accentColor={colors.brand.primary}
          action={
            <QuickActionButton
              icon={
                <AppIcon
                  color={colors.brand.primary}
                  name="profiles"
                  size={20}
                  variant="filled"
                />
              }
              label="Add profile"
              onPress={() => openRoute("/settings/family")}
              toneColor={colors.brand.primary}
            />
          }
          subtitle="Core profile cards with privacy state and quick access."
          title="People"
        >
          <View style={styles.profileGrid}>
            {profileSections.map((item) => (
              <Pressable
                accessibilityRole="button"
                key={item.name}
                onPress={() => openRoute(item.route)}
                style={({ pressed }) => [
                  styles.profileCard,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: `${item.accentColor}20` },
                  ]}
                >
                  <Text
                    style={[styles.avatarText, { color: item.accentColor }]}
                  >
                    {item.avatar}
                  </Text>
                </View>
                <View style={styles.profileCopy}>
                  <Text style={styles.childName}>{item.name}</Text>
                  <Text style={styles.roleText}>{item.role}</Text>
                  <StatusPill
                    label={item.privacy}
                    tone={
                      item.accentColor === colors.status.ai ? "ai" : "default"
                    }
                  />
                </View>
                <QuickActionButton
                  label="Quick view"
                  onPress={() => openRoute(item.route)}
                  toneColor={item.accentColor}
                />
              </Pressable>
            ))}
          </View>
        </WidgetCard>

        <WidgetCard
          accentColor={colors.brand.primary}
          action={
            <StatusPill
              label={canManageChildren ? "Parent mode" : "View only"}
              tone={canManageChildren ? "success" : "default"}
            />
          }
          subtitle="Create child profiles without making the screen feel clinical."
          title="Add a child"
        >
          {canManageChildren ? (
            <View style={styles.form}>
              <TextInput
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor={colors.text.muted}
                style={styles.input}
                value={firstName}
              />
              <TextInput
                onChangeText={setLastName}
                placeholder="Last name"
                placeholderTextColor={colors.text.muted}
                style={styles.input}
                value={lastName}
              />
              <TextInput
                onChangeText={setDateOfBirth}
                placeholder="Date of birth, YYYY-MM-DD"
                placeholderTextColor={colors.text.muted}
                style={styles.input}
                value={dateOfBirth}
              />
              <TextInput
                onChangeText={setGender}
                placeholder="Gender optional"
                placeholderTextColor={colors.text.muted}
                style={styles.input}
                value={gender}
              />
              {isCreating ? (
                <ActivityIndicator />
              ) : (
                <QuickActionButton
                  icon={
                    <AppIcon
                      color={colors.brand.primary}
                      name="child"
                      size={20}
                    />
                  }
                  label="Create child"
                  onPress={handleCreateChild}
                  toneColor={colors.brand.primary}
                />
              )}
            </View>
          ) : (
            <Text style={styles.muted}>
              Only parents or guardians with family permission can create child
              profiles.
            </Text>
          )}
        </WidgetCard>

        <WidgetCard
          accentColor={colors.accent.coral}
          action={<StatusPill label={`${children.length} profiles`} />}
          subtitle="Cards show friendly summaries, not sensitive medical details."
          title="Children"
        >
          {isLoading ? <NativeSkeletonCard /> : null}
          {!isLoading && children.length === 0 ? (
            <NativeEmptyState
              icon="child"
              title="No child profiles yet"
              message="Add a child profile when you are ready. Overview cards will stay privacy-safe."
            />
          ) : null}

          <View style={styles.childList}>
            {children.map((child) => (
              <View key={child.id} style={styles.childCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {child.first_name.slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.childCopy}>
                  <Text style={styles.childName}>
                    {getChildFullName(child)}
                  </Text>
                  <Text style={styles.muted}>
                    {getChildAge(child.date_of_birth)}
                  </Text>
                  <View style={styles.pillRow}>
                    <StatusPill label="Allergy badge" tone="warning" />
                    <StatusPill label="Condition badge" tone="ai" />
                    <StatusPill label="Today schedule" />
                    <StatusPill label="Private details hidden" tone="ai" />
                  </View>
                </View>
                <QuickActionButton
                  label="Quick view"
                  onPress={() => openChildProfile(child.id)}
                  toneColor={colors.brand.primary}
                />
              </View>
            ))}
          </View>
        </WidgetCard>

        <Modal
          transparent
          visible={Boolean(placeholderMessage)}
          animationType="fade"
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setPlaceholderMessage(null)}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Care action</Text>
              <Text style={styles.modalText}>{placeholderMessage}</Text>
              <QuickActionButton
                label="Close"
                onPress={() => setPlaceholderMessage(null)}
                toneColor={colors.brand.primary}
              />
            </View>
          </Pressable>
        </Modal>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    backgroundColor: colors.accent.peach,
    borderRadius: 999,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  avatarText: {
    color: colors.accent.coral,
    fontSize: 22,
    fontWeight: "900",
  },
  childCard: {
    alignItems: "center",
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    padding: spacing.md,
  },
  childCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 180,
  },
  childList: {
    gap: spacing.md,
  },
  childName: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "900",
  },
  careCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  careGrid: {
    gap: spacing.md,
  },
  careIcon: {
    alignItems: "center",
    borderRadius: 14,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  careSection: {
    gap: spacing.sm,
  },
  careSectionTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "900",
  },
  careTile: {
    alignItems: "center",
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    padding: spacing.md,
  },
  error: {
    color: colors.status.emergency,
    fontSize: 15,
    fontWeight: "800",
  },
  form: {
    gap: spacing.md,
  },
  circleStack: {
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.text.primary,
    fontSize: 16,
    minHeight: 50,
    padding: spacing.md,
  },
  muted: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  memberList: {
    gap: spacing.sm,
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.32)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.md,
    maxWidth: 420,
    padding: spacing.xl,
    width: "100%",
  },
  modalText: {
    color: colors.text.secondary,
    fontSize: 15,
    lineHeight: 22,
  },
  modalTitle: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    padding: spacing.md,
  },
  profileCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 180,
  },
  profileGrid: {
    gap: spacing.sm,
  },
  quickLogGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  roleText: {
    color: colors.text.secondary,
    fontSize: 15,
    fontWeight: "700",
  },
  root: {
    backgroundColor: colors.background.app,
    flex: 1,
  },
});
