import {
  topMuscles,
  type MuscleScoreMap,
} from "@/components/fitness/muscle-map";
import { getCurrentStreakDays, getWorkoutSessions } from "@/lib/fitnessStorage";
import { supabase } from "@/lib/supabase";
import {
  deactivateFitnessPlan,
  recordFitnessHistoryEvent as recordPlanHistoryEvent,
} from "@/services/fitnessPlanActivationService";
import { getMuscleHistoryScores } from "@/services/fitnessMuscleMapService";
import type { WorkoutSession } from "@/types/fitness";

export type FitnessHistoryEvent = {
  createdAt: string;
  description: string;
  eventType: string;
  id: string;
  relatedPlanId?: string;
  relatedProgramId?: string;
  title: string;
};

export type ActivePlanProgress = {
  completedDays: number;
  currentDay: number;
  id: string;
  missedDays: number;
  nextWorkout?: string;
  progress: number;
  sourceProgramId: string;
  title: string;
  totalDays: number;
};

export type FitnessHistorySummary = {
  activePlans: number;
  goalProgress: number;
  mostTrainedMuscles: string;
  recoveryAttention: string;
  weeklyStreak: number;
  workoutsCompleted: number;
  workoutsSkipped: number;
};

export async function getFitnessHistory(
  rangeDays?: number,
): Promise<FitnessHistoryEvent[]> {
  const [databaseEvents, sessions] = await Promise.all([
    getDatabaseHistory(rangeDays),
    getWorkoutSessions(),
  ]);
  const localEvents = filterSessions(sessions, rangeDays).map(sessionToHistory);
  return [...databaseEvents, ...localEvents].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export async function getFitnessSummary(
  rangeDays?: number,
): Promise<FitnessHistorySummary> {
  const [history, activePlans, streak, muscle] = await Promise.all([
    getFitnessHistory(rangeDays),
    getActivePlanProgress(),
    getCurrentStreakDays(),
    getMuscleBalanceSummary(rangeDays),
  ]);
  const workoutsCompleted = history.filter((item) =>
    [
      "workout_completed",
      "exercise_completed",
      "calendar_workout_completed",
    ].includes(item.eventType),
  ).length;
  const workoutsSkipped = history.filter((item) =>
    item.eventType.includes("skipped"),
  ).length;
  return {
    activePlans: activePlans.length,
    goalProgress: activePlans.length
      ? Math.round(
          activePlans.reduce((total, plan) => total + plan.progress, 0) /
            activePlans.length,
        )
      : 0,
    mostTrainedMuscles: muscle.workedMost,
    recoveryAttention: muscle.recoveryAttention,
    weeklyStreak: streak,
    workoutsCompleted,
    workoutsSkipped,
  };
}

export async function getActivePlanProgress(): Promise<ActivePlanProgress[]> {
  try {
    const user = await requireUser();
    const { data: plans, error } = await supabase
      .from("user_imported_plans")
      .select("id,title,source_program_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("activated_at", { ascending: false });
    if (error || !plans?.length) return [];
    const results: ActivePlanProgress[] = [];
    for (const plan of plans) {
      const { data: days } = await supabase
        .from("user_imported_plan_days")
        .select("completion_status,scheduled_for,source_day_number")
        .eq("imported_plan_id", plan.id)
        .order("source_day_number");
      const list = days ?? [];
      const completedDays = list.filter(
        (day) => day.completion_status === "completed",
      ).length;
      const missedDays = list.filter((day) =>
        ["skipped", "cancelled"].includes(day.completion_status),
      ).length;
      const next = list.find(
        (day) =>
          day.completion_status === "planned" &&
          new Date(day.scheduled_for) >= new Date(),
      );
      results.push({
        completedDays,
        currentDay: Math.min(list.length, completedDays + missedDays + 1),
        id: plan.id,
        missedDays,
        nextWorkout: next?.scheduled_for,
        progress: list.length
          ? Math.round((completedDays / list.length) * 100)
          : 0,
        sourceProgramId: plan.source_program_id,
        title: plan.title,
        totalDays: list.length,
      });
    }
    return results;
  } catch {
    return [];
  }
}

export async function getMuscleBalanceSummary(
  rangeDays = 7,
): Promise<{
  needsAttention: string;
  recoveryAttention: string;
  scores: MuscleScoreMap;
  workedMost: string;
}> {
  const scores = await getMuscleHistoryScores(rangeDays);
  const ranked = topMuscles(scores, 5);
  return {
    needsAttention: ranked.at(-1)?.label ?? "Build a balanced week",
    recoveryAttention:
      (ranked[0]?.score ?? 0) >= 0.65 ? ranked[0].label : "No high recent load",
    scores,
    workedMost: ranked[0]?.label ?? "No muscle history yet",
  };
}

export async function recordFitnessHistoryEvent(payload: {
  description?: string;
  eventType: string;
  metadata?: Record<string, unknown>;
  profileId?: string;
  relatedCalendarEventId?: string;
  relatedExerciseId?: string;
  relatedPlanId?: string;
  relatedProgramId?: string;
  title: string;
}) {
  const user = await requireUser();
  return supabase.from("user_fitness_history").insert({
    description: payload.description,
    event_type: payload.eventType,
    metadata: payload.metadata ?? {},
    profile_id: payload.profileId,
    related_calendar_event_id: payload.relatedCalendarEventId,
    related_exercise_id: payload.relatedExerciseId,
    related_plan_id: payload.relatedPlanId,
    related_program_id: payload.relatedProgramId,
    title: payload.title,
    user_id: user.id,
  });
}

export async function markWorkoutCompleted(
  payload: Omit<Parameters<typeof recordFitnessHistoryEvent>[0], "eventType">,
) {
  if (payload.relatedCalendarEventId) {
    const user = await requireUser();
    const { data: link } = await supabase
      .from("user_plan_calendar_events")
      .select("imported_plan_day_id,imported_plan_id")
      .eq("user_id", user.id)
      .eq("calendar_event_id", payload.relatedCalendarEventId)
      .limit(1)
      .maybeSingle();
    if (link?.imported_plan_day_id) {
      await supabase
        .from("user_imported_plan_days")
        .update({ completion_status: "completed" })
        .eq("id", link.imported_plan_day_id);
    }
    return recordFitnessHistoryEvent({
      ...payload,
      eventType: "calendar_workout_completed",
      relatedPlanId: payload.relatedPlanId ?? link?.imported_plan_id,
    });
  }
  return recordFitnessHistoryEvent({
    ...payload,
    eventType: "workout_completed",
  });
}
export async function markWorkoutSkipped(
  payload: Omit<Parameters<typeof recordFitnessHistoryEvent>[0], "eventType">,
) {
  if (payload.relatedCalendarEventId) {
    const user = await requireUser();
    const { data: link } = await supabase
      .from("user_plan_calendar_events")
      .select("imported_plan_day_id,imported_plan_id")
      .eq("user_id", user.id)
      .eq("calendar_event_id", payload.relatedCalendarEventId)
      .limit(1)
      .maybeSingle();
    if (link?.imported_plan_day_id) {
      await supabase
        .from("user_imported_plan_days")
        .update({ completion_status: "skipped" })
        .eq("id", link.imported_plan_day_id);
    }
    return recordFitnessHistoryEvent({
      ...payload,
      eventType: "workout_skipped",
      relatedPlanId: payload.relatedPlanId ?? link?.imported_plan_id,
    });
  }
  return recordFitnessHistoryEvent({
    ...payload,
    eventType: "workout_skipped",
  });
}
export { deactivateFitnessPlan };
export { recordPlanHistoryEvent };

async function getDatabaseHistory(
  rangeDays?: number,
): Promise<FitnessHistoryEvent[]> {
  try {
    const user = await requireUser();
    let query = supabase
      .from("user_fitness_history")
      .select("*")
      .eq("user_id", user.id)
      .order("occurred_at", { ascending: false })
      .limit(100);
    if (rangeDays) query = query.gte("occurred_at", since(rangeDays));
    const { data, error } = await query;
    if (error) return [];
    return (data ?? []).map((row) => ({
      createdAt: row.occurred_at ?? row.created_at,
      description:
        row.description ?? historyDescription(row.event_type, row.metadata),
      eventType: row.event_type,
      id: row.id,
      relatedPlanId: row.related_plan_id ?? row.imported_plan_id,
      relatedProgramId: row.related_program_id ?? row.source_program_id,
      title: row.title ?? historyTitle(row.event_type),
    }));
  } catch {
    return [];
  }
}
function filterSessions(sessions: WorkoutSession[], rangeDays?: number) {
  if (!rangeDays) return sessions;
  const threshold = new Date(since(rangeDays));
  return sessions.filter((session) => new Date(session.startedAt) >= threshold);
}
function sessionToHistory(session: WorkoutSession): FitnessHistoryEvent {
  return {
    createdAt: session.endedAt ?? session.startedAt,
    description:
      session.notes ??
      `${Math.round(session.durationSeconds / 60)} active minutes`,
    eventType: session.completed ? "workout_completed" : "workout_started",
    id: `local-${session.id}`,
    title: session.title,
  };
}
function historyTitle(type: string) {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function historyDescription(type: string, metadata: unknown) {
  if (type === "plan_activated")
    return "A workout plan was added to the calendar.";
  if (type === "plan_deactivated")
    return "A workout plan was deactivated while past history was kept.";
  return typeof metadata === "object"
    ? "Fitness activity recorded."
    : "Fitness activity recorded.";
}
function since(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}
async function requireUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw error ?? new Error("Sign in required");
  return data.user;
}
