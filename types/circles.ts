import type { AgeAccessStage, CareProfile, CareProfileType } from "@/types/care-profiles";

export type CircleMemberRole =
  | "owner"
  | "admin"
  | "member"
  | "dependent"
  | "caregiver"
  | "viewer";

export type CircleRelationship =
  | "father"
  | "mother"
  | "guardian"
  | "partner"
  | "husband"
  | "wife"
  | "son"
  | "daughter"
  | "grandparent"
  | "sibling"
  | "in_law"
  | "caregiver"
  | "other";

export type { AgeAccessStage, CareProfileType };

export type CirclePermission =
  | "manage_circle"
  | "manage_members"
  | "manage_dependents"
  | "invite_caregivers"
  | "view_safe_summary"
  | "view_private_records";

export type CircleKind = "family_circle" | "care_circle";

export type CircleMember = {
  id: string;
  circleId: string;
  displayName: string;
  email?: string | null;
  isCurrentUser?: boolean;
  notes?: string | null;
  relationship: CircleRelationship;
  role: CircleMemberRole;
  status: "active" | "pending" | "placeholder";
  userId?: string | null;
};

export type CircleCareProfile = CareProfile;

export type FamilyCircle = {
  id: string;
  name: string;
  kind: CircleKind;
  ownerId?: string | null;
  currentUserRelationship?: CircleRelationship | null;
  currentUserRole: CircleMemberRole;
  description?: string | null;
  memberCount: number;
  dependentCount: number;
  caregiverCount: number;
  members: CircleMember[];
  careProfiles: CircleCareProfile[];
  permissions: CirclePermission[];
  source: "database" | "placeholder";
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreateCircleInput = {
  name: string;
  relationship?: CircleRelationship;
};
