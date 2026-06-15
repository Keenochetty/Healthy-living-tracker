export type WorkoutIntensity = "easy" | "moderate" | "hard" | "max";

export type WorkoutType =
  | "walking"
  | "running"
  | "cycling"
  | "gym"
  | "stretching"
  | "hiit"
  | "strength"
  | "cardio"
  | "mobility"
  | "custom";

export type WorkoutGoalType =
  | "time"
  | "distance"
  | "calories"
  | "steps"
  | "strength"
  | "consistency";

export type WorkoutPlan = {
  createdAt: string;
  description?: string;
  id: string;
  intensity: WorkoutIntensity;
  targetCalories?: number;
  targetDistanceKm?: number;
  targetMinutes?: number;
  targetSteps?: number;
  title: string;
  updatedAt: string;
  workoutType: WorkoutType;
};

export type WorkoutSession = {
  averageHeartRate?: number;
  caloriesEstimate?: number;
  completed: boolean;
  createdAt: string;
  distanceKm?: number;
  durationSeconds: number;
  endedAt?: string;
  id: string;
  intensity: WorkoutIntensity;
  maxHeartRate?: number;
  notes?: string;
  planId?: string;
  startedAt: string;
  steps?: number;
  title: string;
  updatedAt: string;
  workoutType: WorkoutType;
};

export type IntervalTimerSegment = {
  beepEnabled: boolean;
  durationSeconds: number;
  id: string;
  label: string;
  type: "work" | "rest" | "warmup" | "cooldown";
  vibrationEnabled: boolean;
};

export type IntervalTimerPreset = {
  createdAt: string;
  description?: string;
  id: string;
  rounds: number;
  segments: IntervalTimerSegment[];
  title: string;
  updatedAt: string;
};

export type FitnessSummary = {
  activeMinutesToday: number;
  currentStreakDays: number;
  latestWorkout?: WorkoutSession;
  stepsToday: number;
  weeklyGoalProgress: number;
  workoutsThisWeek: number;
};

export type WorkoutDifficulty = "beginner" | "intermediate" | "advanced";

export type WorkoutLocation =
  | "home"
  | "gym"
  | "both"
  | "machine"
  | "bodyweight";

export type WorkoutGoalTag =
  | "strength"
  | "muscle_gain"
  | "weight_loss"
  | "endurance"
  | "mobility"
  | "general_health";

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "core"
  | "legs"
  | "glutes"
  | "full_body"
  | "cardio"
  | "mobility";

export type ExerciseEquipment =
  | "bodyweight"
  | "dumbbell"
  | "barbell"
  | "machine"
  | "cable"
  | "resistance_band"
  | "kettlebell"
  | "treadmill"
  | "bike"
  | "none";

export type ExerciseLibraryItem = {
  commonMistakes: string[];
  description: string;
  difficulty: WorkoutDifficulty;
  equipment: ExerciseEquipment[];
  goalTags: WorkoutGoalTag[];
  id: string;
  imageUrl?: string;
  instructions: string[];
  location: WorkoutLocation[];
  muscleDiagramUrl?: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  videoUrl?: string;
};

export type WorkoutRoutine = {
  accentColor: string;
  coverImageUrl?: string;
  description: string;
  difficulty: WorkoutDifficulty;
  durationMinutes: number;
  equipment: ExerciseEquipment[];
  exerciseIds: string[];
  goal: WorkoutGoalTag;
  id: string;
  location: Extract<WorkoutLocation, "home" | "gym" | "both">;
  name: string;
  targetMuscles: MuscleGroup[];
  videoUrl?: string;
};

export type GuidedWorkoutSet = {
  completed: boolean;
  id: string;
  reps: number;
  setNumber: number;
  weightKg?: number;
};

export type GuidedWorkoutExercise = {
  exerciseId: string;
  sets: GuidedWorkoutSet[];
};

export type RunningLogDraft = {
  distanceKm: number;
  durationMinutes: number;
  effort?: WorkoutIntensity;
  notes?: string;
  routeNote?: string;
};
