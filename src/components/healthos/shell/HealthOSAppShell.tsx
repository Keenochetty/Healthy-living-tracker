import type { ReactNode } from "react";
import { useState } from "react";
import { StyleSheet, useColorScheme, View } from "react-native";
import { Href, router } from "expo-router";

import { HealthOSScreen } from "@/components/healthos/HealthOSScreen";
import {
  healthOSLayout,
  healthOSSafeArea,
  healthOSSpacing,
  type HealthOSColorMode,
} from "@/theme/healthos";
import { HealthOSAICommandBar } from "./HealthOSAICommandBar";
import { HealthOSAICommandSheet } from "./HealthOSAICommandSheet";
import { HealthOSFloatingNav } from "./HealthOSFloatingNav";
import { HealthOSTopHeader } from "./HealthOSTopHeader";
import type { HealthOSNavKey, HealthOSNavItemConfig } from "./healthOSNavConfig";

type HealthOSAppShellProps = {
  activeNavKey?: HealthOSNavKey;
  aiPlaceholder?: string;
  avatarUri?: string | null;
  children: ReactNode;
  initials?: string;
  onNavigate?: (item: HealthOSNavItemConfig) => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
  onSettingsPress?: () => void;
  showAICommandBar?: boolean;
  showBottomNav?: boolean;
  showHeader?: boolean;
  subtitle?: string;
  testID?: string;
  title?: string;
  withBottomNavSpace?: boolean;
};

export function HealthOSAppShell({
  activeNavKey = "home",
  aiPlaceholder,
  avatarUri,
  children,
  initials,
  onNavigate,
  onNotificationsPress,
  onProfilePress,
  onSettingsPress,
  showAICommandBar = true,
  showBottomNav = true,
  showHeader = true,
  subtitle,
  testID,
  title,
  withBottomNavSpace = true,
}: HealthOSAppShellProps) {
  const [aiSheetVisible, setAiSheetVisible] = useState(false);
  useColorScheme() as HealthOSColorMode;

  function navigate(item: HealthOSNavItemConfig) {
    if (onNavigate) {
      onNavigate(item);
      return;
    }

    router.push(item.route as Href);
  }

  function openProfileControlPanel() {
    if (onProfilePress) {
      onProfilePress();
      return;
    }
    router.push("/settings" as Href);
  }

  function openReminderCenter() {
    if (onNotificationsPress) {
      onNotificationsPress();
      return;
    }
    router.push("/reminders" as Href);
  }

  return (
    <HealthOSScreen
      padded={false}
      scroll={false}
      testID={testID}
      withBottomNavSpace={false}
    >
      <View style={styles.shell}>
        {showHeader ? (
          <View style={styles.shellElement}>
            <HealthOSTopHeader
              avatarUri={avatarUri}
              initials={initials}
              onNotificationsPress={openReminderCenter}
              onProfilePress={openProfileControlPanel}
              onSettingsPress={onSettingsPress}
              showSettings={Boolean(onSettingsPress)}
              subtitle={subtitle}
              title={title}
            />
          </View>
        ) : null}
        {showAICommandBar ? (
          <View style={styles.aiBar}>
            <HealthOSAICommandBar
              onOpen={() => setAiSheetVisible(true)}
              placeholder={aiPlaceholder}
              routeContext={activeNavKey}
            />
          </View>
        ) : null}
        <View
          style={[
            styles.content,
            withBottomNavSpace && showBottomNav ? styles.bottomSpace : null,
          ]}
        >
          {children}
        </View>
        {showBottomNav ? (
          <HealthOSFloatingNav
            activeKey={activeNavKey}
            onNavigate={navigate}
          />
        ) : null}
      </View>
      <HealthOSAICommandSheet
        onClose={() => setAiSheetVisible(false)}
        routeContext={activeNavKey}
        visible={aiSheetVisible}
      />
    </HealthOSScreen>
  );
}

const styles = StyleSheet.create({
  aiBar: {
    alignSelf: "center",
    marginTop: healthOSSpacing.sm,
    maxWidth: healthOSLayout.screenMaxWidth,
    paddingHorizontal: healthOSSafeArea.screenHorizontal,
    width: "100%",
  },
  bottomSpace: {
    paddingBottom: healthOSSafeArea.bottomNavSpace,
  },
  content: {
    flex: 1,
    marginTop: healthOSSpacing.lg,
  },
  shell: {
    flex: 1,
    width: "100%",
  },
  shellElement: {
    alignSelf: "center",
    maxWidth: healthOSLayout.screenMaxWidth,
    paddingHorizontal: healthOSSafeArea.screenHorizontal,
    width: "100%",
  },
});
