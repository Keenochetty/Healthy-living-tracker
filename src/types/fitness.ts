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
