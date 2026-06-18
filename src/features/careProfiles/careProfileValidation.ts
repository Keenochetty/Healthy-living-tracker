import type {
  HealthOSCareProfileCreateInput,
  HealthOSCareProfileRelationshipCreateInput,
  HealthOSCareProfileUpdateInput,
} from "./careProfileTypes";

type ValidationResult = { valid: true } | { error: string; valid: false };

export function validateCareProfileCreate(
  input: HealthOSCareProfileCreateInput,
): ValidationResult {
  if (!input.displayName.trim()) {
    return { error: "Care profile display name is required.", valid: false };
  }
  if (input.profileType === "self" && input.relationshipLabel === "Caregiver") {
    return {
      error: "Self profiles cannot be labeled as caregiver contacts.",
      valid: false,
    };
  }
  return { valid: true };
}

export function validateCareProfileUpdate(
  input: HealthOSCareProfileUpdateInput,
): ValidationResult {
  if (input.displayName !== undefined && !input.displayName.trim()) {
    return { error: "Care profile display name cannot be empty.", valid: false };
  }
  return { valid: true };
}

export function validateRelationshipCreate(
  input: HealthOSCareProfileRelationshipCreateInput,
): ValidationResult {
  if (!input.careProfileId) {
    return { error: "Care profile id is required.", valid: false };
  }
  if (!input.userId) {
    return { error: "Related user id is required.", valid: false };
  }
  return { valid: true };
}
