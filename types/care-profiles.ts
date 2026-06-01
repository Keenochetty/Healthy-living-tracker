import type { CircleRelationship } from "@/types/circles";

export type CareProfileType =
  | "child"
  | "teen"
  | "adult_member"
  | "adult_dependent"
  | "elderly_dependent";

export type AgeAccessStage =
  | "parent_managed"
  | "teen_transition"
  | "adult_controlled";

export type CareProfilePrivacyStatus =
  | "parent_managed"
  | "teen_limited"
  | "adult_private"
  | "shared_with_circle";

export type CareProfile = {
  id: string;
  circleId: string;
  displayName: string;
  age?: number | null;
  ageAccessStage: AgeAccessStage;
  dateOfBirth?: string | null;
  profileType: CareProfileType;
  privacyStatus: CareProfilePrivacyStatus;
  relationship: CircleRelationship;
  caregiverAssignmentStatus: "not_assigned" | "placeholder";
  notes?: string | null;
};

export type CreateCareProfileInput = {
  circleId: string;
  displayName: string;
  age?: number | null;
  dateOfBirth?: string;
  profileType: CareProfileType;
  relationship: CircleRelationship;
};
