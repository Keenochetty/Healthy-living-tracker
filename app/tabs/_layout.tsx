import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";

import { AppIcon, FloatingAIButton } from "@/components/ui";
import { layout } from "@/constants/layout";
import { colors, shadows } from "@/constants/theme";

export default function TabsLayout() {
  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.brand.primary,
          tabBarInactiveTintColor: colors.text.muted,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "700"
          },
          tabBarItemStyle: {
            borderRadius: 18,
            marginHorizontal: 2,
            paddingVertical: 2
          },
          tabBarActiveBackgroundColor: colors.brand.primarySoft,
          tabBarStyle: {
            backgroundColor: colors.card.background,
            borderColor: colors.border.soft,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderTopWidth: 1,
            height: layout.tabBarHeight,
            paddingBottom: 10,
            paddingTop: 8,
            ...shadows.soft
          }
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused, size }) => (
              <AppIcon color={color} name="home" size={size} variant={focused ? "filled" : "outline"} />
            )
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: "Calendar",
            tabBarIcon: ({ color, focused, size }) => (
              <AppIcon color={color} name="calendar" size={size} variant={focused ? "filled" : "outline"} />
            )
          }}
        />
        <Tabs.Screen
          name="profiles"
          options={{
            title: "Profiles",
            tabBarIcon: ({ color, focused, size }) => (
              <AppIcon color={color} name="profiles" size={size} variant={focused ? "filled" : "outline"} />
            )
          }}
        />
        <Tabs.Screen
          name="care"
          options={{
            title: "Health",
            tabBarIcon: ({ color, focused, size }) => (
              <AppIcon color={color} name="activity" size={size} variant={focused ? "filled" : "outline"} />
            )
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: "More",
            tabBarIcon: ({ color, focused, size }) => (
              <AppIcon color={color} name="more" size={size} variant={focused ? "filled" : "outline"} />
            )
          }}
        />
      </Tabs>
      <FloatingAIButton />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  }
});
