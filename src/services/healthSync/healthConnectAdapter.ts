import { Platform } from "react-native";

import type {
  HealthSyncDateRange,
  HealthSyncDataType,
  HealthSyncSourceOption,
  SyncedHealthSample,
} from "@/types/healthSync";

export function getHealthConnectSource(): HealthSyncSourceOption {
  const isAndroid = Platform.OS === "android";

  return {
    description: isAndroid
      ? "Prepared for Android Health Connect. Native permissions will be connected later."
      : "Health Connect is available on supported Android devices.",
    isAvailable: isAndroid,
    isComingSoon: true,
    message: isAndroid
      ? "Native Health Connect sync is prepared but not active in this Expo build."
      : "Health Connect is not available on this platform.",
    source: "health_connect",
    title: "Android Health Connect",
  };
}

export async function syncHealthConnectData(
  _dataTypes: HealthSyncDataType[],
  _dateRange: HealthSyncDateRange,
): Promise<SyncedHealthSample[]> {
  return [];
}
