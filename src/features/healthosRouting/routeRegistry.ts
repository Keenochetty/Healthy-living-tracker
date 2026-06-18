export type HealthOSRouteGroup =
  | "account"
  | "ai"
  | "archive"
  | "auth"
  | "deepRealm"
  | "dev"
  | "family"
  | "health"
  | "mainTab"
  | "records"
  | "reminders"
  | "settings"
  | "system"
  | "unknown"
  | "trustedContent";

export type HealthOSRouteStatus =
  | "active"
  | "alias"
  | "archived"
  | "deferred"
  | "hiddenTab"
  | "legacy"
  | "missing";

export type HealthOSRouteKey =
  | "ai"
  | "aiImportReview"
  | "auth"
  | "babyChild"
  | "biometrics"
  | "calendar"
  | "caregiver"
  | "child"
  | "cycle"
  | "deviceSync"
  | "elder"
  | "family"
  | "fitness"
  | "food"
  | "health"
  | "healthCalendar"
  | "home"
  | "join"
  | "medication"
  | "mensHealth"
  | "nutrition"
  | "notifications"
  | "onboarding"
  | "pregnancy"
  | "profile"
  | "records"
  | "reminders"
  | "scan"
  | "settings"
  | "supplements"
  | "trustedContent"
  | "unknown"
  | "womensHealth";

export type HealthOSRouteConfig = {
  aliases: string[];
  entryPoints: string[];
  expectedEntryPoints: string[];
  fallbackPath: string;
  group: HealthOSRouteGroup;
  key: HealthOSRouteKey;
  label: string;
  notes?: string;
  path: string;
  relatedRealms: string[];
  requiresAuth: boolean;
  sensitive: boolean;
  status: HealthOSRouteStatus;
  title: string;
  visibleInBottomNav: boolean;
};

export const healthOSRouteRegistry: HealthOSRouteConfig[] = [
  route("home", "Home", "/(tabs)/today", "mainTab", true, false, ["bottomNav", "rootRedirect"], ["today"], "active"),
  route("calendar", "Calendar", "/(tabs)/calendar", "mainTab", true, true, ["bottomNav", "homeWidgets", "reminders"], ["calendar", "reminders"], "active"),
  route("scan", "Scan / AI Camera", "/(tabs)/scan", "mainTab", true, true, ["bottomNav", "records", "medication", "healthHub"], ["scan", "records", "ai"], "active"),
  route("health", "Health Hub", "/(tabs)/health", "mainTab", true, true, ["bottomNav", "homeWidgets"], ["health"], "active"),
  route("family", "Family / Circle", "/(tabs)/circle", "mainTab", true, true, ["bottomNav", "homeWidgets", "settings"], ["family", "circle", "caregiver"], "active"),

  route("fitness", "Fitness", "/(tabs)/fitness", "deepRealm", false, false, ["healthHub", "homeWidgets", "calendar"], ["fitness", "nutrition"], "hiddenTab", undefined, ["/fitness"]),
  route("nutrition", "Nutrition / Food", "/(tabs)/food", "deepRealm", false, false, ["healthHub", "homeWidgets", "calendar"], ["nutrition", "food", "fitness"], "hiddenTab", undefined, ["/nutrition", "/food"]),
  route("food", "Food", "/(tabs)/food", "deepRealm", false, false, ["healthHub", "homeWidgets", "calendar"], ["nutrition", "food"], "alias", "Food is the existing route name for the Nutrition realm.", ["/nutrition", "/food"]),
  route("medication", "Medication", "/medication", "health", false, true, ["healthHub", "calendar", "scan"], ["medication", "supplements"], "active"),
  route("supplements", "Supplements", "/supplements", "health", false, true, ["healthHub", "calendar", "scan"], ["supplements", "medication"], "active"),
  route("records", "Records", "/records", "records", false, true, ["healthHub", "homeWidgets", "scan"], ["records", "documents"], "active"),
  route("biometrics", "Biometrics", "/biometrics", "health", false, true, ["healthHub"], ["health", "biometrics"], "active"),
  route("cycle", "Women's Health / Cycle", "/cycle", "health", false, true, ["healthHub", "calendar"], ["cycle", "womensHealth"], "active", undefined, ["/womens-health"]),
  route("womensHealth", "Women's Health", "/cycle", "health", false, true, ["healthHub", "calendar"], ["cycle", "womensHealth"], "alias", "Women's Health routes through the existing /cycle screen.", ["/womens-health"]),
  route("pregnancy", "Pregnancy", "/pregnancy", "health", false, true, ["healthHub", "calendar"], ["pregnancy"], "active"),
  route("babyChild", "Baby / Child", "/baby-child", "family", false, true, ["healthHub", "family", "records"], ["babyChild", "child"], "active"),
  route("child", "Child Detail", "/child", "family", false, true, ["family"], ["child", "babyChild"], "active"),
  route("caregiver", "Caregiver", "/caregiver", "family", false, true, ["family"], ["caregiver", "family"], "active"),
  route("elder", "Elder Care", "/elder", "family", false, true, ["family"], ["elder", "caregiver"], "active"),
  route("mensHealth", "Men's Health", "/mens-health", "health", false, true, ["healthHub"], ["mensHealth"], "active"),
  route("deviceSync", "Device Sync", "/device-sync", "health", false, true, ["healthHub", "settings"], ["devices", "fitness", "biometrics"], "active"),
  route("healthCalendar", "Health Calendar", "/health-calendar", "reminders", false, true, ["settings", "reminders"], ["calendar", "reminders"], "legacy"),

  route("ai", "HealthSync AI", "/ai", "ai", false, true, ["scan", "records", "trustedContent"], ["ai", "import"], "active"),
  route("aiImportReview", "AI Import Review", "/ai/import-review", "ai", false, true, ["ai"], ["ai", "records"], "active"),
  route("reminders", "Reminder Center", "/reminders", "reminders", false, true, ["headerBell", "calendar", "settings"], ["reminders", "notifications"], "active", undefined, ["/notifications"]),
  route("notifications", "Notifications", "/reminders", "reminders", false, true, ["headerBell", "settings"], ["reminders", "notifications"], "alias", "Notifications route through the Reminder Center.", ["/notifications"]),
  route("trustedContent", "Trusted Content", "/trusted-content", "trustedContent", false, false, ["healthHub", "ai", "records"], ["trustedContent"], "active"),

  route("settings", "Settings", "/settings", "settings", false, true, ["headerGear", "profileHeader"], ["settings", "privacy"], "active"),
  route("profile", "Profile", "/settings", "account", false, true, ["profileHeader", "settings"], ["profile", "account"], "alias", "Profile controls route through Settings unless opening a specific /profile/[profileId]."),
  route("auth", "Auth", "/auth", "auth", false, true, ["rootStack"], ["auth"], "active"),
  route("onboarding", "Onboarding", "/onboarding", "auth", false, true, ["auth"], ["onboarding"], "active"),
  route("join", "Join Invite", "/join/[token]", "family", false, true, ["inviteLink"], ["family", "circle"], "active"),
  route("unknown", "Unknown", "/(tabs)/today", "unknown", false, false, [], [], "deferred", "Fallback route for unknown route keys."),
];

export const healthOSBottomNavRouteKeys: HealthOSRouteKey[] = [
  "home",
  "calendar",
  "scan",
  "health",
  "family",
];

export function getHealthOSRoute(key: HealthOSRouteKey) {
  return healthOSRouteRegistry.find((item) => item.key === key);
}

function route(
  key: HealthOSRouteKey,
  title: string,
  path: string,
  group: HealthOSRouteGroup,
  visibleInBottomNav: boolean,
  sensitive: boolean,
  entryPoints: string[],
  relatedRealms: string[],
  status: HealthOSRouteStatus,
  notes?: string,
  aliases: string[] = [],
  fallbackPath = path,
): HealthOSRouteConfig {
  return {
    aliases,
    entryPoints,
    expectedEntryPoints: entryPoints,
    fallbackPath,
    group,
    key,
    label: title,
    notes,
    path,
    relatedRealms,
    requiresAuth: group !== "auth",
    sensitive,
    status,
    title,
    visibleInBottomNav,
  };
}
