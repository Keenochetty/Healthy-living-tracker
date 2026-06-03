import { Tabs } from "expo-router";

import { AppIcon } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import { useAppTheme } from "@/theme/ThemeProvider";

export default function TabsLayout() {
  const { theme } = useAppTheme();
  const isDark = theme.background === "#0f172a";
  const isPremiumDark = theme.nav !== undefined;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.nav ?? theme.surface,
          borderRadius: 999,
          borderTopWidth: 0,
          elevation: 12,
          height: 72,
          marginBottom: 16,
          marginHorizontal: 16,
          position: "absolute",
          shadowColor: "#000",
          shadowOpacity: isDark || isPremiumDark ? 0.28 : 0.12,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 }
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.mutedText,
        tabBarItemStyle: {
          borderRadius: 999,
          marginVertical: 8
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "800"
        }
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: "Today",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="today" />,
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="calendar" />,
        }}
      />

      <Tabs.Screen
        name="health"
        options={{
          title: "Health",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="health" />,
        }}
      />

      <Tabs.Screen
        name="circle"
        options={{
          title: "Circle",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="circle" />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="profile" />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ focused, name }: { focused: boolean; name: AppIconName }) {
  return (
    <AppIcon
      container={focused}
      containerVariant={focused ? "soft" : "transparent"}
      name={name}
      size={21}
      variant={focused ? "primary" : "muted"}
    />
  );
}
