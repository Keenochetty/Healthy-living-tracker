import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

export type PrimaryRole =
  | "parent_guardian"
  | "caregiver"
  | "woman"
  | "man"
  | "child"
  | "baby"
  | "elderly_dependent";

export type FamilySetupChoice = "create" | "join";

export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = SignInInput;

export type OnboardingInput = {
  fullName: string;
  displayName: string;
  primaryRole: PrimaryRole;
  familySetup: FamilySetupChoice;
  familyName?: string;
  enableCaregiverWorkProfile: boolean;
};

function cleanText(value: string) {
  return value.trim();
}

function getFallbackName(user: User) {
  return user.email?.split("@")[0] || "New user";
}

function getAuthUserId(user: User | null) {
  if (!user) {
    throw new Error("You must be signed in to continue.");
  }

  return user.id;
}

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function isAuthenticated() {
  const session = await getCurrentSession();

  return Boolean(session);
}

export async function signIn({ email, password }: SignInInput) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanText(email),
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signUp({ email, password }: SignUpInput) {
  const { data, error } = await supabase.auth.signUp({
    email: cleanText(email),
    password,
  });

  if (error) {
    throw error;
  }

  if (data.session && data.user) {
    await createInitialProfile(data.user);
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function createInitialProfile(user: User) {
  const fallbackName = getFallbackName(user);

  const { error } = await supabase.from("profiles").upsert({
    email: user.email,
    id: user.id,
    full_name: fallbackName,
    display_name: fallbackName,
    primary_role: "parent_guardian",
    is_onboarding_complete: false,
  });

  if (error) {
    throw error;
  }
}

export async function completeOnboarding(input: OnboardingInput) {
  const user = await getCurrentUser();
  const userId = getAuthUserId(user);
  const fullName = cleanText(input.fullName);
  const displayName = cleanText(input.displayName);

  if (!fullName || !displayName) {
    throw new Error("Enter your full name and display name.");
  }

  if (input.familySetup === "create" && !cleanText(input.familyName ?? "")) {
    throw new Error("Enter a family name.");
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    email: user.email,
    id: userId,
    full_name: fullName,
    display_name: displayName,
    primary_role: input.primaryRole,
    is_onboarding_complete: true,
  });

  if (profileError) {
    throw profileError;
  }

  const { error: settingsError } = await supabase.from("user_settings").upsert({
    profile_id: userId,
    notification_preferences: {},
    privacy_preferences: {},
    ai_preferences: {},
    calendar_preferences: {},
    security_preferences: {},
  });

  if (settingsError) {
    throw settingsError;
  }

  let familyId: string | null = null;

  if (input.familySetup === "create") {
    const { data: family, error: familyError } = await supabase
      .from("families")
      .insert({
        name: cleanText(input.familyName ?? ""),
        owner_id: userId,
      })
      .select("id")
      .single();

    if (familyError) {
      throw familyError;
    }

    familyId = family.id;

    const { error: memberError } = await supabase
      .from("family_members")
      .insert({
        family_id: familyId,
        profile_id: userId,
        role: input.primaryRole,
        relationship: "self",
        can_manage_family: true,
      });

    if (memberError) {
      throw memberError;
    }
  }

  if (input.primaryRole === "caregiver" && input.enableCaregiverWorkProfile) {
    const { error: caregiverError } = await supabase
      .from("caregiver_profiles")
      .insert({
        profile_id: userId,
      });

    if (caregiverError) {
      throw caregiverError;
    }
  }

  return {
    familyId,
  };
}

export async function hasCompletedOnboarding() {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("is_onboarding_complete")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data?.is_onboarding_complete);
}
