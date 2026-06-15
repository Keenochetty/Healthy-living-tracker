import { Tabs } from "expo-router";
import { useState } from "react";

import { AiAssistantSheet } from "@/components/ai/AiAssistantSheet";
import { AiSearchBar } from "@/components/ai/AiSearchBar";
import { FloatingBottomNav } from "@/components/navigation";

export default function TabsLayout() {
  const [assistantVisible, setAssistantVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
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
          name="scan"
          options={{
            title: "Scan",
          }}
        />

        <Tabs.Screen
          name="health"
          options={{
            title: "Health",
          }}
        />

        <Tabs.Screen name="circle" options={{ title: "Family" }} />
        <Tabs.Screen name="fitness" options={{ href: null }} />
        <Tabs.Screen name="food" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
      </Tabs>
      <AiSearchBar onPress={() => setAssistantVisible(true)} />
      <AiAssistantSheet
        onClose={() => setAssistantVisible(false)}
        visible={assistantVisible}
      />
    </>
  );
}
