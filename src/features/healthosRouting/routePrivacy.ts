import { healthOSRouteRegistry } from "./routeRegistry";
import type { HealthOSRouteKey } from "./routeRegistry";

export const sensitiveHealthOSRouteKeys = healthOSRouteRegistry
  .filter((route) => route.sensitive)
  .map((route) => route.key);

export function isSensitiveHealthOSRoute(key: HealthOSRouteKey) {
  return sensitiveHealthOSRouteKeys.includes(key);
}

export const isSensitiveRoute = isSensitiveHealthOSRoute;

export function getSensitiveHealthOSRoutes() {
  return healthOSRouteRegistry.filter((route) => route.sensitive);
}

export function getRoutePrivacyLabel(key: HealthOSRouteKey) {
  if (key === "aiImportReview") return "Review required";
  if (key === "family" || key === "caregiver") return "Permission controlled";
  if (isSensitiveHealthOSRoute(key)) return "Private";
  return "Standard";
}

export function getRouteSafeNotificationTitle(key: HealthOSRouteKey) {
  if (key === "medication" || key === "supplements") return "Health reminder";
  if (key === "records") return "Record needs review";
  if (key === "pregnancy" || key === "babyChild" || key === "child") return "Care reminder";
  if (key === "cycle" || key === "womensHealth") return "Private health reminder";
  if (key === "aiImportReview") return "Draft ready for review";
  return "HealthOS reminder";
}

export function shouldHideDetailsInSharedContext(key: HealthOSRouteKey) {
  return isSensitiveHealthOSRoute(key);
}

export function requiresExplicitSharePermission(key: HealthOSRouteKey) {
  return (
    key === "family" ||
    key === "caregiver" ||
    key === "records" ||
    key === "medication" ||
    key === "supplements" ||
    key === "pregnancy" ||
    key === "babyChild" ||
    key === "child" ||
    key === "cycle" ||
    key === "womensHealth" ||
    key === "aiImportReview"
  );
}
