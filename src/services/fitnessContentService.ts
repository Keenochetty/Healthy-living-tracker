import { supabase } from "@/lib/supabase";
import type { ExerciseLibraryItem } from "@/types/fitness";

export type FitnessExerciseContent = {
  audience: string[];
  breathing: string[];
  category: string;
  commonMistakes: string[];
  description: string;
  durationMinutes?: number;
  easierVersion?: string;
  equipment: string[];
  exerciseId: string;
  formCues: string[];
  goalTags: string[];
  harderVersion?: string;
  instructions: string[];
  level: string;
  location: string[];
  name: string;
  primaryMuscles: string[];
  reps?: string;
  safetyNotes: string[];
  secondaryMuscles: string[];
  sets?: string;
  stabilizerMuscles: string[];
  videoApproved: boolean;
  videoUrl?: string;
};

export type ExerciseFilters = {
  audience?: string;
  category?: string;
  equipment?: string;
  level?: string;
  muscle?: string;
};

export type NutritionTemplateFilters = {
  audience?: string;
  dietStyle?: string;
  goal?: string;
};

export async function getExercises(filters?: ExerciseFilters) {
  let query = supabase
    .from("fitness_exercises")
    .select("*")
    .order("title", { ascending: true })
    .limit(50);

  if (filters?.audience) query = query.eq("audience", filters.audience);
  if (filters?.level) query = query.eq("level", filters.level);
  if (filters?.category) query = query.eq("category", filters.category);
  if (filters?.equipment) query = query.ilike("equipment", `%${filters.equipment}%`);
  if (filters?.muscle) query = query.ilike("primary_muscles", `%${filters.muscle}%`);

  return query;
}

export async function getExerciseById(exerciseId: string) {
  return supabase
    .from("fitness_exercises")
    .select("*")
    .eq("exercise_id", exerciseId)
    .single();
}

export function normalizeExerciseContent(
  row: Record<string, unknown> | ExerciseLibraryItem,
): FitnessExerciseContent {
  const local = row as Partial<ExerciseLibraryItem>;
  const source = row as Record<string, unknown>;
  const category =
    stringValue(source.category ?? source.type) ??
    local.goalTags?.[0] ??
    local.primaryMuscle ??
    "general fitness";

  return {
    audience: stringList(source.audience ?? source.audiences),
    breathing: stringList(source.breathing ?? source.breathing_cues),
    category,
    commonMistakes: stringList(source.common_mistakes ?? local.commonMistakes),
    description:
      stringValue(source.description) ??
      local.description ??
      "A movement you can review and add to your fitness routine.",
    durationMinutes: numberValue(source.duration_minutes ?? source.duration),
    easierVersion: stringValue(source.easier_version ?? source.regression),
    equipment: stringList(source.equipment ?? local.equipment),
    exerciseId:
      stringValue(source.exercise_id ?? source.id ?? local.id) ?? "exercise",
    formCues: stringList(source.form_cues ?? source.cues),
    goalTags: stringList(source.goal_tags ?? source.goals ?? local.goalTags),
    harderVersion: stringValue(source.harder_version ?? source.progression),
    instructions: stringList(source.instructions ?? local.instructions),
    level:
      stringValue(source.level ?? source.difficulty ?? local.difficulty) ??
      "beginner",
    location: stringList(source.location ?? local.location),
    name:
      stringValue(source.title ?? source.name ?? local.name) ??
      "Exercise",
    primaryMuscles: stringList(
      source.primary_muscles ?? source.primaryMuscle ?? local.primaryMuscle,
    ),
    reps: stringValue(source.reps ?? source.recommended_reps),
    safetyNotes: stringList(source.safety_notes ?? source.safety),
    secondaryMuscles: stringList(
      source.secondary_muscles ??
        source.secondaryMuscles ??
        local.secondaryMuscles,
    ),
    sets: stringValue(source.sets ?? source.recommended_sets),
    stabilizerMuscles: stringList(
      source.stabilizer_muscles ?? source.stabilizers,
    ),
    videoApproved:
      stringValue(source.video_review_status)?.toLowerCase() === "approved",
    videoUrl: stringValue(source.video_url ?? local.videoUrl),
  };
}

function stringValue(value: unknown) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return undefined;
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function stringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => stringValue(item))
      .filter((item): item is string => Boolean(item));
  }
  const string = stringValue(value);
  if (!string) return [];
  return string
    .split(/[,;\n|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function getWorkoutPrograms() {
  return supabase
    .from("fitness_workout_programs")
    .select("*")
    .order("title", { ascending: true })
    .limit(24);
}

export async function getWorkoutProgramById(programId: string) {
  return supabase
    .from("fitness_workout_programs")
    .select("*")
    .or(`program_id.eq.${programId},plan_id.eq.${programId},id.eq.${programId}`)
    .limit(1)
    .maybeSingle();
}

export async function getWorkoutProgramDays(planId: string) {
  return supabase
    .from("fitness_workout_program_days")
    .select("*")
    .eq("plan_id", planId)
    .order("day_number", { ascending: true });
}

export async function getGoalProgressions(goalId: string) {
  return supabase
    .from("fitness_goal_progressions")
    .select("*")
    .eq("goal_id", goalId)
    .order("step_number", { ascending: true });
}

export type FitnessProgramContent = {
  audience: string[];
  averageMinutes: number;
  days: number;
  daysPerWeek: number;
  description: string;
  equipment: string[];
  focus: string[];
  goal: string;
  level: string;
  programId: string;
  recoveryDays: string;
  title: string;
};

export type FitnessProgramDayContent = {
  dayNumber: number;
  durationMinutes: number;
  exercises: string[];
  focus: string;
  safetyNote?: string;
  setsReps?: string;
};

export function normalizeProgramContent(row: Record<string, unknown>): FitnessProgramContent {
  return {
    audience: stringList(row.audience ?? row.audiences),
    averageMinutes: numberValue(row.average_minutes ?? row.estimated_minutes) ?? 30,
    days: numberValue(row.days ?? row.duration_days) ?? 7,
    daysPerWeek: numberValue(row.days_per_week ?? row.training_days_per_week) ?? 3,
    description: stringValue(row.description ?? row.subtitle) ?? "A guided fitness plan with balanced progression and recovery.",
    equipment: stringList(row.equipment),
    focus: stringList(row.focus ?? row.focus_muscles ?? row.target_muscles),
    goal: stringValue(row.goal ?? row.category) ?? "General fitness",
    level: stringValue(row.level ?? row.difficulty) ?? "Beginner",
    programId: stringValue(row.program_id ?? row.plan_id ?? row.id) ?? "program",
    recoveryDays: stringValue(row.recovery_days ?? row.rest_days) ?? "Include lighter or rest days",
    title: stringValue(row.title ?? row.name) ?? "Workout program",
  };
}

export function normalizeProgramDayContent(row: Record<string, unknown>): FitnessProgramDayContent {
  return {
    dayNumber: numberValue(row.day_number ?? row.day) ?? 1,
    durationMinutes: numberValue(row.estimated_minutes ?? row.duration_minutes) ?? 30,
    exercises: stringList(row.exercises ?? row.exercise_ids ?? row.exercise_names),
    focus: stringValue(row.focus ?? row.title ?? row.name) ?? "Guided session",
    safetyNote: stringValue(row.safety_note ?? row.safety_notes),
    setsReps: stringValue(row.sets_reps ?? row.prescription ?? row.instructions),
  };
}

export async function getNutritionTemplates(filters?: NutritionTemplateFilters) {
  let query = supabase
    .from("fitness_nutrition_templates")
    .select("*")
    .order("title", { ascending: true })
    .limit(24);

  if (filters?.audience) query = query.eq("audience", filters.audience);
  if (filters?.dietStyle) query = query.eq("diet_style", filters.dietStyle);
  if (filters?.goal) query = query.eq("goal", filters.goal);

  return query;
}
