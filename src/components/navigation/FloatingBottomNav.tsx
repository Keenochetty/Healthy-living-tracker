import { StyleSheet, useWindowDimensions, View } from "react-native";
import { Href, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FloatingBottomNavItem } from "@/components/navigation/FloatingBottomNavItem";
import type { AppIconName } from "@/constants/appIcons";
import { appShadows, zLayers } from "@/theme/designSystem";
import { useAppTheme } from "@/theme/ThemeProvider";

const NAV_HEIGHT = 68;
const NAV_MAX_WIDTH = 390;
const NAV_SIDE_MARGIN = 16;

type NavConfig = {
  accessibilityLabel: string;
  iconName: AppIconName;
  label: string;
};

type TabRoute = {
  key: string;
  name: string;
  params?: object;
};

type FloatingTabBarProps = {
  descriptors?: Record<
    string,
    { options: { tabBarAccessibilityLabel?: string } }
  >;
  navigation?: {
    emit: (...args: any[]) => unknown;
    navigate: (...args: any[]) => void;
  };
  state?: {
    index: number;
    routes: TabRoute[];
  };
};

const NAV_ITEMS: Record<string, NavConfig> = {
  today: {
    accessibilityLabel: "Open Home",
    iconName: "home",
    label: "Home",
  },
  calendar: {
    accessibilityLabel: "Open Calendar",
    iconName: "calendar",
    label: "Calendar",
  },
  health: {
    accessibilityLabel: "Open Health",
    iconName: "health",
    label: "Health",
  },
  fitness: {
    accessibilityLabel: "Open Fitness",
    iconName: "fitness",
    label: "Fitness",
  },
  food: {
    accessibilityLabel: "Open Food",
    iconName: "food",
    label: "Food",
  },
};

type FloatingBottomNavProps = FloatingTabBarProps & {
  activeRouteName?: keyof typeof NAV_ITEMS;
};

const STANDALONE_ROUTES = Object.keys(NAV_ITEMS).map((name) => ({
  key: `standalone-${name}`,
  name,
}));

const NAV_HREFS: Record<string, Href> = {
  calendar: "/(tabs)/calendar" as Href,
  fitness: "/(tabs)/fitness" as Href,
  food: "/(tabs)/food" as Href,
  health: "/(tabs)/health" as Href,
  today: "/(tabs)/today" as Href,
};

export function FloatingBottomNav({
  activeRouteName,
  descriptors = {},
  navigation,
  state,
}: FloatingBottomNavProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();
  const routes = state?.routes ?? STANDALONE_ROUTES;
  const activeIndex =
    state?.index ??
    Math.max(
      0,
      routes.findIndex((route) => route.name === activeRouteName),
    );
  const visibleRoutes = routes.filter(
    (route: TabRoute) => NAV_ITEMS[route.name],
  );

  const compact = screenWidth < 400;
  const navWidth = Math.min(screenWidth - NAV_SIDE_MARGIN * 2, NAV_MAX_WIDTH);
  const navSafeOffset = insets.bottom + 14;

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <View
        style={[
          styles.bottomNavWrapper,
          {
            backgroundColor: theme.nav ?? theme.surface,
            borderColor: theme.border,
            bottom: navSafeOffset,
            shadowColor: theme.background,
            width: navWidth,
          },
        ]}
      >
        <View
          style={[styles.navContent, compact ? styles.navContentCompact : null]}
        >
          {visibleRoutes.map((route: TabRoute) => {
            const config = NAV_ITEMS[route.name];
            const focused =
              activeIndex ===
              routes.findIndex((item: TabRoute) => item.key === route.key);
            const { options = {} } = descriptors[route.key] ?? {};

            const onPress = () => {
              if (!navigation || !state) {
                if (!focused) {
                  router.push(NAV_HREFS[route.name]);
                }
                return;
              }

              const event = navigation.emit({
                canPreventDefault: true,
                target: route.key,
                type: "tabPress",
              }) as { defaultPrevented?: boolean };

              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              if (!navigation) return;
              navigation.emit({
                target: route.key,
                type: "tabLongPress",
              });
            };

            return (
              <FloatingBottomNavItem
                accessibilityLabel={
                  options.tabBarAccessibilityLabel ?? config.accessibilityLabel
                }
                focused={focused}
                iconName={config.iconName}
                key={route.key}
                label={config.label}
                onLongPress={onLongPress}
                onPress={onPress}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavWrapper: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    height: NAV_HEIGHT,
    justifyContent: "center",
    overflow: "hidden",
    position: "absolute",
    zIndex: zLayers.floatingNav,
    ...appShadows.floating,
  },
  navContent: {
    alignItems: "center",
    flexDirection: "row",
    height: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    width: "100%",
    zIndex: zLayers.floatingAction,
  },
  navContentCompact: {
    paddingHorizontal: 5,
  },
  overlay: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    alignItems: "center",
    zIndex: zLayers.floatingNav,
  },
});
