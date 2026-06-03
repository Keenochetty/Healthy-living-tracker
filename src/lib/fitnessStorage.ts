import AsyncStorage from "@react-native-async-storage/async-storage";

import { DEFAULT_TIMER_PRESETS } from "@/constants/fitnessOptions";
import type {
  FitnessSummary,
  IntervalTimerPreset,
  WorkoutIntensity,
  WorkoutPlan,
  WorkoutSession,
  WorkoutType
} from "@/types/fitness";
import { getTodayStepCount } from "./pedometer";

const WORKOUT_PLANS_STORAGE_KEY = "family_health_workout_plans";
const WORKOUT_SESSIONS_STORAGE_KEY = "family_health_workout_sessions";
const INTERVAL_PRESETS_STORAGE_KEY = "family_health_interval_presets";
const fitnessListeners = new Set<() => void>();

type CreateWorkoutPlanInput = {
  description?: string;
  intensity: WorkoutIntensity;
  targetCalories?: number;
  targetDistanceKm?: number;
  targetMinutes?: number;
  targetSteps?: number;
  title: string;
  workoutType: WorkoutType;
};

type CreateWorkoutSessionInput = {
  caloriesEstimate?: number;
  distanceKm?: number;
  durationSeconds?: number;
  intensity: WorkoutIntensity;
  notes?: string;
  planId?: string;
  startedAt?: string;
  steps?: number;
  title: string;
  workoutType: WorkoutType;
};

export function subscribeToFitness(listener: () => void) {
  fitnessListeners.add(listener);

  return () => {
    fitnessListeners.delete(listener);
  };
}

function notifyFitnessListeners() {
  fitnessListeners.forEach((listener) => listener());
}

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
  notifyFitnessListeners();

  return value;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfWeek(date: Date) {
  const nextDate = new Date(date);
  const day = nextDate.getDay();
  const diff = nextDate.getDate() - day + (day === 0 ? -6 : 1);

  nextDate.setDate(diff);
  nextDate.setHours(0, 0, 0, 0);

  return nextDate;
}

function sortSessions(sessions: WorkoutSession[]) {
  return [...sessions].sort(
    (left, right) =>
      new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime()
  );
}

export async function getWorkoutPlans() {
  return readJsonArray<WorkoutPlan>(WORKOUT_PLANS_STORAGE_KEY);
}

export async function createWorkoutPlan(input: CreateWorkoutPlanInput) {
  const now = new Date().toISOString();
  const plan: WorkoutPlan = {
    createdAt: now,
    description: input.description?.trim() || undefined,
    id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    intensity: input.intensity,
    targetCalories: input.targetCalories,
    targetDistanceKm: input.targetDistanceKm,
    targetMinutes: input.targetMinutes,
    targetSteps: input.targetSteps,
    title: input.title.trim(),
    updatedAt: now,
    workoutType: input.workoutType
  };
  const plans = await getWorkoutPlans();

  await writeJsonArray(WORKOUT_PLANS_STORAGE_KEY, [plan, ...plans]);

  return plan;
}

export async function updateWorkoutPlan(
  id: string,
  partial: Partial<Omit<WorkoutPlan, "id" | "createdAt">>
) {
  const plans = await getWorkoutPlans();
  const updatedPlans = plans.map((plan) =>
    plan.id === id ? { ...plan, ...partial, updatedAt: new Date().toISOString() } : plan
  );

  await writeJsonArray(WORKOUT_PLANS_STORAGE_KEY, updatedPlans);

  return updatedPlans.find((plan) => plan.id === id) ?? null;
}

export async function deleteWorkoutPlan(id: string) {
  const plans = await getWorkoutPlans();
  const plan = plans.find((item) => item.id === id) ?? null;

  await writeJsonArray(WORKOUT_PLANS_STORAGE_KEY, plans.filter((item) => item.id !== id));

  return plan;
}

export async function getWorkoutSessions() {
  const sessions = await readJsonArray<WorkoutSession>(WORKOUT_SESSIONS_STORAGE_KEY);

  return sortSessions(sessions);
}

export async function createWorkoutSession(input: CreateWorkoutSessionInput) {
  const now = new Date().toISOString();
  const session: WorkoutSession = {
    caloriesEstimate: input.caloriesEstimate,
    completed: false,
    createdAt: now,
    distanceKm: input.distanceKm,
    durationSeconds: input.durationSeconds ?? 0,
    id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    intensity: input.intensity,
    notes: input.notes?.trim() || undefined,
    planId: input.planId,
    startedAt: input.startedAt ?? now,
    steps: input.steps,
    title: input.title.trim(),
    updatedAt: now,
    workoutType: input.workoutType
  };
  const sessions = await getWorkoutSessions();

  await writeJsonArray(WORKOUT_SESSIONS_STORAGE_KEY, [session, ...sessions]);

  return session;
}

export async function updateWorkoutSession(
  id: string,
  partial: Partial<Omit<WorkoutSession, "id" | "createdAt">>
) {
  const sessions = await getWorkoutSessions();
  const updatedSessions = sessions.map((session) =>
    session.id === id
      ? { ...session, ...partial, updatedAt: new Date().toISOString() }
      : session
  );

  await writeJsonArray(WORKOUT_SESSIONS_STORAGE_KEY, updatedSessions);

  return updatedSessions.find((session) => session.id === id) ?? null;
}

export async function completeWorkoutSession(
  id: string,
  data: Partial<Omit<WorkoutSession, "id" | "createdAt" | "completed">>
) {
  return updateWorkoutSession(id, {
    ...data,
    completed: true,
    endedAt: data.endedAt ?? new Date().toISOString()
  });
}

export async function deleteWorkoutSession(id: string) {
  const sessions = await getWorkoutSessions();
  const session = sessions.find((item) => item.id === id) ?? null;

  await writeJsonArray(
    WORKOUT_SESSIONS_STORAGE_KEY,
    sessions.filter((item) => item.id !== id)
  );

  return session;
}

export async function getIntervalPresets() {
  const presets = await readJsonArray<IntervalTimerPreset>(
    INTERVAL_PRESETS_STORAGE_KEY,
    DEFAULT_TIMER_PRESETS
  );

  if (!presets.length) {
    await writeJsonArray(INTERVAL_PRESETS_STORAGE_KEY, DEFAULT_TIMER_PRESETS);
    return DEFAULT_TIMER_PRESETS;
  }

  return presets;
}

export async function createIntervalPreset(
  input: Omit<IntervalTimerPreset, "id" | "createdAt" | "updatedAt">
) {
  const now = new Date().toISOString();
  const preset: IntervalTimerPreset = {
    ...input,
    createdAt: now,
    id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    updatedAt: now
  };
  const presets = await getIntervalPresets();

  await writeJsonArray(INTERVAL_PRESETS_STORAGE_KEY, [preset, ...presets]);

  return preset;
}

export async function updateIntervalPreset(
  id: string,
  partial: Partial<Omit<IntervalTimerPreset, "id" | "createdAt">>
) {
  const presets = await getIntervalPresets();
  const updatedPresets = presets.map((preset) =>
    preset.id === id
      ? { ...preset, ...partial, updatedAt: new Date().toISOString() }
      : preset
  );

  await writeJsonArray(INTERVAL_PRESETS_STORAGE_KEY, updatedPresets);

  return updatedPresets.find((preset) => preset.id === id) ?? null;
}

export async function deleteIntervalPreset(id: string) {
  const presets = await getIntervalPresets();
  const preset = presets.find((item) => item.id === id) ?? null;

  await writeJsonArray(
    INTERVAL_PRESETS_STORAGE_KEY,
    presets.filter((item) => item.id !== id)
  );

  return preset;
}

export async function getLatestWorkout() {
  const sessions = await getWorkoutSessions();

  return sessions.find((session) => session.completed) ?? sessions[0];
}

export async function getCurrentStreakDays() {
  const sessions = (await getWorkoutSessions()).filter((session) => session.completed);
  const workoutDays = new Set(sessions.map((session) => toDateKey(new Date(session.startedAt))));
  let streak = 0;
  const currentDate = new Date();

  while (workoutDays.has(toDateKey(currentDate))) {
    streak += 1;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

export async function getWeeklyFitnessSummary() {
  const sessions = await getWorkoutSessions();
  const weekStart = startOfWeek(new Date());

  return sessions.filter((session) => new Date(session.startedAt) >= weekStart);
}

export async function getTodayFitnessSummary(): Promise<FitnessSummary> {
  const [sessions, stepsToday, latestWorkout, currentStreakDays, weeklySessions] =
    await Promise.all([
      getWorkoutSessions(),
      getTodayStepCount(),
      getLatestWorkout(),
      getCurrentStreakDays(),
      getWeeklyFitnessSummary()
    ]);
  const todayKey = toDateKey(new Date());
  const todaySessions = sessions.filter((session) => toDateKey(new Date(session.startedAt)) === todayKey);
  const activeMinutesToday = Math.round(
    todaySessions.reduce((total, session) => total + session.durationSeconds, 0) / 60
  );
  const weeklyGoalProgress = Math.min(100, (weeklySessions.length / 3) * 100);

  return {
    activeMinutesToday,
    currentStreakDays,
    latestWorkout,
    stepsToday,
    weeklyGoalProgress,
    workoutsThisWeek: weeklySessions.length
  };
}
