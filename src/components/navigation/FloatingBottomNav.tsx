import { StyleSheet, useWindowDimensions, View } from "react-native";
import { Href, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { BabyPortalButton } from "@/components/navigation/BabyPortalButton";
import { FloatingBottomNavItem } from "@/components/navigation/FloatingBottomNavItem";
import type { AppIconName } from "@/constants/appIcons";
import { appShadows, zLayers } from "@/theme/designSystem";

const NAV_WIDTH_PERCENT = 0.92;
const NAV_HEIGHT = 74;
const WAVE_HEIGHT = 46;
const TOTAL_HEIGHT = NAV_HEIGHT + WAVE_HEIGHT;
const WAVE_BASE_WIDTH = 150;

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
  descriptors?: Record<string, { options: { tabBarAccessibilityLabel?: string } }>;
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
    label: "Home"
  },
  calendar: {
    accessibilityLabel: "Open Calendar",
    iconName: "calendar",
    label: "Calendar"
  },
  health: {
    accessibilityLabel: "Open Health",
    iconName: "health",
    label: "Health"
  },
  circle: {
    accessibilityLabel: "Open Family",
    iconName: "circle",
    label: "Family"
  },
  profile: {
    accessibilityLabel: "Open Settings",
    iconName: "settings",
    label: "Settings"
  }
};

type FloatingBottomNavProps = FloatingTabBarProps & {
  activeRouteName?: keyof typeof NAV_ITEMS;
  activeBabyPortal?: boolean;
  hasDueBabyReminder?: boolean;
  multipleBabyProfiles?: boolean;
  showBabyPortal?: boolean;
};

const STANDALONE_ROUTES = Object.keys(NAV_ITEMS).map((name) => ({ key: `standalone-${name}`, name }));

const NAV_HREFS: Record<string, Href> = {
  calendar: "/(tabs)/calendar" as Href,
  circle: "/(tabs)/circle" as Href,
  health: "/(tabs)/health" as Href,
  profile: "/(tabs)/profile" as Href,
  today: "/(tabs)/today" as Href
};

export function FloatingBottomNav({
  activeRouteName,
  activeBabyPortal = false,
  descriptors = {},
  hasDueBabyReminder = false,
  multipleBabyProfiles = false,
  navigation,
  showBabyPortal = false,
  state
}: FloatingBottomNavProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const routes = state?.routes ?? STANDALONE_ROUTES;
  const activeIndex =
    state?.index ??
    Math.max(
      0,
      routes.findIndex((route) => route.name === activeRouteName)
    );
  const visibleRoutes = routes.filter((route: TabRoute) => NAV_ITEMS[route.name]);

  const navWidth = screenWidth * NAV_WIDTH_PERCENT;
  const centerX = navWidth / 2;
  const navTopY = WAVE_HEIGHT;
  const navSafeOffset = insets.bottom + 14;
  const navPath = `
    M 38 ${navTopY}
    H ${centerX - WAVE_BASE_WIDTH / 2}
    C ${centerX - 58} ${navTopY}
      ${centerX - 50} ${navTopY - 24}
      ${centerX - 28} ${navTopY - 36}
    C ${centerX - 12} ${navTopY - 46}
      ${centerX + 12} ${navTopY - 46}
      ${centerX + 28} ${navTopY - 36}
    C ${centerX + 50} ${navTopY - 24}
      ${centerX + 58} ${navTopY}
      ${centerX + WAVE_BASE_WIDTH / 2} ${navTopY}
    H ${navWidth - 38}
    Q ${navWidth} ${navTopY} ${navWidth} ${navTopY + 38}
    V ${TOTAL_HEIGHT - 38}
    Q ${navWidth} ${TOTAL_HEIGHT} ${navWidth - 38} ${TOTAL_HEIGHT}
    H 38
    Q 0 ${TOTAL_HEIGHT} 0 ${TOTAL_HEIGHT - 38}
    V ${navTopY + 38}
    Q 0 ${navTopY} 38 ${navTopY}
    Z
  `;

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <View style={[styles.bottomNavWrapper, { bottom: navSafeOffset, width: navWidth }]}>
        <Svg height={TOTAL_HEIGHT} style={styles.navSvg} width={navWidth}>
          <Defs>
            <LinearGradient id="navGlass" x1="0" x2="1" y1="0" y2="1">
              <Stop offset="0" stopColor="rgba(36, 31, 30, 0.94)" />
              <Stop offset="1" stopColor="rgba(12, 18, 25, 0.96)" />
            </LinearGradient>
          </Defs>
          <Path
            d={navPath}
            fill="url(#navGlass)"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth={1}
          />
        </Svg>

        <View pointerEvents="box-none" style={styles.babySlot}>
          <BabyPortalButton
            active={activeBabyPortal}
            hasDueReminder={hasDueBabyReminder}
            multipleProfiles={multipleBabyProfiles}
            visible={showBabyPortal}
          />
        </View>

        <View style={styles.navContent}>
          {visibleRoutes.map((route: TabRoute) => {
            const config = NAV_ITEMS[route.name];
            const focused = activeIndex === routes.findIndex((item: TabRoute) => item.key === route.key);
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
                type: "tabPress"
              }) as { defaultPrevented?: boolean };

              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              if (!navigation) return;
              navigation.emit({
                target: route.key,
                type: "tabLongPress"
              });
            };

            return (
              <FloatingBottomNavItem
                accessibilityLabel={options.tabBarAccessibilityLabel ?? config.accessibilityLabel}
                focused={focused}
                iconName={config.iconName}
                key={route.key}
                label={config.label}
                offsetY={route.name === "health" && showBabyPortal && !focused ? 8 : 0}
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
  babySlot: {
    alignItems: "center",
    height: 64,
    justifyContent: "flex-start",
    left: 0,
    pointerEvents: "box-none",
    position: "absolute",
    right: 0,
    top: 7,
    zIndex: zLayers.floatingAction
  },
  bottomNavWrapper: {
    alignItems: "center",
    height: TOTAL_HEIGHT,
    justifyContent: "flex-end",
    overflow: "visible",
    position: "absolute",
    zIndex: zLayers.floatingNav,
    ...appShadows.floating,
  },
  navContent: {
    alignItems: "center",
    bottom: 10,
    flexDirection: "row",
    height: 56,
    justifyContent: "space-between",
    left: 14,
    position: "absolute",
    right: 14,
    zIndex: zLayers.floatingAction
  },
  navSvg: {
    bottom: 0,
    left: 0,
    position: "absolute"
  },
  overlay: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    alignItems: "center",
    zIndex: zLayers.floatingNav
  }
});
