import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  DEFAULT_FITNESS_FEATURES,
  FEATURE_PREFERENCE_CONFIG,
  isProfileRelevantForFeature,
  type FeaturePreferenceKey,
} from "@/constants/featurePreferenceConfig";
import { supabase } from "@/lib/supabase";
import type { ProfileType } from "@/types/familyPermissions";

const STORAGE_KEY = "user_feature_preferences_v1";

export type UserFeaturePreference = {
  enabled: boolean;
  featureKey: FeaturePreferenceKey;
  profileId?: string;
  source: "default" | "manual" | "onboarding" | string;
};

export type FeatureVisibilityContext = {
  preferences?: UserFeaturePreference[];
  profileType?: ProfileType;
};

export async function getUserFeaturePreferences(profileId?: string) {
  try {
    const user = await getUser();
    if (user) {
      let query = supabase
        .from("user_feature_preferences")
        .select("feature_key,enabled,profile_id,source")
        .eq("user_id", user.id);
      query = profileId
        ? query.eq("profile_id", profileId)
        : query.is("profile_id", null);
      const { data, error } = await query;
      if (!error) {
        const preferences = (data ?? []).map(mapRow);
        await saveLocalPreferences(preferences, profileId);
        return preferences;
      }
    }
  } catch {
    // Local preferences keep customization available before migrations are deployed.
  }
  return getLocalPreferences(profileId);
}

export async function setUserFeaturePreference(
  featureKey: FeaturePreferenceKey,
  enabled: boolean,
  profileId?: string,
) {
  return setManyUserFeaturePreferences([{ enabled, featureKey }], profileId);
}

export async function setManyUserFeaturePreferences(
  preferences: Array<{ enabled: boolean; featureKey: FeaturePreferenceKey }>,
  profileId?: string,
) {
  const normalized = preferences.map((preference) => ({
    ...preference,
    profileId,
    source: "manual" as const,
  }));
  const current = await getLocalPreferences(profileId);
  const changed = new Set(normalized.map((item) => item.featureKey));
  await saveLocalPreferences(
    [...current.filter((item) => !changed.has(item.featureKey)), ...normalized],
    profileId,
  );

  try {
    const user = await getUser();
    if (!user) return normalized;
    let deletion = supabase
      .from("user_feature_preferences")
      .delete()
      .eq("user_id", user.id)
      .in("feature_key", [...changed]);
    deletion = profileId
      ? deletion.eq("profile_id", profileId)
      : deletion.is("profile_id", null);
    const { error: deleteError } = await deletion;
    if (deleteError) return normalized;
    await supabase.from("user_feature_preferences").insert(
      normalized.map((item) => ({
        enabled: item.enabled,
        feature_key: item.featureKey,
        profile_id: profileId ?? null,
        source: item.source,
        user_id: user.id,
      })),
    );
  } catch {
    // Safe local fallback already contains the user's choices.
  }
  return normalized;
}

export function getVisibleFitnessFeatures(context: FeatureVisibilityContext) {
  return (
    Object.keys(FEATURE_PREFERENCE_CONFIG) as FeaturePreferenceKey[]
  ).filter((featureKey) => shouldShowFeature(featureKey, context));
}

export function shouldShowFeature(
  featureKey: FeaturePreferenceKey,
  context: FeatureVisibilityContext,
) {
  const explicit = context.preferences?.find(
    (item) => item.featureKey === featureKey,
  );
  if (explicit) return explicit.enabled;
  if (isProfileRelevantForFeature(featureKey, context.profileType)) return true;
  if (featureKey === "injury_conscious") {
    return (
      context.preferences?.some(
        (item) => item.featureKey === "recovery" && item.enabled,
      ) ?? false
    );
  }
  return DEFAULT_FITNESS_FEATURES.includes(featureKey);
}

async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

function mapRow(row: {
  enabled: boolean;
  feature_key: FeaturePreferenceKey;
  profile_id?: string | null;
  source?: string | null;
}): UserFeaturePreference {
  return {
    enabled: row.enabled,
    featureKey: row.feature_key,
    profileId: row.profile_id ?? undefined,
    source: row.source ?? "manual",
  };
}

async function getLocalPreferences(
  profileId?: string,
): Promise<UserFeaturePreference[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const stored = raw
    ? (JSON.parse(raw) as Record<string, UserFeaturePreference[]>)
    : {};
  return stored[profileId ?? "user"] ?? [];
}

async function saveLocalPreferences(
  preferences: UserFeaturePreference[],
  profileId?: string,
) {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const stored = raw
    ? (JSON.parse(raw) as Record<string, UserFeaturePreference[]>)
    : {};
  stored[profileId ?? "user"] = preferences;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}
