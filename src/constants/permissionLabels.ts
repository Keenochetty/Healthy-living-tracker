import type { CirclePermissionKey } from "@/types/circle";

export type CirclePermissionDefinition = {
  description: string;
  key: CirclePermissionKey;
  label: string;
};

export const CIRCLE_PERMISSION_DEFINITIONS: Record<
  CirclePermissionKey,
  CirclePermissionDefinition
> = {
  add_care_notes: {
    description: "Can add care notes for assigned care tasks.",
    key: "add_care_notes",
    label: "Add care notes"
  },
  add_health_updates: {
    description: "Can add updates, but cannot see private records unless approved.",
    key: "add_health_updates",
    label: "Add health updates"
  },
  add_schedule: {
    description: "Can add shared calendar items and reminders.",
    key: "add_schedule",
    label: "Add schedule"
  },
  emergency_access: {
    description: "Can see emergency details in urgent situations.",
    key: "emergency_access",
    label: "Emergency access"
  },
  manage_child_profile: {
    description: "Can manage child profile details when a parent allows it.",
    key: "manage_child_profile",
    label: "Manage child profile"
  },
  manage_elder_profile: {
    description: "Can manage elder-care profile details when assigned.",
    key: "manage_elder_profile",
    label: "Manage elder profile"
  },
  upload_documents: {
    description: "Can upload documents for review by the circle admin.",
    key: "upload_documents",
    label: "Upload documents"
  },
  view_allergies: {
    description: "Can see allergy information only if approved.",
    key: "view_allergies",
    label: "View allergies"
  },
  view_emergency_contacts: {
    description: "Can see emergency contacts shared with this circle.",
    key: "view_emergency_contacts",
    label: "View emergency contacts"
  },
  view_health_summary: {
    description: "Can see a limited health summary only if approved.",
    key: "view_health_summary",
    label: "View health summary"
  },
  view_medications: {
    description: "Can see medication information only if approved.",
    key: "view_medications",
    label: "View medications"
  },
  view_profile: {
    description: "Can see basic profile details shared with the circle.",
    key: "view_profile",
    label: "View profile"
  },
  view_schedule: {
    description: "Can see shared calendar items.",
    key: "view_schedule",
    label: "View schedule"
  }
};

export const CIRCLE_PERMISSION_LABELS: Record<CirclePermissionKey, string> =
  Object.fromEntries(
    Object.entries(CIRCLE_PERMISSION_DEFINITIONS).map(([key, value]) => [
      key,
      value.label
    ])
  ) as Record<CirclePermissionKey, string>;
