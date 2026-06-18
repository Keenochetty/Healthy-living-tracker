import type { HealthOSBackendStatus } from "@/features/backend";

import type {
  HealthOSUIConnectionInput,
  HealthOSUIConnectionState,
  HealthOSUIConnectionSummary,
} from "./uiConnectionTypes";

export function mapBackendStatusToUIConnectionState(
  status?: HealthOSBackendStatus | "success",
): HealthOSUIConnectionState {
  if (!status || status === "idle" || status === "loading") return "loading";
  if (status === "ready" || status === "success") return "ready";
  if (status === "missingAuth" || status === "permissionDenied") {
    return "permissionRequired";
  }
  if (status === "reviewRequired") return "reviewRequired";
  if (
    status === "missingTable" ||
    status === "missingTypes" ||
    status === "storageDeferred" ||
    status === "edgeFunctionMissing" ||
    status === "adminDeferred" ||
    status === "deferred"
  ) {
    return "deferred";
  }
  return "error";
}

export function getCollectionCount(data: unknown) {
  if (Array.isArray(data)) return data.length;
  if (data == null) return 0;
  return 1;
}

export function createUIConnectionSummary<T>(
  input: HealthOSUIConnectionInput<T>,
): HealthOSUIConnectionSummary {
  const count = getCollectionCount(input.data);
  const state = input.loading
    ? "loading"
    : input.error
      ? "error"
      : input.status
        ? mapBackendStatusToUIConnectionState(input.status)
        : "ready";

  return {
    count,
    deferredReason: input.deferredReason,
    error: input.error,
    state: state === "ready" && count === 0 ? "empty" : state,
    status: input.status === "success" ? "ready" : input.status,
  };
}
