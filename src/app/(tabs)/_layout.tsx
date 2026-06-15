import { Tabs } from "expo-router";

import { FloatingAssistantButton, FloatingBottomNav } from "@/components/navigation";

export default function TabsLayout() {
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
          name="fitness"
          options={{
            title: "Fitness",
          }}
        />

        <Tabs.Screen name="food" options={{ title: "Food" }} />
        <Tabs.Screen name="scan" options={{ href: null }} />
        <Tabs.Screen name="circle" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
      </Tabs>
      <FloatingAssistantButton />
    </>
  );
}
