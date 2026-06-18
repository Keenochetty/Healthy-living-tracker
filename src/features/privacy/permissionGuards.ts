import { healthOSSensitiveDataMap, type HealthOSDataArea } from "./sensitiveDataMap";

export type HealthOSPermissionStatus = "granted" | "denied" | "unknown";

export function isSensitiveDataArea(area: HealthOSDataArea) {
  return healthOSSensitiveDataMap[area]?.sensitive ?? true;
}

export function requiresExplicitPermission(area: HealthOSDataArea) {
  const item = healthOSSensitiveDataMap[area];
  return item ? item.sensitive && item.defaultPrivacyScope !== "publicReference" : true;
}

export function getDefaultPrivacyScope(area: HealthOSDataArea) {
  return healthOSSensitiveDataMap[area]?.defaultPrivacyScope ?? "unknown";
}

export function getPrivacySafeTitle(area: HealthOSDataArea) {
  return healthOSSensitiveDataMap[area]?.notificationPrivacySafeTitle ?? "Private update";
}

export function canDisplayDetailsInSharedContext(
  area: HealthOSDataArea,
  permissionStatus: HealthOSPermissionStatus,
) {
  if (!isSensitiveDataArea(area)) return true;
  return permissionStatus === "granted";
}

export function canAttachToAIContext(area: HealthOSDataArea, userConfirmed: boolean) {
  if (!userConfirmed) return false;
  return isSensitiveDataArea(area) || area === "trustedContent";
}

export function canShowInNotification(
  area: HealthOSDataArea,
  revealSensitiveContent: boolean,
) {
  if (!isSensitiveDataArea(area)) return true;
  return revealSensitiveContent === true;
}
