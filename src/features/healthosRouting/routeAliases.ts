import type { HealthOSRouteKey } from "./routeRegistry";

export type HealthOSRouteAlias = {
  aliasPath: string;
  existsAsFile: boolean;
  notes?: string;
  targetKey: HealthOSRouteKey;
  targetPath: string;
};

export const healthOSRouteAliases: HealthOSRouteAlias[] = [
  {
    aliasPath: "/baby-child",
    existsAsFile: true,
    notes: "Baby/Child is the broad child-care realm.",
    targetKey: "babyChild",
    targetPath: "/baby-child",
  },
  {
    aliasPath: "/child",
    existsAsFile: true,
    notes: "Baby/Child and Child both exist; Baby/Child remains the broader entry.",
    targetKey: "babyChild",
    targetPath: "/baby-child",
  },
  {
    aliasPath: "/nutrition",
    existsAsFile: false,
    notes: "No /nutrition route exists. Use the hidden Food tab entry.",
    targetKey: "nutrition",
    targetPath: "/(tabs)/food",
  },
  {
    aliasPath: "/food",
    existsAsFile: false,
    notes: "Food detail routes exist, but there is no /food/index.tsx.",
    targetKey: "nutrition",
    targetPath: "/(tabs)/food",
  },
  {
    aliasPath: "/fitness",
    existsAsFile: false,
    notes: "Fitness detail routes exist, but there is no /fitness/index.tsx.",
    targetKey: "fitness",
    targetPath: "/(tabs)/fitness",
  },
  {
    aliasPath: "/circle",
    existsAsFile: false,
    notes: "Circle detail routes exist, but the Family tab is /(tabs)/circle.",
    targetKey: "family",
    targetPath: "/(tabs)/circle",
  },
  {
    aliasPath: "/family",
    existsAsFile: false,
    notes: "No /family route exists. Use the Family tab at /(tabs)/circle.",
    targetKey: "family",
    targetPath: "/(tabs)/circle",
  },
  {
    aliasPath: "/cycle",
    existsAsFile: true,
    notes: "Cycle is the existing route for Women's Health.",
    targetKey: "cycle",
    targetPath: "/cycle",
  },
  {
    aliasPath: "/womens-health",
    existsAsFile: false,
    notes: "No /womens-health route exists. Use /cycle.",
    targetKey: "womensHealth",
    targetPath: "/cycle",
  },
  {
    aliasPath: "/notifications",
    existsAsFile: false,
    notes: "Notification center route is /reminders.",
    targetKey: "reminders",
    targetPath: "/reminders",
  },
  {
    aliasPath: "/profile",
    existsAsFile: false,
    notes: "Profile detail route is /profile/[profileId]; self profile settings live at /settings.",
    targetKey: "settings",
    targetPath: "/settings",
  },
];
