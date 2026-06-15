import type { CareProfileType } from "@/types/care-profiles";

export type CaregiverAssignmentStatus =
  | "active"
  | "paused"
  | "revoked"
  | "pending";

export type CaregiverAssignmentPermissionKey =
  | "canViewCareInstructions"
  | "canViewSchedule"
  | "canLogActivity"
  | "canUploadPhotos"
  | "canUseEmergencyButton"
  | "canViewEmergencyContacts"
  | "canViewMedicationReminders"
  | "canViewBasicConditions"
  | "canReceiveParentNotes";

export type CaregiverAssignmentPermissions = Record<
  CaregiverAssignmentPermissionKey,
  boolean
>;

export type CaregiverAssignmentPreset =
  | "basic_care"
  | "emergency_ready"
  | "medication_support"
  | "full_assigned_care"
  | "custom";

export type CaregiverAssignmentAuditEvent = {
  id: string;
  assignmentId: string;
  permissionKey?: CaregiverAssignmentPermissionKey;
  action: "created" | "permission_changed" | "revoked" | "paused" | "resumed";
  createdAt: string;
  createdByProfileId: string;
  note: string;
  source: "placeholder";
};

export type AssignedCareProfileSummary = {
  id: string;
  displayName: string;
  profileType: CareProfileType;
  circleName: string;
  status: "ready" | "needs_review" | "placeholder";
  grantedPermissionCount?: number;
};

export type CaregiverAssignment = {
  id: string;
  circleId: string;
  circleName?: string;
  careProfileId: string;
  careProfileName?: string;
  careProfileType?: CareProfileType;
  caregiverProfileId: string;
  caregiverName?: string;
  caregiverEmail?: string | null;
  caregiverPhone?: string | null;
  assignedByProfileId: string;
  status: CaregiverAssignmentStatus;
  permissions: CaregiverAssignmentPermissions;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  auditLog: CaregiverAssignmentAuditEvent[];
  source: "placeholder";
};

export type CreateCaregiverAssignmentInput = {
  circleId: string;
  circleName?: string;
  careProfileId: string;
  careProfileName?: string;
  careProfileType?: CareProfileType;
  caregiverProfileId: string;
  caregiverName?: string;
  caregiverEmail?: string | null;
  caregiverPhone?: string | null;
  assignedByProfileId: string;
  permissionPreset: CaregiverAssignmentPreset;
  notes?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};
