import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { CaregiverAssignmentCard } from "@/components/caregiver/CaregiverAssignmentCard";
import { CareProfileCard } from "@/components/care-profiles/CareProfileCard";
import { AdultConsentCard } from "@/components/privacy/AdultConsentCard";
import { CaregiverPermissionCard } from "@/components/privacy/CaregiverPermissionCard";
import { PermissionToggleGroup } from "@/components/privacy/PermissionToggleGroup";
import { PrivacySummaryCard } from "@/components/privacy/PrivacySummaryCard";
import { TeenTransitionCard } from "@/components/privacy/TeenTransitionCard";
import {
  AppHeader,
  AppScreen,
  QuickActionButton,
  StatusPill,
  WidgetCard,
} from "@/components/ui";
import { careProfilePrivacyLabels } from "@/constants/care-profiles";
import { permissionCategoryLabels } from "@/constants/permissions";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import {
  getMockCaregiverAssignments,
  revokeCaregiverAssignment,
  updateCaregiverAssignmentPermission,
} from "@/lib/caregiver-assignments";
import { listMyCirclesFromContext } from "@/lib/circles";
import { openEmail, openPhoneCall } from "@/lib/contact-actions";
import {
  buildPermissionSummary,
  createPermissionAuditPlaceholder,
  getSafePreview,
  getPrivacyLevelForCareProfile,
  shouldRequireConsent,
  toPermissionGrants,
} from "@/lib/permissions";
import { useProfileContext } from "@/lib/profile-context";
import type { CareProfile } from "@/types/care-profiles";
import type {
  CaregiverAssignment,
  CaregiverAssignmentPermissionKey,
} from "@/types/caregiver-assignments";
import type {
  PermissionAuditEvent,
  PermissionCategory,
} from "@/types/permissions";

function openRoute(route: string) {
  router.push(route as Parameters<typeof router.push>[0]);
}

export default function CareProfileDetailScreen() {
  const { careProfileId } = useLocalSearchParams();
  const { families } = useProfileContext();
  const [placeholderMessage, setPlaceholderMessage] = useState<string | null>(
    null,
  );
  const [auditEvents, setAuditEvents] = useState<PermissionAuditEvent[]>([]);
  const circles = useMemo(() => listMyCirclesFromContext(families), [families]);
  const careProfile =
    circles
      .flatMap((circle) => circle.careProfiles)
      .find((profile) => profile.id === careProfileId) ?? null;
  const circle = careProfile
    ? (circles.find((item) => item.id === careProfile.circleId) ?? null)
    : null;
  const privacyLevel = careProfile
    ? getPrivacyLevelForCareProfile(careProfile)
    : "private";
  const permissionSummary =
    careProfile && circle
      ? buildPermissionSummary({
          ageAccessStage: careProfile.ageAccessStage,
          currentUserRole: circle.currentUserRole,
          isAssignedCaregiver:
            careProfile.caregiverAssignmentStatus !== "not_assigned",
          isSelfManagedAdult:
            careProfile.ageAccessStage === "adult_controlled" &&
            careProfile.profileType === "adult_member",
          privacyLevel,
        })
      : null;
  const [assignments, setAssignments] = useState<CaregiverAssignment[]>(() =>
    getMockCaregiverAssignments(
      typeof careProfileId === "string" ? careProfileId : undefined,
    ),
  );

  function handleAction(profile: CareProfile, action: string) {
    setPlaceholderMessage(
      `${action} for ${profile.displayName} will connect when care records, notes, and calendar workflows are built.`,
    );
  }

  function handleAssignmentPermissionChange(
    assignment: CaregiverAssignment,
    permission: CaregiverAssignmentPermissionKey,
    enabled: boolean,
  ) {
    setAssignments((current) =>
      current.map((item) =>
        item.id === assignment.id
          ? updateCaregiverAssignmentPermission(item, permission, enabled)
          : item,
      ),
    );
    setPlaceholderMessage(
      "Caregiver permission change captured locally. Audit log entry placeholder created.",
    );
  }

  async function handleAssignmentCall(assignment: CaregiverAssignment) {
    if (!assignment.caregiverPhone) {
      setPlaceholderMessage(
        "No caregiver phone number is available for this assignment.",
      );
      return;
    }

    try {
      await openPhoneCall(assignment.caregiverPhone);
    } catch (error) {
      setPlaceholderMessage(
        error instanceof Error ? error.message : "Unable to start phone call.",
      );
    }
  }

  async function handleAssignmentEmail(assignment: CaregiverAssignment) {
    if (!assignment.caregiverEmail) {
      setPlaceholderMessage(
        "No caregiver email is available for this assignment.",
      );
      return;
    }

    try {
      await openEmail(
        assignment.caregiverEmail,
        `Care assignment for ${assignment.careProfileName ?? "care profile"}`,
      );
    } catch (error) {
      setPlaceholderMessage(
        error instanceof Error ? error.message : "Unable to open email.",
      );
    }
  }

  function handlePermissionChange(
    category: PermissionCategory,
    enabled: boolean,
  ) {
    const profileId =
      typeof careProfileId === "string" ? careProfileId : undefined;
    setAuditEvents((current) =>
      [
        createPermissionAuditPlaceholder(
          category,
          enabled,
          "local-user",
          profileId,
        ),
        ...current,
      ].slice(0, 4),
    );
    setPlaceholderMessage(
      `${permissionCategoryLabels[category]} changes are captured locally. Audit log entry placeholder created.`,
    );
  }

  if (!careProfile) {
    return (
      <View style={styles.root}>
        <AppScreen>
          <AppHeader
            action={
              <QuickActionButton
                label="Back"
                onPress={() => openRoute("/circles")}
                toneColor={colors.brand.primary}
              />
            }
            eyebrow="Care Profile"
            subtitle="This care profile is not available in the current placeholder data."
            title="Profile not found"
          />
        </AppScreen>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <AppScreen>
        <AppHeader
          action={
            <QuickActionButton
              label="Circle"
              onPress={() =>
                openRoute(circle ? `/circles/${circle.id}` : "/circles")
              }
              toneColor={colors.brand.primary}
            />
          }
          eyebrow="Care Profile"
          subtitle={`${circle?.name ?? "Family Circle"} care tracking foundation.`}
          title={careProfile.displayName}
        />

        <CareProfileCard
          onCalendar={(profile) => handleAction(profile, "Calendar")}
          onCareNotes={(profile) => handleAction(profile, "Care notes")}
          onEmergency={(profile) => handleAction(profile, "Emergency")}
          onView={(profile) => handleAction(profile, "Profile details")}
          profile={careProfile}
        />

        <WidgetCard
          accentColor={colors.status.ai}
          action={
            <StatusPill
              label={careProfilePrivacyLabels[careProfile.privacyStatus]}
              tone={
                careProfile.privacyStatus === "adult_private"
                  ? "success"
                  : "default"
              }
            />
          }
          subtitle="Adults stay in control of private health information unless they explicitly grant access."
          title="Privacy foundation"
        >
          <Text style={styles.muted}>
            Caregiver assignment, detailed records, and granular permissions are
            intentionally placeholders in this phase.
          </Text>
          <Text style={styles.safePreview}>
            {getSafePreview(
              careProfile.notes ?? "Sensitive notes stay out of preview cards.",
              careProfile.privacyStatus === "adult_private",
            )}
          </Text>
        </WidgetCard>

        {permissionSummary ? (
          <PrivacySummaryCard
            summary={permissionSummary}
            title="Permission summary"
          />
        ) : null}

        {permissionSummary ? (
          <WidgetCard
            accentColor={colors.brand.primary}
            action={<StatusPill label="Local controls" />}
            subtitle="Field-level permissions are local placeholders until backend sharing and policies are added."
            title="Permission settings"
          >
            <PermissionToggleGroup
              grants={toPermissionGrants(permissionSummary.defaultPermissions, [
                "view_emergency_info",
              ])}
              onChange={handlePermissionChange}
            />
          </WidgetCard>
        ) : null}

        <AdultConsentCard
          consentRequired={shouldRequireConsent(
            careProfile.profileType,
            careProfile.ageAccessStage,
          )}
          onRequestConsent={() =>
            handlePermissionChange("manage_privacy", true)
          }
        />
        {careProfile.ageAccessStage === "teen_transition" ? (
          <TeenTransitionCard
            onOpenSettings={() =>
              handlePermissionChange("view_health_summary", true)
            }
          />
        ) : null}
        <CaregiverPermissionCard
          assignedOnly={
            careProfile.caregiverAssignmentStatus !== "not_assigned"
          }
          onConfigure={() => handlePermissionChange("assign_caregivers", true)}
        />

        <WidgetCard
          accentColor={colors.status.warning}
          action={
            <StatusPill label={`${auditEvents.length} local`} tone="warning" />
          }
          subtitle="Permission changes are captured locally until persistence and RLS are built."
          title="Audit log placeholder"
        >
          {auditEvents.length > 0 ? (
            <View style={styles.auditList}>
              {auditEvents.map((event) => (
                <Text
                  key={`${event.createdAt}-${event.category}`}
                  style={styles.muted}
                >
                  {permissionCategoryLabels[event.category]}{" "}
                  {event.enabled ? "enabled" : "disabled"} locally.
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.muted}>
              No permission changes recorded in this local session.
            </Text>
          )}
        </WidgetCard>

        <WidgetCard
          accentColor={colors.status.success}
          action={
            <QuickActionButton
              label="Assign caregiver"
              onPress={() =>
                openRoute(`/caregiver/assign?careProfileId=${careProfile.id}`)
              }
              toneColor={colors.status.success}
            />
          }
          subtitle="Caregivers only see assigned care profiles and granted fields."
          title="Assigned caregivers"
        >
          <View style={styles.assignmentList}>
            {assignments.map((assignment) => (
              <CaregiverAssignmentCard
                assignment={{
                  ...assignment,
                  careProfileName: careProfile.displayName,
                  careProfileType: careProfile.profileType,
                  circleName: circle?.name ?? assignment.circleName,
                }}
                key={assignment.id}
                onCall={handleAssignmentCall}
                onEmail={handleAssignmentEmail}
                onManagePermissions={() =>
                  setPlaceholderMessage(
                    "Manage permissions is represented by grouped toggles on the assignment card for now.",
                  )
                }
                onOpenProfile={() => openRoute("/caregiver/profile")}
                onPermissionChange={handleAssignmentPermissionChange}
                onRevoke={(item) => {
                  setAssignments((current) =>
                    current.map((assignmentItem) =>
                      assignmentItem.id === item.id
                        ? revokeCaregiverAssignment(assignmentItem)
                        : assignmentItem,
                    ),
                  );
                  setPlaceholderMessage(
                    "Remove/revoke access captured locally. Future backend will revoke assignment and write audit history.",
                  );
                }}
                showPermissionToggles
              />
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
              <Text style={styles.modalTitle}>Coming next</Text>
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
  assignmentList: {
    gap: spacing.md,
  },
  auditList: {
    gap: spacing.xs,
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
  muted: {
    color: colors.text.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  root: {
    backgroundColor: colors.background.app,
    flex: 1,
  },
  safePreview: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 22,
  },
});
