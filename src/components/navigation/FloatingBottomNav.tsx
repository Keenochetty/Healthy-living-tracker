import { Href, router } from "expo-router";

import {
  getHealthOSNavItemByTabName,
  HealthOSFloatingNav,
  type HealthOSNavItemConfig,
} from "@/components/healthos/shell";

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

type FloatingBottomNavProps = FloatingTabBarProps & {
  activeRouteName?: HealthOSNavItemConfig["tabName"];
};

export function FloatingBottomNav({
  activeRouteName,
  navigation,
  state,
}: FloatingBottomNavProps) {
  const activeRoute = state?.routes[state.index];
  const activeItem =
    getHealthOSNavItemByTabName(activeRoute?.name) ??
    getHealthOSNavItemByTabName(activeRouteName) ??
    getHealthOSNavItemByTabName("today");

  function handleNavigate(item: HealthOSNavItemConfig) {
    if (!navigation || !state) {
      if (activeItem?.key !== item.key) {
        router.push(item.route as Href);
      }
      return;
    }

    const route = state.routes.find((candidate) => candidate.name === item.tabName);
    if (!route) return;

    const focused = activeRoute?.key === route.key;
    const event = navigation.emit({
      canPreventDefault: true,
      target: route.key,
      type: "tabPress",
    }) as { defaultPrevented?: boolean };

    if (!focused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  }

  return (
    <HealthOSFloatingNav
      activeKey={activeItem?.key ?? "home"}
      onNavigate={handleNavigate}
      testID="healthos-floating-bottom-nav"
    />
  );
}
