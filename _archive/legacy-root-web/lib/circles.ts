import { supabase } from "@/lib/supabase";
import { buildCareProfile } from "@/lib/care-profiles";
import type { FamilyRecord, ProfileRecord } from "@/lib/profile-context";
import type {
  CircleMemberRole,
  CirclePermission,
  CircleRelationship,
  CreateCircleInput,
  FamilyCircle,
} from "@/types/circles";

const fallbackCircles: FamilyCircle[] = [
  {
    caregiverCount: 0,
    careProfiles: [
      buildCareProfile({
        caregiverAssignmentStatus: "not_assigned",
        circleId: "placeholder-household",
        dateOfBirth: "2018-04-12",
        displayName: "Child profile",
        id: "placeholder-household-child",
        notes: "Everyday care, school calendar, and emergency basics.",
        profileType: "child",
        relationship: "daughter",
      }),
      buildCareProfile({
        caregiverAssignmentStatus: "not_assigned",
        circleId: "placeholder-household",
        dateOfBirth: "2011-09-18",
        displayName: "Teen profile",
        id: "placeholder-household-teen",
        notes:
          "Teen transition profile with safe summaries and gradual access controls.",
        profileType: "teen",
        relationship: "son",
      }),
      buildCareProfile({
        caregiverAssignmentStatus: "not_assigned",
        circleId: "placeholder-household",
        dateOfBirth: "1991-02-05",
        displayName: "Partner profile",
        id: "placeholder-household-partner",
        notes:
          "Adult member profile. Private health info stays adult controlled unless shared.",
        profileType: "adult_member",
        relationship: "partner",
      }),
    ],
    currentUserRelationship: "guardian",
    currentUserRole: "owner",
    dependentCount: 2,
    description: "Primary home circle for everyday family coordination.",
    id: "placeholder-household",
    kind: "family_circle",
    memberCount: 4,
    members: [
      {
        circleId: "placeholder-household",
        displayName: "Keeno",
        id: "placeholder-household-owner",
        isCurrentUser: true,
        relationship: "guardian",
        role: "owner",
        status: "placeholder",
      },
      {
        circleId: "placeholder-household",
        displayName: "Partner",
        id: "placeholder-household-partner-member",
        relationship: "partner",
        role: "admin",
        status: "placeholder",
      },
      {
        circleId: "placeholder-household",
        displayName: "Child profile",
        id: "placeholder-household-child-member",
        relationship: "daughter",
        role: "dependent",
        status: "placeholder",
      },
      {
        circleId: "placeholder-household",
        displayName: "Teen profile",
        id: "placeholder-household-teen-member",
        relationship: "son",
        role: "dependent",
        status: "placeholder",
      },
    ],
    name: "My Household",
    permissions: [
      "manage_circle",
      "manage_members",
      "manage_dependents",
      "invite_caregivers",
      "view_safe_summary",
    ],
    source: "placeholder",
  },
  {
    caregiverCount: 1,
    careProfiles: [
      buildCareProfile({
        caregiverAssignmentStatus: "placeholder",
        age: 74,
        circleId: "placeholder-dad-care",
        displayName: "Dad",
        id: "placeholder-dad-care-profile",
        notes:
          "Adult care profile with shared care notes and emergency details pending permission setup.",
        privacyStatus: "shared_with_circle",
        profileType: "elderly_dependent",
        relationship: "father",
      }),
      buildCareProfile({
        age: 46,
        caregiverAssignmentStatus: "not_assigned",
        circleId: "placeholder-dad-care",
        displayName: "Aunt care profile",
        id: "placeholder-dad-care-adult-dependent",
        notes:
          "Adult dependent profile. Private health details require explicit permission.",
        profileType: "adult_dependent",
        relationship: "other",
      }),
    ],
    currentUserRelationship: "son",
    currentUserRole: "admin",
    dependentCount: 2,
    description:
      "A care circle for shared responsibilities and safe summaries.",
    id: "placeholder-dad-care",
    kind: "care_circle",
    memberCount: 5,
    members: [
      {
        circleId: "placeholder-dad-care",
        displayName: "Keeno",
        id: "placeholder-dad-care-admin",
        isCurrentUser: true,
        relationship: "son",
        role: "admin",
        status: "placeholder",
      },
      {
        circleId: "placeholder-dad-care",
        displayName: "Dad",
        id: "placeholder-dad-care-dependent",
        relationship: "father",
        role: "dependent",
        status: "placeholder",
      },
      {
        circleId: "placeholder-dad-care",
        displayName: "Aunt care profile",
        id: "placeholder-dad-care-adult-dependent-member",
        relationship: "other",
        role: "dependent",
        status: "placeholder",
      },
      {
        circleId: "placeholder-dad-care",
        displayName: "Sibling",
        id: "placeholder-dad-care-sibling",
        relationship: "sibling",
        role: "member",
        status: "placeholder",
      },
      {
        circleId: "placeholder-dad-care",
        displayName: "Caregiver",
        id: "placeholder-dad-care-caregiver",
        relationship: "caregiver",
        role: "caregiver",
        status: "placeholder",
      },
    ],
    name: "Dad's Care Circle",
    permissions: ["manage_members", "invite_caregivers", "view_safe_summary"],
    source: "placeholder",
  },
];

function normalizeRelationship(
  value?: string | null,
): CircleRelationship | null {
  const normalized = value?.trim().toLowerCase().replaceAll(" ", "_");

  switch (normalized) {
    case "father":
    case "mother":
    case "guardian":
    case "partner":
    case "husband":
    case "wife":
    case "son":
    case "daughter":
    case "grandparent":
    case "sibling":
    case "in_law":
    case "caregiver":
    case "other":
      return normalized;
    default:
      return value ? "other" : null;
  }
}

function permissionsForRole(role: CircleMemberRole): CirclePermission[] {
  if (role === "owner") {
    return [
      "manage_circle",
      "manage_members",
      "manage_dependents",
      "invite_caregivers",
      "view_safe_summary",
      "view_private_records",
    ];
  }

  if (role === "admin") {
    return [
      "manage_members",
      "manage_dependents",
      "invite_caregivers",
      "view_safe_summary",
    ];
  }

  if (role === "caregiver") {
    return ["view_safe_summary"];
  }

  return ["view_safe_summary"];
}

export function getFallbackCircles() {
  return fallbackCircles;
}

export function getProfileDisplayName(profile: ProfileRecord | null) {
  return profile?.display_name || profile?.full_name || "Me";
}

export function familyRecordToCircle(family: FamilyRecord): FamilyCircle {
  return {
    caregiverCount: 0,
    careProfiles: [],
    currentUserRelationship: normalizeRelationship(family.relationship),
    currentUserRole: family.role,
    dependentCount: 0,
    description:
      "Family Circle foundation is ready for members, dependents, and permissions.",
    id: family.id,
    kind: "family_circle",
    memberCount: 1,
    members: [
      {
        circleId: family.id,
        displayName: "Current user",
        id: `${family.id}-current-user`,
        isCurrentUser: true,
        relationship: normalizeRelationship(family.relationship) ?? "other",
        role: family.role,
        status: "active",
      },
    ],
    name: family.name,
    permissions: permissionsForRole(family.role),
    source: "database",
  };
}

export function listMyCirclesFromContext(families: FamilyRecord[]) {
  const circles = families.map(familyRecordToCircle);

  return circles.length > 0 ? circles : fallbackCircles;
}

export function getCircleById(
  circles: FamilyCircle[],
  circleId: string | string[] | undefined,
) {
  const id = Array.isArray(circleId) ? circleId[0] : circleId;

  return (
    circles.find((circle) => circle.id === id) ??
    fallbackCircles.find((circle) => circle.id === id) ??
    null
  );
}

export async function createCircle(input: CreateCircleInput) {
  const name = input.name.trim();

  if (!name) {
    throw new Error("Enter a Circle name.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be signed in to create a Family Circle.");
  }

  const { data: family, error: familyError } = await supabase
    .from("families")
    .insert({
      name,
      owner_id: user.id,
    })
    .select("id, name, owner_id, created_at, updated_at")
    .single();

  if (familyError) {
    throw familyError;
  }

  const { error: membershipError } = await supabase
    .from("family_memberships")
    .insert({
      family_id: family.id,
      relationship: input.relationship ?? "other",
      role: "owner",
      user_id: user.id,
    });

  if (membershipError) {
    throw membershipError;
  }

  return {
    caregiverCount: 0,
    careProfiles: [],
    createdAt: family.created_at,
    currentUserRelationship: input.relationship ?? "other",
    currentUserRole: "owner",
    dependentCount: 0,
    description: "New Family Circle",
    id: family.id,
    kind: "family_circle",
    memberCount: 1,
    members: [
      {
        circleId: family.id,
        displayName: "Current user",
        id: `${family.id}-owner`,
        isCurrentUser: true,
        relationship: input.relationship ?? "other",
        role: "owner",
        status: "active",
        userId: user.id,
      },
    ],
    name: family.name,
    ownerId: family.owner_id,
    permissions: permissionsForRole("owner"),
    source: "database",
    updatedAt: family.updated_at,
  } satisfies FamilyCircle;
}
