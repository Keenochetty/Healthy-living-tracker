import { Tabs, usePathname } from "expo-router";

import { FloatingAssistantButton, FloatingBottomNav } from "@/components/navigation";

export default function TabsLayout() {
  const pathname = usePathname();
  const showAssistant = !pathname.endsWith("/calendar");

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false
        }}
        tabBar={(props) => <FloatingBottomNav {...props} />}
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
      <FloatingAssistantButton visible={showAssistant} />
    </>
  );
}
