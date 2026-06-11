import AsyncStorage from "@react-native-async-storage/async-storage";

import { supabase } from "@/lib/supabase";
import { addSecurityActivity, reauthenticate } from "@/lib/securitySettings";
import { getUserPreferences, updateUserPreferences } from "@/lib/userPreferences";
import type { EmergencyContact, ProfileContactDetails } from "@/types/profileContact";

const STORAGE_KEY = "healthsync_profile_contact_details";

export async function getProfileContactDetails(): Promise<ProfileContactDetails> {
  const preferences = await getUserPreferences();
  const fallback: ProfileContactDetails = {
    avatarPath: null,
    avatarPreviewUri: null,
    dateOfBirth: "",
    displayName: preferences.displayName,
    emergencyContacts: [],
    fullName: preferences.displayName,
    phone: "",
    preferredContactMethod: "email"
  };

  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const local = stored ? { ...fallback, ...(JSON.parse(stored) as Partial<ProfileContactDetails>) } : fallback;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return local;

    const [{ data: profile }, { data: contacts }] = await Promise.all([
      supabase.from("profiles").select("avatar_url,date_of_birth,display_name,email,full_name,phone,preferred_contact_method").eq("id", userData.user.id).maybeSingle(),
      supabase.from("emergency_contacts").select("*").eq("user_id", userData.user.id).order("created_at")
    ]);

    let avatarPreviewUri = local.avatarPreviewUri;
    const avatarPath = profile?.avatar_url ?? local.avatarPath;
    if (avatarPath) {
      const { data } = await supabase.storage.from("profile-avatars").createSignedUrl(avatarPath, 60 * 30);
      avatarPreviewUri = data?.signedUrl ?? avatarPreviewUri;
    }

    return {
      ...local,
      avatarPath,
      avatarPreviewUri,
      dateOfBirth: profile?.date_of_birth ?? local.dateOfBirth,
      displayName: profile?.display_name ?? local.displayName,
      emergencyContacts: contacts?.map(mapEmergencyContact) ?? local.emergencyContacts,
      fullName: profile?.full_name ?? local.fullName,
      phone: profile?.phone ?? local.phone,
      preferredContactMethod: profile?.preferred_contact_method ?? local.preferredContactMethod
    };
  } catch {
    return fallback;
  }
}

export async function saveProfileContactDetails(details: ProfileContactDetails) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(details));
  await updateUserPreferences({ displayName: details.displayName.trim() || details.fullName.trim() });
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return details;

  const { error: profileError } = await supabase.from("profiles").upsert({
    avatar_url: details.avatarPath,
    date_of_birth: details.dateOfBirth || null,
    display_name: details.displayName.trim() || null,
    email: userData.user.email ?? null,
    full_name: details.fullName.trim() || null,
    id: userData.user.id,
    phone: details.phone.trim() || null,
    preferred_contact_method: details.preferredContactMethod,
    updated_at: new Date().toISOString()
  }, { onConflict: "id" });
  if (profileError) throw new Error("Could not save your profile. Your local changes are still available.");

  const { error: deleteError } = await supabase.from("emergency_contacts").delete().eq("user_id", userData.user.id);
  if (deleteError) throw new Error("Profile saved, but emergency contacts could not be updated.");
  if (details.emergencyContacts.length) {
    const { error } = await supabase.from("emergency_contacts").insert(details.emergencyContacts.map((contact) => ({
      id: contact.id,
      include_in_medical_id: contact.includeInMedicalId,
      name: contact.name.trim(),
      phone: contact.phone.trim(),
      relationship: contact.relationship.trim() || null,
      secondary_contact: contact.secondaryContact.trim() || null,
      user_id: userData.user!.id,
      visibility: contact.visibility
    })));
    if (error) throw new Error("Profile saved, but emergency contacts could not be updated.");
  }
  return details;
}

export async function uploadProfileAvatar(localUri: string, mimeType = "image/jpeg") {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Sign in to upload a profile photo.");
  const response = await fetch(localUri);
  if (!response.ok) throw new Error("Could not read the selected photo.");
  const bytes = await response.arrayBuffer();
  const extension = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg";
  const path = `${userData.user.id}/avatar.${extension}`;
  const { error } = await supabase.storage.from("profile-avatars").upload(path, bytes, { contentType: mimeType, upsert: true });
  if (error) throw new Error("Could not upload the profile photo. Please try again.");
  return path;
}

export async function removeProfileAvatar(path: string | null) {
  if (!path) return;
  await supabase.storage.from("profile-avatars").remove([path]);
}

export async function updateAccountEmail(email: string, currentPassword: string) {
  await reauthenticate(currentPassword);
  const { error } = await supabase.auth.updateUser({ email: email.trim() });
  if (error) throw new Error("Could not update email. Please check the address and try again.");
  await addSecurityActivity("Email change requested");
}

function mapEmergencyContact(row: Record<string, unknown>): EmergencyContact {
  return {
    id: String(row.id),
    includeInMedicalId: Boolean(row.include_in_medical_id),
    name: String(row.name ?? ""),
    phone: String(row.phone ?? ""),
    relationship: String(row.relationship ?? ""),
    secondaryContact: String(row.secondary_contact ?? ""),
    visibility: (row.visibility as EmergencyContact["visibility"]) ?? "private"
  };
}
