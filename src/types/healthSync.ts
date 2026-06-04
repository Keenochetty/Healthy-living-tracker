import type { WidgetKey } from "@/types/app";

export type HealthSyncSource =
  | "apple_health"
  | "health_connect"
  | "manual"
  | "mock"
  | "unknown";

export type HealthSyncDataType =
  | "steps"
  | "distance"
  | "workout"
  | "running"
  | "heart_rate"
  | "resting_heart_rate"
  | "sleep"
  | "weight"
  | "active_calories"
  | "water"
  | "blood_pressure"
  | "blood_glucose";

export type HealthSyncPermissionStatus =
  | "not_requested"
  | "granted"
  | "partial"
  | "denied"
  | "unavailable";

export type HealthSyncConnection = {
  createdAt: string;
  enabledDataTypes: HealthSyncDataType[];
  id: string;
  isConnected: boolean;
  lastSyncAt?: string;
  permissionStatus: HealthSyncPermissionStatus;
  profileId: string;
  source: HealthSyncSource;
  updatedAt: string;
  userId: string;
};

export type SyncedHealthSample = {
  createdAt: string;
  dataType: HealthSyncDataType;
  endTime?: string;
  id: string;
  metadata?: Record<string, unknown>;
  profileId: string;
  source: HealthSyncSource;
  sourceSampleId?: string;
  startTime: string;
  syncedAt: string;
  unit: string;
  userId: string;
  value: number;
};

export type HealthSyncStatus = {
  isAvailable: boolean;
  isConnected: boolean;
  lastSyncAt?: string;
  message?: string;
  permissionStatus: HealthSyncPermissionStatus;
  source: HealthSyncSource;
};

export type HealthSyncError = {
  createdAt: string;
  dataType?: HealthSyncDataType;
  errorCode: string;
  errorMessage: string;
  id: string;
  occurredAt: string;
  profileId: string;
  resolvedAt?: string;
  source: HealthSyncSource;
  userId: string;
};

export type HealthSyncSourceOption = {
  description: string;
  isAvailable: boolean;
  isComingSoon?: boolean;
  message?: string;
  source: HealthSyncSource;
  title: string;
};

export type HealthSyncDateRange = {
  endDate: Date;
  startDate: Date;
};

export type HealthSyncPermissionRequest = {
  dataTypes: HealthSyncDataType[];
  source: HealthSyncSource;
};

export type HealthSyncResult = {
  errors: HealthSyncError[];
  importedCount: number;
  samples: SyncedHealthSample[];
  status: HealthSyncStatus;
};

export type DeviceSyncWidgetKey = Extract<
  WidgetKey,
  | "steps_today"
  | "distance_today"
  | "last_synced_workout"
  | "sleep_last_night"
  | "active_calories"
  | "synced_weight"
  | "sync_status"
>;

export type DeviceSyncWidgetSummary = {
  route: "/device-sync" | "/biometrics" | "/fitness" | "/food";
  title: string;
  value: string;
  widgetKey: DeviceSyncWidgetKey;
};
