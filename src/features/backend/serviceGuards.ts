import { supabase } from "./supabaseClient";
import { createMissingAuthResult, createMissingTypesResult, createPermissionDeniedResult, type HealthOSServiceResult } from "./backendResult";
import { getMissingTableDeferredReason } from "./tableAvailability";

export async function requireAuthenticatedUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return createMissingAuthResult();
  return { data: data.user, error: null, status: "ready" as const };
}

export function requireGeneratedTable<T>(tableName: string): HealthOSServiceResult<T> | null {
  const deferredReason = getMissingTableDeferredReason(tableName);
  return deferredReason ? createMissingTypesResult<T>(deferredReason) : null;
}

export function requireReviewBeforeImport<T>(reviewStatus?: string): HealthOSServiceResult<T> | null {
  return reviewStatus === "reviewed" ? null : { data: null, error: "Review required before import.", status: "reviewRequired" };
}

export function requireOwnerScopedWrite<T>(ownerUserId?: string | null, currentUserId?: string | null): HealthOSServiceResult<T> | null {
  return ownerUserId && currentUserId && ownerUserId === currentUserId ? null : createPermissionDeniedResult<T>();
}

export function requirePrivacySafeCopy(copy?: string | null) {
  return Boolean(copy && !copy.toLowerCase().includes("service_role") && !copy.toLowerCase().includes("secret"));
}

export const isPermissionDeniedError = (error?: { code?: string } | null) => error?.code === "42501" || error?.code === "PGRST301";
export const isMissingTableError = (error?: { code?: string } | null) => error?.code === "42P01" || error?.code === "PGRST205" || error?.code === "PGRST204";
