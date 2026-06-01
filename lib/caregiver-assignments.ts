import {
  CAREGIVER_ASSIGNMENT_PERMISSION_KEYS,
  caregiverAssignmentPermissionLabels,
  caregiverAssignmentPresetPermissions
} from "@/constants/caregiver-assignments";
import type {
  CaregiverAssignment,
  CaregiverAssignmentAuditEvent,
  CaregiverAssignmentPermissionKey,
  CaregiverAssignmentPermissions,
  CaregiverAssignmentPreset,
  CreateCaregiverAssignmentInput
} from "@/types/caregiver-assignments";

export function buildCaregiverAssignmentPermissions(preset: CaregiverAssignmentPreset): CaregiverAssignmentPermissions {
  return { ...caregiverAssignmentPresetPermissions[preset] };
}

export function countGrantedCaregiverPermissions(permissions: CaregiverAssignmentPermissions) {
  return CAREGIVER_ASSIGNMENT_PERMISSION_KEYS.filter((key) => permissions[key]).length;
}

export function summarizeCaregiverPermissions(permissions: CaregiverAssignmentPermissions, limit = 3) {
  const granted = CAREGIVER_ASSIGNMENT_PERMISSION_KEYS.filter((key) => permissions[key]);

  if (granted.length === 0) {
    return "No permissions granted yet";
  }

  const labels = granted.slice(0, limit).map((key) => caregiverAssignmentPermissionLabels[key]);
  const remaining = granted.length - labels.length;

  return remaining > 0 ? `${labels.join(", ")} +${remaining} more` : labels.join(", ");
}

export function canCaregiverAccessAssignment(permissions: CaregiverAssignmentPermissions, permissionKey: CaregiverAssignmentPermissionKey) {
  return permissions[permissionKey];
}

export function createCaregiverAssignmentAuditEvent(
  assignmentId: string,
  action: CaregiverAssignmentAuditEvent["action"],
  createdByProfileId: string,
  note: string,
  permissionKey?: CaregiverAssignmentPermissionKey
): CaregiverAssignmentAuditEvent {
  return {
    action,
    assignmentId,
    createdAt: new Date().toISOString(),
    createdByProfileId,
    id: `${assignmentId}-${action}-${Date.now().toString(36)}`,
    note,
    permissionKey,
    source: "placeholder"
  };
}

export function buildPlaceholderCaregiverAssignment(input: CreateCaregiverAssignmentInput): CaregiverAssignment {
  const now = new Date().toISOString();
  const id = `${input.careProfileId}-${input.caregiverProfileId}-assignment`;

  return {
    assignedByProfileId: input.assignedByProfileId,
    auditLog: [
      createCaregiverAssignmentAuditEvent(
        id,
        "created",
        input.assignedByProfileId,
        "Placeholder caregiver assignment created."
      )
    ],
    caregiverEmail: input.caregiverEmail ?? null,
    caregiverName: input.caregiverName ?? "Maya Stone",
    caregiverPhone: input.caregiverPhone ?? null,
    caregiverProfileId: input.caregiverProfileId,
    careProfileId: input.careProfileId,
    careProfileName: input.careProfileName,
    careProfileType: input.careProfileType,
    circleId: input.circleId,
    circleName: input.circleName,
    createdAt: now,
    endDate: input.endDate ?? null,
    id,
    notes: input.notes ?? null,
    permissions: buildCaregiverAssignmentPermissions(input.permissionPreset),
    source: "placeholder",
    startDate: input.startDate ?? now.slice(0, 10),
    status: "active",
    updatedAt: now
  };
}

export function updateCaregiverAssignmentPermission(
  assignment: CaregiverAssignment,
  permissionKey: CaregiverAssignmentPermissionKey,
  enabled: boolean,
  actorProfileId = "local-admin-profile"
): CaregiverAssignment {
  const note = `${caregiverAssignmentPermissionLabels[permissionKey]} ${enabled ? "enabled" : "disabled"}.`;

  return {
    ...assignment,
    auditLog: [
      createCaregiverAssignmentAuditEvent(assignment.id, "permission_changed", actorProfileId, note, permissionKey),
      ...assignment.auditLog
    ],
    permissions: {
      ...assignment.permissions,
      [permissionKey]: enabled
    },
    updatedAt: new Date().toISOString()
  };
}

export function revokeCaregiverAssignment(assignment: CaregiverAssignment, actorProfileId = "local-admin-profile"): CaregiverAssignment {
  return {
    ...assignment,
    auditLog: [
      createCaregiverAssignmentAuditEvent(assignment.id, "revoked", actorProfileId, "Caregiver access revoked."),
      ...assignment.auditLog
    ],
    status: "revoked",
    updatedAt: new Date().toISOString()
  };
}

export function getMockCaregiverAssignments(careProfileId = "placeholder-care-profile"): CaregiverAssignment[] {
  return [
    buildPlaceholderCaregiverAssignment({
      assignedByProfileId: "placeholder-admin-profile",
      caregiverEmail: "caregiver@example.com",
      caregiverName: "Maya Stone",
      caregiverPhone: "+1 555 014 2700",
      caregiverProfileId: "placeholder-caregiver-profile",
      careProfileId,
      careProfileName: "Selected care profile",
      careProfileType: "elderly_dependent",
      circleId: "placeholder-circle",
      circleName: "Dad's Care Circle",
      notes: "Assigned-only access. Sensitive adult/private health details remain hidden unless explicitly granted.",
      permissionPreset: "emergency_ready",
      startDate: "2026-06-01"
    })
  ];
}
