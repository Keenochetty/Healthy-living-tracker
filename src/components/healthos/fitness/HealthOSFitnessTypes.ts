import type { Href } from "expo-router";

export type HealthOSFitnessDayStatus =
  | "completed"
  | "planned"
  | "rest"
  | "missed"
  | "today"
  | "selected";

export type HealthOSFitnessDifficulty = "beginner" | "intermediate" | "advanced" | "expert";

export type HealthOSFitnessEquipment =
  | "dumbbells"
  | "barbell"
  | "machine"
  | "cable"
  | "bodyweight"
  | "resistanceBand"
  | "treadmill"
  | "bike"
  | "none"
  | "other";

export type HealthOSMuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "core"
  | "glutes"
  | "quads"
  | "hamstrings"
  | "calves"
  | "fullBody"
  | "cardio"
  | "mobility";

export type HealthOSMuscleStatus =
  | "targeted"
  | "secondary"
  | "trainedRecently"
  | "needsAttention"
  | "overworked"
  | "recovered";

export type HealthOSFitnessWeekDay = {
  date: Date;
  dateKey: string;
  dayLabel: string;
  numberLabel: string;
  status: HealthOSFitnessDayStatus;
};

export type HealthOSFitnessLegendItem = {
  color: string;
  key: string;
  label: string;
  target?: string;
  value: string;
};

export type HealthOSFitnessStatCard = {
  key: string;
  label: string;
  value: string;
};

export type HealthOSExerciseDisplay = {
  difficulty?: string;
  equipment: string[];
  id: string;
  instructions: string[];
  muscleGroups: string[];
  name: string;
  routeTarget?: Href;
  secondaryMuscles?: string[];
  videoUrl?: string;
};

export type HealthOSWorkoutDisplay = {
  calendarStatus?: string;
  difficulty?: string;
  equipment: string[];
  exercises: HealthOSExerciseDisplay[];
  familyStatus?: string;
  goal?: string;
  id: string;
  muscleGroups: string[];
  title: string;
  totalMinutes?: number;
};

export type HealthOSMuscleStatusItem = {
  group: HealthOSMuscleGroup;
  label: string;
  status: HealthOSMuscleStatus;
};

