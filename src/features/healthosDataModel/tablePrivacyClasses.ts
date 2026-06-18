export type HealthOSTablePrivacyClass =
  | "publicReference"
  | "userPrivate"
  | "familyShared"
  | "childParentManaged"
  | "caregiverLimited"
  | "systemPrivate"
  | "adminOnly"
  | "unknown";

export type HealthOSBackendReadiness =
  | "ready"
  | "partial"
  | "uiOnly"
  | "schemaMissing"
  | "rlsMissing"
  | "storageMissing"
  | "handlerMissing"
  | "unknown";

export function getTablePrivacyLabel(privacyClass: HealthOSTablePrivacyClass) {
  const labels: Record<HealthOSTablePrivacyClass, string> = {
    adminOnly: "Admin only",
    caregiverLimited: "Caregiver limited",
    childParentManaged: "Child parent-managed",
    familyShared: "Family shared",
    publicReference: "Public reference",
    systemPrivate: "System private",
    unknown: "Unknown",
    userPrivate: "User private",
  };
  return labels[privacyClass];
}

export function isSensitivePrivacyClass(
  privacyClass: HealthOSTablePrivacyClass,
) {
  return privacyClass !== "publicReference";
}

export function getBackendReadinessLabel(readiness: HealthOSBackendReadiness) {
  const labels: Record<HealthOSBackendReadiness, string> = {
    handlerMissing: "Handler missing",
    partial: "Partial",
    ready: "Ready",
    rlsMissing: "RLS missing",
    schemaMissing: "Schema missing",
    storageMissing: "Storage missing",
    uiOnly: "UI only",
    unknown: "Unknown",
  };
  return labels[readiness];
}

export function isBackendReleaseBlocker(readiness: HealthOSBackendReadiness) {
  return (
    readiness === "schemaMissing" ||
    readiness === "rlsMissing" ||
    readiness === "storageMissing" ||
    readiness === "handlerMissing" ||
    readiness === "unknown"
  );
}
