import { Href, router, useFocusEffect } from "expo-router";
import { ReactNode, useCallback, useState } from "react";
import { View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AiFloatingQuickBar } from "@/components/ai/AiFloatingQuickBar";
import { getInitials, PeopleAccountSheet, formatRelationship } from "@/components/identity";
import { AppScreen } from "@/components/ui";
import { useActiveProfile } from "@/context/ActiveProfileContext";
import { AppTopProfileHeader } from "./AppTopProfileHeader";
import { spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";

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
  const { activeProfile, permittedProfiles, refreshProfiles, selectProfile } = useActiveProfile();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const [peopleAccountVisible, setPeopleAccountVisible] = useState(false);
  const displayName = activeProfile?.displayName ?? "My profile";
  const initials = getInitials(displayName);

  useFocusEffect(
    useCallback(() => {
      refreshProfiles();
    }, [refreshProfiles])
  );

  function openProfile(profile = activeProfile) {
    if (!profile) return;
    setPeopleAccountVisible(false);

    if (profile.profileType === "self") {
      router.push("/settings" as Href);
      return;
    }

    router.push(`/profile/${profile.id}` as Href);
  }

  return (
    <View style={{ flex: 1 }}>
      {showHeader ? (
        <View
          style={{
            alignSelf: "center",
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
            borderBottomWidth: 1,
            paddingBottom: spacing.md,
            paddingHorizontal: spacing.xl,
            paddingTop: insets.top + spacing.md,
            width: "100%",
            maxWidth: 430,
            zIndex: 20
          }}
        >
          <AppTopProfileHeader
            avatarInitials={initials}
            avatarUri={activeProfile?.avatarUrl}
            greeting={title ?? subtitle}
            onOpenPeopleAccount={() => setPeopleAccountVisible(true)}
            onOpenProfile={() => openProfile()}
            onQuickActionPress={() => router.push("/calendar" as Href)}
            relationship={activeProfile ? formatRelationship(activeProfile) : "Me"}
            userName={displayName}
          />
        </View>
      ) : null}
      <AppScreen safeBottom={safeBottom} safeTop={!showHeader} scroll={scroll} style={screenStyle}>
        {children}
      </AppScreen>
      {showAi ? <AiFloatingQuickBar onScanPress={() => router.push("/ai" as Href)} /> : null}
      <PeopleAccountSheet
        activeProfile={activeProfile}
        onClose={() => setPeopleAccountVisible(false)}
        onOpenProfile={openProfile}
        onSelectProfile={async (profileId) => {
          await selectProfile(profileId);
        }}
        profiles={permittedProfiles}
        visible={peopleAccountVisible}
      />
    </View>
  );
}
