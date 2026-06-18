export type HealthOSBackendStatus =
  | "idle"
  | "loading"
  | "ready"
  | "missingAuth"
  | "missingTable"
  | "missingTypes"
  | "permissionDenied"
  | "storageDeferred"
  | "edgeFunctionMissing"
  | "reviewRequired"
  | "adminDeferred"
  | "deferred"
  | "error";

export type HealthOSBackendRiskLevel = "none" | "low" | "medium" | "high" | "blocked";

export type HealthOSServiceArea =
  | "account"
  | "careProfiles"
  | "familySharing"
  | "records"
  | "calendarReminders"
  | "medicationSafety"
  | "lifeStageHealth"
  | "aiImport"
  | "fitnessNutrition"
  | "trustedContent";

export type HealthOSTableGeneratedTypeStatus = "present" | "missing" | "unknown";
export type HealthOSServiceWiringStatus = "wired" | "deferred" | "missing" | "unknown";
export type HealthOSRouteWiringStatus = "wired" | "deferred" | "notApplicable" | "unknown";
export type HealthOSRLSStatus = "confirmed" | "drafted" | "missing" | "unknown";

export type HealthOSTableRegistryEntry = {
  batch: number;
  featureArea: HealthOSServiceArea;
  generatedTypeStatus: HealthOSTableGeneratedTypeStatus;
  notes?: string;
  rlsStatus: HealthOSRLSStatus;
  routeStatus: HealthOSRouteWiringStatus;
  serviceStatus: HealthOSServiceWiringStatus;
  tableName: string;
};
