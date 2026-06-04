import { Platform } from "react-native";

import type {
  HealthSyncDateRange,
  HealthSyncDataType,
  HealthSyncSourceOption,
  SyncedHealthSample
} from "@/types/healthSync";

export function getAppleHealthSource(): HealthSyncSourceOption {
  const isIOS = Platform.OS === "ios";

  return {
    description: isIOS
      ? "Prepared for Apple Health. Native HealthKit setup will be connected later."
      : "Apple Health is available on supported Apple devices.",
    isAvailable: isIOS,
    isComingSoon: true,
    message: isIOS
      ? "Native Apple Health sync is prepared but not active in this Expo build."
      : "Apple Health is not available on this platform.",
    source: "apple_health",
    title: "Apple Health"
  };
}

export async function syncAppleHealthData(
  _dataTypes: HealthSyncDataType[],
  _dateRange: HealthSyncDateRange
): Promise<SyncedHealthSample[]> {
  return [];
}
