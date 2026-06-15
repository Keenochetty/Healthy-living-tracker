import type {
  HealthSyncDateRange,
  HealthSyncDataType,
  SyncedHealthSample,
} from "@/types/healthSync";

const LOCAL_USER_ID = "local-user";
const LOCAL_PROFILE_ID = "local-profile";

export async function syncMockHealthData(
  dataTypes: HealthSyncDataType[],
  dateRange: HealthSyncDateRange,
): Promise<SyncedHealthSample[]> {
  const now = new Date().toISOString();
  const day = new Date(dateRange.endDate);
  day.setHours(8, 0, 0, 0);

  return dataTypes.flatMap((dataType) => makeMockSamples(dataType, day, now));
}

function makeMockSamples(
  dataType: HealthSyncDataType,
  date: Date,
  syncedAt: string,
): SyncedHealthSample[] {
  const startTime = date.toISOString();
  const base = {
    createdAt: syncedAt,
    dataType,
    id: `mock-${dataType}-${date.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    profileId: LOCAL_PROFILE_ID,
    source: "mock" as const,
    sourceSampleId: `mock-${dataType}-${date.toISOString().slice(0, 10)}`,
    startTime,
    syncedAt,
    userId: LOCAL_USER_ID,
  };

  switch (dataType) {
    case "steps":
      return [{ ...base, unit: "steps", value: 8420 }];
    case "distance":
      return [{ ...base, unit: "km", value: 6.2 }];
    case "workout":
    case "running":
      return [
        {
          ...base,
          endTime: new Date(date.getTime() + 38 * 60 * 1000).toISOString(),
          metadata: {
            title: dataType === "running" ? "Synced run" : "Synced workout",
            workoutType: dataType === "running" ? "running" : "cardio",
          },
          unit: "min",
          value: 38,
        },
      ];
    case "heart_rate":
      return [{ ...base, unit: "bpm", value: 78 }];
    case "resting_heart_rate":
      return [{ ...base, unit: "bpm", value: 61 }];
    case "sleep":
      return [
        {
          ...base,
          endTime: new Date(
            date.getTime() + 7 * 60 * 60 * 1000 + 20 * 60 * 1000,
          ).toISOString(),
          unit: "min",
          value: 440,
        },
      ];
    case "weight":
      return [{ ...base, unit: "kg", value: 82.4 }];
    case "active_calories":
      return [{ ...base, unit: "kcal", value: 520 }];
    case "water":
      return [{ ...base, unit: "ml", value: 750 }];
    case "blood_pressure":
      return [
        { ...base, metadata: { diastolic: 78 }, unit: "mmHg", value: 122 },
      ];
    case "blood_glucose":
      return [
        {
          ...base,
          metadata: { timing: "fasting" },
          unit: "mmol/L",
          value: 5.4,
        },
      ];
    default:
      return [];
  }
}
