export type HealthOSCareProfileBackendStatus =
  | "idle"
  | "loading"
  | "ready"
  | "missingAuth"
  | "missingTable"
  | "deferred"
  | "error";

export type HealthOSCareProfileServiceResult<T> = {
  data: T | null;
  error: string | null;
  status: HealthOSCareProfileBackendStatus;
};

export type HealthOSCareProfileType =
  | "self"
  | "child"
  | "dependent"
  | "elder"
  | "pregnancySubject"
  | "caregiverContact"
  | "other";

export type HealthOSCareProfilePrivacyScope =
  | "private"
  | "selectedFamily"
  | "caregiverLimited"
  | "emergencyOnly"
  | "unknown";

export type HealthOSCareProfileStatus =
  | "active"
  | "inactive"
  | "archived"
  | "pending"
  | "unknown";

export type HealthOSCareProfileRelationshipType =
  | "self"
  | "parent"
  | "guardian"
  | "adultOwner"
  | "dependentManager"
  | "caregiver"
  | "viewer";

export type HealthOSCareProfile = {
  id: string;
  ownerUserId: string;
  profileType: HealthOSCareProfileType;
  displayName: string;
  legalName?: string | null;
  relationshipLabel?: string | null;
  dateOfBirth?: string | null;
  genderContext?: string | null;
  avatarUrl?: string | null;
  avatarStoragePath?: string | null;
  privacyScope: HealthOSCareProfilePrivacyScope;
  managedByUserId?: string | null;
  adultOwnerUserId?: string | null;
  isPrimarySelf: boolean;
  status: HealthOSCareProfileStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type HealthOSCareProfileRelationship = {
  id: string;
  careProfileId: string;
  userId: string;
  relationshipType: HealthOSCareProfileRelationshipType;
  status: HealthOSCareProfileStatus;
  isPrimaryManager: boolean;
  canManageIdentity: boolean;
  createdBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type HealthOSActiveCareProfilePreference = {
  userId: string;
  activeCareProfileId?: string | null;
  lastSelectedAt?: string | null;
};

export type HealthOSCareProfileCreateInput = {
  profileType: HealthOSCareProfileType;
  displayName: string;
  legalName?: string | null;
  relationshipLabel?: string | null;
  dateOfBirth?: string | null;
  genderContext?: string | null;
  avatarUrl?: string | null;
  avatarStoragePath?: string | null;
  privacyScope?: HealthOSCareProfilePrivacyScope;
  managedByUserId?: string | null;
  adultOwnerUserId?: string | null;
  isPrimarySelf?: boolean;
};

export type HealthOSCareProfileUpdateInput = Partial<
  Omit<
    HealthOSCareProfileCreateInput,
    "isPrimarySelf" | "profileType"
  > & {
    isPrimarySelf: boolean;
    profileType: HealthOSCareProfileType;
    status: Exclude<HealthOSCareProfileStatus, "unknown">;
  }
>;

export type HealthOSCareProfileRelationshipCreateInput = {
  careProfileId: string;
  userId: string;
  relationshipType: HealthOSCareProfileRelationshipType;
  isPrimaryManager?: boolean;
  canManageIdentity?: boolean;
};
