import type { CirclePermissionKey, CircleRole } from "@/types/circle";
import { CIRCLE_PERMISSION_LABELS } from "./permissionLabels";

export type CircleRoleDefinition = {
  defaultPermissions: CirclePermissionKey[];
  description: string;
  emoji: string;
  key: CircleRole;
  label: string;
  privacyNote: string;
};

export { CIRCLE_PERMISSION_LABELS };

const scheduleSharing: CirclePermissionKey[] = ["view_profile", "view_schedule"];

export const CIRCLE_ROLES: CircleRoleDefinition[] = [
  {
    defaultPermissions: [...scheduleSharing, "add_schedule", "view_emergency_contacts"],
    description: "A trusted partner with shared planning access.",
    emoji: "💜",
    key: "partner",
    label: "Partner",
    privacyNote: "Health records stay private unless you explicitly share them."
  },
  {
    defaultPermissions: [...scheduleSharing, "add_schedule", "view_emergency_contacts"],
    description: "A spouse with shared planning access.",
    emoji: "💍",
    key: "spouse",
    label: "Spouse",
    privacyNote: "Health records stay private unless you explicitly share them."
  },
  {
    defaultPermissions: [...scheduleSharing],
    description: "A trusted friend who can see selected planning details.",
    emoji: "🤗",
    key: "close_friend",
    label: "Close friend",
    privacyNote: "Only the schedule and profile basics are shared by default."
  },
  {
    defaultPermissions: [...scheduleSharing, "view_emergency_contacts"],
    description: "A parent with access to shared planning details.",
    emoji: "🌱",
    key: "parent",
    label: "Parent",
    privacyNote: "Child profile access remains parent-controlled and must be granted separately."
  },
  {
    defaultPermissions: [...scheduleSharing],
    description: "A grandparent with access to selected family planning details.",
    emoji: "🌼",
    key: "grandparent",
    label: "Grandparent",
    privacyNote: "Private health and child-care details are not shared by default."
  },
  {
    defaultPermissions: ["view_profile"],
    description: "A child account with age-appropriate shared access.",
    emoji: "🧒",
    key: "child",
    label: "Child",
    privacyNote: "A parent or guardian controls child profile permissions."
  },
  {
    defaultPermissions: [...scheduleSharing],
    description: "An adult child helping with family coordination.",
    emoji: "🌿",
    key: "adult_child",
    label: "Adult child",
    privacyNote: "Health and elder-care records require explicit permission."
  },
  {
    defaultPermissions: ["view_profile", "view_schedule", "add_care_notes"],
    description: "A caregiver who can work only with assigned care information.",
    emoji: "🤝",
    key: "caregiver",
    label: "Caregiver",
    privacyNote: "Caregiver access is limited to assigned care information."
  },
  {
    defaultPermissions: [...scheduleSharing],
    description: "An elder family member with simple shared planning access.",
    emoji: "🌳",
    key: "elder",
    label: "Elder",
    privacyNote: "Health and care details remain private unless explicitly shared."
  },
  {
    defaultPermissions: [...scheduleSharing],
    description: "Another trusted family member with selected planning access.",
    emoji: "🏡",
    key: "other_family",
    label: "Other family",
    privacyNote: "Health records stay private unless you explicitly share them."
  }
];

export function getCircleRoleDefinition(role: CircleRole) {
  return CIRCLE_ROLES.find((definition) => definition.key === role) ?? CIRCLE_ROLES[0];
}
