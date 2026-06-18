import { useCallback, useEffect, useMemo, useState } from "react";

import { EXERCISE_LIBRARY, PREBUILT_ROUTINES, formatWorkoutLabel } from "@/constants/workoutLibrary";
import {
  getTodayFitnessSummary,
  getWorkoutPlans,
  getWorkoutSessions,
} from "@/lib/fitnessStorage";
import type { ExerciseLibraryItem, FitnessSummary, WorkoutPlan, WorkoutSession } from "@/types/fitness";
import { getHealthOSChartTheme } from "@/theme/healthos";
import type { HealthOSSegmentedRingSegment } from "@/components/healthos/charts";

import type {
  HealthOSExerciseDisplay,
  HealthOSFitnessLegendItem,
  HealthOSFitnessStatCard,
  HealthOSFitnessWeekDay,
  HealthOSMuscleGroup,
  HealthOSMuscleStatusItem,
  HealthOSWorkoutDisplay,
} from "./HealthOSFitnessTypes";

type HealthOSFitnessDataState = {
  plans: WorkoutPlan[];
  sessions: WorkoutSession[];
  summary: FitnessSummary | null;
};

const INITIAL_STATE: HealthOSFitnessDataState = {
  plans: [],
  sessions: [],
  summary: null,
};

export function useHealthOSFitnessData() {
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [state, setState] = useState<HealthOSFitnessDataState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartTheme = getHealthOSChartTheme("dark");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summary, plans, sessions] = await Promise.all([
        getTodayFitnessSummary().catch(() => null),
        getWorkoutPlans().catch(() => []),
        getWorkoutSessions().catch(() => []),
      ]);
      setState({ plans, sessions, summary });
    } catch {
      setError("Fitness data is unavailable right now.");
      setState(INITIAL_STATE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const selectedSessions = useMemo(
    () => state.sessions.filter((session) => toDateKey(new Date(session.startedAt)) === selectedDate),
    [selectedDate, state.sessions],
  );
  const completedToday = selectedSessions.filter((session) => session.completed);
  const activePlan = state.plans[0] ?? null;
  const activeRoutine = PREBUILT_ROUTINES[0];
  const recommendedExercises = EXERCISE_LIBRARY.slice(0, 6).map(mapExercise);
  const todaysWorkout: HealthOSWorkoutDisplay | null =
    activePlan || activeRoutine
      ? {
          calendarStatus: "Calendar connection pending",
          difficulty: activePlan?.intensity ?? activeRoutine.difficulty,
          equipment: activeRoutine.equipment.map(formatWorkoutLabel),
          exercises: activeRoutine.exerciseIds
            .map((exerciseId) => EXERCISE_LIBRARY.find((exercise) => exercise.id === exerciseId))
            .filter(Boolean)
            .slice(0, 6)
            .map((exercise) => mapExercise(exercise as ExerciseLibraryItem)),
          familyStatus: "Private until shared",
          goal: activePlan?.workoutType ? formatWorkoutLabel(activePlan.workoutType) : formatWorkoutLabel(activeRoutine.goal),
          id: activePlan?.id ?? activeRoutine.id,
          muscleGroups: activeRoutine.targetMuscles.map(formatWorkoutLabel),
          title: activePlan?.title ?? activeRoutine.name,
          totalMinutes: activePlan?.targetMinutes ?? activeRoutine.durationMinutes,
        }
      : null;
  const totalMinutes = Math.round(
    selectedSessions.reduce((sum, session) => sum + session.durationSeconds, 0) / 60,
  );
  const calories = selectedSessions.reduce(
    (sum, session) => sum + (session.caloriesEstimate ?? 0),
    0,
  );
  const exerciseCount = todaysWorkout?.exercises.length ?? 0;
  const completion = exerciseCount && completedToday.length ? 1 : 0;
  const percent = Math.round(
    Math.min(100, ((state.summary?.weeklyGoalProgress ?? 0) + completion * 100) / 2),
  );
  const progressSegments: HealthOSSegmentedRingSegment[] = [
    {
      color: chartTheme.ringSegments[0],
      key: "time",
      label: "Time",
      max: Math.max(todaysWorkout?.totalMinutes ?? 45, 1),
      value: totalMinutes,
    },
    {
      color: chartTheme.ringSegments[2],
      key: "completion",
      label: "Completion",
      max: 1,
      value: completion,
    },
    {
      color: chartTheme.ringSegments[1],
      key: "week",
      label: "Weekly",
      max: 100,
      value: state.summary?.weeklyGoalProgress ?? 0,
    },
  ];
  const legendItems: HealthOSFitnessLegendItem[] = [
    {
      color: chartTheme.ringSegments[0],
      key: "kcal",
      label: "Kcal",
      value: calories ? `${Math.round(calories)}` : "Not started",
    },
    {
      color: chartTheme.ringSegments[2],
      key: "time",
      label: "Time",
      target: todaysWorkout?.totalMinutes ? `${todaysWorkout.totalMinutes} min` : undefined,
      value: totalMinutes ? `${totalMinutes} min` : "Not started",
    },
    {
      color: chartTheme.ringSegments[1],
      key: "exercises",
      label: "Exercises",
      value: completedToday.length ? `${completedToday.length} done` : "Not started",
      target: exerciseCount ? `${exerciseCount} planned` : undefined,
    },
    {
      color: chartTheme.primaryLine,
      key: "streak",
      label: "Streak",
      value: state.summary?.currentStreakDays ? `${state.summary.currentStreakDays} days` : "Not started",
    },
  ];
  const statCards: HealthOSFitnessStatCard[] = [
    { key: "streak", label: "Streak", value: state.summary?.currentStreakDays ? `${state.summary.currentStreakDays} days` : "No streak" },
    { key: "weekly", label: "Weekly workouts", value: `${state.summary?.workoutsThisWeek ?? 0}` },
    { key: "minutes", label: "Total minutes", value: totalMinutes ? `${totalMinutes}` : "0" },
    { key: "calories", label: "Calories", value: calories ? `${Math.round(calories)}` : "0" },
    { key: "pb", label: "Personal bests", value: "No PBs" },
    { key: "recovery", label: "Recovery", value: "Not tracked" },
  ];
  const muscleStatus: HealthOSMuscleStatusItem[] = [
    ...(todaysWorkout?.muscleGroups ?? []).slice(0, 4).map((label) => ({
      group: normalizeMuscle(label),
      label,
      status: "targeted" as const,
    })),
    { group: "mobility" as const, label: "Mobility", status: "recovered" as const },
  ];

  return {
    activeGoal: activePlan?.title ?? null,
    activePlan,
    emptyState: "Choose a plan to start.",
    error,
    exercises: recommendedExercises,
    legendItems,
    loading,
    muscleStatus,
    progressSegments,
    recommendedExercises,
    refresh,
    selectedDate,
    setSelectedDate,
    statCards,
    todayProgress: {
      percent,
      statusNote: activePlan ? "Plan progress uses your real logged workouts." : "Choose a plan to start tracking.",
    },
    todaysWorkout,
    weekDays: buildWeekDays(selectedDate, state.sessions),
  };
}

function mapExercise(exercise: ExerciseLibraryItem): HealthOSExerciseDisplay {
  return {
    difficulty: exercise.difficulty,
    equipment: exercise.equipment.map(formatWorkoutLabel),
    id: exercise.id,
    instructions: exercise.instructions,
    muscleGroups: [formatWorkoutLabel(exercise.primaryMuscle)],
    name: exercise.name,
    routeTarget: `/fitness/exercise/${exercise.id}` as const,
    secondaryMuscles: exercise.secondaryMuscles.map(formatWorkoutLabel),
    videoUrl: exercise.videoUrl?.startsWith("local-placeholder") ? undefined : exercise.videoUrl,
  };
}

function buildWeekDays(selectedDate: string, sessions: WorkoutSession[]): HealthOSFitnessWeekDay[] {
  const today = new Date();
  const start = startOfWeek(today);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const dateKey = toDateKey(date);
    const hasCompleted = sessions.some(
      (session) => session.completed && toDateKey(new Date(session.startedAt)) === dateKey,
    );
    const isToday = dateKey === toDateKey(today);
    return {
      date,
      dateKey,
      dayLabel: date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 3),
      numberLabel: String(date.getDate()),
      status: dateKey === selectedDate ? "selected" : hasCompleted ? "completed" : isToday ? "today" : "rest",
    };
  });
}

function startOfWeek(date: Date) {
  const nextDate = new Date(date);
  const day = nextDate.getDay();
  nextDate.setDate(nextDate.getDate() - day + (day === 0 ? -6 : 1));
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeMuscle(label: string): HealthOSMuscleGroup {
  const normalized = label.toLowerCase();
  if (normalized.includes("back")) return "back";
  if (normalized.includes("shoulder")) return "shoulders";
  if (normalized.includes("glute")) return "glutes";
  if (normalized.includes("leg") || normalized.includes("quad")) return "quads";
  if (normalized.includes("core")) return "core";
  if (normalized.includes("mobility")) return "mobility";
  if (normalized.includes("cardio")) return "cardio";
  return "fullBody";
}
