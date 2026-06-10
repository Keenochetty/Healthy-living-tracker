import { createContext, useContext, useState, type ReactNode } from "react";

import {
  GENERAL_HEALTH_ACTIVITY,
  GENERAL_HEALTH_MOCK_PROFILE,
  type GeneralHealthActivityEntry
} from "@/lib/generalHealthMockData";

type GeneralHealthActivityContextValue = {
  activities: GeneralHealthActivityEntry[];
  addActivity: (activity: GeneralHealthActivityEntry) => void;
  selectedProfileId: string;
  selectedProfileName: string;
};

const GeneralHealthActivityContext = createContext<GeneralHealthActivityContextValue | null>(null);

export function GeneralHealthActivityProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<GeneralHealthActivityEntry[]>(() => GENERAL_HEALTH_ACTIVITY.map((entry) => ({ ...entry })));

  function addActivity(activity: GeneralHealthActivityEntry) {
    setActivities((current) => [activity, ...current]
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()));
  }

  return (
    <GeneralHealthActivityContext.Provider
      value={{
        activities,
        addActivity,
        // TODO: Enforce final selected-profile permissions and sharing rules
        // through the approved privacy layer.
        selectedProfileId: GENERAL_HEALTH_MOCK_PROFILE.id,
        selectedProfileName: GENERAL_HEALTH_MOCK_PROFILE.name
      }}
    >
      {children}
    </GeneralHealthActivityContext.Provider>
  );
}

export function useGeneralHealthActivity() {
  const context = useContext(GeneralHealthActivityContext);
  if (!context) {
    throw new Error("useGeneralHealthActivity must be used within GeneralHealthActivityProvider");
  }
  return context;
}
