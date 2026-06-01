import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { CareProfileCard } from "@/components/care-profiles/CareProfileCard";
import { CircleCard } from "@/components/circles/CircleCard";
import { CircleMemberCard } from "@/components/circles/CircleMemberCard";
import { InviteCard } from "@/components/invites/InviteCard";
import { InviteMethodCard } from "@/components/invites/InviteMethodCard";
import { PermissionToggleGroup } from "@/components/privacy/PermissionToggleGroup";
import { PrivacySummaryCard } from "@/components/privacy/PrivacySummaryCard";
import {
  AccessControlRow,
  AppHeader,
  AppIcon,
  AppScreen,
  QuickActionButton,
  StatusPill,
  StatusSurface,
  WidgetCard
} from "@/components/ui";
import {
  AGE_ACCESS_STAGES,
  CARE_PROFILE_TYPES,
  CIRCLE_MEMBER_ROLES,
  CIRCLE_RELATIONSHIPS,
  ageAccessStageLabels,
  canManageCircleMembers,
  careProfileTypeLabels,
  circlePermissionLabels,
  circleRelationshipLabels,
  circleRoleLabels
} from "@/constants/circles";
import { getPlaceholderCircleInvites } from "@/lib/invites";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import { getCircleById, listMyCirclesFromContext } from "@/lib/circles";
import { buildPermissionSummary, createPermissionAuditPlaceholder, getSafePreview, getPrivacyLevelForCareProfile, toPermissionGrants } from "@/lib/permissions";
import { useProfileContext } from "@/lib/profile-context";
import type { CareProfile } from "@/types/care-profiles";
import type { CircleMember } from "@/types/circles";
import type { CircleInvite } from "@/types/invites";
import type { PermissionAuditEvent, PermissionCategory } from "@/types/permissions";

function openRoute(route: string) {
  router.push(route as Parameters<typeof router.push>[0]);
}

export default function CircleDetailsScreen() {
  const { circleId } = useLocalSearchParams();
  const { families, selectedFamily, switchFamily } = useProfileContext();
  const [placeholderMessage, setPlaceholderMessage] = useState<string | null>(null);
  const [auditEvents, setAuditEvents] = useState<PermissionAuditEvent[]>([]);
  const circles = useMemo(() => listMyCirclesFromContext(families), [families]);
  const circle = getCircleById(circles, circleId);

  if (!circle) {
    return (
      <View style={styles.root}>
        <AppScreen>
          <AppHeader
            action={<QuickActionButton label="Back" onPress={() => openRoute("/circles")} toneColor={colors.brand.primary} />}
            eyebrow="Family Circle"
            subtitle="This circle is no longer available."
            title="Circle not found"
          />
        </AppScreen>
      </View>
    );
  }

  const activeCircle = circle;
  const pendingInvites = getPlaceholderCircleInvites(activeCircle.id);
  const firstCareProfile = activeCircle.careProfiles[0] ?? null;
  const circlePrivacySummary = buildPermissionSummary({
    ageAccessStage: firstCareProfile?.ageAccessStage ?? "adult_controlled",
    currentUserRole: activeCircle.currentUserRole,
    isAssignedCaregiver: firstCareProfile ? firstCareProfile.caregiverAssignmentStatus !== "not_assigned" : false,
    isSelfManagedAdult: false,
    privacyLevel: firstCareProfile ? getPrivacyLevelForCareProfile(firstCareProfile) : "private"
  });

  async function handleSelectCircle() {
    if (activeCircle.source === "database") {
      await switchFamily(activeCircle.id);
    }
  }

  function handleAddMember() {
    setPlaceholderMessage("Add Member will support direct member creation or linking later. No invite backend is connected yet.");
  }

  function handleInviteMember() {
    openRoute(`/invites/create?circleId=${activeCircle.id}`);
  }

  function handleManageMember(member: CircleMember) {
    setPlaceholderMessage(`Management actions for ${member.displayName} will support role, relationship, and permission changes later.`);
  }

  function handleViewMember(member: CircleMember) {
    setPlaceholderMessage(`${member.displayName} is a ${circleRoleLabels[member.role].toLowerCase()} in this circle.`);
  }

  function handleAddCareProfile() {
    openRoute(`/care-profiles/create?circleId=${activeCircle.id}`);
  }

  function handleViewCareProfile(profile: CareProfile) {
    openRoute(`/care-profiles/${profile.id}`);
  }

  function handleCareProfileAction(profile: CareProfile, action: string) {
    setPlaceholderMessage(`${action} for ${profile.displayName} will connect when care profile workflows are built.`);
  }

  function handleOpenInvite(invite: CircleInvite) {
    openRoute(`/invites/${invite.id}`);
  }

  function handleInvitePlaceholder(invite: CircleInvite, action: string) {
    setPlaceholderMessage(`${action} for ${invite.recipientLabel ?? "this invite"} will connect when invite backend state exists.`);
  }

  function handlePermissionChange(category: PermissionCategory, enabled: boolean) {
    setAuditEvents((current) => [createPermissionAuditPlaceholder(category, enabled, "local-user", firstCareProfile?.id), ...current].slice(0, 4));
    setPlaceholderMessage(`${category} permission changed locally. Audit log placeholder created.`);
  }

  return (
    <View style={styles.root}>
      <AppScreen>
        <AppHeader
          action={<QuickActionButton label="Invite" onPress={handleInviteMember} toneColor={colors.brand.primary} />}
          eyebrow={activeCircle.kind === "care_circle" ? "Care Circle" : "Family Circle"}
          subtitle="Circle-level roles, relationships, permissions, care profile types, and age access stages."
          title={activeCircle.name}
        />

        <CircleCard
          actionLabel={activeCircle.source === "database" ? "Select" : "Demo"}
          circle={activeCircle}
          onPress={handleSelectCircle}
          selected={selectedFamily?.id === activeCircle.id}
        />

        <StatusSurface
          action={<StatusPill label={activeCircle.currentUserRole} tone={canManageCircleMembers(activeCircle.currentUserRole) ? "success" : "default"} />}
          description="This circle controls who belongs here, what role they hold, and which shared care surfaces they can manage."
          icon={activeCircle.kind === "care_circle" ? "caregiver" : "family"}
          title="Trusted circle management"
          tone="success"
        />

        <WidgetCard
          accentColor={colors.brand.primary}
          action={<StatusPill label={activeCircle.source === "database" ? "Connected" : "Placeholder"} tone={activeCircle.source === "database" ? "success" : "default"} />}
          subtitle="These permissions are circle-scoped and can map to existing family tables later."
          title="Permissions"
        >
          <View style={styles.pillRow}>
            {activeCircle.permissions.map((permission) => (
              <StatusPill key={permission} label={circlePermissionLabels[permission]} tone={permission.includes("manage") ? "success" : "default"} />
            ))}
          </View>
        </WidgetCard>

        <PrivacySummaryCard
          summary={circlePrivacySummary}
          title={firstCareProfile ? `${firstCareProfile.displayName} privacy boundary` : "Circle privacy boundary"}
        />

        <WidgetCard
          accentColor={colors.brand.primary}
          action={<StatusPill label={`${auditEvents.length} audit placeholders`} tone={auditEvents.length > 0 ? "warning" : "default"} />}
          subtitle="Circle admins can manage the circle. Adult private health data still requires consent."
          title="Circle permission foundation"
        >
          <Text style={styles.muted}>
            {getSafePreview("Adult health notes and documents stay hidden from dashboards unless explicitly shared.", true)}
          </Text>
          <View style={styles.accessList}>
            <AccessControlRow
              description="Admins can manage circle structure, members, invites, and dependents."
              icon="settings"
              label="Circle management"
              statusLabel={canManageCircleMembers(activeCircle.currentUserRole) ? "Allowed" : "View only"}
              tone={canManageCircleMembers(activeCircle.currentUserRole) ? "success" : "system"}
            />
            <AccessControlRow
              description="Adult private health details need explicit adult consent."
              icon="privacy"
              label="Adult private data"
              statusLabel="Consent first"
              tone="private"
            />
            <AccessControlRow
              description="Caregivers only see assigned care profiles and granted fields."
              icon="caregiver"
              label="Caregiver access"
              statusLabel="Assigned-only"
              tone="success"
            />
          </View>
          <PermissionToggleGroup
            grants={toPermissionGrants(circlePrivacySummary.defaultPermissions, ["view_emergency_info"])}
            onChange={handlePermissionChange}
          />
        </WidgetCard>

        <WidgetCard
          accentColor={colors.brand.primary}
          action={
            <QuickActionButton
              icon={<AppIcon color={colors.brand.primary} name="family" size={20} variant="filled" />}
              label="Create invite"
              onPress={handleInviteMember}
              toneColor={colors.brand.primary}
            />
          }
          subtitle="Invite links, QR placeholders, email, and SMS/WhatsApp placeholders stay local until backend invites are connected."
          title="Pending invites"
        >
          <View style={styles.inviteList}>
            {pendingInvites.map((invite) => (
              <InviteCard
                invite={invite}
                key={invite.id}
                onApprove={(item) => handleInvitePlaceholder(item, "Admin approval")}
                onCopy={(item) => handleInvitePlaceholder(item, "Copy link")}
                onOpen={handleOpenInvite}
                onShare={(item) => handleInvitePlaceholder(item, "Copy/share")}
              />
            ))}
          </View>
        </WidgetCard>

        <WidgetCard
          accentColor={colors.status.ai}
          action={<StatusPill label="No QR package" tone="warning" />}
          subtitle="A real QR code can be added later if a QR package is intentionally installed."
          title="Invite methods"
        >
          <View style={styles.methodGrid}>
            <InviteMethodCard method="share_link" selected />
            <InviteMethodCard method="qr_placeholder" selected />
            <InviteMethodCard method="email" />
            <InviteMethodCard method="sms_whatsapp_placeholder" />
          </View>
        </WidgetCard>

        <WidgetCard
          accentColor={colors.status.success}
          action={
            <View style={styles.memberActions}>
              <QuickActionButton
                icon={<AppIcon color={colors.status.success} name="profiles" size={20} variant="filled" />}
                label="Add member"
                onPress={handleAddMember}
                toneColor={colors.status.success}
              />
              <QuickActionButton
                icon={<AppIcon color={colors.brand.primary} name="family" size={20} variant="filled" />}
                label="Invite member"
                onPress={handleInviteMember}
                toneColor={colors.brand.primary}
              />
            </View>
          }
          subtitle={
            canManageCircleMembers(activeCircle.currentUserRole)
              ? "Owners and admins can manage roles, relationships, and member permissions from here."
              : "Members can view circle membership without changing roles or relationships."
          }
          title="Circle members"
        >
          <View style={styles.memberList}>
            {activeCircle.members.map((member) => (
              <CircleMemberCard
                currentUserRole={activeCircle.currentUserRole}
                key={member.id}
                member={member}
                onManage={handleManageMember}
                onView={handleViewMember}
              />
            ))}
          </View>
        </WidgetCard>

        <WidgetCard
          accentColor={colors.status.ai}
          action={
            <QuickActionButton
              icon={<AppIcon color={colors.status.ai} name="child" size={20} variant="filled" />}
              label="Add care profile"
              onPress={handleAddCareProfile}
              toneColor={colors.status.ai}
            />
          }
          subtitle="Care profiles can represent children, teens, adult members, adult dependents, and elderly dependents."
          title="Care profiles"
        >
          {activeCircle.careProfiles.length > 0 ? (
            <View style={styles.careProfileList}>
              {activeCircle.careProfiles.map((profile) => (
                <CareProfileCard
                  key={profile.id}
                  onCalendar={(item) => handleCareProfileAction(item, "Calendar")}
                  onCareNotes={(item) => handleCareProfileAction(item, "Care notes")}
                  onEmergency={(item) => handleCareProfileAction(item, "Emergency")}
                  onView={handleViewCareProfile}
                  profile={profile}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyPanel}>
              <Text style={styles.emptyTitle}>No care profiles yet</Text>
              <Text style={styles.muted}>Add a child, teen, adult dependent, or elderly dependent when this circle needs care tracking.</Text>
            </View>
          )}
        </WidgetCard>

        <WidgetCard accentColor={colors.status.ai} subtitle="Supported foundation values for future care profile screens." title="Care profile model">
          <View style={styles.sectionGroup}>
            <Text style={styles.groupTitle}>Roles</Text>
            <View style={styles.pillRow}>
              {CIRCLE_MEMBER_ROLES.map((role) => (
                <StatusPill key={role} label={circleRoleLabels[role]} tone={role === "owner" || role === "admin" ? "success" : "default"} />
              ))}
            </View>
          </View>

          <View style={styles.sectionGroup}>
            <Text style={styles.groupTitle}>Relationships per circle</Text>
            <View style={styles.pillRow}>
              {CIRCLE_RELATIONSHIPS.map((relationship) => (
                <StatusPill key={relationship} label={circleRelationshipLabels[relationship]} />
              ))}
            </View>
          </View>

          <View style={styles.sectionGroup}>
            <Text style={styles.groupTitle}>Care profile types</Text>
            <View style={styles.pillRow}>
              {CARE_PROFILE_TYPES.map((profileType) => (
                <StatusPill key={profileType} label={careProfileTypeLabels[profileType]} tone="ai" />
              ))}
            </View>
          </View>

          <View style={styles.sectionGroup}>
            <Text style={styles.groupTitle}>Age access stages</Text>
            <View style={styles.pillRow}>
              {AGE_ACCESS_STAGES.map((stage) => (
                <StatusPill key={stage} label={ageAccessStageLabels[stage]} tone={stage === "adult_controlled" ? "success" : "warning"} />
              ))}
            </View>
          </View>
        </WidgetCard>

        <Modal transparent visible={Boolean(placeholderMessage)} animationType="fade">
          <Pressable style={styles.modalBackdrop} onPress={() => setPlaceholderMessage(null)}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Coming next</Text>
              <Text style={styles.modalText}>{placeholderMessage}</Text>
              <QuickActionButton label="Close" onPress={() => setPlaceholderMessage(null)} toneColor={colors.brand.primary} />
            </View>
          </Pressable>
        </Modal>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  accessList: {
    gap: spacing.md
  },
  careProfileList: {
    gap: spacing.md
  },
  emptyPanel: {
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md
  },
  emptyTitle: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: "900"
  },
  groupTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "900"
  },
  inviteList: {
    gap: spacing.md
  },
  muted: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20
  },
  methodGrid: {
    gap: spacing.sm
  },
  memberList: {
    gap: spacing.md
  },
  memberActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.32)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl
  },
  modalCard: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.md,
    maxWidth: 420,
    padding: spacing.xl,
    width: "100%"
  },
  modalText: {
    color: colors.text.secondary,
    fontSize: 15,
    lineHeight: 22
  },
  modalTitle: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: "900"
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  root: {
    backgroundColor: colors.background.app,
    flex: 1
  },
  sectionGroup: {
    gap: spacing.sm
  }
});
