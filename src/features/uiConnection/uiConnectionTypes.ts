import type { HealthOSBackendStatus } from "@/features/backend";

export type HealthOSUIConnectionState =
  | "loading"
  | "ready"
  | "empty"
  | "deferred"
  | "error"
  | "permissionRequired"
  | "reviewRequired";

export type HealthOSUIConnectionSummary = {
  count?: number;
  deferredReason?: string | null;
  error?: string | null;
  state: HealthOSUIConnectionState;
  status?: HealthOSBackendStatus;
};

export type HealthOSUIConnectionInput<T = unknown> = {
  data?: T[] | T | null;
  deferredReason?: string | null;
  error?: string | null;
  loading?: boolean;
  status?: HealthOSBackendStatus | "success";
};
