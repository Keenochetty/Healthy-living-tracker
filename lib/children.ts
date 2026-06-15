import { router } from "expo-router";

import { supabase } from "@/lib/supabase";
import type { FamilyRecord, ProfileRecord } from "@/lib/profile-context";

export type ChildProfile = {
  id: string;
  family_id: string;
  first_name: string;
  last_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  notes: string | null;
  created_by: string | null;
};

export type ChildProfileInput = {
  familyId: string;
  firstName: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
};

export type CaregiverChildAccess = {
  can_view_care_instructions: boolean | null;
  can_view_schedule: boolean | null;
  can_log_activity: boolean | null;
  can_upload_photos: boolean | null;
  can_use_emergency_button: boolean | null;
  is_active: boolean | null;
};

export type AssignedCaregiverChild = {
  access: CaregiverChildAccess;
  child: ChildProfile;
};

export type GrantCaregiverAccessInput = {
  childId: string;
  caregiverEmail: string;
  canViewCareInstructions: boolean;
  canViewSchedule: boolean;
  canLogActivity: boolean;
  canUploadPhotos: boolean;
  canUseEmergencyButton: boolean;
};

function cleanOptional(value?: string) {
  const nextValue = value?.trim();
  return nextValue ? nextValue : null;
}

export function getChildFullName(
  child: Pick<ChildProfile, "first_name" | "last_name">,
) {
  return [child.first_name, child.last_name].filter(Boolean).join(" ");
}

export function getChildAge(dateOfBirth: string | null) {
  if (!dateOfBirth) {
    return "Age not set";
  }

  const birthDate = new Date(`${dateOfBirth}T00:00:00`);

  if (Number.isNaN(birthDate.getTime())) {
    return "Age not set";
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasHadBirthday =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());

  if (!hasHadBirthday) {
    age -= 1;
  }

  return age === 1 ? "1 year old" : `${age} years old`;
}

export function canCreateOrEditChildProfiles(
  profile: ProfileRecord | null,
  selectedFamily: FamilyRecord | null,
) {
  const role = profile?.primary_role ?? profile?.app_role;

  return role === "parent_guardian" && Boolean(selectedFamily);
}

export function openChildProfile(
  childId: string,
  viewer: "family" | "caregiver" = "family",
) {
  router.push(
    viewer === "caregiver"
      ? `/caregiver/child/${childId}`
      : `/child/${childId}`,
  );
}

export async function listChildrenInSelectedFamily(
  familyId: string | null | undefined,
) {
  if (!familyId) {
    return [];
  }

  const { data, error } = await supabase
    .from("children")
    .select(
      "id, family_id, first_name, last_name, date_of_birth, gender, notes, created_by",
    )
    .eq("family_id", familyId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as ChildProfile[];
}

export async function getChildProfile(childId: string) {
  const { data, error } = await supabase
    .from("children")
    .select(
      "id, family_id, first_name, last_name, date_of_birth, gender, notes, created_by",
    )
    .eq("id", childId)
    .single();

  if (error) {
    throw error;
  }

  return data as ChildProfile;
}

export async function createChildProfile(input: ChildProfileInput) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be signed in to create a child profile.");
  }

  const firstName = input.firstName.trim();

  if (!firstName) {
    throw new Error("Enter the child's first name.");
  }

  const { data, error } = await supabase
    .from("children")
    .insert({
      created_by: user.id,
      date_of_birth: cleanOptional(input.dateOfBirth),
      family_id: input.familyId,
      first_name: firstName,
      gender: cleanOptional(input.gender),
      last_name: cleanOptional(input.lastName),
    })
    .select(
      "id, family_id, first_name, last_name, date_of_birth, gender, notes, created_by",
    )
    .single();

  if (error) {
    throw error;
  }

  return data as ChildProfile;
}

export async function updateChildProfile(
  childId: string,
  input: Omit<ChildProfileInput, "familyId">,
) {
  const firstName = input.firstName.trim();

  if (!firstName) {
    throw new Error("Enter the child's first name.");
  }

  const { data, error } = await supabase
    .from("children")
    .update({
      date_of_birth: cleanOptional(input.dateOfBirth),
      first_name: firstName,
      gender: cleanOptional(input.gender),
      last_name: cleanOptional(input.lastName),
    })
    .eq("id", childId)
    .select(
      "id, family_id, first_name, last_name, date_of_birth, gender, notes, created_by",
    )
    .single();

  if (error) {
    throw error;
  }

  return data as ChildProfile;
}

export async function getCaregiverChildProfile(childId: string) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be signed in to view caregiver child profiles.");
  }

  const { data: caregiverProfile, error: caregiverError } = await supabase
    .from("caregiver_profiles")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (caregiverError) {
    throw caregiverError;
  }

  if (!caregiverProfile) {
    throw new Error("No caregiver work profile found.");
  }

  const { data: access, error: accessError } = await supabase
    .from("caregiver_child_access")
    .select(
      "can_view_care_instructions, can_view_schedule, can_log_activity, can_upload_photos, can_use_emergency_button, is_active",
    )
    .eq("caregiver_profile_id", caregiverProfile.id)
    .eq("child_id", childId)
    .eq("is_active", true)
    .maybeSingle();

  if (accessError) {
    throw accessError;
  }

  if (!access) {
    throw new Error("You do not have active caregiver access for this child.");
  }

  const child = await getChildProfile(childId);

  return {
    access: access as CaregiverChildAccess,
    child,
  };
}

export async function listAssignedCaregiverChildren() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be signed in to view caregiver work mode.");
  }

  const { data: caregiverProfile, error: caregiverError } = await supabase
    .from("caregiver_profiles")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (caregiverError) {
    throw caregiverError;
  }

  if (!caregiverProfile) {
    return [];
  }

  const { data: accessRows, error: accessError } = await supabase
    .from("caregiver_child_access")
    .select(
      "child_id, can_view_care_instructions, can_view_schedule, can_log_activity, can_upload_photos, can_use_emergency_button, is_active",
    )
    .eq("caregiver_profile_id", caregiverProfile.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (accessError) {
    throw accessError;
  }

  const childIds = Array.from(
    new Set((accessRows ?? []).map((row) => row.child_id).filter(Boolean)),
  );

  if (childIds.length === 0) {
    return [];
  }

  const { data: children, error: childrenError } = await supabase
    .from("children")
    .select(
      "id, family_id, first_name, last_name, date_of_birth, gender, notes, created_by",
    )
    .in("id", childIds);

  if (childrenError) {
    throw childrenError;
  }

  const childrenById = new Map(
    (children ?? []).map((child) => [child.id, child as ChildProfile]),
  );

  return (accessRows ?? [])
    .map((access) => {
      const child = childrenById.get(access.child_id);

      if (!child) {
        return null;
      }

      return {
        access: {
          can_log_activity: access.can_log_activity,
          can_upload_photos: access.can_upload_photos,
          can_use_emergency_button: access.can_use_emergency_button,
          can_view_care_instructions: access.can_view_care_instructions,
          can_view_schedule: access.can_view_schedule,
          is_active: access.is_active,
        },
        child,
      };
    })
    .filter((item): item is AssignedCaregiverChild => item !== null);
}

export async function grantCaregiverAccessToChild(
  input: GrantCaregiverAccessInput,
) {
  const caregiverEmail = input.caregiverEmail.trim();

  if (!caregiverEmail) {
    throw new Error("Enter the caregiver email.");
  }

  const { data, error } = await supabase.rpc("grant_caregiver_child_access", {
    allow_log_activity: input.canLogActivity,
    allow_upload_photos: input.canUploadPhotos,
    allow_use_emergency_button: input.canUseEmergencyButton,
    allow_view_care_instructions: input.canViewCareInstructions,
    allow_view_schedule: input.canViewSchedule,
    caregiver_email: caregiverEmail,
    target_child_id: input.childId,
  });

  if (error) {
    throw error;
  }

  return data as string;
}
