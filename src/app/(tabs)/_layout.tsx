import { useState } from "react";
import { Tabs, useSegments } from "expo-router";

import { AiAssistantSheet } from "@/components/ai/AiAssistantSheet";
import { AiSearchBar } from "@/components/ai/AiSearchBar";
import { FloatingBottomNav } from "@/components/navigation";
import { AppChromeProvider } from "@/context/AppChromeContext";

export default function TabsLayout() {
  const [aiOpen, setAiOpen] = useState(false);
  const segments = useSegments();
  const activeTab = segments[1];
  const hideGlobalAiSearch = activeTab === "scan";

  return (
    <AppChromeProvider>
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
      {!hideGlobalAiSearch ? <AiSearchBar onPress={() => setAiOpen(true)} /> : null}
      <AiAssistantSheet onClose={() => setAiOpen(false)} visible={aiOpen && !hideGlobalAiSearch} />
    </AppChromeProvider>
  );
}
