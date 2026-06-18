export type HealthOSFitnessNutritionBackendStatus =
  | "idle"
  | "loading"
  | "ready"
  | "missingAuth"
  | "missingTable"
  | "reviewRequired"
  | "deferred"
  | "error";

export type HealthOSFitnessNutritionServiceResult<T> = {
  data: T | null;
  deferredReason?: string;
  error: string | null;
  status: HealthOSFitnessNutritionBackendStatus;
};

export type FitnessNutritionPrivacyScope = "private" | "selectedFamily" | "caregiverLimited";
export type FitnessNutritionReviewStatus = "userEntered" | "needsReview" | "reviewed" | "dismissed";
export type FitnessNutritionSourceType = "manual" | "record" | "scan" | "aiImport" | "barcode";
export type FitnessNutritionMetadata = Record<string, unknown>;

export type FitnessGoal = {
  aiImportId?: string | null;
  createdAt?: string;
  goalType: string;
  id?: string;
  metadata?: FitnessNutritionMetadata;
  notes?: string | null;
  ownerUserId?: string;
  privacyScope: FitnessNutritionPrivacyScope;
  reviewStatus: FitnessNutritionReviewStatus;
  reviewedAt?: string | null;
  sourceRecordId?: string | null;
  sourceType: FitnessNutritionSourceType;
  startDate?: string | null;
  status: "draft" | "active" | "paused" | "completed" | "archived";
  subjectCareProfileId?: string | null;
  targetDate?: string | null;
  targetUnit?: string | null;
  targetValue?: number | null;
  title: string;
  updatedAt?: string;
};

export type WorkoutPlan = {
  aiImportId?: string | null;
  createdAt?: string;
  daysPerWeek?: number | null;
  description?: string | null;
  difficulty?: string | null;
  durationWeeks?: number | null;
  equipment: unknown[];
  fitnessGoalId?: string | null;
  id?: string;
  legacyImportedPlanId?: string | null;
  metadata?: FitnessNutritionMetadata;
  ownerUserId?: string;
  planType: string;
  reviewStatus: FitnessNutritionReviewStatus;
  reviewedAt?: string | null;
  safetyNotes?: string | null;
  schedule: FitnessNutritionMetadata;
  sourceRecordId?: string | null;
  sourceType: FitnessNutritionSourceType;
  status: "draft" | "active" | "paused" | "completed" | "archived";
  subjectCareProfileId?: string | null;
  title: string;
  updatedAt?: string;
};

export type WorkoutSession = {
  aiImportId?: string | null;
  completedAt?: string | null;
  createdAt?: string;
  durationMinutes?: number | null;
  fitnessGoalId?: string | null;
  id?: string;
  linkedCalendarEventId?: string | null;
  linkedReminderId?: string | null;
  metadata?: FitnessNutritionMetadata;
  notes?: string | null;
  ownerUserId?: string;
  perceivedEffort?: number | null;
  reviewStatus: FitnessNutritionReviewStatus;
  sessionDate: string;
  sourceRecordId?: string | null;
  sourceType: FitnessNutritionSourceType;
  startedAt?: string | null;
  status: "planned" | "inProgress" | "completed" | "skipped" | "cancelled";
  subjectCareProfileId?: string | null;
  title: string;
  updatedAt?: string;
  workoutPlanId?: string | null;
};

export type ExerciseLog = {
  aiImportId?: string | null;
  createdAt?: string;
  distanceUnit?: string | null;
  distanceValue?: number | null;
  durationMinutes?: number | null;
  exerciseCatalogId?: string | null;
  exerciseName: string;
  id?: string;
  metadata?: FitnessNutritionMetadata;
  notes?: string | null;
  orderIndex: number;
  ownerUserId?: string;
  reviewStatus: FitnessNutritionReviewStatus;
  sourceType: FitnessNutritionSourceType;
  targetMuscleGroups: string[];
  updatedAt?: string;
  workoutSessionId: string;
};

export type ExerciseSetLog = {
  completed: boolean;
  createdAt?: string;
  distanceUnit?: string | null;
  distanceValue?: number | null;
  durationSeconds?: number | null;
  effortRating?: number | null;
  exerciseLogId: string;
  id?: string;
  metadata?: FitnessNutritionMetadata;
  notes?: string | null;
  ownerUserId?: string;
  reps?: number | null;
  setIndex: number;
  updatedAt?: string;
  weightUnit?: string | null;
  weightValue?: number | null;
};

export type MuscleFocusLog = {
  createdAt?: string;
  focusScore?: number | null;
  id?: string;
  loggedOn: string;
  metadata?: FitnessNutritionMetadata;
  muscleGroup: string;
  notes?: string | null;
  ownerUserId?: string;
  sorenessLevel?: number | null;
  subjectCareProfileId?: string | null;
  updatedAt?: string;
  workoutSessionId?: string | null;
};

export type FitnessProgressNote = {
  aiImportId?: string | null;
  body: string;
  createdAt?: string;
  fitnessGoalId?: string | null;
  id?: string;
  metadata?: FitnessNutritionMetadata;
  mood?: string | null;
  noteDate: string;
  ownerUserId?: string;
  privacyScope: FitnessNutritionPrivacyScope;
  reviewStatus: FitnessNutritionReviewStatus;
  sourceRecordId?: string | null;
  sourceType: FitnessNutritionSourceType;
  subjectCareProfileId?: string | null;
  title?: string | null;
  updatedAt?: string;
  workoutSessionId?: string | null;
};

export type NutritionGoal = Omit<FitnessGoal, "goalType"> & {
  cautionNote?: string | null;
  goalType: string;
};

export type FoodItem = {
  aiImportId?: string | null;
  barcode?: string | null;
  brandName?: string | null;
  createdAt?: string;
  displayName: string;
  id?: string;
  metadata?: FitnessNutritionMetadata;
  nutrients: FitnessNutritionMetadata;
  ownerUserId?: string;
  reviewStatus: FitnessNutritionReviewStatus;
  reviewedAt?: string | null;
  servingSize?: string | null;
  sourceRecordId?: string | null;
  sourceType: FitnessNutritionSourceType;
  updatedAt?: string;
};

export type MealLog = {
  aiImportId?: string | null;
  createdAt?: string;
  id?: string;
  mealDate: string;
  mealTime?: string | null;
  mealType: string;
  metadata?: FitnessNutritionMetadata;
  notes?: string | null;
  nutritionGoalId?: string | null;
  ownerUserId?: string;
  privacyScope: FitnessNutritionPrivacyScope;
  reviewStatus: FitnessNutritionReviewStatus;
  sourceRecordId?: string | null;
  sourceType: FitnessNutritionSourceType;
  subjectCareProfileId?: string | null;
  title?: string | null;
  updatedAt?: string;
};

export type MealItem = {
  aiImportId?: string | null;
  createdAt?: string;
  displayName: string;
  foodItemId?: string | null;
  id?: string;
  mealLogId: string;
  metadata?: FitnessNutritionMetadata;
  nutrients: FitnessNutritionMetadata;
  ownerUserId?: string;
  quantity?: number | null;
  reviewStatus: FitnessNutritionReviewStatus;
  sourceType: FitnessNutritionSourceType;
  unit?: string | null;
  updatedAt?: string;
};

export type MealPlan = {
  aiImportId?: string | null;
  cautionNote?: string | null;
  createdAt?: string;
  description?: string | null;
  grocerySummary: FitnessNutritionMetadata;
  id?: string;
  mealDays: unknown[];
  metadata?: FitnessNutritionMetadata;
  nutritionGoalId?: string | null;
  ownerUserId?: string;
  reviewStatus: FitnessNutritionReviewStatus;
  reviewedAt?: string | null;
  sourceRecordId?: string | null;
  sourceType: FitnessNutritionSourceType;
  status: "draft" | "active" | "paused" | "completed" | "archived";
  subjectCareProfileId?: string | null;
  title: string;
  updatedAt?: string;
};

export type GroceryList = {
  createdAt?: string;
  id?: string;
  mealPlanId?: string | null;
  metadata?: FitnessNutritionMetadata;
  ownerUserId?: string;
  privacyScope: FitnessNutritionPrivacyScope;
  status: "draft" | "active" | "completed" | "archived";
  subjectCareProfileId?: string | null;
  title: string;
  updatedAt?: string;
};

export type GroceryListItem = {
  category?: string | null;
  checked: boolean;
  createdAt?: string;
  displayName: string;
  groceryListId: string;
  id?: string;
  metadata?: FitnessNutritionMetadata;
  ownerUserId?: string;
  quantity?: number | null;
  sourceType: FitnessNutritionSourceType;
  unit?: string | null;
  updatedAt?: string;
};

export type HydrationLog = {
  amountUnit: string;
  amountValue: number;
  beverageType?: string | null;
  createdAt?: string;
  id?: string;
  loggedAt: string;
  metadata?: FitnessNutritionMetadata;
  ownerUserId?: string;
  sourceType: FitnessNutritionSourceType;
  subjectCareProfileId?: string | null;
  updatedAt?: string;
};

export type NutritionReviewFlag = {
  aiImportId?: string | null;
  createdAt?: string;
  flagType: string;
  id?: string;
  message: string;
  metadata?: FitnessNutritionMetadata;
  ownerUserId?: string;
  relatedId?: string | null;
  relatedTable: string;
  resolvedAt?: string | null;
  severity: "info" | "caution" | "warning";
  sourceType: string;
  status: "open" | "acknowledged" | "resolved" | "dismissed";
  subjectCareProfileId?: string | null;
  updatedAt?: string;
};
