import { StyleSheet, Text, View } from "react-native";

import { CaregiverAssignmentPermissions } from "@/components/caregiver/CaregiverAssignmentPermissions";
import { AppIcon, QuickActionButton, StatusPill } from "@/components/ui";
import { caregiverAssignmentStatusLabels } from "@/constants/caregiver-assignments";
import { careProfileTypeLabels } from "@/constants/care-profiles";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import { countGrantedCaregiverPermissions, summarizeCaregiverPermissions } from "@/lib/caregiver-assignments";
import type {
  CaregiverAssignment,
  CaregiverAssignmentPermissionKey
} from "@/types/caregiver-assignments";

type CaregiverAssignmentCardProps = {
  assignment: CaregiverAssignment;
  onCall?: (assignment: CaregiverAssignment) => void;
  onEmail?: (assignment: CaregiverAssignment) => void;
  onManagePermissions?: (assignment: CaregiverAssignment) => void;
  onOpenProfile?: (assignment: CaregiverAssignment) => void;
  onPermissionChange?: (assignment: CaregiverAssignment, permissionKey: CaregiverAssignmentPermissionKey, enabled: boolean) => void;
  onRevoke?: (assignment: CaregiverAssignment) => void;
  showPermissionToggles?: boolean;
};

function getStatusTone(status: CaregiverAssignment["status"]) {
  if (status === "active") {
    return "success" as const;
  }

  if (status === "revoked") {
    return "emergency" as const;
  }

  return "warning" as const;
}

export function CaregiverAssignmentCard({
  assignment,
  onCall,
  onEmail,
  onManagePermissions,
  onOpenProfile,
  onPermissionChange,
  onRevoke,
  showPermissionToggles = false
}: CaregiverAssignmentCardProps) {
  const permissionCount = countGrantedCaregiverPermissions(assignment.permissions);
  const permissionSummary = summarizeCaregiverPermissions(assignment.permissions);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconShell}>
          <AppIcon color={colors.status.success} name="caregiver" size={23} variant="filled" />
        </View>
        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{assignment.caregiverName ?? "Caregiver"}</Text>
            <StatusPill label={caregiverAssignmentStatusLabels[assignment.status]} tone={getStatusTone(assignment.status)} />
          </View>
          <Text style={styles.meta}>
            Assigned to {assignment.careProfileName ?? "care profile"}
            {assignment.circleName ? ` in ${assignment.circleName}` : ""}
          </Text>
          <Text style={styles.meta}>Assigned-only access. No full Family/Care Circle browsing.</Text>
          <View style={styles.badges}>
            {assignment.careProfileType ? <StatusPill label={careProfileTypeLabels[assignment.careProfileType]} tone="ai" /> : null}
            <StatusPill label={`${permissionCount} granted`} tone="success" />
            <StatusPill label={`${assignment.auditLog.length} audit placeholders`} />
            {assignment.permissions.canUseEmergencyButton || assignment.permissions.canViewEmergencyContacts ? (
              <StatusPill label="Emergency logged" tone="warning" />
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Permission summary</Text>
        <Text style={styles.summaryText}>{permissionSummary}</Text>
        <Text style={styles.meta}>Sensitive adult/private health information remains hidden unless explicitly granted.</Text>
      </View>

      {assignment.startDate || assignment.endDate ? (
        <View style={styles.dateRow}>
          {assignment.startDate ? <StatusPill label={`Starts ${assignment.startDate}`} /> : null}
          {assignment.endDate ? <StatusPill label={`Ends ${assignment.endDate}`} tone="warning" /> : null}
        </View>
      ) : null}

      {showPermissionToggles && onPermissionChange ? (
        <CaregiverAssignmentPermissions
          onChange={(permissionKey, enabled) => onPermissionChange(assignment, permissionKey, enabled)}
          permissions={assignment.permissions}
        />
      ) : null}

      <View style={styles.actions}>
        {assignment.caregiverPhone ? (
          <QuickActionButton
            icon={<AppIcon color={colors.status.success} name="emergency" size={18} />}
            label="Call"
            onPress={() => onCall?.(assignment)}
            toneColor={colors.status.success}
          />
        ) : null}
        {assignment.caregiverEmail ? (
          <QuickActionButton
            icon={<AppIcon color={colors.brand.primary} name="notifications" size={18} />}
            label="Email"
            onPress={() => onEmail?.(assignment)}
            toneColor={colors.brand.primary}
          />
        ) : null}
        <QuickActionButton
          icon={<AppIcon color={colors.status.ai} name="settings" size={18} />}
          label="Manage permissions"
          onPress={() => onManagePermissions?.(assignment)}
          toneColor={colors.status.ai}
        />
        <QuickActionButton
          icon={<AppIcon color={colors.brand.primary} name="profiles" size={18} />}
          label="Open profile"
          onPress={() => onOpenProfile?.(assignment)}
          toneColor={colors.brand.primary}
        />
        <QuickActionButton
          icon={<AppIcon color={colors.status.emergency} name="lock" size={18} />}
          label="Revoke access"
          onPress={() => onRevoke?.(assignment)}
          toneColor={colors.status.emergency}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs
  },
  card: {
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 210
  },
  dateRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  iconShell: {
    alignItems: "center",
    backgroundColor: colors.status.successSoft,
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  meta: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20
  },
  summaryBox: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md
  },
  summaryLabel: {
    color: colors.text.muted,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  summaryText: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21
  },
  title: {
    color: colors.text.primary,
    flex: 1,
    fontSize: 18,
    fontWeight: "900"
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  }
});
