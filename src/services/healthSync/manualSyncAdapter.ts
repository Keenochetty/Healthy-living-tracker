import type {
  HealthSyncDateRange,
  HealthSyncDataType,
  HealthSyncSourceOption,
  SyncedHealthSample,
} from "@/types/healthSync";

export function getManualSyncSource(): HealthSyncSourceOption {
  return {
    description:
      "Keep using manual logs when device sync is off or unavailable.",
    isAvailable: true,
    source: "manual",
    title: "Manual only",
  };
}

export async function syncManualHealthData(
  _dataTypes: HealthSyncDataType[],
  _dateRange: HealthSyncDateRange,
): Promise<SyncedHealthSample[]> {
  return [];
}
