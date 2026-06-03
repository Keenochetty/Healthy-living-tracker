import type { Session, User } from "@supabase/supabase-js";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";

import {
  getLocalTestingMode,
  saveLocalOnboardingBackup,
  setLocalTestingMode
} from "@/lib/authStorage";
import {
  getProfile,
  loadCloudPreferences,
  saveOnboardingToCloud,
  signInWithEmail,
  signOut as signOutFromSupabase,
  signUpWithEmail
} from "@/lib/profileSync";
import { supabase } from "@/lib/supabase";
import {
  getUserPreferences,
  saveUserPreferences
} from "@/lib/userPreferences";
import type { AuthUserProfile } from "@/types/auth";
import type { UserPreferences } from "@/types/profile";

type AuthContextValue = {
  error: string | null;
  initialized: boolean;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  loading: boolean;
  localMode: boolean;
  logout: () => Promise<{ error: string | null }>;
  preferences: UserPreferences | null;
  profile: AuthUserProfile | null;
  refreshProfile: () => Promise<void>;
  savePreferences: (
    preferences: UserPreferences
  ) => Promise<{ error: string | null; savedLocally: boolean }>;
  session: Session | null;
  setLocalMode: (enabled: boolean) => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error: string | null }>;
  user: User | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

function mapProfile(user: User | null, profile: AuthUserProfile | null) {
  if (profile) return profile;
  if (!user) return null;

  return {
    email: user.email,
    fullName:
      typeof user.user_metadata.full_name === "string"
        ? user.user_metadata.full_name
        : null,
    id: user.id
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [localMode, setLocalModeState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [profile, setProfile] = useState<AuthUserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const user = session?.user ?? null;

  const hydrateLocalPreferences = useCallback(async () => {
    const localPreferences = await getUserPreferences();

    setPreferences(localPreferences);

    return localPreferences;
  }, []);

  const refreshProfile = useCallback(async () => {
    const currentUser = session?.user;

    if (!currentUser) {
      await hydrateLocalPreferences();
      setProfile(null);
      return;
    }

    const cloudPreferences = await loadCloudPreferences(currentUser.id);

    if (cloudPreferences.data) {
      const saved = await saveUserPreferences(cloudPreferences.data, {
        skipRemoteSync: true
      });
      setPreferences(saved);
    } else {
      await hydrateLocalPreferences();
      setError(cloudPreferences.error);
    }

    const profileResult = await getProfile(currentUser.id);
    const row = profileResult.data;

    setProfile(
      mapProfile(
        currentUser,
        row
          ? {
              avatarUrl: row.avatar_url,
              createdAt: row.created_at,
              email: row.email,
              fullName: row.full_name,
              id: row.id
            }
          : null
      )
    );
  }, [hydrateLocalPreferences, session?.user]);

  useEffect(() => {
    let isActive = true;

    async function initialise() {
      setLoading(true);
      const [localEnabled, localPreferences, sessionResult] = await Promise.all([
        getLocalTestingMode(),
        getUserPreferences(),
        supabase.auth.getSession()
      ]);

      if (!isActive) return;

      setLocalModeState(localEnabled);
      setPreferences(localPreferences);
      setSession(sessionResult.data.session);
      setInitialized(true);
      setLoading(false);
    }

    initialise();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      isActive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const refreshTask = Promise.resolve().then(refreshProfile);

    refreshTask.catch(() => {
      setError("Could not sync right now. Your local settings are still saved.");
    });
  }, [initialized, refreshProfile]);

  async function signIn(email: string, password: string) {
    setError(null);
    setLoading(true);
    const result = await signInWithEmail({ email, password });
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return { error: result.error };
    }

    setSession(result.data);
    await setLocalTestingMode(false);
    setLocalModeState(false);

    return { error: null };
  }

  async function signUp(email: string, password: string, fullName = "") {
    setError(null);
    setLoading(true);
    const result = await signUpWithEmail({ email, fullName, password });
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return { error: result.error };
    }

    await setLocalTestingMode(false);
    setLocalModeState(false);

    return { error: null };
  }

  async function logout() {
    setError(null);
    const result = await signOutFromSupabase();

    if (result.error) {
      setError(result.error);
      return { error: result.error };
    }

    setSession(null);
    setProfile(null);
    await hydrateLocalPreferences();

    return { error: null };
  }

  async function savePreferences(nextPreferences: UserPreferences) {
    const local = await saveLocalOnboardingBackup(nextPreferences);

    setPreferences(local);

    if (!user) {
      return { error: null, savedLocally: true };
    }

    const result = await saveOnboardingToCloud(user.id, local);

    if (result.error) {
      setError("Saved locally. Cloud sync will retry later.");
      return { error: "Saved locally. Cloud sync will retry later.", savedLocally: true };
    }

    setError(null);

    return { error: null, savedLocally: true };
  }

  async function setLocalMode(enabled: boolean) {
    await setLocalTestingMode(enabled);
    setLocalModeState(enabled);
  }

  const value: AuthContextValue = {
    error,
    initialized,
    isAuthenticated: Boolean(user),
    isOnboarded: Boolean(preferences?.onboardingComplete),
    loading,
    localMode,
    logout,
    preferences,
    profile,
    refreshProfile,
    savePreferences,
    session,
    setLocalMode,
    signIn,
    signOut: async () => {
      await logout();
    },
    signUp,
    user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
