import {
  healthOSBottomNavRouteKeys,
  healthOSRouteRegistry,
  type HealthOSRouteConfig,
  type HealthOSRouteKey,
} from "./routeRegistry";

export type HealthOSRouteValidationResult = {
  bottomNavKeys: HealthOSRouteKey[];
  duplicateKeys: HealthOSRouteKey[];
  invalidBottomNavKeys: HealthOSRouteKey[];
  isValid: boolean;
  visibleBottomNavKeys: HealthOSRouteKey[];
};

export function validateHealthOSRoutes(): HealthOSRouteValidationResult {
  const keys = healthOSRouteRegistry.map((route) => route.key);
  const duplicateKeys = keys.filter((key, index) => keys.indexOf(key) !== index);
  const visibleBottomNavKeys = healthOSRouteRegistry
    .filter((route) => route.visibleInBottomNav)
    .map((route) => route.key);
  const invalidBottomNavKeys = visibleBottomNavKeys.filter(
    (key) => !healthOSBottomNavRouteKeys.includes(key),
  );

  return {
    bottomNavKeys: healthOSBottomNavRouteKeys,
    duplicateKeys,
    invalidBottomNavKeys,
    isValid:
      duplicateKeys.length === 0 &&
      invalidBottomNavKeys.length === 0 &&
      visibleBottomNavKeys.length === healthOSBottomNavRouteKeys.length,
    visibleBottomNavKeys,
  };
}

export function getVisibleBottomNavRoutes() {
  return healthOSRouteRegistry.filter((route) => route.visibleInBottomNav);
}

export function assertBottomNavContract() {
  return validateHealthOSRoutes();
}

export function getMissingExpectedEntryPoints() {
  return healthOSRouteRegistry
    .map((route) => ({
      key: route.key,
      missingEntryPoints: route.expectedEntryPoints.filter(
        (entryPoint) => !route.entryPoints.includes(entryPoint),
      ),
    }))
    .filter((item) => item.missingEntryPoints.length > 0);
}

export function getRouteByKey(key: HealthOSRouteKey) {
  return healthOSRouteRegistry.find((route) => route.key === key);
}

export function getRoutePath(key: HealthOSRouteKey) {
  return getRouteByKey(key)?.path;
}

export function isRouteActive(key: HealthOSRouteKey) {
  const route = getRouteByKey(key);
  return Boolean(route && (route.status === "active" || route.status === "hiddenTab" || route.status === "alias"));
}

export function getFallbackRoute(key: HealthOSRouteKey) {
  return getRouteByKey(key)?.fallbackPath ?? "/(tabs)/today";
}

export function getRouteAuditSummary() {
  const validation = validateHealthOSRoutes();
  const routesByStatus = healthOSRouteRegistry.reduce<Record<string, HealthOSRouteConfig[]>>(
    (groups, route) => {
      groups[route.status] = [...(groups[route.status] ?? []), route];
      return groups;
    },
    {},
  );

  return {
    bottomNav: validation,
    routeCount: healthOSRouteRegistry.length,
    routesByStatus,
    sensitiveCount: healthOSRouteRegistry.filter((route) => route.sensitive).length,
  };
}
