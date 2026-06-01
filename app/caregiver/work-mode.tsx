import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";

import {
  AppHeader,
  AppScreen,
  BottomSheet,
  ChildAvatar,
  EmergencyButton,
  QuickActionButton,
  StatusPill,
  WidgetCard
} from "@/components/ui";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import { createActivityLog, type ActivityType } from "@/lib/activity-logs";
import { getErrorMessage } from "@/lib/errors";
import {
  getChildAge,
  getChildFullName,
  listAssignedCaregiverChildren,
  openChildProfile,
  type AssignedCaregiverChild
} from "@/lib/children";

type CareQuickAction = {
  activityType: ActivityType;
  label: string;
  notificationType: "blue_calendar_activity" | "green_normal_update" | "orange_important_health" | "purple_ai_suggestion" | "red_emergency" | "yellow_attention";
  toneColor: string;
};

const quickActions: CareQuickAction[] = [
  { activityType: "feed", label: "Feed", notificationType: "green_normal_update", toneColor: colors.status.success },
  { activityType: "nap", label: "Nap", notificationType: "green_normal_update", toneColor: colors.status.success },
  { activityType: "medication", label: "Medication", notificationType: "orange_important_health", toneColor: colors.accent.coral },
  { activityType: "mood", label: "Mood", notificationType: "yellow_attention", toneColor: colors.status.warning },
  { activityType: "activity", label: "Activity", notificationType: "green_normal_update", toneColor: colors.status.success },
  { activityType: "incident", label: "Incident", notificationType: "orange_important_health", toneColor: colors.accent.coral },
  { activityType: "photo_update", label: "Photo", notificationType: "purple_ai_suggestion", toneColor: colors.status.ai },
  { activityType: "note", label: "Note", notificationType: "blue_calendar_activity", toneColor: colors.brand.primary },
  { activityType: "emergency", label: "Emergency", notificationType: "red_emergency", toneColor: colors.status.emergency }
];

function getAssignmentStatus(assignment: AssignedCaregiverChild) {
  if (!assignment.access.can_use_emergency_button) {
    return { label: "Needs attention", tone: "warning" as const };
  }

  if (!assignment.access.can_log_activity) {
    return { label: "View only", tone: "default" as const };
  }

  return { label: "All good", tone: "success" as const };
}

function getActionByType(activityType: ActivityType) {
  return quickActions.find((action) => action.activityType === activityType) ?? quickActions[4];
}

export default function CaregiverWorkModeScreen() {
  const [assignedChildren, setAssignedChildren] = useState<AssignedCaregiverChild[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignedCaregiverChild | null>(null);
  const [selectedAction, setSelectedAction] = useState<CareQuickAction | null>(null);
  const [activityNote, setActivityNote] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);

  const loadAssignedChildren = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextChildren = await listAssignedCaregiverChildren();
      setAssignedChildren(nextChildren);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Unable to load caregiver assignments."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      loadAssignedChildren();
    }, 0);

    return () => {
      clearTimeout(loadTimer);
    };
  }, [loadAssignedChildren]);

  function openLogSheet(assignment: AssignedCaregiverChild, action: CareQuickAction) {
    if (!assignment.access.can_log_activity && action.activityType !== "emergency") {
      setErrorMessage("You do not have permission to log activity for this child.");
      return;
    }

    setSelectedAssignment(assignment);
    setSelectedAction(action);
    setActivityNote("");
    setErrorMessage(null);
    setNotice(null);
  }

  async function handleCreateActivityLog() {
    if (!selectedAssignment || !selectedAction) {
      return;
    }

    if (!selectedAssignment.access.can_log_activity && selectedAction.activityType !== "emergency") {
      setErrorMessage("You do not have permission to log activity for this child.");
      return;
    }

    setIsCreatingActivity(true);
    setErrorMessage(null);
    setNotice(null);

    try {
      await createActivityLog({
        activityType: selectedAction.activityType,
        childId: selectedAssignment.child.id,
        familyId: selectedAssignment.child.family_id,
        isSharedWithCaregiver: false,
        isSharedWithParents: true,
        note: activityNote,
        notificationType: selectedAction.notificationType,
        title: `${selectedAction.label} update`
      });
      setNotice(`${selectedAction.label} update sent to parents/guardians.`);
      setSelectedAction(null);
      setSelectedAssignment(null);
      setActivityNote("");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Unable to create activity log."));
    } finally {
      setIsCreatingActivity(false);
    }
  }

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Caregiver work mode"
        subtitle="Assigned children, quick logs, care highlights, and emergency actions."
        title="Today's Care"
      />

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {isLoading ? <ActivityIndicator /> : null}

      {!isLoading && assignedChildren.length === 0 ? (
        <WidgetCard title="No assigned children" subtitle="Parents or guardians can grant child access by caregiver email.">
          <Text style={styles.muted}>Assigned children will appear here with schedule and care permissions.</Text>
        </WidgetCard>
      ) : null}

      <View style={styles.cards}>
        {assignedChildren.map((assignment) => {
          const { access, child } = assignment;
          const childName = getChildFullName(child);
          const status = getAssignmentStatus(assignment);

          return (
            <WidgetCard
              accentColor={status.tone === "success" ? colors.status.success : colors.status.warning}
              key={child.id}
              onPress={() => openChildProfile(child.id, "caregiver")}
            >
              <View style={styles.cardHeader}>
                <ChildAvatar name={childName} size={64} subtitle={getChildAge(child.date_of_birth)} />
                <StatusPill label={status.label} tone={status.tone} />
              </View>

              <View style={styles.highlightRow}>
                <StatusPill label="Condition highlights" tone="default" />
                <StatusPill label={access.can_view_care_instructions ? "Allergy badge" : "Allergies hidden"} tone="warning" />
                <StatusPill label="Schedule" tone="default" />
              </View>

              <View style={styles.detailPanel}>
                <Text style={styles.detailLabel}>Today schedule</Text>
                <Text style={styles.detailText}>{access.can_view_schedule ? "No schedule added yet" : "Schedule hidden"}</Text>
                <Text style={styles.detailLabel}>Last update</Text>
                <Text style={styles.detailText}>No caregiver update logged yet</Text>
                <Text style={styles.detailLabel}>Care instruction</Text>
                <Text style={styles.detailText}>
                  {access.can_view_care_instructions ? "Quick care instruction placeholder" : "Care instructions hidden"}
                </Text>
              </View>

              <View style={styles.quickActions}>
                {quickActions.map((action) => (
                  <QuickActionButton
                    key={action.activityType}
                    label={action.label}
                    onPress={() => openLogSheet(assignment, action)}
                    toneColor={action.toneColor}
                  />
                ))}
              </View>

              <View style={styles.primaryActions}>
                <EmergencyButton
                  label="Emergency"
                  onPress={() => openLogSheet(assignment, getActionByType("emergency"))}
                />
                <QuickActionButton
                  label="Log activity"
                  onPress={() => openLogSheet(assignment, getActionByType("activity"))}
                  toneColor={colors.status.success}
                />
              </View>
            </WidgetCard>
          );
        })}
      </View>

      <QuickActionButton label="Refresh assignments" onPress={loadAssignedChildren} toneColor={colors.brand.primary} />

      <BottomSheet
        footer={
          isCreatingActivity ? (
            <ActivityIndicator />
          ) : (
            <QuickActionButton
              label={`Send ${selectedAction?.label ?? "activity"} update`}
              onPress={handleCreateActivityLog}
              toneColor={selectedAction?.toneColor ?? colors.brand.primary}
            />
          )
        }
        onClose={() => {
          setSelectedAction(null);
          setSelectedAssignment(null);
          setActivityNote("");
        }}
        title={selectedAction ? `${selectedAction.label} update` : undefined}
        visible={Boolean(selectedAction && selectedAssignment)}
      >
        {selectedAssignment && selectedAction ? (
          <View style={styles.sheetContent}>
            <ChildAvatar
              name={getChildFullName(selectedAssignment.child)}
              size={52}
              subtitle={`${getChildAge(selectedAssignment.child.date_of_birth)} • Parents will be notified`}
            />
            <StatusPill
              label={
                selectedAction.activityType === "emergency"
                  ? "red = emergency"
                  : selectedAction.notificationType === "yellow_attention"
                    ? "yellow = needs attention"
                    : selectedAction.notificationType === "orange_important_health"
                      ? "orange = important"
                      : selectedAction.notificationType === "blue_calendar_activity"
                        ? "blue = schedule"
                        : "green = all good"
              }
              tone={
                selectedAction.activityType === "emergency"
                  ? "emergency"
                  : selectedAction.notificationType === "yellow_attention"
                    ? "warning"
                    : selectedAction.notificationType === "orange_important_health"
                      ? "warning"
                      : "success"
              }
            />
            <TextInput
              multiline
              onChangeText={setActivityNote}
              placeholder="Add a short caregiver note"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
              value={activityNote}
            />
          </View>
        ) : null}
      </BottomSheet>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  cards: {
    gap: spacing.lg
  },
  detailLabel: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: "800"
  },
  detailPanel: {
    backgroundColor: colors.background.mist,
    borderColor: colors.border.soft,
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.lg
  },
  detailText: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm
  },
  error: {
    color: colors.status.emergency,
    fontSize: 14,
    fontWeight: "700"
  },
  highlightRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  input: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 18,
    borderWidth: 1,
    color: colors.text.primary,
    minHeight: 120,
    padding: spacing.lg,
    textAlignVertical: "top"
  },
  muted: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20
  },
  notice: {
    color: colors.status.success,
    fontSize: 14,
    fontWeight: "700"
  },
  primaryActions: {
    gap: spacing.sm
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  sheetContent: {
    gap: spacing.lg
  }
});
