import type { User } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { supabase } from "@/lib/supabase";

export type ViewingMode = "personal" | "family" | "caregiver_work";

export type ProfileRecord = {
  id: string;
  full_name?: string | null;
  display_name?: string | null;
  primary_role?: string | null;
  app_role?: string | null;
  is_onboarding_complete?: boolean | null;
};

export type FamilyRecord = {
  id: string;
  name: string;
  relationship?: string | null;
  role: "owner" | "admin" | "member";
};

type ProfileContextValue = {
  user: User | null;
  profile: ProfileRecord | null;
  families: FamilyRecord[];
  selectedFamily: FamilyRecord | null;
  selectedMode: ViewingMode;
  isLoading: boolean;
  errorMessage: string | null;
  switchFamily: (familyId: string) => Promise<void>;
  switchMode: (mode: ViewingMode) => Promise<void>;
  refreshProfileContext: () => Promise<void>;
};

const SELECTED_FAMILY_KEY = "fhfamily";
const SELECTED_MODE_KEY = "fhmode";
const DEFAULT_MODE: ViewingMode = "personal";

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

function toNativeStorageKey(key: string) {
  return key.replace(/[^a-zA-Z0-9._-]/g, "");
}

async function getPersistedItem(key: string) {
  if (Platform.OS === "web") {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(key);
  }

  try {
    return await SecureStore.getItemAsync(toNativeStorageKey(key));
  } catch {
    return null;
  }
}

async function setPersistedItem(key: string, value: string) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, value);
    }

    return;
  }

  try {
    await SecureStore.setItemAsync(toNativeStorageKey(key), value);
  } catch {
    // Persisted viewing context is a convenience; do not crash the app if native storage rejects it.
  }
}

async function deletePersistedItem(key: string) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
    }

    return;
  }

  try {
    await SecureStore.deleteItemAsync(toNativeStorageKey(key));
  } catch {
    // Ignore storage cleanup failures for optional local UI state.
  }
}

function isViewingMode(value: string | null): value is ViewingMode {
  return value === "personal" || value === "family" || value === "caregiver_work";
}

type FamilyMembershipRow = {
  family_id: string;
  relationship: string | null;
  role: "owner" | "admin" | "member" | "caregiver";
};

type FamilySummaryRow = {
  id: string;
  name: string;
};

function normalizeFamilies(
  memberships: FamilyMembershipRow[],
  families: Array<FamilySummaryRow | null | undefined>
) {
  const familyMap = new Map<string, FamilyRecord>();
  const membershipByFamilyId = new Map(memberships.map((membership) => [membership.family_id, membership]));

  families.forEach((family) => {
    const membership = family?.id ? membershipByFamilyId.get(family.id) : null;

    if (family?.id && family.name && membership && membership.role !== "caregiver") {
      familyMap.set(family.id, {
        id: family.id,
        name: family.name,
        relationship: membership.relationship,
        role: membership.role
      });
    }
  });

  return Array.from(familyMap.values());
}

async function loadPersistedSelection() {
  const [familyId, mode] = await Promise.all([
    getPersistedItem(SELECTED_FAMILY_KEY),
    getPersistedItem(SELECTED_MODE_KEY)
  ]);

  return {
    familyId,
    mode: isViewingMode(mode) ? mode : DEFAULT_MODE
  };
}

export function ProfileProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [families, setFamilies] = useState<FamilyRecord[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<ViewingMode>(DEFAULT_MODE);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshProfileContext = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [{ data: userData, error: userError }, persistedSelection] = await Promise.all([
        supabase.auth.getUser(),
        loadPersistedSelection()
      ]);

      if (userError) {
        throw userError;
      }

      const authUser = userData.user;
      setUser(authUser);
      setSelectedMode(persistedSelection.mode);

      if (!authUser) {
        setProfile(null);
        setFamilies([]);
        setSelectedFamilyId(null);
        return;
      }

      const [{ data: profileData, error: profileError }, { data: membershipRows, error: membershipError }] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", authUser.id).maybeSingle(),
          supabase
            .from("family_memberships")
            .select("family_id, role, relationship")
            .eq("user_id", authUser.id)
            .in("role", ["owner", "admin", "member"])
        ]);

      if (profileError) {
        throw profileError;
      }

      if (membershipError) {
        throw membershipError;
      }

      const memberships = (membershipRows ?? []) as FamilyMembershipRow[];
      const familyIds = Array.from(new Set(memberships.map((row) => row.family_id).filter(Boolean)));
      const familyResult =
        familyIds.length > 0
          ? await supabase.from("families").select("id, name").in("id", familyIds)
          : { data: [], error: null };

      if (familyResult.error) {
        throw familyResult.error;
      }

      const loadedFamilies = normalizeFamilies(memberships, familyResult.data ?? []);
      const nextSelectedFamilyId =
        loadedFamilies.find((family) => family.id === persistedSelection.familyId)?.id ??
        loadedFamilies[0]?.id ??
        null;

      setProfile(profileData);
      setFamilies(loadedFamilies);
      setSelectedFamilyId(nextSelectedFamilyId);

      if (nextSelectedFamilyId) {
        await setPersistedItem(SELECTED_FAMILY_KEY, nextSelectedFamilyId);
      } else {
        await deletePersistedItem(SELECTED_FAMILY_KEY);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load profile context.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const refreshTimer = setTimeout(() => {
      refreshProfileContext();
    }, 0);

    const { data } = supabase.auth.onAuthStateChange(() => {
      refreshProfileContext();
    });

    return () => {
      clearTimeout(refreshTimer);
      data.subscription.unsubscribe();
    };
  }, [refreshProfileContext]);

  const switchFamily = useCallback(
    async (familyId: string) => {
      const family = families.find((item) => item.id === familyId);

      if (!family) {
        throw new Error("Choose a family you belong to.");
      }

      setSelectedFamilyId(family.id);
      await setPersistedItem(SELECTED_FAMILY_KEY, family.id);
    },
    [families]
  );

  const switchMode = useCallback(async (mode: ViewingMode) => {
    setSelectedMode(mode);
    await setPersistedItem(SELECTED_MODE_KEY, mode);
  }, []);

  const selectedFamily = useMemo(
    () => families.find((family) => family.id === selectedFamilyId) ?? null,
    [families, selectedFamilyId]
  );

  const value = useMemo(
    () => ({
      errorMessage,
      families,
      isLoading,
      profile,
      refreshProfileContext,
      selectedFamily,
      selectedMode,
      switchFamily,
      switchMode,
      user
    }),
    [
      errorMessage,
      families,
      isLoading,
      profile,
      refreshProfileContext,
      selectedFamily,
      selectedMode,
      switchFamily,
      switchMode,
      user
    ]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfileContext() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfileContext must be used within ProfileProvider.");
  }

  return context;
}
