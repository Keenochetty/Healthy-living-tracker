import AsyncStorage from "@react-native-async-storage/async-storage";

import { getActiveNutritionTarget } from "@/lib/nutritionStorage";
import type { WidgetKey } from "@/types/app";
import type {
  BiometricDashboardItem,
  BiometricDashboardSummary,
  BiometricLog,
  BiometricLogInput,
  BiometricTrend,
  BiometricType,
  BiometricWidgetKey,
  BiometricWidgetSummary,
  BiometricsInsight,
  BloodGlucoseLog,
  BloodGlucoseLogInput,
  BloodPressureLog,
  BloodPressureLogInput,
  BodyMeasurementLog,
  BodyMeasurementLogInput,
  SleepLog,
  SleepLogInput,
  TrainingBodyProgressSummary,
  WeightLog,
  WeightLogInput,
  WorkoutReadinessSummary
} from "@/types/biometrics";

const LOCAL_USER_ID = "local-user";
const LOCAL_PROFILE_ID = "local-profile";
const BIOMETRIC_LOGS_STORAGE_KEY = "family_health_biometric_logs";
const WEIGHT_LOGS_STORAGE_KEY = "family_health_weight_logs";
const BODY_MEASUREMENTS_STORAGE_KEY = "family_health_body_measurement_logs";
const SLEEP_LOGS_STORAGE_KEY = "family_health_sleep_logs";
const BLOOD_PRESSURE_STORAGE_KEY = "family_health_blood_pressure_logs";
const BLOOD_GLUCOSE_STORAGE_KEY = "family_health_blood_glucose_logs";

const BIOMETRIC_TYPES: BiometricType[] = [
  "weight",
  "body_measurement",
  "sleep",
  "heart_rate",
  "blood_pressure",
  "blood_glucose",
  "energy",
  "mood",
  "digestion",
  "symptom"
];

const BIOMETRIC_WIDGET_KEYS = [
  "weight",
  "biometric_goal_weight",
  "sleep",
  "energy",
  "mood",
  "resting_heart_rate",
  "blood_pressure",
  "blood_glucose",
  "digestion",
  "symptoms"
] as const satisfies WidgetKey[];

const DEFAULT_PRIVACY = {
  lockedPrivate: true,
  sharedWithCaregiver: false,
  sharedWithFamily: false,
  sharedWithPartner: false,
  visibility: "private" as const
};

type StoredBiometricLog = BiometricLog;

export const BIOMETRIC_TYPE_LABELS: Record<BiometricType, string> = {
  blood_glucose: "Blood Glucose",
  blood_pressure: "Blood Pressure",
  body_measurement: "Body Measurements",
  digestion: "Digestion",
  energy: "Energy",
  heart_rate: "Heart Rate",
  mood: "Mood",
  sleep: "Sleep",
  symptom: "Symptoms",
  weight: "Weight"
};

export const BIOMETRIC_TYPE_EMPTY_TEXT: Record<BiometricType, string> = {
  blood_glucose: "Add your first log to start seeing trends.",
  blood_pressure: "Add your first log to start seeing trends.",
  body_measurement: "Add your first log to start seeing trends.",
  digestion: "Add notes when something feels different.",
  energy: "Track energy to notice daily patterns.",
  heart_rate: "Add your first log to start seeing trends.",
  mood: "Add your first log to start seeing trends.",
  sleep: "Log sleep to understand your recovery patterns.",
  symptom: "Add notes when something feels different.",
  weight: "Track weight over time to support your goals."
};

async function readJsonArray<T>(key: string, fallback: T[] = []) {
  try {
    const storedValue = await AsyncStorage.getItem(key);

    if (!storedValue) return fallback;

    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue) ? (parsedValue as T[]) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJsonArray<T>(key: string, value: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(value));

  return value;
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sortByLoggedAt<T extends { loggedAt: string }>(items: T[]) {
  return [...items].sort((left, right) => new Date(right.loggedAt).getTime() - new Date(left.loggedAt).getTime());
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function makeBase(now: string) {
  return {
    ...DEFAULT_PRIVACY,
    createdAt: now,
    profileId: LOCAL_PROFILE_ID,
    updatedAt: now,
    userId: LOCAL_USER_ID
  };
}

export function isBiometricWidget(widgetKey: WidgetKey) {
  return BIOMETRIC_WIDGET_KEYS.includes(widgetKey as BiometricWidgetKey);
}

export async function getAvailableBiometricWidgets(): Promise<BiometricWidgetSummary[]> {
  return Promise.all(
    BIOMETRIC_WIDGET_KEYS.map(async (widgetKey) => ({
      routeType: getWidgetRouteType(widgetKey),
      title: getBiometricWidgetTitle(widgetKey),
      value: await calculateBiometricWidgetValue(widgetKey),
      widgetKey
    }))
  );
}

export async function calculateBiometricWidgetValue(widgetKey: WidgetKey) {
  switch (widgetKey) {
    case "weight": {
      const latest = await getLatestBiometricLog("weight");
      return latest?.value ? `${latest.value} kg` : "No log";
    }
    case "biometric_goal_weight": {
      const target = await getActiveNutritionTarget();
      return target?.currentWeightKg && target.goalWeightKg
        ? `${target.currentWeightKg} kg -> ${target.goalWeightKg} kg`
        : "Set goal";
    }
    case "sleep": {
      const latest = await getLatestBiometricLog("sleep");
      return latest?.value ? formatSleepDuration(latest.value) : "No log";
    }
    case "energy":
      return (await getLatestBiometricLog("energy"))?.label ?? "No log";
    case "mood":
      return (await getLatestBiometricLog("mood"))?.label ?? "No log";
    case "resting_heart_rate": {
      const latest = await getLatestBiometricLog("heart_rate");
      return latest?.value ? `${Math.round(latest.value)} bpm` : "No log";
    }
    case "blood_pressure": {
      const latest = await getLatestBiometricLog("blood_pressure");
      return latest?.value && latest.secondaryValue
        ? `${Math.round(latest.value)}/${Math.round(latest.secondaryValue)}`
        : "No log";
    }
    case "blood_glucose": {
      const latest = await getLatestBiometricLog("blood_glucose");
      return latest?.value ? `${latest.value} ${latest.unit ?? "mmol/L"}` : "No log";
    }
    case "digestion":
      return (await getLatestBiometricLog("digestion"))?.label ?? "No log";
    case "symptoms": {
      const latest = await getLatestBiometricLog("symptom");
      return latest?.label ? `${latest.label}${latest.severity ? ` ${latest.severity}/10` : ""}` : "No log";
    }
    default:
      return "Ready";
  }
}

export function getWidgetRouteType(widgetKey: WidgetKey): BiometricType | undefined {
  switch (widgetKey) {
    case "weight":
    case "biometric_goal_weight":
      return "weight";
    case "sleep":
      return "sleep";
    case "energy":
      return "energy";
    case "mood":
      return "mood";
    case "resting_heart_rate":
      return "heart_rate";
    case "blood_pressure":
      return "blood_pressure";
    case "blood_glucose":
      return "blood_glucose";
    case "digestion":
      return "digestion";
    case "symptoms":
      return "symptom";
    default:
      return undefined;
  }
}

export async function createBiometricLog(input: BiometricLogInput) {
  const now = new Date().toISOString();
  const log: BiometricLog = {
    ...makeBase(now),
    id: id(`biometric-${input.type}`),
    label: input.label?.trim() || undefined,
    loggedAt: input.loggedAt ?? now,
    metadata: input.metadata,
    notes: input.notes?.trim() || undefined,
    quality: input.quality,
    secondaryUnit: input.secondaryUnit,
    secondaryValue: input.secondaryValue,
    severity: input.severity,
    type: input.type,
    unit: input.unit,
    value: input.value
  };
  const logs = await getBiometricLogs();

  await writeJsonArray(BIOMETRIC_LOGS_STORAGE_KEY, [log, ...logs]);

  return log;
}

export async function getBiometricLogs() {
  return sortByLoggedAt(await readJsonArray<StoredBiometricLog>(BIOMETRIC_LOGS_STORAGE_KEY));
}

export async function getBiometricLogsByType(type: BiometricType) {
  const logs = await getBiometricLogs();

  return logs.filter((log) => log.type === type);
}

export async function getBiometricLogsByDateRange(type: BiometricType | "all", startDate: Date, endDate: Date) {
  const startKey = toDateKey(startDate);
  const endKey = toDateKey(endDate);
  const logs = await getBiometricLogs();

  return logs.filter((log) => {
    const logKey = toDateKey(new Date(log.loggedAt));
    const matchesType = type === "all" || log.type === type;

    return matchesType && logKey >= startKey && logKey <= endKey;
  });
}

export async function getLatestBiometricLog(type: BiometricType) {
  const logs = await getBiometricLogsByType(type);

  return logs[0] ?? null;
}

export async function updateBiometricLog(id: string, partial: Partial<BiometricLogInput>) {
  const logs = await getBiometricLogs();
  const updatedLogs = logs.map((log) =>
    log.id === id
      ? {
          ...log,
          label: partial.label?.trim() || partial.label,
          loggedAt: partial.loggedAt ?? log.loggedAt,
          metadata: partial.metadata ?? log.metadata,
          notes: partial.notes?.trim() || partial.notes,
          quality: partial.quality ?? log.quality,
          secondaryUnit: partial.secondaryUnit ?? log.secondaryUnit,
          secondaryValue: partial.secondaryValue ?? log.secondaryValue,
          severity: partial.severity ?? log.severity,
          unit: partial.unit ?? log.unit,
          updatedAt: new Date().toISOString(),
          value: partial.value ?? log.value
        }
      : log
  );

  await writeJsonArray(BIOMETRIC_LOGS_STORAGE_KEY, updatedLogs);

  return updatedLogs.find((log) => log.id === id) ?? null;
}

export async function deleteBiometricLog(id: string) {
  const logs = await getBiometricLogs();
  const deleted = logs.find((log) => log.id === id) ?? null;

  await writeJsonArray(BIOMETRIC_LOGS_STORAGE_KEY, logs.filter((log) => log.id !== id));

  return deleted;
}

export async function calculateBiometricTrend(type: BiometricType): Promise<BiometricTrend> {
  const logs = await getBiometricLogsByType(type);
  const numericLogs = logs.filter((log) => typeof log.value === "number");
  const latest = logs[0];
  const previousNumeric = numericLogs[1];
  const latestNumeric = numericLogs[0];
  const sevenDayLogs = getLogsWithinDays(numericLogs, 7);
  const thirtyDayLogs = getLogsWithinDays(numericLogs, 30);
  const change = latestNumeric && previousNumeric ? latestNumeric.value! - previousNumeric.value! : undefined;

  return {
    changeSinceLastLog: change,
    direction: change === undefined ? "unknown" : Math.abs(change) < 0.1 ? "same" : change > 0 ? "up" : "down",
    highestValue: numericLogs.length ? Math.max(...numericLogs.map((log) => log.value ?? 0)) : undefined,
    latestLabel: latest?.label,
    latestLoggedAt: latest?.loggedAt,
    latestValue: latestNumeric?.value,
    lowestValue: numericLogs.length ? Math.min(...numericLogs.map((log) => log.value ?? 0)) : undefined,
    message: buildTrendMessage(type, latest, change),
    sevenDayAverage: averageLogValue(sevenDayLogs),
    thirtyDayAverage: averageLogValue(thirtyDayLogs),
    type,
    unit: latestNumeric?.unit ?? latest?.unit
  };
}

export async function getBiometricDashboardSummary(): Promise<BiometricDashboardSummary> {
  const items = await Promise.all(
    BIOMETRIC_TYPES.map(async (type): Promise<BiometricDashboardItem> => {
      const [latest, trend] = await Promise.all([
        getLatestBiometricLog(type),
        calculateBiometricTrend(type)
      ]);

      return {
        addLabel: `Add ${BIOMETRIC_TYPE_LABELS[type]}`,
        emptyText: BIOMETRIC_TYPE_EMPTY_TEXT[type],
        latestDisplay: latest ? formatBiometricLogValue(latest) : "No log",
        latestLoggedAt: latest?.loggedAt,
        title: BIOMETRIC_TYPE_LABELS[type],
        trendMessage: trend.message,
        type
      };
    })
  );

  return {
    items,
    updatedAt: new Date().toISOString()
  };
}

export async function createWeightLog(input: WeightLogInput) {
  const now = new Date().toISOString();
  const log: WeightLog = {
    ...makeBase(now),
    id: id("weight"),
    loggedAt: input.loggedAt ?? now,
    notes: input.notes?.trim() || undefined,
    weightKg: input.weightKg
  };
  const logs = await getWeightLogs();

  await Promise.all([
    writeJsonArray(WEIGHT_LOGS_STORAGE_KEY, [log, ...logs]),
    createBiometricLog({
      loggedAt: log.loggedAt,
      notes: log.notes,
      type: "weight",
      unit: "kg",
      value: log.weightKg
    })
  ]);

  return log;
}

export async function getWeightLogs() {
  return sortByLoggedAt(await readJsonArray<WeightLog>(WEIGHT_LOGS_STORAGE_KEY));
}

export async function createBodyMeasurementLog(input: BodyMeasurementLogInput) {
  const now = new Date().toISOString();
  const log: BodyMeasurementLog = {
    ...makeBase(now),
    armCm: input.armCm,
    bodyFatPercentage: input.bodyFatPercentage,
    chestCm: input.chestCm,
    hipCm: input.hipCm,
    id: id("body-measurement"),
    loggedAt: input.loggedAt ?? now,
    notes: input.notes?.trim() || undefined,
    photoUrl: input.photoUrl?.trim() || undefined,
    thighCm: input.thighCm,
    waistCm: input.waistCm
  };
  const logs = await getBodyMeasurementLogs();

  await Promise.all([
    writeJsonArray(BODY_MEASUREMENTS_STORAGE_KEY, [log, ...logs]),
    createBiometricLog({
      loggedAt: log.loggedAt,
      metadata: {
        armCm: log.armCm,
        bodyFatPercentage: log.bodyFatPercentage,
        chestCm: log.chestCm,
        hipCm: log.hipCm,
        photoUrl: log.photoUrl,
        thighCm: log.thighCm,
        waistCm: log.waistCm
      },
      notes: log.notes,
      type: "body_measurement",
      unit: "cm",
      value: log.waistCm ?? log.chestCm ?? log.armCm ?? log.thighCm ?? log.hipCm
    })
  ]);

  return log;
}

export async function getBodyMeasurementLogs() {
  return sortByLoggedAt(await readJsonArray<BodyMeasurementLog>(BODY_MEASUREMENTS_STORAGE_KEY));
}

export async function createSleepLog(input: SleepLogInput) {
  const now = new Date().toISOString();
  const log: SleepLog = {
    ...makeBase(now),
    bedtime: input.bedtime?.trim() || undefined,
    durationMinutes: input.durationMinutes,
    id: id("sleep"),
    loggedAt: input.loggedAt ?? now,
    notes: input.notes?.trim() || undefined,
    sleepQuality: input.sleepQuality,
    wakeTime: input.wakeTime?.trim() || undefined
  };
  const logs = await getSleepLogs();

  await Promise.all([
    writeJsonArray(SLEEP_LOGS_STORAGE_KEY, [log, ...logs]),
    createBiometricLog({
      label: log.sleepQuality,
      loggedAt: log.loggedAt,
      metadata: { bedtime: log.bedtime, wakeTime: log.wakeTime },
      notes: log.notes,
      quality: log.sleepQuality,
      type: "sleep",
      unit: "min",
      value: log.durationMinutes
    })
  ]);

  return log;
}

export async function getSleepLogs() {
  return sortByLoggedAt(await readJsonArray<SleepLog>(SLEEP_LOGS_STORAGE_KEY));
}

export async function createBloodPressureLog(input: BloodPressureLogInput) {
  const now = new Date().toISOString();
  const log: BloodPressureLog = {
    ...makeBase(now),
    diastolic: input.diastolic,
    id: id("blood-pressure"),
    loggedAt: input.loggedAt ?? now,
    notes: input.notes?.trim() || undefined,
    pulse: input.pulse,
    systolic: input.systolic
  };
  const logs = await getBloodPressureLogs();

  await Promise.all([
    writeJsonArray(BLOOD_PRESSURE_STORAGE_KEY, [log, ...logs]),
    createBiometricLog({
      loggedAt: log.loggedAt,
      notes: log.notes,
      secondaryUnit: "mmHg",
      secondaryValue: log.diastolic,
      type: "blood_pressure",
      unit: "mmHg",
      value: log.systolic,
      metadata: { pulse: log.pulse }
    })
  ]);

  return log;
}

export async function getBloodPressureLogs() {
  return sortByLoggedAt(await readJsonArray<BloodPressureLog>(BLOOD_PRESSURE_STORAGE_KEY));
}

export async function createBloodGlucoseLog(input: BloodGlucoseLogInput) {
  const now = new Date().toISOString();
  const log: BloodGlucoseLog = {
    ...makeBase(now),
    glucoseValue: input.glucoseValue,
    id: id("blood-glucose"),
    loggedAt: input.loggedAt ?? now,
    notes: input.notes?.trim() || undefined,
    timing: input.timing,
    unit: input.unit
  };
  const logs = await getBloodGlucoseLogs();

  await Promise.all([
    writeJsonArray(BLOOD_GLUCOSE_STORAGE_KEY, [log, ...logs]),
    createBiometricLog({
      label: log.timing,
      loggedAt: log.loggedAt,
      notes: log.notes,
      type: "blood_glucose",
      unit: log.unit,
      value: log.glucoseValue
    })
  ]);

  return log;
}

export async function getBloodGlucoseLogs() {
  return sortByLoggedAt(await readJsonArray<BloodGlucoseLog>(BLOOD_GLUCOSE_STORAGE_KEY));
}

export function createEnergyLog(label: string, notes?: string, loggedAt?: string) {
  return createBiometricLog({
    label,
    loggedAt,
    notes,
    type: "energy",
    unit: "level",
    value: levelToNumber(label)
  });
}

export function createMoodLog(label: string, notes?: string, loggedAt?: string) {
  return createBiometricLog({
    label,
    loggedAt,
    notes,
    type: "mood",
    unit: "level",
    value: levelToNumber(label)
  });
}

export function createDigestionLog(label: string, notes?: string, loggedAt?: string) {
  return createBiometricLog({
    label,
    loggedAt,
    notes,
    type: "digestion"
  });
}

export function createSymptomLog(label: string, severity: number, notes?: string, loggedAt?: string) {
  return createBiometricLog({
    label,
    loggedAt,
    notes,
    severity,
    type: "symptom",
    value: severity
  });
}

export async function createHeartRateLog(restingBpm: number, activeBpm?: number, notes?: string, loggedAt?: string) {
  return createBiometricLog({
    loggedAt,
    metadata: { activeBpm },
    notes,
    secondaryUnit: activeBpm ? "bpm" : undefined,
    secondaryValue: activeBpm,
    type: "heart_rate",
    unit: "bpm",
    value: restingBpm
  });
}

export async function getNutritionBiometricInsights(): Promise<BiometricsInsight[]> {
  const [weightTrend, sleep, energyLogs, digestion, glucose] = await Promise.all([
    calculateBiometricTrend("weight"),
    getLatestBiometricLog("sleep"),
    getBiometricLogsByType("energy"),
    getLatestBiometricLog("digestion"),
    getLatestBiometricLog("blood_glucose")
  ]);
  const insights: BiometricsInsight[] = [];
  const recentLowEnergy = energyLogs.slice(0, 5).filter((log) => (log.value ?? 3) <= 2).length >= 2;

  if (weightTrend.latestValue) {
    insights.push({
      message: "Your weight trend can help you understand progress over time.",
      title: "Weight trend",
      type: "weight"
    });
  }

  if (sleep?.value && sleep.value < 420) {
    insights.push({
      message: "Sleep was lower than usual. Recovery and appetite can feel different on low-sleep days.",
      title: "Sleep and nutrition",
      type: "sleep"
    });
  }

  if (recentLowEnergy) {
    insights.push({
      message: "Energy has been logged as low recently. Review sleep, food, hydration, and workload.",
      title: "Energy pattern",
      type: "energy"
    });
  }

  if (digestion) {
    insights.push({
      message: "You logged digestion notes recently. Food notes may help you spot patterns.",
      title: "Digestion notes",
      type: "digestion"
    });
  }

  if (glucose) {
    insights.push({
      message: "Blood glucose logs are shown for tracking only. Follow healthcare guidance for interpretation.",
      title: "Glucose tracking",
      type: "blood_glucose"
    });
  }

  return insights.slice(0, 4);
}

export async function getWeightGoalProgress() {
  const [target, weightTrend] = await Promise.all([
    getActiveNutritionTarget(),
    calculateBiometricTrend("weight")
  ]);

  if (!weightTrend.latestValue) return "Track weight over time to support your goals.";

  if (target?.goalWeightKg) {
    return `Latest logged weight is ${weightTrend.latestValue} kg. Goal weight is ${target.goalWeightKg} kg.`;
  }

  return "Your weight trend can help you understand progress over time.";
}

export async function getEnergyFoodPatternSummary() {
  const energyLogs = await getBiometricLogsByType("energy");
  const recentLowEnergy = energyLogs.slice(0, 5).filter((log) => (log.value ?? 3) <= 2).length >= 2;

  return recentLowEnergy
    ? "Energy has been logged as low recently. Review sleep, food, hydration, and workload."
    : "Energy logs can help you compare daily patterns with meals and hydration.";
}

export async function getDigestionFoodNotesSummary() {
  const digestion = await getLatestBiometricLog("digestion");

  return digestion
    ? "You logged digestion notes recently. Food notes may help you spot patterns."
    : "Digestion notes can be compared with food notes when you add them.";
}

export async function getWorkoutReadinessSummary(): Promise<WorkoutReadinessSummary> {
  const [sleep, energy] = await Promise.all([
    getLatestBiometricLog("sleep"),
    getLatestBiometricLog("energy")
  ]);

  return {
    energyLabel: energy?.label,
    message: "Your energy and sleep logs can help you choose a suitable workout intensity.",
    sleepDurationMinutes: sleep?.value,
    title: "Workout readiness"
  };
}

export async function getTrainingBodyProgressSummary(): Promise<TrainingBodyProgressSummary> {
  const [weight, body] = await Promise.all([
    calculateBiometricTrend("weight"),
    calculateBiometricTrend("body_measurement")
  ]);

  return {
    bodyMeasurementMessage: body.latestValue
      ? `Latest measurement trend uses ${body.latestValue} ${body.unit ?? "cm"} as the primary logged value.`
      : "Body measurements can support muscle or fat-loss goals over time.",
    weightMessage: weight.latestValue
      ? `Latest weight log is ${weight.latestValue} ${weight.unit ?? "kg"}.`
      : "Weight trend can show next to goal weight when logs exist."
  };
}

export function formatBiometricLogValue(log: BiometricLog) {
  switch (log.type) {
    case "weight":
      return log.value ? `${log.value} kg` : "No value";
    case "sleep":
      return log.value ? formatSleepDuration(log.value) : "No value";
    case "heart_rate":
      return log.value ? `${Math.round(log.value)} bpm` : "No value";
    case "blood_pressure":
      return log.value && log.secondaryValue ? `${Math.round(log.value)}/${Math.round(log.secondaryValue)} mmHg` : "No value";
    case "blood_glucose":
      return log.value ? `${log.value} ${log.unit ?? "mmol/L"}` : "No value";
    case "energy":
    case "mood":
    case "digestion":
      return log.label ?? "Logged";
    case "symptom":
      return log.label ? `${log.label}${log.severity ? ` ${log.severity}/10` : ""}` : "Logged";
    case "body_measurement":
      return log.value ? `${log.value} ${log.unit ?? "cm"}` : "Measurements logged";
    default:
      return "Logged";
  }
}

export function getBiometricWidgetTitle(widgetKey: WidgetKey) {
  switch (widgetKey) {
    case "biometric_goal_weight":
      return "Goal Weight";
    case "resting_heart_rate":
      return "Resting Heart Rate";
    case "blood_pressure":
      return "Blood Pressure";
    case "blood_glucose":
      return "Blood Glucose";
    case "symptoms":
      return "Symptoms";
    default:
      return String(widgetKey)
        .split("_")
        .map((part) => part[0]?.toUpperCase() + part.slice(1))
        .join(" ");
  }
}

function getLogsWithinDays(logs: BiometricLog[], days: number) {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days + 1);

  return logs.filter((log) => new Date(log.loggedAt) >= threshold);
}

function averageLogValue(logs: BiometricLog[]) {
  const values = logs.map((log) => log.value).filter((value): value is number => typeof value === "number");

  if (!values.length) return undefined;

  return Math.round((values.reduce((total, value) => total + value, 0) / values.length) * 10) / 10;
}

function buildTrendMessage(type: BiometricType, latest?: BiometricLog, change?: number) {
  if (!latest) return BIOMETRIC_TYPE_EMPTY_TEXT[type];

  if (change === undefined) return "Latest log is saved. Add more logs to see trends.";

  if (Math.abs(change) < 0.1) return "Latest value appears similar to the previous log.";

  const direction = change > 0 ? "up" : "down";

  return `Latest value is ${direction} by ${Math.abs(Math.round(change * 10) / 10)} ${latest.unit ?? ""} since the previous log.`.trim();
}

function levelToNumber(label: string) {
  const normalized = label.toLowerCase().replace(/\s+/g, "_");

  switch (normalized) {
    case "very_low":
      return 1;
    case "low":
      return 2;
    case "okay":
    case "stressed":
    case "tired":
      return 3;
    case "good":
    case "calm":
    case "motivated":
      return 4;
    case "great":
      return 5;
    default:
      return undefined;
  }
}

function formatSleepDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  return `${hours}h ${remainingMinutes}m`;
}
