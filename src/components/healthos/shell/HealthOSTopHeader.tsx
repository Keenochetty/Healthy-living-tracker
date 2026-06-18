import type { ReactNode } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { Bell, Settings } from "lucide-react-native";

import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSHeaderSizes,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type HealthOSTopHeaderProps = {
  avatarUri?: string | null;
  collapsed?: boolean;
  initials?: string;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
  onSettingsPress?: () => void;
  rightAccessory?: ReactNode;
  showNotifications?: boolean;
  showSettings?: boolean;
  subtitle?: string;
  testID?: string;
  title?: string;
};

export function HealthOSTopHeader({
  avatarUri,
  collapsed = false,
  initials = "HS",
  onNotificationsPress,
  onProfilePress,
  onSettingsPress,
  rightAccessory,
  showNotifications = true,
  showSettings = false,
  subtitle,
  testID,
  title = "HealthOS",
}: HealthOSTopHeaderProps) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);

  return (
    <View
      style={[styles.container, collapsed && styles.collapsed]}
      testID={testID}
    >
      <Pressable
        accessibilityLabel="Open profile and settings"
        accessibilityRole="button"
        onPress={onProfilePress}
        style={[styles.avatarButton, surfaces.glassPill]}
      >
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : (
          <Text style={[healthOSTypography.buttonLabel, { color: palette.inkText }]}>
            {initials}
          </Text>
        )}
      </Pressable>
      <View style={styles.textBlock}>
        <Text
          numberOfLines={1}
          style={[healthOSTypography.cardTitle, { color: palette.inkText }]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={[healthOSTypography.caption, { color: palette.softText }]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.actions}>
        {rightAccessory}
        {showNotifications ? (
          <Pressable
            accessibilityLabel="Open notifications"
            accessibilityRole="button"
            onPress={onNotificationsPress}
            style={[styles.iconButton, surfaces.glassPill]}
          >
            <Bell color={palette.inkText} size={18} strokeWidth={2.2} />
          </Pressable>
        ) : null}
        {showSettings ? (
          <Pressable
            accessibilityLabel="Open settings"
            accessibilityRole="button"
            onPress={onSettingsPress}
            style={[styles.iconButton, surfaces.glassPill]}
          >
            <Settings color={palette.inkText} size={18} strokeWidth={2.2} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
  avatarButton: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: 38,
  },
  avatarImage: {
    borderRadius: healthOSRadius.pill,
    height: 38,
    width: 38,
  },
  collapsed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    minHeight: healthOSHeaderSizes.compactHeight,
    width: "100%",
  },
  iconButton: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: 38,
  },
  textBlock: {
    flex: 1,
    gap: 1,
    justifyContent: "center",
    minWidth: 0,
  },
});
