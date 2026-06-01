import type {
  AgeAccessStage,
  CareProfilePrivacyStatus,
  CareProfileType
} from "@/types/care-profiles";

export const CARE_PROFILE_TYPES = [
  "child",
  "teen",
  "adult_member",
  "adult_dependent",
  "elderly_dependent"
] as const satisfies readonly CareProfileType[];

export const AGE_ACCESS_STAGES = [
  "parent_managed",
  "teen_transition",
  "adult_controlled"
] as const satisfies readonly AgeAccessStage[];

export const CARE_PROFILE_PRIVACY_STATUSES = [
  "parent_managed",
  "teen_limited",
  "adult_private",
  "shared_with_circle"
] as const satisfies readonly CareProfilePrivacyStatus[];

export const careProfileTypeLabels = {
  adult_dependent: "Adult dependent",
  adult_member: "Adult member",
  child: "Child",
  elderly_dependent: "Elderly dependent",
  teen: "Teen"
} as const satisfies Record<CareProfileType, string>;

export const ageAccessStageLabels = {
  adult_controlled: "Adult controlled",
  parent_managed: "Parent managed",
  teen_transition: "Teen transition"
} as const satisfies Record<AgeAccessStage, string>;

export const careProfilePrivacyLabels = {
  adult_private: "Adult private",
  parent_managed: "Parent managed",
  shared_with_circle: "Shared with circle",
  teen_limited: "Teen limited"
} as const satisfies Record<CareProfilePrivacyStatus, string>;

export function getDefaultAgeAccessStage(age: number | null): AgeAccessStage {
  if (age === null || age < 13) {
    return "parent_managed";
  }

  if (age < 18) {
    return "teen_transition";
  }

  return "adult_controlled";
}

export function getDefaultPrivacyStatus(ageAccessStage: AgeAccessStage): CareProfilePrivacyStatus {
  if (ageAccessStage === "adult_controlled") {
    return "adult_private";
  }

  if (ageAccessStage === "teen_transition") {
    return "teen_limited";
  }

  return "parent_managed";
}

export function getAgeAccessStageTone(stage: AgeAccessStage) {
  if (stage === "adult_controlled") {
    return "success" as const;
  }

  if (stage === "teen_transition") {
    return "warning" as const;
  }

  return "ai" as const;
}

export function getCareProfilePrivacyTone(status: CareProfilePrivacyStatus) {
  if (status === "adult_private") {
    return "success" as const;
  }

  if (status === "teen_limited") {
    return "warning" as const;
  }

  return "default" as const;
}
