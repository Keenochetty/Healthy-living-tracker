import type {
  HealthOSActiveCareProfilePreference,
  HealthOSCareProfile,
} from "./careProfileTypes";

export function createDefaultSelfCareProfile(
  userId: string,
  displayName = "You",
): Omit<HealthOSCareProfile, "id"> {
  return {
    ownerUserId: userId,
    profileType: "self",
    displayName,
    legalName: null,
    relationshipLabel: "Self",
    dateOfBirth: null,
    genderContext: null,
    avatarUrl: null,
    avatarStoragePath: null,
    privacyScope: "private",
    managedByUserId: userId,
    adultOwnerUserId: userId,
    isPrimarySelf: true,
    status: "active",
    createdAt: null,
    updatedAt: null,
  };
}

export function createDefaultActiveCareProfilePreference(
  userId: string,
  activeCareProfileId: string | null = null,
): HealthOSActiveCareProfilePreference {
  return {
    userId,
    activeCareProfileId,
    lastSelectedAt: activeCareProfileId ? new Date().toISOString() : null,
  };
}
