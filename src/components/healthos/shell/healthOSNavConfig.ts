import type { Href } from "expo-router";

import type { AppIconName } from "@/constants/appIcons";

export type HealthOSNavKey = "calendar" | "family" | "health" | "home" | "scan";

export type HealthOSNavItemConfig = {
  accessibilityLabel: string;
  hideAICommandBar?: boolean;
  hideHeader?: boolean;
  iconName: AppIconName;
  key: HealthOSNavKey;
  label: string;
  route: Href;
  tabName: "calendar" | "circle" | "health" | "scan" | "today";
};

export const healthOSNavItems: HealthOSNavItemConfig[] = [
  {
    accessibilityLabel: "Open Home",
    iconName: "home",
    key: "home",
    label: "Home",
    route: "/(tabs)/today" as Href,
    tabName: "today",
  },
  {
    accessibilityLabel: "Open Calendar",
    iconName: "calendar",
    key: "calendar",
    label: "Calendar",
    route: "/(tabs)/calendar" as Href,
    tabName: "calendar",
  },
  {
    accessibilityLabel: "Open Scan",
    hideAICommandBar: true,
    hideHeader: true,
    iconName: "scan",
    key: "scan",
    label: "Scan",
    route: "/(tabs)/scan" as Href,
    tabName: "scan",
  },
  {
    accessibilityLabel: "Open Health",
    iconName: "health",
    key: "health",
    label: "Health",
    route: "/(tabs)/health" as Href,
    tabName: "health",
  },
  {
    accessibilityLabel: "Open Family",
    iconName: "circle",
    key: "family",
    label: "Family",
    route: "/(tabs)/circle" as Href,
    tabName: "circle",
  },
];

export const healthOSNavItemsByTabName = healthOSNavItems.reduce(
  (accumulator, item) => {
    accumulator[item.tabName] = item;
    return accumulator;
  },
  {} as Partial<Record<HealthOSNavItemConfig["tabName"], HealthOSNavItemConfig>>,
);

export function getHealthOSNavItemByTabName(tabName?: string) {
  return healthOSNavItems.find((item) => item.tabName === tabName);
}

export function getHealthOSNavItemByKey(key?: string) {
  return healthOSNavItems.find((item) => item.key === key);
}
