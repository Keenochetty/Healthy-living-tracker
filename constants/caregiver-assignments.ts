import type {
  CaregiverAssignmentPermissionKey,
  CaregiverAssignmentPermissions,
  CaregiverAssignmentPreset,
  CaregiverAssignmentStatus
} from "@/types/caregiver-assignments";

export const CAREGIVER_ASSIGNMENT_PERMISSION_KEYS = [
  "canViewCareInstructions",
  "canViewSchedule",
  "canLogActivity",
  "canUploadPhotos",
  "canUseEmergencyButton",
  "canViewEmergencyContacts",
  "canViewMedicationReminders",
  "canViewBasicConditions",
  "canReceiveParentNotes"
] as const satisfies readonly CaregiverAssignmentPermissionKey[];

export const CAREGIVER_ASSIGNMENT_PRESETS = [
  "basic_care",
  "emergency_ready",
  "medication_support",
  "full_assigned_care",
  "custom"
] as const satisfies readonly CaregiverAssignmentPreset[];

export const caregiverAssignmentStatusLabels = {
  active: "Active",
  paused: "Paused",
  pending: "Pending",
  revoked: "Revoked"
} as const satisfies Record<CaregiverAssignmentStatus, string>;

export const caregiverAssignmentPermissionLabels = {
  canLogActivity: "Log activity",
  canReceiveParentNotes: "Receive parent notes",
  canUploadPhotos: "Upload photos",
  canUseEmergencyButton: "Use emergency button",
  canViewBasicConditions: "View basic conditions",
  canViewCareInstructions: "View care instructions",
  canViewEmergencyContacts: "View emergency contacts",
  canViewMedicationReminders: "View medication reminders",
  canViewSchedule: "View schedule"
} as const satisfies Record<CaregiverAssignmentPermissionKey, string>;

export const caregiverAssignmentPermissionDescriptions = {
  canLogActivity: "Allow routine activity logs for this assigned profile.",
  canReceiveParentNotes: "Allow parent-approved handoff notes.",
  canUploadPhotos: "Allow photo updates for approved family review.",
  canUseEmergencyButton: "Allow urgent action access. Emergency usage should be logged.",
  canViewBasicConditions: "Allow basic condition names needed for safe care.",
  canViewCareInstructions: "Allow routines, handoff notes, and care instructions.",
  canViewEmergencyContacts: "Allow approved emergency contacts.",
  canViewMedicationReminders: "Allow reminder-level medication support, not full medication history.",
  canViewSchedule: "Allow assigned schedule and care timing visibility."
} as const satisfies Record<CaregiverAssignmentPermissionKey, string>;

export const caregiverAssignmentPermissionGroups = {
  basics: ["canViewCareInstructions", "canViewSchedule", "canLogActivity", "canReceiveParentNotes"],
  emergency: ["canUseEmergencyButton", "canViewEmergencyContacts", "canViewBasicConditions"],
  healthSupport: ["canViewMedicationReminders"],
  updates: ["canUploadPhotos"]
} as const satisfies Record<string, readonly CaregiverAssignmentPermissionKey[]>;

export const caregiverAssignmentPermissionGroupLabels = {
  basics: "Basic Care",
  emergency: "Emergency",
  healthSupport: "Health Support",
  updates: "Updates"
} as const satisfies Record<keyof typeof caregiverAssignmentPermissionGroups, string>;

export const emptyCaregiverAssignmentPermissions: CaregiverAssignmentPermissions = {
  canLogActivity: false,
  canReceiveParentNotes: false,
  canUploadPhotos: false,
  canUseEmergencyButton: false,
  canViewBasicConditions: false,
  canViewCareInstructions: false,
  canViewEmergencyContacts: false,
  canViewMedicationReminders: false,
  canViewSchedule: false
};

export const caregiverAssignmentPresetLabels = {
  basic_care: "Basic Care",
  custom: "Custom",
  emergency_ready: "Emergency Ready",
  full_assigned_care: "Full Assigned Care",
  medication_support: "Medication Support"
} as const satisfies Record<CaregiverAssignmentPreset, string>;

export const caregiverAssignmentPresetDescriptions = {
  basic_care: "Care instructions, schedule, and activity logging for one assigned profile.",
  custom: "Start from no permissions and choose each granted field.",
  emergency_ready: "Basic care plus emergency contacts, emergency button, and basic conditions.",
  full_assigned_care: "All assigned-care permissions. Still no full family or private adult record browsing.",
  medication_support: "Basic care plus reminder-level medication support."
} as const satisfies Record<CaregiverAssignmentPreset, string>;

export const caregiverAssignmentPresetPermissions = {
  basic_care: {
    ...emptyCaregiverAssignmentPermissions,
    canLogActivity: true,
    canViewCareInstructions: true,
    canViewSchedule: true
  },
  custom: {
    ...emptyCaregiverAssignmentPermissions
  },
  emergency_ready: {
    ...emptyCaregiverAssignmentPermissions,
    canLogActivity: true,
    canUseEmergencyButton: true,
    canViewBasicConditions: true,
    canViewCareInstructions: true,
    canViewEmergencyContacts: true,
    canViewSchedule: true
  },
  full_assigned_care: Object.fromEntries(CAREGIVER_ASSIGNMENT_PERMISSION_KEYS.map((key) => [key, true])) as CaregiverAssignmentPermissions,
  medication_support: {
    ...emptyCaregiverAssignmentPermissions,
    canLogActivity: true,
    canViewCareInstructions: true,
    canViewMedicationReminders: true,
    canViewSchedule: true
  }
} as const satisfies Record<CaregiverAssignmentPreset, CaregiverAssignmentPermissions>;
