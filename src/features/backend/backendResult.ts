import { getSupabaseErrorSafeMessage } from "./backendErrors";
import type { HealthOSBackendStatus } from "./backendTypes";

export type HealthOSServiceResult<T> = {
  data: T | null;
  deferredReason?: string | null;
  error: string | null;
  status: HealthOSBackendStatus;
};

export type HealthOSListServiceResult<T> = {
  data: T[];
  deferredReason?: string | null;
  error: string | null;
  status: HealthOSBackendStatus;
};

export const createReadyResult = <T>(data: T): HealthOSServiceResult<T> => ({ data, error: null, status: "ready" });
export const createReadyListResult = <T>(data: T[] = []): HealthOSListServiceResult<T> => ({ data, error: null, status: "ready" });
export const createMissingAuthResult = <T>(): HealthOSServiceResult<T> => ({ data: null, error: "Sign in required.", status: "missingAuth" });
export const createMissingTableResult = <T>(deferredReason?: string): HealthOSServiceResult<T> => ({ data: null, deferredReason, error: "This backend table is not available yet.", status: "missingTable" });
export const createMissingTypesResult = <T>(deferredReason?: string): HealthOSServiceResult<T> => ({ data: null, deferredReason, error: "Generated backend types are not available yet.", status: "missingTypes" });
export const createDeferredResult = <T>(deferredReason?: string): HealthOSServiceResult<T> => ({ data: null, deferredReason, error: deferredReason ?? "This backend connection is deferred.", status: "deferred" });
export const createPermissionDeniedResult = <T>(): HealthOSServiceResult<T> => ({ data: null, error: "You do not have permission to access this data.", status: "permissionDenied" });
export const createErrorResult = <T>(error?: string | null): HealthOSServiceResult<T> => ({ data: null, error: error ?? "Backend data is not available right now.", status: "error" });

export function normalizeSupabaseError(error?: { code?: string; message?: string } | null): HealthOSBackendStatus {
  if (!error) return "ready";
  if (error.code === "42501" || error.code === "PGRST301") return "permissionDenied";
  if (error.code === "42P01" || error.code === "PGRST205" || error.code === "PGRST204") return "missingTable";
  return "error";
}

export function createResultFromSupabaseError<T>(error?: { code?: string; message?: string } | null): HealthOSServiceResult<T> {
  const status = normalizeSupabaseError(error);
  return { data: null, error: getSupabaseErrorSafeMessage(error), status };
}
