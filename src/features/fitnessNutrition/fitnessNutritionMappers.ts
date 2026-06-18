import type {
  ExerciseLog,
  ExerciseSetLog,
  FitnessGoal,
  FitnessNutritionReviewStatus,
  FitnessNutritionSourceType,
  FoodItem,
  GroceryList,
  GroceryListItem,
  HydrationLog,
  MealItem,
  MealLog,
  MealPlan,
  MuscleFocusLog,
  NutritionGoal,
  NutritionReviewFlag,
  WorkoutPlan,
  WorkoutSession,
} from "./fitnessNutritionTypes";

type Row = Record<string, any>;

const toReview = (value?: string | null): FitnessNutritionReviewStatus =>
  value === "needs_review" ? "needsReview" : value === "reviewed" || value === "dismissed" ? value : "userEntered";
const fromReview = (value?: FitnessNutritionReviewStatus) => (value === "needsReview" ? "needs_review" : value === "userEntered" ? "user_entered" : value);
const toSource = (value?: string | null): FitnessNutritionSourceType => (value === "ai_import" ? "aiImport" : (value as FitnessNutritionSourceType) ?? "manual");
const fromSource = (value?: FitnessNutritionSourceType) => (value === "aiImport" ? "ai_import" : value);
const toSessionStatus = (value?: string | null) => (value === "in_progress" ? "inProgress" : value ?? "planned");
const fromSessionStatus = (value?: string) => (value === "inProgress" ? "in_progress" : value);

export function mapFitnessGoalRow(row: Row): FitnessGoal {
  return {
    aiImportId: row.ai_import_id,
    createdAt: row.created_at,
    goalType: row.goal_type ?? "general",
    id: row.id,
    metadata: row.metadata ?? {},
    notes: row.notes,
    ownerUserId: row.owner_user_id,
    privacyScope: row.privacy_scope ?? "private",
    reviewStatus: toReview(row.review_status),
    reviewedAt: row.reviewed_at,
    sourceRecordId: row.source_record_id,
    sourceType: toSource(row.source_type),
    startDate: row.start_date,
    status: row.status ?? "draft",
    subjectCareProfileId: row.subject_care_profile_id,
    targetDate: row.target_date,
    targetUnit: row.target_unit,
    targetValue: row.target_value,
    title: row.title,
    updatedAt: row.updated_at,
  };
}

export const mapNutritionGoalRow = (row: Row): NutritionGoal => ({ ...mapFitnessGoalRow(row), cautionNote: row.caution_note });

export function mapWorkoutPlanRow(row: Row): WorkoutPlan {
  return {
    aiImportId: row.ai_import_id,
    createdAt: row.created_at,
    daysPerWeek: row.days_per_week,
    description: row.description,
    difficulty: row.difficulty,
    durationWeeks: row.duration_weeks,
    equipment: row.equipment ?? [],
    fitnessGoalId: row.fitness_goal_id,
    id: row.id,
    legacyImportedPlanId: row.legacy_imported_plan_id,
    metadata: row.metadata ?? {},
    ownerUserId: row.owner_user_id,
    planType: row.plan_type ?? "general",
    reviewStatus: toReview(row.review_status),
    reviewedAt: row.reviewed_at,
    safetyNotes: row.safety_notes,
    schedule: row.schedule ?? {},
    sourceRecordId: row.source_record_id,
    sourceType: toSource(row.source_type),
    status: row.status ?? "draft",
    subjectCareProfileId: row.subject_care_profile_id,
    title: row.title,
    updatedAt: row.updated_at,
  };
}

export function mapWorkoutSessionRow(row: Row): WorkoutSession {
  return {
    aiImportId: row.ai_import_id,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    durationMinutes: row.duration_minutes,
    fitnessGoalId: row.fitness_goal_id,
    id: row.id,
    linkedCalendarEventId: row.linked_calendar_event_id,
    linkedReminderId: row.linked_reminder_id,
    metadata: row.metadata ?? {},
    notes: row.notes,
    ownerUserId: row.owner_user_id,
    perceivedEffort: row.perceived_effort,
    reviewStatus: toReview(row.review_status),
    sessionDate: row.session_date,
    sourceRecordId: row.source_record_id,
    sourceType: toSource(row.source_type),
    startedAt: row.started_at,
    status: toSessionStatus(row.status) as WorkoutSession["status"],
    subjectCareProfileId: row.subject_care_profile_id,
    title: row.title,
    updatedAt: row.updated_at,
    workoutPlanId: row.workout_plan_id,
  };
}

export function mapExerciseLogRow(row: Row): ExerciseLog {
  return {
    aiImportId: row.ai_import_id,
    createdAt: row.created_at,
    distanceUnit: row.distance_unit,
    distanceValue: row.distance_value,
    durationMinutes: row.duration_minutes,
    exerciseCatalogId: row.exercise_catalog_id,
    exerciseName: row.exercise_name,
    id: row.id,
    metadata: row.metadata ?? {},
    notes: row.notes,
    orderIndex: row.order_index ?? 0,
    ownerUserId: row.owner_user_id,
    reviewStatus: toReview(row.review_status),
    sourceType: toSource(row.source_type),
    targetMuscleGroups: row.target_muscle_groups ?? [],
    updatedAt: row.updated_at,
    workoutSessionId: row.workout_session_id,
  };
}

export function mapExerciseSetLogRow(row: Row): ExerciseSetLog {
  return {
    completed: row.completed ?? false,
    createdAt: row.created_at,
    distanceUnit: row.distance_unit,
    distanceValue: row.distance_value,
    durationSeconds: row.duration_seconds,
    effortRating: row.effort_rating,
    exerciseLogId: row.exercise_log_id,
    id: row.id,
    metadata: row.metadata ?? {},
    notes: row.notes,
    ownerUserId: row.owner_user_id,
    reps: row.reps,
    setIndex: row.set_index ?? 1,
    updatedAt: row.updated_at,
    weightUnit: row.weight_unit,
    weightValue: row.weight_value,
  };
}

export function mapMuscleFocusLogRow(row: Row): MuscleFocusLog {
  return {
    createdAt: row.created_at,
    focusScore: row.focus_score,
    id: row.id,
    loggedOn: row.logged_on,
    metadata: row.metadata ?? {},
    muscleGroup: row.muscle_group,
    notes: row.notes,
    ownerUserId: row.owner_user_id,
    sorenessLevel: row.soreness_level,
    subjectCareProfileId: row.subject_care_profile_id,
    updatedAt: row.updated_at,
    workoutSessionId: row.workout_session_id,
  };
}

export function mapFitnessProgressNoteRow(row: Row) {
  return {
    aiImportId: row.ai_import_id,
    body: row.body,
    createdAt: row.created_at,
    fitnessGoalId: row.fitness_goal_id,
    id: row.id,
    metadata: row.metadata ?? {},
    mood: row.mood,
    noteDate: row.note_date,
    ownerUserId: row.owner_user_id,
    privacyScope: row.privacy_scope ?? "private",
    reviewStatus: toReview(row.review_status),
    sourceRecordId: row.source_record_id,
    sourceType: toSource(row.source_type),
    subjectCareProfileId: row.subject_care_profile_id,
    title: row.title,
    updatedAt: row.updated_at,
    workoutSessionId: row.workout_session_id,
  };
}

export function mapFoodItemRow(row: Row): FoodItem {
  return {
    aiImportId: row.ai_import_id,
    barcode: row.barcode,
    brandName: row.brand_name,
    createdAt: row.created_at,
    displayName: row.display_name,
    id: row.id,
    metadata: row.metadata ?? {},
    nutrients: row.nutrients ?? {},
    ownerUserId: row.owner_user_id,
    reviewStatus: toReview(row.review_status),
    reviewedAt: row.reviewed_at,
    servingSize: row.serving_size,
    sourceRecordId: row.source_record_id,
    sourceType: toSource(row.source_type),
    updatedAt: row.updated_at,
  };
}

export function mapMealLogRow(row: Row): MealLog {
  return {
    aiImportId: row.ai_import_id,
    createdAt: row.created_at,
    id: row.id,
    mealDate: row.meal_date,
    mealTime: row.meal_time,
    mealType: row.meal_type ?? "meal",
    metadata: row.metadata ?? {},
    notes: row.notes,
    nutritionGoalId: row.nutrition_goal_id,
    ownerUserId: row.owner_user_id,
    privacyScope: row.privacy_scope ?? "private",
    reviewStatus: toReview(row.review_status),
    sourceRecordId: row.source_record_id,
    sourceType: toSource(row.source_type),
    subjectCareProfileId: row.subject_care_profile_id,
    title: row.title,
    updatedAt: row.updated_at,
  };
}

export function mapMealItemRow(row: Row): MealItem {
  return {
    aiImportId: row.ai_import_id,
    createdAt: row.created_at,
    displayName: row.display_name,
    foodItemId: row.food_item_id,
    id: row.id,
    mealLogId: row.meal_log_id,
    metadata: row.metadata ?? {},
    nutrients: row.nutrients ?? {},
    ownerUserId: row.owner_user_id,
    quantity: row.quantity,
    reviewStatus: toReview(row.review_status),
    sourceType: toSource(row.source_type),
    unit: row.unit,
    updatedAt: row.updated_at,
  };
}

export function mapMealPlanRow(row: Row): MealPlan {
  return {
    aiImportId: row.ai_import_id,
    cautionNote: row.caution_note,
    createdAt: row.created_at,
    description: row.description,
    grocerySummary: row.grocery_summary ?? {},
    id: row.id,
    mealDays: row.plan_days ?? [],
    metadata: row.metadata ?? {},
    nutritionGoalId: row.nutrition_goal_id,
    ownerUserId: row.owner_user_id,
    reviewStatus: toReview(row.review_status),
    reviewedAt: row.reviewed_at,
    sourceRecordId: row.source_record_id,
    sourceType: toSource(row.source_type),
    status: row.status ?? "draft",
    subjectCareProfileId: row.subject_care_profile_id,
    title: row.title,
    updatedAt: row.updated_at,
  };
}

export function mapGroceryListRow(row: Row): GroceryList {
  return {
    createdAt: row.created_at,
    id: row.id,
    mealPlanId: row.meal_plan_id,
    metadata: row.metadata ?? {},
    ownerUserId: row.owner_user_id,
    privacyScope: row.privacy_scope ?? "private",
    status: row.status ?? "draft",
    subjectCareProfileId: row.subject_care_profile_id,
    title: row.title,
    updatedAt: row.updated_at,
  };
}

export function mapGroceryListItemRow(row: Row): GroceryListItem {
  return {
    category: row.category,
    checked: row.checked ?? false,
    createdAt: row.created_at,
    displayName: row.display_name,
    groceryListId: row.grocery_list_id,
    id: row.id,
    metadata: row.metadata ?? {},
    ownerUserId: row.owner_user_id,
    quantity: row.quantity,
    sourceType: toSource(row.source_type),
    unit: row.unit,
    updatedAt: row.updated_at,
  };
}

export function mapHydrationLogRow(row: Row): HydrationLog {
  return {
    amountUnit: row.amount_unit ?? "ml",
    amountValue: row.amount_value,
    beverageType: row.beverage_type,
    createdAt: row.created_at,
    id: row.id,
    loggedAt: row.logged_at,
    metadata: row.metadata ?? {},
    ownerUserId: row.owner_user_id,
    sourceType: toSource(row.source_type),
    subjectCareProfileId: row.subject_care_profile_id,
    updatedAt: row.updated_at,
  };
}

export function mapNutritionReviewFlagRow(row: Row): NutritionReviewFlag {
  return {
    aiImportId: row.ai_import_id,
    createdAt: row.created_at,
    flagType: row.flag_type,
    id: row.id,
    message: row.message,
    metadata: row.metadata ?? {},
    ownerUserId: row.owner_user_id,
    relatedId: row.related_id,
    relatedTable: row.related_table,
    resolvedAt: row.resolved_at,
    severity: row.severity ?? "info",
    sourceType: row.source_type ?? "system",
    status: row.status ?? "open",
    subjectCareProfileId: row.subject_care_profile_id,
    updatedAt: row.updated_at,
  };
}

export function toRow(input: Row): Row {
  const row: Row = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    const snake = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    row[snake] = value;
  }
  if ("review_status" in row) row.review_status = fromReview(row.review_status);
  if ("source_type" in row) row.source_type = fromSource(row.source_type);
  if ("status" in row) row.status = fromSessionStatus(row.status);
  if ("meal_days" in row) {
    row.plan_days = row.meal_days;
    delete row.meal_days;
  }
  return row;
}
