import { healthOSRouteRegistry } from "./routeRegistry";
import type { HealthOSRouteGroup } from "./routeRegistry";

export const healthOSRouteGroups: Record<HealthOSRouteGroup, string> = {
  account: "Profile and account controls",
  ai: "AI assistant and import review",
  archive: "Archived or inactive route areas",
  auth: "Auth and onboarding",
  deepRealm: "Hidden deep realm entry points",
  dev: "Development-only QA routes",
  family: "Family, circle, caregiver, child and elder care",
  health: "Health realms",
  mainTab: "Visible app shell tabs",
  records: "Private records and documents",
  reminders: "Calendar, reminders and notification center",
  settings: "Settings and privacy control panel",
  system: "System settings and infrastructure routes",
  trustedContent: "Trusted content and education",
  unknown: "Unknown or fallback routes",
};

export function getRoutesByGroup(group: HealthOSRouteGroup) {
  return healthOSRouteRegistry.filter((route) => route.group === group);
}
