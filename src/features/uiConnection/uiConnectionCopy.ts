import type { HealthOSUIConnectionState } from "./uiConnectionTypes";

export const HEALTHOS_UI_CONNECTION_COPY: Record<HealthOSUIConnectionState, string> = {
  deferred: "This feature is not connected yet.",
  empty: "Nothing added yet.",
  error: "Couldn't load this right now.",
  loading: "Loading your data...",
  permissionRequired: "You do not have access to this yet.",
  ready: "Connected.",
  reviewRequired: "Review before saving.",
};

export function getUIConnectionCopy(
  state: HealthOSUIConnectionState,
  fallback?: string,
) {
  return fallback ?? HEALTHOS_UI_CONNECTION_COPY[state];
}
