import { healthOSRouteRegistry } from "./routeRegistry";
import type { HealthOSRouteKey } from "./routeRegistry";

export type HealthOSRouteEntryPoint = {
  entryPoints: string[];
  fromAI: boolean;
  fromBabyChild: boolean;
  fromCalendar: boolean;
  fromFamily: boolean;
  fromHealthHub: boolean;
  fromHome: boolean;
  fromMedication: boolean;
  fromNotifications: boolean;
  fromPregnancy: boolean;
  fromProfileSettings: boolean;
  fromRecords: boolean;
  fromScan: boolean;
  fromTrustedContent: boolean;
  key: HealthOSRouteKey;
  visibleInBottomNav: boolean;
};

export const healthOSRouteEntryPoints: HealthOSRouteEntryPoint[] =
  healthOSRouteRegistry.map((route) => ({
    entryPoints: route.entryPoints,
    fromAI: route.entryPoints.includes("ai"),
    fromBabyChild: route.entryPoints.includes("babyChild"),
    fromCalendar: route.entryPoints.includes("calendar"),
    fromFamily: route.entryPoints.includes("family"),
    fromHealthHub: route.entryPoints.includes("healthHub"),
    fromHome: route.entryPoints.includes("homeWidgets") || route.entryPoints.includes("bottomNav"),
    fromMedication: route.entryPoints.includes("medication"),
    fromNotifications: route.entryPoints.includes("headerBell") || route.entryPoints.includes("reminders"),
    fromPregnancy: route.entryPoints.includes("pregnancy"),
    fromProfileSettings: route.entryPoints.includes("settings") || route.entryPoints.includes("profileHeader"),
    fromRecords: route.entryPoints.includes("records"),
    fromScan: route.entryPoints.includes("scan"),
    fromTrustedContent: route.entryPoints.includes("trustedContent"),
    key: route.key,
    visibleInBottomNav: route.visibleInBottomNav,
  }));
