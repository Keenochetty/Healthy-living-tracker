import {
  muscleKeysFromText,
  normalizeScores,
  type MuscleKey,
  type MuscleScoreMap,
  type MuscleTargetRole
} from "@/components/fitness/muscle-map";
import { supabase } from "@/lib/supabase";

type ExerciseLike = {
  category?: string | null;
  exercise_id?: string;
  id?: string;
  name?: string | null;
  primary_muscles?: string | string[] | null;
  primaryMuscle?: string | null;
  secondary_muscles?: string | string[] | null;
  secondaryMuscles?: string[] | null;
  title?: string | null;
};

type DbMuscleTarget = {
  exercise_id: string;
  intensity: number;
  muscle_key: MuscleKey;
  target_role: MuscleTargetRole;
};

export function scoresFromExerciseFallback(exercise?: ExerciseLike | null): MuscleScoreMap {
  if (!exercise) return {};

  const primary = muscleKeysFromText(exercise.primary_muscles ?? exercise.primaryMuscle);
  const secondary = muscleKeysFromText(exercise.secondary_muscles ?? exercise.secondaryMuscles);
  const category = muscleKeysFromText(exercise.category);
  const scores: MuscleScoreMap = {};

  for (const muscle of primary) {
    scores[muscle] = Math.max(scores[muscle] ?? 0, 1);
  }

  for (const muscle of secondary) {
    scores[muscle] = Math.max(scores[muscle] ?? 0, 0.55);
  }

  for (const muscle of category) {
    scores[muscle] = Math.max(scores[muscle] ?? 0, 0.35);
  }

  return normalizeScores(scores);
}

export async function getExerciseMuscleScores(
  exerciseId: string,
  fallbackExercise?: ExerciseLike | null
): Promise<MuscleScoreMap> {
  const { data, error } = await supabase
    .from("fitness_exercise_muscle_targets")
    .select("exercise_id,muscle_key,target_role,intensity")
    .eq("exercise_id", exerciseId);

  if (!error && data?.length) {
    const scores: MuscleScoreMap = {};

    for (const target of data as DbMuscleTarget[]) {
      const roleBoost =
        target.target_role === "primary" ? 1 : target.target_role === "secondary" ? 0.65 : 0.35;

      scores[target.muscle_key] = Math.max(
        scores[target.muscle_key] ?? 0,
        Number(target.intensity ?? 0.5) * roleBoost
      );
    }

    return normalizeScores(scores);
  }

  return scoresFromExerciseFallback(fallbackExercise);
}

export function aggregateMuscleScores(items: MuscleScoreMap[]): MuscleScoreMap {
  const combined: MuscleScoreMap = {};

  for (const item of items) {
    for (const [key, value] of Object.entries(item)) {
      const muscleKey = key as MuscleKey;
      combined[muscleKey] = (combined[muscleKey] ?? 0) + Number(value ?? 0);
    }
  }

  return normalizeScores(combined);
}

export async function getMuscleHistoryScores(days = 7): Promise<MuscleScoreMap> {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return {};

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("user_muscle_load_history")
    .select("muscle_key,load_score,performed_at")
    .eq("user_id", user.id)
    .gte("performed_at", since.toISOString())
    .order("performed_at", { ascending: false });

  if (error || !data?.length) return {};

  const now = Date.now();
  const scores: MuscleScoreMap = {};

  for (const row of data as Array<{ load_score: number; muscle_key: MuscleKey; performed_at: string }>) {
    const ageMs = Math.max(0, now - new Date(row.performed_at).getTime());
    const ageDays = ageMs / 86_400_000;
    const decay = Math.max(0.2, 1 - ageDays / days);
    const score = Number(row.load_score ?? 0) * decay;

    scores[row.muscle_key] = (scores[row.muscle_key] ?? 0) + score;
  }

  return normalizeScores(scores);
}

export async function recordMuscleLoadForExercise(input: {
  exerciseId?: string;
  fallbackExercise?: ExerciseLike | null;
  intensityMultiplier?: number;
  performedAt?: string;
  profileId?: string;
  source?: string;
  workoutSessionId?: string;
}) {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !input.exerciseId) {
    return { data: null, error: "Missing user or exercise id" };
  }

  const scores = await getExerciseMuscleScores(input.exerciseId, input.fallbackExercise);
  const intensityMultiplier = input.intensityMultiplier ?? 1;

  const rows = Object.entries(scores).map(([muscleKey, score]) => ({
    exercise_id: input.exerciseId,
    intensity: Number(score ?? 0),
    load_score: Number(score ?? 0) * intensityMultiplier,
    muscle_key: muscleKey,
    performed_at: input.performedAt ?? new Date().toISOString(),
    profile_id: input.profileId,
    source: input.source ?? "workout_completed",
    user_id: user.id,
    workout_session_id: input.workoutSessionId
  }));

  if (!rows.length) return { data: null, error: "No muscle scores found" };

  return supabase.from("user_muscle_load_history").insert(rows);
}
