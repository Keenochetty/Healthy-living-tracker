import { circlePermissionLabels } from "@/constants/circles";
import type { CircleInvite, InviteMethod, InvitePermissionPreset } from "@/types/invites";

export const INVITE_METHODS = [
  "share_link",
  "qr_placeholder",
  "email",
  "sms_whatsapp_placeholder"
] as const satisfies readonly InviteMethod[];

export const inviteMethodLabels = {
  email: "Email",
  qr_placeholder: "QR placeholder",
  share_link: "Share link",
  sms_whatsapp_placeholder: "SMS / WhatsApp"
} as const satisfies Record<InviteMethod, string>;

export const inviteMethodDescriptions = {
  email: "Send an email invite later when backend delivery is connected.",
  qr_placeholder: "Reserve space for QR invites without generating a real QR code yet.",
  share_link: "Generate a placeholder invite link that can be copied or shared.",
  sms_whatsapp_placeholder: "Prepare SMS or WhatsApp sharing without real native share integration."
} as const satisfies Record<InviteMethod, string>;

export const INVITE_PERMISSION_PRESETS = [
  "adult_family_member",
  "parent_guardian",
  "caregiver",
  "viewer",
  "custom"
] as const satisfies readonly InvitePermissionPreset[];

export const invitePermissionPresetLabels = {
  adult_family_member: "Adult family member",
  caregiver: "Caregiver",
  custom: "Custom",
  parent_guardian: "Parent / Guardian",
  viewer: "Viewer"
} as const satisfies Record<InvitePermissionPreset, string>;

export const invitePermissionPresetDescriptions = {
  adult_family_member: "Can see shared calendar and shared updates. Private health data is not shared by default.",
  caregiver: "Assigned-only access will be configured after acceptance. No full family access.",
  custom: "Placeholder for manual permission toggles.",
  parent_guardian: "Can manage dependents, child emergency info, and child schedules.",
  viewer: "Read-only access to shared circle updates."
} as const satisfies Record<InvitePermissionPreset, string>;

export const invitePermissionPresetDetails = {
  adult_family_member: ["View shared calendar", "View shared updates", "No private health access"],
  caregiver: ["Assigned-only access", "No full family access", "Care profiles assigned later"],
  custom: ["Manual toggles placeholder", "Admin reviews before acceptance"],
  parent_guardian: ["Manage dependents", "View child emergency info", "Manage child schedule"],
  viewer: ["Read-only shared circle updates"]
} as const satisfies Record<InvitePermissionPreset, readonly string[]>;

export const invitePermissionPresetDefaults = {
  adult_family_member: ["view_safe_summary"],
  caregiver: ["view_safe_summary"],
  custom: ["view_safe_summary"],
  parent_guardian: ["manage_dependents", "view_safe_summary"],
  viewer: ["view_safe_summary"]
} as const satisfies Record<InvitePermissionPreset, readonly CircleInvite["defaultPermissions"][number][]>;

export function formatInvitePermissions(permissions: CircleInvite["defaultPermissions"]) {
  return permissions.map((permission) => circlePermissionLabels[permission]).join(", ");
}
