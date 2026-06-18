import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

import {
  defaultFitnessGoal,
  defaultFoodItem,
  defaultMealLog,
  defaultMealPlan,
  defaultNutritionGoal,
  defaultNutritionReviewFlag,
  defaultWorkoutPlan,
  defaultWorkoutSession,
} from "./fitnessNutritionDefaults";
import {
  mapExerciseLogRow,
  mapExerciseSetLogRow,
  mapFitnessGoalRow,
  mapFitnessProgressNoteRow,
  mapFoodItemRow,
  mapGroceryListItemRow,
  mapGroceryListRow,
  mapHydrationLogRow,
  mapMealItemRow,
  mapMealLogRow,
  mapMealPlanRow,
  mapMuscleFocusLogRow,
  mapNutritionGoalRow,
  mapNutritionReviewFlagRow,
  mapWorkoutPlanRow,
  mapWorkoutSessionRow,
  toRow,
} from "./fitnessNutritionMappers";
import {
  validateExerciseLog,
  validateExerciseSetLog,
  validateFitnessGoal,
  validateFoodItem,
  validateGroceryList,
  validateGroceryListItem,
  validateHydrationLog,
  validateMealItem,
  validateMealLog,
  validateMealPlan,
  validateNutritionGoal,
  validateNutritionReviewFlag,
  validateWorkoutPlan,
  validateWorkoutSession,
} from "./fitnessNutritionValidation";
import type {
  ExerciseLog,
  ExerciseSetLog,
  FitnessGoal,
  FoodItem,
  GroceryList,
  GroceryListItem,
  HydrationLog,
  HealthOSFitnessNutritionServiceResult,
  MealItem,
  MealLog,
  MealPlan,
  MuscleFocusLog,
  NutritionGoal,
  NutritionReviewFlag,
  WorkoutPlan,
  WorkoutSession,
} from "./fitnessNutritionTypes";

type Mapper<T> = (row: Record<string, unknown>) => T;
type Validator = (input: Record<string, unknown>) => { errors: string[]; valid: boolean };

const MISSING_TABLE_CODES = new Set(["42P01", "PGRST205", "PGRST204"]);

export async function getCurrentFitnessNutritionAuthUser(): Promise<HealthOSFitnessNutritionServiceResult<User>> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return result<User>(null, "missingAuth", "Sign in required.");
  return result(data.user, "ready");
}

export const getFitnessGoals = () => list("fitness_goals", mapFitnessGoalRow);
export const createFitnessGoalDraft = (input: Partial<FitnessGoal>) => createOwned("fitness_goals", input, defaultFitnessGoal(input.title), mapFitnessGoalRow, validateFitnessGoal as Validator);
export const updateFitnessGoal = (id: string, input: Partial<FitnessGoal>) => updateOwned("fitness_goals", id, input, mapFitnessGoalRow);
export const reviewFitnessGoal = (id: string) => reviewOwned("fitness_goals", id, mapFitnessGoalRow);
export const archiveFitnessGoal = (id: string) => archiveOwned("fitness_goals", id, mapFitnessGoalRow);

export const getWorkoutPlans = () => list("workout_plans", mapWorkoutPlanRow);
export const createWorkoutPlanDraft = (input: Partial<WorkoutPlan>) => createOwned("workout_plans", input, defaultWorkoutPlan(input.title), mapWorkoutPlanRow, validateWorkoutPlan as Validator);
export const updateWorkoutPlan = (id: string, input: Partial<WorkoutPlan>) => updateOwned("workout_plans", id, input, mapWorkoutPlanRow);
export const reviewWorkoutPlan = (id: string) => reviewOwned("workout_plans", id, mapWorkoutPlanRow);
export const archiveWorkoutPlan = (id: string) => archiveOwned("workout_plans", id, mapWorkoutPlanRow);

export const getWorkoutSessions = () => list("workout_sessions", mapWorkoutSessionRow, "session_date");
export const createWorkoutSession = (input: Partial<WorkoutSession>) => createOwned("workout_sessions", input, defaultWorkoutSession(input.title), mapWorkoutSessionRow, validateWorkoutSession as Validator);
export const updateWorkoutSession = (id: string, input: Partial<WorkoutSession>) => updateOwned("workout_sessions", id, input, mapWorkoutSessionRow);
export const completeWorkoutSession = (id: string) => updateOwned("workout_sessions", id, { completedAt: new Date().toISOString(), status: "completed" }, mapWorkoutSessionRow);

export const getExerciseLogs = (workoutSessionId?: string) => list("exercise_logs", mapExerciseLogRow, "order_index", workoutSessionId ? { workout_session_id: workoutSessionId } : undefined);
export const createExerciseLog = (input: Partial<ExerciseLog>) => createOwned("exercise_logs", input, {}, mapExerciseLogRow, validateExerciseLog as Validator);
export const getExerciseSetLogs = (exerciseLogId?: string) => list("exercise_set_logs", mapExerciseSetLogRow, "set_index", exerciseLogId ? { exercise_log_id: exerciseLogId } : undefined);
export const createExerciseSetLog = (input: Partial<ExerciseSetLog>) => createOwned("exercise_set_logs", input, { completed: false, setIndex: 1 }, mapExerciseSetLogRow, validateExerciseSetLog as Validator);

export const getMuscleFocusLogs = () => list("muscle_focus_logs", mapMuscleFocusLogRow, "logged_on");
export const createMuscleFocusLog = (input: Partial<MuscleFocusLog>) => createOwned("muscle_focus_logs", input, { loggedOn: new Date().toISOString().slice(0, 10) }, mapMuscleFocusLogRow);
export const getFitnessProgressNotes = () => list("fitness_progress_notes", mapFitnessProgressNoteRow, "note_date");
export const createFitnessProgressNote = (input: Record<string, unknown>) => createOwned("fitness_progress_notes", input, { privacyScope: "private", reviewStatus: "userEntered", sourceType: "manual" }, mapFitnessProgressNoteRow);

export const getNutritionGoals = () => list("nutrition_goals", mapNutritionGoalRow);
export const createNutritionGoalDraft = (input: Partial<NutritionGoal>) => createOwned("nutrition_goals", input, defaultNutritionGoal(input.title), mapNutritionGoalRow, validateNutritionGoal as Validator);
export const updateNutritionGoal = (id: string, input: Partial<NutritionGoal>) => updateOwned("nutrition_goals", id, input, mapNutritionGoalRow);
export const reviewNutritionGoal = (id: string) => reviewOwned("nutrition_goals", id, mapNutritionGoalRow);
export const archiveNutritionGoal = (id: string) => archiveOwned("nutrition_goals", id, mapNutritionGoalRow);

export const getMealLogs = () => list("meal_logs", mapMealLogRow, "meal_date");
export const createMealLog = (input: Partial<MealLog>) => createOwned("meal_logs", input, defaultMealLog(input.sourceType), mapMealLogRow, validateMealLog as Validator);
export const getMealItems = (mealLogId?: string) => list("meal_items", mapMealItemRow, "created_at", mealLogId ? { meal_log_id: mealLogId } : undefined);
export const createMealItem = (input: Partial<MealItem>) => createOwned("meal_items", input, { nutrients: {}, reviewStatus: "userEntered", sourceType: "manual" }, mapMealItemRow, validateMealItem as Validator);
export const getFoodItems = () => list("food_items", mapFoodItemRow);
export const createFoodItemDraft = (input: Partial<FoodItem>) => createOwned("food_items", input, defaultFoodItem(input.displayName, input.sourceType), mapFoodItemRow, validateFoodItem as Validator);
export const reviewFoodItem = (id: string) => reviewOwned("food_items", id, mapFoodItemRow);

export const getMealPlans = () => list("meal_plans", mapMealPlanRow);
export const createMealPlanDraft = (input: Partial<MealPlan>) => createOwned("meal_plans", input, defaultMealPlan(input.title, input.sourceType), mapMealPlanRow, validateMealPlan as Validator);
export const reviewMealPlan = (id: string) => reviewOwned("meal_plans", id, mapMealPlanRow);
export const archiveMealPlan = (id: string) => archiveOwned("meal_plans", id, mapMealPlanRow);

export const getGroceryLists = () => list("grocery_lists", mapGroceryListRow);
export const createGroceryList = (input: Partial<GroceryList>) => createOwned("grocery_lists", input, { privacyScope: "private", status: "draft" }, mapGroceryListRow, validateGroceryList as Validator);
export const getGroceryListItems = (groceryListId?: string) => list("grocery_list_items", mapGroceryListItemRow, "created_at", groceryListId ? { grocery_list_id: groceryListId } : undefined);
export const createGroceryListItem = (input: Partial<GroceryListItem>) => createOwned("grocery_list_items", input, { checked: false, sourceType: "manual" }, mapGroceryListItemRow, validateGroceryListItem as Validator);
export const updateGroceryListItem = (id: string, input: Partial<GroceryListItem>) => updateOwned("grocery_list_items", id, input, mapGroceryListItemRow);

export const getHydrationLogs = () => list("hydration_logs", mapHydrationLogRow, "logged_at");
export const createHydrationLog = (input: Partial<HydrationLog>) => createOwned("hydration_logs", input, { amountUnit: "ml", loggedAt: new Date().toISOString(), sourceType: "manual" }, mapHydrationLogRow, validateHydrationLog as Validator);

export const getNutritionReviewFlags = () => list("nutrition_review_flags", mapNutritionReviewFlagRow);
export const createNutritionReviewFlag = (input: Partial<NutritionReviewFlag>) => createOwned("nutrition_review_flags", input, defaultNutritionReviewFlag(input.message ?? "Review required.", input.relatedTable ?? "nutrition"), mapNutritionReviewFlagRow, validateNutritionReviewFlag as Validator);

export const createWorkoutPlanCandidateFromAI = (input: Partial<WorkoutPlan>) =>
  createWorkoutPlanDraft({ ...input, reviewStatus: "needsReview", sourceType: "aiImport", status: "draft" });
export const createWorkoutPlanCandidateFromRecord = (input: Partial<WorkoutPlan>) =>
  createWorkoutPlanDraft({ ...input, reviewStatus: "needsReview", sourceType: "record", status: "draft" });
export const createMealPlanCandidateFromAI = (input: Partial<MealPlan>) =>
  createMealPlanDraft({ ...input, reviewStatus: "needsReview", sourceType: "aiImport", status: "draft" });
export const createMealCandidateFromScan = (input: Partial<MealLog>) =>
  createMealLog({ ...input, reviewStatus: "needsReview", sourceType: "scan" });
export const createFoodItemCandidateFromScan = (input: Partial<FoodItem>) =>
  createFoodItemDraft({ ...input, reviewStatus: "needsReview", sourceType: input.sourceType ?? "scan" });

export function createCalendarLinkCandidate(input: { sourceTable: "workout_sessions"; sourceId: string }) {
  return result(input, "deferred", null, "Calendar link candidates are review-first and deferred until UI confirmation wires a selected calendar event.");
}

export function createReminderLinkCandidate(input: { sourceTable: "workout_sessions"; sourceId: string }) {
  return result(input, "deferred", null, "Reminder link candidates are review-first and deferred until UI confirmation wires a selected reminder.");
}

async function list<T>(
  table: string,
  mapper: Mapper<T>,
  orderColumn = "created_at",
  filters?: Record<string, string>,
): Promise<HealthOSFitnessNutritionServiceResult<T[]>> {
  const user = await getCurrentFitnessNutritionAuthUser();
  if (!user.data) return result([], user.status, user.error ?? undefined);
  let query = fromTable(table).select("*").eq("owner_user_id", user.data.id);
  for (const [key, value] of Object.entries(filters ?? {})) query = query.eq(key, value);
  const { data, error } = await query.order(orderColumn, { ascending: false });
  if (error) return dbError(error, []);
  return result((data ?? []).map((row) => mapper(row as Record<string, unknown>)), "ready");
}

async function createOwned<T>(
  table: string,
  input: Record<string, unknown>,
  defaults: Record<string, unknown>,
  mapper: Mapper<T>,
  validator?: Validator,
): Promise<HealthOSFitnessNutritionServiceResult<T>> {
  const user = await getCurrentFitnessNutritionAuthUser();
  if (!user.data) return result<T>(null, user.status, user.error ?? undefined);
  const payload = { ...defaults, ...input, ownerUserId: user.data.id };
  const validation = validator?.(payload);
  if (validation && !validation.valid) return result<T>(null, "error", validation.errors[0]);
  const { data, error } = await fromTable(table).insert(toRow(payload)).select("*").single();
  if (error) return dbError<T>(error, null);
  return result(mapper(data as Record<string, unknown>), "ready");
}

async function updateOwned<T>(table: string, id: string, input: Record<string, unknown>, mapper: Mapper<T>): Promise<HealthOSFitnessNutritionServiceResult<T>> {
  const user = await getCurrentFitnessNutritionAuthUser();
  if (!user.data) return result<T>(null, user.status, user.error ?? undefined);
  const { data, error } = await fromTable(table).update(toRow(input)).eq("id", id).eq("owner_user_id", user.data.id).select("*").single();
  if (error) return dbError<T>(error, null);
  return result(mapper(data as Record<string, unknown>), "ready");
}

function reviewOwned<T>(table: string, id: string, mapper: Mapper<T>) {
  return updateOwned(table, id, { reviewStatus: "reviewed", reviewedAt: new Date().toISOString() }, mapper);
}

function archiveOwned<T>(table: string, id: string, mapper: Mapper<T>) {
  return updateOwned(table, id, { status: "archived" }, mapper);
}

function fromTable(name: string) {
  return supabase.from(name as never);
}

function dbError<T>(error: { code?: string; message?: string }, fallback: T | null): HealthOSFitnessNutritionServiceResult<T> {
  if (error.code && MISSING_TABLE_CODES.has(error.code)) {
    return result(fallback, "missingTable", "Fitness and nutrition backend tables are not available yet.", error.message);
  }
  return result(fallback, "error", "Fitness and nutrition data is not available right now.", error.message);
}

function result<T>(
  data: T | null,
  status: HealthOSFitnessNutritionServiceResult<T>["status"],
  error: string | null = null,
  deferredReason?: string,
): HealthOSFitnessNutritionServiceResult<T> {
  return { data, deferredReason, error, status };
}
