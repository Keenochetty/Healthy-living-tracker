import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import {
  createBiometricLog,
  createBloodGlucoseLog,
  createBloodPressureLog,
  createSleepLog,
  createWeightLog,
} from "@/lib/biometricsStorage";
import {
  completeWorkoutSession,
  createWorkoutSession,
} from "@/lib/fitnessStorage";
import { addWaterLog } from "@/lib/nutritionStorage";
import type { WidgetKey } from "@/types/app";
import type {
  DeviceSyncWidgetKey,
  HealthSyncConnection,
  HealthSyncDataType,
  HealthSyncDateRange,
  HealthSyncError,
  HealthSyncPermissionRequest,
  HealthSyncPermissionStatus,
  HealthSyncResult,
  HealthSyncSource,
  HealthSyncSourceOption,
  HealthSyncStatus,
  SyncedHealthSample,
} from "@/types/healthSync";
import {
  getAppleHealthSource,
  syncAppleHealthData,
} from "./appleHealthAdapter";
import {
  getHealthConnectSource,
  syncHealthConnectData,
} from "./healthConnectAdapter";
import { getManualSyncSource, syncManualHealthData } from "./manualSyncAdapter";
import { syncMockHealthData } from "./mockHealthSyncAdapter";

const LOCAL_USER_ID = "local-user";
const LOCAL_PROFILE_ID = "local-profile";
const CONNECTION_STORAGE_KEY = "family_health_sync_connection";
const SAMPLES_STORAGE_KEY = "family_health_synced_samples";
const ERRORS_STORAGE_KEY = "family_health_sync_errors";

export const HEALTH_SYNC_DATA_TYPES: Array<{
  key: HealthSyncDataType;
  label: string;
  later?: boolean;
}> = [
  { key: "steps", label: "Steps" },
  { key: "distance", label: "Distance" },
  { key: "workout", label: "Workouts" },
  { key: "running", label: "Running" },
  { key: "heart_rate", label: "Heart rate" },
  { key: "sleep", label: "Sleep" },
  { key: "weight", label: "Weight" },
  { key: "active_calories", label: "Active calories" },
  { key: "water", label: "Water" },
  { key: "blood_pressure", label: "Blood pressure later", later: true },
  { key: "blood_glucose", label: "Blood glucose later", later: true },
];

export const DEVICE_SYNC_WIDGET_KEYS = [
  "steps_today",
  "distance_today",
  "last_synced_workout",
  "sleep_last_night",
  "active_calories",
  "synced_weight",
  "sync_status",
] as const satisfies WidgetKey[];

async function readJsonArray<T>(key: string, fallback: T[] = []) {
  try {
    const stored = await AsyncStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJsonArray<T>(key: string, value: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
  return value;
}

async function readConnection() {
  try {
    const stored = await AsyncStorage.getItem(CONNECTION_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as HealthSyncConnection) : null;
  } catch {
    return null;
  }
}

async function writeConnection(connection: HealthSyncConnection | null) {
  if (!connection) {
    await AsyncStorage.removeItem(CONNECTION_STORAGE_KEY);
    return null;
  }

  await AsyncStorage.setItem(
    CONNECTION_STORAGE_KEY,
    JSON.stringify(connection),
  );
  return connection;
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isDeviceSyncWidget(widgetKey: WidgetKey) {
  return DEVICE_SYNC_WIDGET_KEYS.includes(widgetKey as DeviceSyncWidgetKey);
}

export async function getAvailableHealthSources(): Promise<
  HealthSyncSourceOption[]
> {
  const platformSource = getPlatformHealthSource();

  return [
    getAppleHealthSource(),
    getHealthConnectSource(),
    {
      description:
        "Development-only local samples for testing the sync pipeline.",
      isAvailable: true,
      source: "mock" as const,
      title: "Mock Sync",
    },
    getManualSyncSource(),
  ].map((source) => ({
    ...source,
    isAvailable:
      source.source === platformSource ||
      source.source === "mock" ||
      source.source === "manual"
        ? source.isAvailable
        : false,
  }));
}

export function getPlatformHealthSource(): HealthSyncSource {
  if (Platform.OS === "ios") return "apple_health";
  if (Platform.OS === "android") return "health_connect";
  return "manual";
}

export async function getHealthSyncConnection() {
  return readConnection();
}

export async function createHealthSyncConnection(
  source: HealthSyncSource,
  enabledDataTypes: HealthSyncDataType[] = [],
) {
  const now = new Date().toISOString();
  const connection: HealthSyncConnection = {
    createdAt: now,
    enabledDataTypes,
    id: id("health-sync-connection"),
    isConnected: source === "mock" || source === "manual",
    permissionStatus: enabledDataTypes.length ? "granted" : "not_requested",
    profileId: LOCAL_PROFILE_ID,
    source,
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };

  await writeConnection(connection);
  return connection;
}

export async function updateHealthSyncConnection(
  partial: Partial<HealthSyncConnection>,
) {
  const current = await readConnection();
  const now = new Date().toISOString();
  const connection: HealthSyncConnection = {
    createdAt: current?.createdAt ?? now,
    enabledDataTypes:
      partial.enabledDataTypes ?? current?.enabledDataTypes ?? [],
    id: current?.id ?? id("health-sync-connection"),
    isConnected: partial.isConnected ?? current?.isConnected ?? false,
    lastSyncAt: partial.lastSyncAt ?? current?.lastSyncAt,
    permissionStatus:
      partial.permissionStatus ?? current?.permissionStatus ?? "not_requested",
    profileId: current?.profileId ?? LOCAL_PROFILE_ID,
    source: partial.source ?? current?.source ?? getPlatformHealthSource(),
    updatedAt: now,
    userId: current?.userId ?? LOCAL_USER_ID,
  };

  await writeConnection(connection);
  return connection;
}

export async function disconnectHealthSource() {
  const current = await readConnection();
  if (!current) return null;

  return updateHealthSyncConnection({
    enabledDataTypes: [],
    isConnected: false,
    permissionStatus: "not_requested",
  });
}

export async function requestHealthPermissions({
  dataTypes,
  source,
}: HealthSyncPermissionRequest) {
  const status = getRequestedPermissionStatus(source, dataTypes);

  return updateHealthSyncConnection({
    enabledDataTypes: dataTypes,
    isConnected: status === "granted" || status === "partial",
    permissionStatus: status,
    source,
  });
}

export async function getHealthPermissionStatus(): Promise<HealthSyncPermissionStatus> {
  const connection = await readConnection();
  return connection?.permissionStatus ?? "not_requested";
}

export async function getLastSyncStatus(): Promise<HealthSyncStatus> {
  const connection = await readConnection();
  const source = connection?.source ?? getPlatformHealthSource();
  const available = await getAvailableHealthSources();
  const selected = available.find((item) => item.source === source);

  return {
    isAvailable: Boolean(selected?.isAvailable),
    isConnected: Boolean(connection?.isConnected),
    lastSyncAt: connection?.lastSyncAt,
    message: getStatusMessage(connection, selected),
    permissionStatus: connection?.permissionStatus ?? "not_requested",
    source,
  };
}

export async function syncSelectedHealthData(
  dateRange = getTodayDateRange(),
): Promise<HealthSyncResult> {
  const connection = await readConnection();

  if (!connection || !connection.enabledDataTypes.length) {
    const error = await logHealthSyncError({
      errorCode: "no_data_types",
      errorMessage: "No data types selected for sync.",
      source: connection?.source ?? getPlatformHealthSource(),
    });

    return {
      errors: [error],
      importedCount: 0,
      samples: [],
      status: await getLastSyncStatus(),
    };
  }

  return syncHealthData(
    dateRange,
    connection.enabledDataTypes,
    connection.source,
  );
}

export async function syncHealthData(
  dateRange: HealthSyncDateRange,
  dataTypes: HealthSyncDataType[],
  source: HealthSyncSource,
): Promise<HealthSyncResult> {
  try {
    const rawSamples = await syncBySource(source, dataTypes, dateRange);
    const samples = await saveSyncedHealthSamples(rawSamples);

    await Promise.all([
      mapSyncedSamplesToBiometrics(samples),
      mapSyncedSamplesToWorkout(samples),
      mapSyncedSamplesToNutrition(samples),
    ]);

    await updateHealthSyncConnection({
      isConnected: true,
      lastSyncAt: new Date().toISOString(),
      permissionStatus: dataTypes.length ? "granted" : "not_requested",
      source,
    });

    return {
      errors: [],
      importedCount: samples.length,
      samples,
      status: await getLastSyncStatus(),
    };
  } catch (error) {
    const syncError = await logHealthSyncError({
      errorCode: "sync_failed",
      errorMessage:
        error instanceof Error
          ? error.message
          : "Sync could not complete right now. Your manual logs are still safe.",
      source,
    });

    return {
      errors: [syncError],
      importedCount: 0,
      samples: [],
      status: await getLastSyncStatus(),
    };
  }
}

export function syncSteps(dateRange: HealthSyncDateRange) {
  return syncSingleType("steps", dateRange);
}

export function syncDistance(dateRange: HealthSyncDateRange) {
  return syncSingleType("distance", dateRange);
}

export function syncWorkouts(dateRange: HealthSyncDateRange) {
  return syncSingleType("workout", dateRange);
}

export function syncHeartRate(dateRange: HealthSyncDateRange) {
  return syncSingleType("heart_rate", dateRange);
}

export function syncSleep(dateRange: HealthSyncDateRange) {
  return syncSingleType("sleep", dateRange);
}

export function syncWeight(dateRange: HealthSyncDateRange) {
  return syncSingleType("weight", dateRange);
}

export function syncActiveCalories(dateRange: HealthSyncDateRange) {
  return syncSingleType("active_calories", dateRange);
}

export function syncWater(dateRange: HealthSyncDateRange) {
  return syncSingleType("water", dateRange);
}

export async function saveSyncedHealthSamples(samples: SyncedHealthSample[]) {
  const existing = await getSyncedHealthSamples();
  const existingKeys = new Set(existing.map(getSampleDedupeKey));
  const newSamples = samples.filter(
    (sample) => !existingKeys.has(getSampleDedupeKey(sample)),
  );
  const deduped = dedupeSyncedSamples([...existing, ...newSamples]);

  await writeJsonArray(SAMPLES_STORAGE_KEY, deduped);

  return newSamples;
}

export async function getSyncedHealthSamples() {
  const samples = await readJsonArray<SyncedHealthSample>(SAMPLES_STORAGE_KEY);
  return samples.sort(
    (left, right) =>
      new Date(right.startTime).getTime() - new Date(left.startTime).getTime(),
  );
}

export async function getSyncedHealthSamplesByType(
  dataType: HealthSyncDataType,
) {
  const samples = await getSyncedHealthSamples();
  return samples.filter((sample) => sample.dataType === dataType);
}

export async function getSyncedHealthSamplesByDateRange(
  dataType: HealthSyncDataType | "all",
  dateRange: HealthSyncDateRange,
) {
  const samples = await getSyncedHealthSamples();
  const start = dateRange.startDate.getTime();
  const end = dateRange.endDate.getTime();

  return samples.filter((sample) => {
    const time = new Date(sample.startTime).getTime();
    return (
      (dataType === "all" || sample.dataType === dataType) &&
      time >= start &&
      time <= end
    );
  });
}

export function dedupeSyncedSamples(samples: SyncedHealthSample[]) {
  const seen = new Set<string>();

  return samples.filter((sample) => {
    const key = getSampleDedupeKey(sample);

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getSampleDedupeKey(sample: SyncedHealthSample) {
  return sample.sourceSampleId
    ? `${sample.source}:${sample.sourceSampleId}`
    : `${sample.source}:${sample.dataType}:${sample.startTime}:${sample.endTime ?? ""}:${sample.value}`;
}

export async function mapSyncedSamplesToBiometrics(
  samples: SyncedHealthSample[],
) {
  await Promise.all(
    samples.map(async (sample) => {
      switch (sample.dataType) {
        case "sleep":
          await createSleepLog({
            durationMinutes: Math.round(sample.value),
            loggedAt: sample.startTime,
            notes: getSourceNote(sample),
          });
          break;
        case "weight":
          await createWeightLog({
            loggedAt: sample.startTime,
            notes: getSourceNote(sample),
            weightKg: sample.value,
          });
          break;
        case "heart_rate":
        case "resting_heart_rate":
          await createBiometricLog({
            loggedAt: sample.startTime,
            metadata: {
              source: sample.source,
              sourceSampleId: sample.sourceSampleId,
            },
            notes: getSourceNote(sample),
            type: "heart_rate",
            unit: "bpm",
            value: sample.value,
          });
          break;
        case "blood_pressure":
          await createBloodPressureLog({
            diastolic: Number(sample.metadata?.diastolic) || 0,
            loggedAt: sample.startTime,
            notes: getSourceNote(sample),
            systolic: sample.value,
          });
          break;
        case "blood_glucose":
          await createBloodGlucoseLog({
            glucoseValue: sample.value,
            loggedAt: sample.startTime,
            notes: getSourceNote(sample),
            timing: "other",
            unit: sample.unit === "mg/dL" ? "mg/dL" : "mmol/L",
          });
          break;
        default:
          break;
      }
    }),
  );
}

export async function mapSyncedSamplesToWorkout(samples: SyncedHealthSample[]) {
  const workoutSamples = samples.filter(
    (sample) => sample.dataType === "workout" || sample.dataType === "running",
  );

  await Promise.all(
    workoutSamples.map(async (sample) => {
      const session = await createWorkoutSession({
        caloriesEstimate: Number(sample.metadata?.activeCalories) || undefined,
        durationSeconds: Math.round(sample.value * 60),
        intensity: "moderate",
        notes: getSourceNote(sample),
        startedAt: sample.startTime,
        title: String(sample.metadata?.title ?? "Synced workout"),
        workoutType: sample.dataType === "running" ? "running" : "cardio",
      });

      await completeWorkoutSession(session.id, {
        endedAt:
          sample.endTime ??
          new Date(
            new Date(sample.startTime).getTime() + sample.value * 60 * 1000,
          ).toISOString(),
      });
    }),
  );
}

export async function mapSyncedSamplesToNutrition(
  samples: SyncedHealthSample[],
) {
  const waterSamples = samples.filter((sample) => sample.dataType === "water");

  await Promise.all(
    waterSamples.map((sample) =>
      addWaterLog(Math.round(sample.value), sample.startTime),
    ),
  );
}

export async function calculateDailyStepsFromSamples(date = new Date()) {
  return sumSamples("steps", getDateRangeForDay(date));
}

export async function calculateDailyDistanceFromSamples(date = new Date()) {
  return sumSamples("distance", getDateRangeForDay(date));
}

export async function calculateSleepSummaryFromSamples(date = new Date()) {
  const samples = await getSyncedHealthSamplesByDateRange(
    "sleep",
    getDateRangeForDay(date),
  );
  const totalMinutes = samples.reduce(
    (total, sample) => total + sample.value,
    0,
  );

  return {
    latest: samples[0],
    totalMinutes,
  };
}

export async function calculateHeartRateSummaryFromSamples(date = new Date()) {
  const samples = await getSyncedHealthSamplesByDateRange(
    "heart_rate",
    getDateRangeForDay(date),
  );
  const values = samples.map((sample) => sample.value);

  return {
    averageBpm: values.length
      ? Math.round(
          values.reduce((total, value) => total + value, 0) / values.length,
        )
      : undefined,
    latest: samples[0],
  };
}

export async function getAvailableDeviceSyncWidgets() {
  return Promise.all(
    DEVICE_SYNC_WIDGET_KEYS.map(async (widgetKey) => ({
      route: getDeviceSyncWidgetRoute(widgetKey),
      title: getDeviceSyncWidgetTitle(widgetKey),
      value: await calculateDeviceSyncWidgetValue(widgetKey),
      widgetKey,
    })),
  );
}

export async function calculateDeviceSyncWidgetValue(widgetKey: WidgetKey) {
  switch (widgetKey) {
    case "steps_today":
    case "steps":
      return `${Math.round(await calculateDailyStepsFromSamples()).toLocaleString()}`;
    case "distance_today":
      return `${(await calculateDailyDistanceFromSamples()).toFixed(1)} km`;
    case "last_synced_workout": {
      const workouts = await getSyncedHealthSamplesByType("workout");
      const running = await getSyncedHealthSamplesByType("running");
      const latest = [...workouts, ...running].sort(
        (left, right) =>
          new Date(right.startTime).getTime() -
          new Date(left.startTime).getTime(),
      )[0];
      return latest
        ? String(latest.metadata?.title ?? "Synced workout")
        : "No sync";
    }
    case "sleep_last_night":
      return formatMinutes(
        (await calculateSleepSummaryFromSamples()).totalMinutes,
      );
    case "active_calories":
      return `${Math.round(await sumSamples("active_calories", getDateRangeForDay(new Date())))} kcal`;
    case "synced_weight": {
      const latest = (await getSyncedHealthSamplesByType("weight"))[0];
      return latest ? `${latest.value} ${latest.unit}` : "No sync";
    }
    case "sync_status": {
      const status = await getLastSyncStatus();
      return status.isConnected ? "Connected" : "Not connected";
    }
    default:
      return "Ready";
  }
}

export async function logHealthSyncError({
  dataType,
  errorCode,
  errorMessage,
  source,
}: {
  dataType?: HealthSyncDataType;
  errorCode: string;
  errorMessage: string;
  source: HealthSyncSource;
}) {
  const now = new Date().toISOString();
  const error: HealthSyncError = {
    createdAt: now,
    dataType,
    errorCode,
    errorMessage,
    id: id("health-sync-error"),
    occurredAt: now,
    profileId: LOCAL_PROFILE_ID,
    source,
    userId: LOCAL_USER_ID,
  };
  const errors = await readJsonArray<HealthSyncError>(ERRORS_STORAGE_KEY);

  await writeJsonArray(ERRORS_STORAGE_KEY, [error, ...errors]);
  return error;
}

export async function getHealthSyncErrors() {
  return readJsonArray<HealthSyncError>(ERRORS_STORAGE_KEY);
}

export function getDeviceSyncWidgetRoute(widgetKey: WidgetKey) {
  switch (widgetKey) {
    case "sleep_last_night":
    case "synced_weight":
      return "/biometrics";
    case "last_synced_workout":
    case "active_calories":
      return "/fitness";
    default:
      return "/device-sync";
  }
}

export function getDeviceSyncWidgetTitle(widgetKey: WidgetKey) {
  switch (widgetKey) {
    case "steps_today":
      return "Steps Today";
    case "distance_today":
      return "Distance Today";
    case "last_synced_workout":
      return "Last Workout";
    case "sleep_last_night":
      return "Sleep Last Night";
    case "active_calories":
      return "Active Calories";
    case "synced_weight":
      return "Synced Weight";
    case "sync_status":
      return "Sync Status";
    default:
      return String(widgetKey);
  }
}

function getRequestedPermissionStatus(
  source: HealthSyncSource,
  dataTypes: HealthSyncDataType[],
): HealthSyncPermissionStatus {
  if (!dataTypes.length) return "not_requested";
  if (source === "manual") return "unavailable";
  if (source === "apple_health" && Platform.OS !== "ios") return "unavailable";
  if (source === "health_connect" && Platform.OS !== "android")
    return "unavailable";
  return "granted";
}

async function syncSingleType(
  dataType: HealthSyncDataType,
  dateRange: HealthSyncDateRange,
) {
  const connection = await readConnection();
  return syncHealthData(
    dateRange,
    [dataType],
    connection?.source ?? getPlatformHealthSource(),
  );
}

async function syncBySource(
  source: HealthSyncSource,
  dataTypes: HealthSyncDataType[],
  dateRange: HealthSyncDateRange,
) {
  switch (source) {
    case "apple_health":
      return syncAppleHealthData(dataTypes, dateRange);
    case "health_connect":
      return syncHealthConnectData(dataTypes, dateRange);
    case "mock":
      return syncMockHealthData(dataTypes, dateRange);
    case "manual":
      return syncManualHealthData(dataTypes, dateRange);
    default:
      return [];
  }
}

function getStatusMessage(
  connection: HealthSyncConnection | null,
  source?: HealthSyncSourceOption,
) {
  if (!source?.isAvailable)
    return "Device sync is not available on this device yet. You can still log health data manually.";
  if (!connection || connection.permissionStatus === "not_requested")
    return "Choose what health data to sync.";
  if (connection.permissionStatus === "denied")
    return "Permission was not granted. You can change this in your device health settings.";
  if (connection.permissionStatus === "partial")
    return "Some data types are connected. You can update permissions anytime.";
  return "You control what data is imported. You can disconnect device sync anytime.";
}

function getTodayDateRange(): HealthSyncDateRange {
  return getDateRangeForDay(new Date());
}

function getDateRangeForDay(date: Date): HealthSyncDateRange {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  return { endDate, startDate };
}

async function sumSamples(
  dataType: HealthSyncDataType,
  dateRange: HealthSyncDateRange,
) {
  const samples = await getSyncedHealthSamplesByDateRange(dataType, dateRange);
  return samples.reduce((total, sample) => total + sample.value, 0);
}

function getSourceNote(sample: SyncedHealthSample) {
  return `Imported from ${getSourceLabel(sample.source)}. Source data is kept separate from manual logs.`;
}

function getSourceLabel(source: HealthSyncSource) {
  switch (source) {
    case "apple_health":
      return "Apple Health";
    case "health_connect":
      return "Health Connect";
    case "mock":
      return "Mock Sync";
    case "manual":
      return "Manual";
    default:
      return "Device Sync";
  }
}

function formatMinutes(minutes: number) {
  if (!minutes) return "No sync";
  const hours = Math.floor(minutes / 60);
  const remaining = Math.round(minutes % 60);
  return `${hours}h ${remaining}m`;
}
