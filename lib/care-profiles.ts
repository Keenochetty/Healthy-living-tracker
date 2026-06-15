import {
  getDefaultAgeAccessStage,
  getDefaultPrivacyStatus,
} from "@/constants/care-profiles";
import type {
  AgeAccessStage,
  CareProfile,
  CareProfilePrivacyStatus,
  CareProfileType,
  CreateCareProfileInput,
} from "@/types/care-profiles";
import type { CircleRelationship } from "@/types/circles";

export function calculateAge(
  dateOfBirth: string | null | undefined,
  today = new Date(),
) {
  if (!dateOfBirth) {
    return null;
  }

  const birthDate = new Date(`${dateOfBirth}T00:00:00`);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const hasHadBirthday =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());

  if (!hasHadBirthday) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

export function determineDefaultAgeAccessStage(
  age: number | null,
): AgeAccessStage {
  return getDefaultAgeAccessStage(age);
}

export function formatCareProfileAge(
  profile: Pick<CareProfile, "age" | "dateOfBirth">,
) {
  const age = profile.age ?? calculateAge(profile.dateOfBirth);

  if (age === null) {
    return "Age not set";
  }

  return age === 1 ? "1 year old" : `${age} years old`;
}

export function isAdultCareProfile(
  profile: Pick<CareProfile, "ageAccessStage" | "profileType">,
) {
  return (
    profile.ageAccessStage === "adult_controlled" ||
    profile.profileType === "adult_member" ||
    profile.profileType === "adult_dependent" ||
    profile.profileType === "elderly_dependent"
  );
}

type BuildCareProfileInput = CreateCareProfileInput & {
  caregiverAssignmentStatus?: CareProfile["caregiverAssignmentStatus"];
  id: string;
  notes?: string | null;
  privacyStatus?: CareProfilePrivacyStatus;
};

export function buildCareProfile(input: BuildCareProfileInput): CareProfile {
  const age = input.age ?? calculateAge(input.dateOfBirth);
  const ageAccessStage = determineDefaultAgeAccessStage(age);

  return {
    age,
    ageAccessStage,
    caregiverAssignmentStatus:
      input.caregiverAssignmentStatus ?? "not_assigned",
    circleId: input.circleId,
    dateOfBirth: input.dateOfBirth ?? null,
    displayName: input.displayName,
    id: input.id,
    notes: input.notes ?? null,
    privacyStatus:
      input.privacyStatus ?? getDefaultPrivacyStatus(ageAccessStage),
    profileType: input.profileType,
    relationship: input.relationship,
  };
}

export function getCareProfileRelationshipFallback(
  profileType: CareProfileType,
): CircleRelationship {
  if (profileType === "child" || profileType === "teen") {
    return "other";
  }

  if (profileType === "elderly_dependent") {
    return "grandparent";
  }

  return "other";
}
