import { router } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { CaregiverAssignmentCard } from "@/components/caregiver/CaregiverAssignmentCard";
import { CaregiverCard } from "@/components/caregiver/CaregiverCard";
import { CaregiverContactWidget } from "@/components/caregiver/CaregiverContactWidget";
import { AppHeader, AppIcon, AppScreen, QuickActionButton, StatusPill, WidgetCard } from "@/components/ui";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import { getMockCaregiverAssignments, revokeCaregiverAssignment, updateCaregiverAssignmentPermission } from "@/lib/caregiver-assignments";
import { openEmail, openPhoneCall } from "@/lib/contact-actions";
import type { AssignedCareProfileSummary, CaregiverAssignment, CaregiverAssignmentPermissionKey } from "@/types/caregiver-assignments";
import type { CaregiverProfile } from "@/types/caregiver";

const placeholderCaregiver: CaregiverProfile = {
  age: 34,
  availability: {
    availableFromTime: "08:00",
    availableToTime: "17:00",
    days: ["monday", "tuesday", "wednesday", "thursday", "friday"]
  },
  careType: "both",
  cellNumber: "+1 555 014 2700",
  dateOfBirth: null,
  email: "caregiver@example.com",
  experienceSummary: "Experienced caregiver focused on calm routines, safe handoffs, basic medication reminders, and family-approved care notes.",
  firstName: "Maya",
  id: "placeholder-caregiver-profile",
  lastName: "Stone",
  middleName: null,
  profilePhotoUrl: null,
  rate: {
    dailyRate: 180,
    hourlyRate: 24,
    rateNotes: "Rates vary by weekend coverage and overnight care."
  },
  referencesStatus: "placeholder",
  serviceArea: "North side and nearby suburbs",
  yearsOfExperience: 8
};

function openRoute(route: string) {
  router.push(route as Parameters<typeof router.push>[0]);
}

export default function CaregiverProfileScreen() {
  const [placeholderMessage, setPlaceholderMessage] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<CaregiverAssignment[]>(() => getMockCaregiverAssignments("placeholder-dad-care-profile"));
  const assignedCareProfiles: AssignedCareProfileSummary[] = assignments.map((assignment) => ({
    circleName: assignment.circleName ?? "Care Circle",
    displayName: assignment.careProfileName ?? "Assigned care profile",
    grantedPermissionCount: Object.values(assignment.permissions).filter(Boolean).length,
    id: assignment.careProfileId,
    profileType: assignment.careProfileType ?? "elderly_dependent",
    status: assignment.status === "active" ? "ready" : "needs_review"
  }));

  function handleAssignmentPermissionChange(assignment: CaregiverAssignment, permission: CaregiverAssignmentPermissionKey, enabled: boolean) {
    setAssignments((current) => current.map((item) => (item.id === assignment.id ? updateCaregiverAssignmentPermission(item, permission, enabled) : item)));
    setPlaceholderMessage("Permission change captured locally. Audit log placeholder created.");
  }

  async function handleAssignmentCall(assignment: CaregiverAssignment) {
    if (!assignment.caregiverPhone) {
      setPlaceholderMessage("No caregiver phone number is available for this assignment.");
      return;
    }

    try {
      await openPhoneCall(assignment.caregiverPhone);
    } catch (error) {
      setPlaceholderMessage(error instanceof Error ? error.message : "Unable to start phone call.");
    }
  }

  async function handleAssignmentEmail(assignment: CaregiverAssignment) {
    if (!assignment.caregiverEmail) {
      setPlaceholderMessage("No caregiver email is available for this assignment.");
      return;
    }

    try {
      await openEmail(assignment.caregiverEmail, `Care assignment for ${assignment.careProfileName ?? "care profile"}`);
    } catch (error) {
      setPlaceholderMessage(error instanceof Error ? error.message : "Unable to open email.");
    }
  }

  return (
    <View style={styles.root}>
      <AppScreen>
        <AppHeader
          action={<QuickActionButton label="Edit" onPress={() => openRoute("/caregiver/edit-profile")} toneColor={colors.brand.primary} />}
          eyebrow="Caregiver"
          subtitle="Caregiver profile details stay inside the Care tab and caregiver work surfaces."
          title="Caregiver profile"
        />

        <CaregiverCard
          assignedCareProfiles={assignedCareProfiles}
          caregiver={placeholderCaregiver}
          onEdit={() => openRoute("/caregiver/edit-profile")}
          onOpenAssignedProfile={(profile) => openRoute(`/care-profiles/${profile.id}`)}
          onOpen={() => undefined}
          onShare={() => setPlaceholderMessage("Sharing caregiver cards is a placeholder for now.")}
        />

        <CaregiverContactWidget
          caregiver={placeholderCaregiver}
          onShare={() => setPlaceholderMessage("Sharing caregiver cards is a placeholder for now.")}
          onStatus={setPlaceholderMessage}
        />

        <WidgetCard
          accentColor={colors.status.success}
          action={<StatusPill label={`${assignedCareProfiles.length} profiles`} tone="success" />}
          subtitle="Caregivers only see assigned care profiles and granted fields."
          title="Assigned care profiles"
        >
          <View style={styles.assignedList}>
            {assignedCareProfiles.map((profile) => (
              <View key={profile.id} style={styles.assignedRow}>
                <View style={styles.assignedIcon}>
                  <AppIcon color={colors.status.success} name="caregiver" size={22} />
                </View>
                <View style={styles.assignedCopy}>
                  <Text style={styles.assignedTitle}>{profile.displayName}</Text>
                  <Text style={styles.muted}>{profile.circleName} - assigned access only</Text>
                </View>
                <QuickActionButton label="Open" onPress={() => openRoute(`/care-profiles/${profile.id}`)} toneColor={colors.status.success} />
              </View>
            ))}
          </View>
        </WidgetCard>

        <WidgetCard
          accentColor={colors.brand.primary}
          action={<StatusPill label="Assigned-only" tone="success" />}
          subtitle="These cards represent the caregiver's assigned profiles and granted fields. They do not unlock full circle browsing."
          title="Assignment permissions"
        >
          <View style={styles.assignedList}>
            {assignments.map((assignment) => (
              <CaregiverAssignmentCard
                assignment={assignment}
                key={assignment.id}
                onCall={handleAssignmentCall}
                onEmail={handleAssignmentEmail}
                onManagePermissions={() => setPlaceholderMessage("Manage permissions is a placeholder on the caregiver profile. Admin controls live on assignment screens.")}
                onOpenProfile={(item) => openRoute(`/care-profiles/${item.careProfileId}`)}
                onPermissionChange={handleAssignmentPermissionChange}
                onRevoke={(item) => {
                  setAssignments((current) => current.map((assignmentItem) => (assignmentItem.id === item.id ? revokeCaregiverAssignment(assignmentItem) : assignmentItem)));
                  setPlaceholderMessage("Revoke access captured locally. Backend revocation and audit logs come later.");
                }}
              />
            ))}
          </View>
        </WidgetCard>

        <WidgetCard
          accentColor={colors.status.ai}
          action={<StatusPill label="Placeholder" tone="ai" />}
          subtitle="References, background checks, caregiver assignments, and verification can be added later."
          title="References"
        >
          <Text style={styles.muted}>References are represented as a placeholder and are not verified in this foundation step.</Text>
        </WidgetCard>

        <Modal transparent visible={Boolean(placeholderMessage)} animationType="fade">
          <Pressable style={styles.modalBackdrop} onPress={() => setPlaceholderMessage(null)}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Caregiver action</Text>
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
  assignedCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 180
  },
  assignedIcon: {
    alignItems: "center",
    backgroundColor: colors.status.successSoft,
    borderRadius: 16,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  assignedList: {
    gap: spacing.md
  },
  assignedRow: {
    alignItems: "center",
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    padding: spacing.md
  },
  assignedTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "900"
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
  muted: {
    color: colors.text.muted,
    fontSize: 15,
    lineHeight: 22
  },
  root: {
    backgroundColor: colors.background.app,
    flex: 1
  }
});
