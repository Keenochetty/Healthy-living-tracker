import type { HealthOSBackendStatus } from "./backendTypes";

export function getMissingTableMessage() {
  return "This backend table is not available yet.";
}

export function getMissingTypesMessage() {
  return "Generated backend types are not available yet.";
}

export function getPermissionDeniedMessage() {
  return "You do not have permission to access this data.";
}

export function getDeferredFeatureMessage() {
  return "This backend connection is deferred until the required schema and types are ready.";
}

export function getSupabaseErrorSafeMessage(error?: { code?: string; message?: string } | null) {
  if (!error) return null;
  if (error.code === "42501" || error.code === "PGRST301") return getPermissionDeniedMessage();
  if (error.code === "42P01" || error.code === "PGRST205" || error.code === "PGRST204") return getMissingTableMessage();
  return "Backend data is not available right now.";
}

export function getBackendErrorMessage(status: HealthOSBackendStatus, error?: string | null) {
  if (error) return error;
  if (status === "missingTable") return getMissingTableMessage();
  if (status === "missingTypes") return getMissingTypesMessage();
  if (status === "permissionDenied") return getPermissionDeniedMessage();
  if (status === "deferred") return getDeferredFeatureMessage();
  if (status === "missingAuth") return "Sign in required.";
  return "Backend data is not available right now.";
}
