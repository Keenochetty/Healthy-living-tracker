import type {
  HealthOSActiveCareProfilePreference,
  HealthOSCareProfile,
  HealthOSCareProfileCreateInput,
  HealthOSCareProfilePrivacyScope,
  HealthOSCareProfileRelationship,
  HealthOSCareProfileRelationshipCreateInput,
  HealthOSCareProfileRelationshipType,
  HealthOSCareProfileStatus,
  HealthOSCareProfileType,
  HealthOSCareProfileUpdateInput,
} from "./careProfileTypes";

type Row = Record<string, unknown>;

export function mapCareProfileRow(row: Row): HealthOSCareProfile {
  return {
    id: stringValue(row.id),
    ownerUserId: stringValue(row.owner_user_id),
    profileType: toProfileType(row.profile_type),
    displayName: stringValue(row.display_name, "Care profile"),
    legalName: nullableString(row.legal_name),
    relationshipLabel: nullableString(row.relationship_label),
    dateOfBirth: nullableString(row.date_of_birth),
    genderContext: nullableString(row.gender_context),
    avatarUrl: nullableString(row.avatar_url),
    avatarStoragePath: nullableString(row.avatar_storage_path),
    privacyScope: toPrivacyScope(row.privacy_scope),
    managedByUserId: nullableString(row.managed_by_user_id),
    adultOwnerUserId: nullableString(row.adult_owner_user_id),
    isPrimarySelf: booleanValue(row.is_primary_self),
    status: toStatus(row.status),
    createdAt: nullableString(row.created_at),
    updatedAt: nullableString(row.updated_at),
  };
}

export function mapRelationshipRow(
  row: Row,
): HealthOSCareProfileRelationship {
  return {
    id: stringValue(row.id),
    careProfileId: stringValue(row.care_profile_id),
    userId: stringValue(row.user_id),
    relationshipType: toRelationshipType(row.relationship_type),
    status: toStatus(row.status),
    isPrimaryManager: booleanValue(row.is_primary_manager),
    canManageIdentity: booleanValue(row.can_manage_identity),
    createdBy: nullableString(row.created_by),
    createdAt: nullableString(row.created_at),
    updatedAt: nullableString(row.updated_at),
  };
}

export function mapPreferenceRow(
  row: Row | null,
  userId: string,
): HealthOSActiveCareProfilePreference {
  return {
    userId,
    activeCareProfileId: nullableString(row?.active_care_profile_id),
    lastSelectedAt: nullableString(row?.last_selected_at),
  };
}

export function mapCareProfileCreateToInsert(
  userId: string,
  input: HealthOSCareProfileCreateInput,
) {
  return {
    owner_user_id: userId,
    profile_type: fromProfileType(input.profileType),
    display_name: input.displayName.trim(),
    legal_name: nullableInput(input.legalName),
    relationship_label: nullableInput(input.relationshipLabel),
    date_of_birth: nullableInput(input.dateOfBirth),
    gender_context: nullableInput(input.genderContext),
    avatar_url: nullableInput(input.avatarUrl),
    avatar_storage_path: nullableInput(input.avatarStoragePath),
    privacy_scope: fromPrivacyScope(input.privacyScope ?? "private"),
    managed_by_user_id: input.managedByUserId ?? userId,
    adult_owner_user_id: input.adultOwnerUserId ?? null,
    is_primary_self: Boolean(input.isPrimarySelf),
  };
}

export function mapCareProfileUpdateToPatch(
  input: HealthOSCareProfileUpdateInput,
) {
  return {
    profile_type: input.profileType ? fromProfileType(input.profileType) : undefined,
    display_name: input.displayName?.trim(),
    legal_name: input.legalName,
    relationship_label: input.relationshipLabel,
    date_of_birth: input.dateOfBirth,
    gender_context: input.genderContext,
    avatar_url: input.avatarUrl,
    avatar_storage_path: input.avatarStoragePath,
    privacy_scope: input.privacyScope
      ? fromPrivacyScope(input.privacyScope)
      : undefined,
    managed_by_user_id: input.managedByUserId,
    adult_owner_user_id: input.adultOwnerUserId,
    is_primary_self: input.isPrimarySelf,
    status: input.status,
  };
}

export function mapRelationshipCreateToInsert(
  userId: string,
  input: HealthOSCareProfileRelationshipCreateInput,
) {
  return {
    care_profile_id: input.careProfileId,
    user_id: input.userId,
    relationship_type: fromRelationshipType(input.relationshipType),
    is_primary_manager: Boolean(input.isPrimaryManager),
    can_manage_identity: Boolean(input.canManageIdentity),
    created_by: userId,
  };
}

export function mapPreferenceToUpsert(
  userId: string,
  activeCareProfileId: string | null,
) {
  return {
    user_id: userId,
    active_care_profile_id: activeCareProfileId,
    last_selected_at: activeCareProfileId ? new Date().toISOString() : null,
  };
}

function toProfileType(value: unknown): HealthOSCareProfileType {
  switch (value) {
    case "self":
    case "child":
    case "dependent":
    case "elder":
    case "other":
      return value;
    case "pregnancy_subject":
      return "pregnancySubject";
    case "caregiver_contact":
      return "caregiverContact";
    default:
      return "other";
  }
}

function fromProfileType(value: HealthOSCareProfileType) {
  if (value === "pregnancySubject") return "pregnancy_subject";
  if (value === "caregiverContact") return "caregiver_contact";
  return value;
}

function toPrivacyScope(value: unknown): HealthOSCareProfilePrivacyScope {
  switch (value) {
    case "private":
      return "private";
    case "selected_family":
      return "selectedFamily";
    case "caregiver_limited":
      return "caregiverLimited";
    case "emergency_only":
      return "emergencyOnly";
    default:
      return "unknown";
  }
}

function fromPrivacyScope(value: HealthOSCareProfilePrivacyScope) {
  if (value === "selectedFamily") return "selected_family";
  if (value === "caregiverLimited") return "caregiver_limited";
  if (value === "emergencyOnly") return "emergency_only";
  if (value === "unknown") return "private";
  return value;
}

function toRelationshipType(value: unknown): HealthOSCareProfileRelationshipType {
  if (value === "adult_owner") return "adultOwner";
  if (value === "dependent_manager") return "dependentManager";
  if (
    value === "self" ||
    value === "parent" ||
    value === "guardian" ||
    value === "caregiver" ||
    value === "viewer"
  ) {
    return value;
  }
  return "viewer";
}

function fromRelationshipType(value: HealthOSCareProfileRelationshipType) {
  if (value === "adultOwner") return "adult_owner";
  if (value === "dependentManager") return "dependent_manager";
  return value;
}

function toStatus(value: unknown): HealthOSCareProfileStatus {
  if (
    value === "active" ||
    value === "inactive" ||
    value === "archived" ||
    value === "pending"
  ) {
    return value;
  }
  return "unknown";
}

function nullableInput(value?: string | null) {
  return value?.trim() || null;
}

function nullableString(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function booleanValue(value: unknown) {
  return value === true;
}
