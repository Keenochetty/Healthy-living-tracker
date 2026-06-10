import { Href, router } from "expo-router";
import { ReactNode, useEffect, useState } from "react";
import { View, type ViewStyle } from "react-native";

import { AiFloatingQuickBar } from "@/components/ai/AiFloatingQuickBar";
import { AppScreen } from "@/components/ui";
import { getUserPreferences } from "@/lib/userPreferences";
import type { UserPreferences } from "@/types/profile";
import { AppTopProfileHeader } from "./AppTopProfileHeader";

type AppMainLayoutProps = {
  children: ReactNode;
  safeBottom?: boolean;
  screenStyle?: ViewStyle;
  scroll?: boolean;
  showAi?: boolean;
  showHeader?: boolean;
  subtitle?: string;
  title?: string;
};

export function AppMainLayout({
  children,
  safeBottom = true,
  screenStyle,
  scroll = true,
  showAi = false,
  showHeader = true,
  subtitle,
  title
}: AppMainLayoutProps) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const displayName = preferences?.displayName.trim() || "Friend";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2) || "HL";

  useEffect(() => {
    getUserPreferences().then(setPreferences);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <AppScreen safeBottom={safeBottom} scroll={scroll} style={screenStyle}>
        {showHeader ? (
          <AppTopProfileHeader
            avatarInitials={initials}
            greeting={subtitle ?? "Welcome back,"}
            onQuickActionPress={() => router.push("/calendar" as Href)}
            userName={title ?? displayName}
          />
        ) : null}
        {children}
      </AppScreen>
      {showAi ? <AiFloatingQuickBar onScanPress={() => router.push("/ai" as Href)} /> : null}
    </View>
  );
}
