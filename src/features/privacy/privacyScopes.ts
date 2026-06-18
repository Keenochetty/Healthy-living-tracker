export type HealthOSPrivacyScopeKey =
  | "private"
  | "selectedFamily"
  | "familyCircle"
  | "caregiverLimited"
  | "careTeam"
  | "emergencyOnly"
  | "publicReference"
  | "unknown";

export type HealthOSPrivacyScope = {
  key: HealthOSPrivacyScopeKey;
  label: string;
  description: string;
  sensitive: boolean;
  requiresExplicitPermission: boolean;
  defaultShare: boolean;
};

export const healthOSPrivacyScopes: Record<
  HealthOSPrivacyScopeKey,
  HealthOSPrivacyScope
> = {
  private: {
    key: "private",
    label: "Private",
    description: "Visible only to the owning account unless explicitly shared.",
    sensitive: true,
    requiresExplicitPermission: true,
    defaultShare: false,
  },
  selectedFamily: {
    key: "selectedFamily",
    label: "Selected family",
    description: "Visible only to selected family members with a matching permission.",
    sensitive: true,
    requiresExplicitPermission: true,
    defaultShare: false,
  },
  familyCircle: {
    key: "familyCircle",
    label: "Family circle",
    description: "Visible inside an approved family circle for non-sensitive shared updates.",
    sensitive: true,
    requiresExplicitPermission: true,
    defaultShare: false,
  },
  caregiverLimited: {
    key: "caregiverLimited",
    label: "Caregiver limited",
    description: "Visible to assigned caregivers only for the specific care task granted.",
    sensitive: true,
    requiresExplicitPermission: true,
    defaultShare: false,
  },
  careTeam: {
    key: "careTeam",
    label: "Care team",
    description: "Visible to explicitly approved care-team participants.",
    sensitive: true,
    requiresExplicitPermission: true,
    defaultShare: false,
  },
  emergencyOnly: {
    key: "emergencyOnly",
    label: "Emergency only",
    description: "Visible only in emergency packet contexts or emergency access flows.",
    sensitive: true,
    requiresExplicitPermission: true,
    defaultShare: false,
  },
  publicReference: {
    key: "publicReference",
    label: "Public reference",
    description: "Non-personal reference content that does not contain private health data.",
    sensitive: false,
    requiresExplicitPermission: false,
    defaultShare: true,
  },
  unknown: {
    key: "unknown",
    label: "Unknown",
    description: "Treat as private until the data ownership and sharing model is confirmed.",
    sensitive: true,
    requiresExplicitPermission: true,
    defaultShare: false,
  },
};

export function getPrivacyScope(scope: HealthOSPrivacyScopeKey) {
  return healthOSPrivacyScopes[scope] ?? healthOSPrivacyScopes.unknown;
}
