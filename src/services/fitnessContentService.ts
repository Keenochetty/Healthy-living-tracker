import { supabase } from "@/lib/supabase";

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

export async function getWorkoutPrograms() {
  return supabase
    .from("fitness_workout_programs")
    .select("*")
    .order("title", { ascending: true });
}

export async function getWorkoutProgramDays(planId: string) {
  return supabase
    .from("fitness_workout_program_days")
    .select("*")
    .eq("plan_id", planId)
    .order("day_number", { ascending: true });
}

export async function getNutritionTemplates(filters?: NutritionTemplateFilters) {
  let query = supabase
    .from("fitness_nutrition_templates")
    .select("*")
    .order("title", { ascending: true });

  if (filters?.audience) query = query.eq("audience", filters.audience);
  if (filters?.dietStyle) query = query.eq("diet_style", filters.dietStyle);
  if (filters?.goal) query = query.eq("goal", filters.goal);

  return query;
}
