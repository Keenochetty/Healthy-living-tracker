import { Tabs, useFocusEffect, usePathname } from "expo-router";
import { useCallback, useState } from "react";

import { FloatingAssistantButton, FloatingBottomNav } from "@/components/navigation";
import { getChildProfiles } from "@/lib/childStorage";

export default function TabsLayout() {
  const pathname = usePathname();
  const [showBabyButton, setShowBabyButton] = useState(false);
  const [multipleBabyProfiles, setMultipleBabyProfiles] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getChildProfiles()
        .then((profiles) => {
          setShowBabyButton(profiles.length > 0);
          setMultipleBabyProfiles(profiles.length > 1);
        })
        .catch(() => {
          setShowBabyButton(false);
          setMultipleBabyProfiles(false);
        });
    }, [])
  );

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false
        }}
        tabBar={(props) => (
          <FloatingBottomNav
            {...props}
            activeBabyPortal={pathname.startsWith("/baby-child")}
            multipleBabyProfiles={multipleBabyProfiles}
            showBabyPortal={showBabyButton}
          />
        )}
      >
        <Tabs.Screen
          name="today"
          options={{
            title: "Home",
          }}
        />

        <Tabs.Screen
          name="calendar"
          options={{
            title: "Calendar",
          }}
        />

        <Tabs.Screen
          name="health"
          options={{
            title: "Health",
          }}
        />

        <Tabs.Screen
          name="circle"
          options={{
            title: "Family",
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Settings",
          }}
        />
      </Tabs>
      <FloatingAssistantButton avoidBabyPortal={showBabyButton} />
    </>
  );
}
