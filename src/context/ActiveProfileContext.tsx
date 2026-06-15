import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getActiveProfile,
  getProfilesVisibleToUser,
  setActiveProfile,
} from "@/lib/familyPermissionsStorage";
import type { HealthProfile } from "@/types/familyPermissions";

type ActiveProfileContextValue = {
  activeProfile: HealthProfile | null;
  isLoading: boolean;
  permittedProfiles: HealthProfile[];
  refreshProfiles: () => Promise<void>;
  selectProfile: (profileId: string) => Promise<HealthProfile | null>;
};

const ActiveProfileContext = createContext<ActiveProfileContextValue | null>(
  null,
);

export function ActiveProfileProvider({ children }: { children: ReactNode }) {
  const [activeProfile, setActiveProfileState] = useState<HealthProfile | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [permittedProfiles, setPermittedProfiles] = useState<HealthProfile[]>(
    [],
  );

  const refreshProfiles = useCallback(async () => {
    setIsLoading(true);

    try {
      const [profiles, active] = await Promise.all([
        getProfilesVisibleToUser(),
        getActiveProfile(),
      ]);
      setPermittedProfiles(profiles);
      setActiveProfileState(active);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfiles();
  }, [refreshProfiles]);

  const selectProfile = useCallback(
    async (profileId: string) => {
      if (!permittedProfiles.some((profile) => profile.id === profileId))
        return null;

      const nextProfile = await setActiveProfile(profileId);
      if (nextProfile) setActiveProfileState(nextProfile);
      return nextProfile;
    },
    [permittedProfiles],
  );

  const value = useMemo(
    () => ({
      activeProfile,
      isLoading,
      permittedProfiles,
      refreshProfiles,
      selectProfile,
    }),
    [
      activeProfile,
      isLoading,
      permittedProfiles,
      refreshProfiles,
      selectProfile,
    ],
  );

  return (
    <ActiveProfileContext.Provider value={value}>
      {children}
    </ActiveProfileContext.Provider>
  );
}

export function useActiveProfile() {
  const context = useContext(ActiveProfileContext);
  if (!context)
    throw new Error(
      "useActiveProfile must be used within ActiveProfileProvider",
    );
  return context;
}
