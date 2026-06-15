import type {
  IntervalTimerPreset,
  WorkoutIntensity,
  WorkoutType,
} from "@/types/fitness";

export type WorkoutTypeOption = {
  colour: string;
  emoji: string;
  key: WorkoutType;
  label: string;
};

export const WORKOUT_TYPE_OPTIONS: WorkoutTypeOption[] = [
  { colour: "#22c55e", emoji: "Walk", key: "walking", label: "Walking" },
  { colour: "#3b82f6", emoji: "Run", key: "running", label: "Running" },
  { colour: "#06b6d4", emoji: "Bike", key: "cycling", label: "Cycling" },
  { colour: "#8b5cf6", emoji: "Gym", key: "gym", label: "Gym" },
  { colour: "#ec4899", emoji: "Zen", key: "stretching", label: "Stretching" },
  { colour: "#f97316", emoji: "HIIT", key: "hiit", label: "HIIT" },
  { colour: "#dc2626", emoji: "Lift", key: "strength", label: "Strength" },
  { colour: "#ef4444", emoji: "HR", key: "cardio", label: "Cardio" },
  { colour: "#65a30d", emoji: "Move", key: "mobility", label: "Mobility" },
  { colour: "#64748b", emoji: "Custom", key: "custom", label: "Custom" },
];

export const INTENSITY_OPTIONS: Array<{
  key: WorkoutIntensity;
  label: string;
}> = [
  { key: "easy", label: "Easy" },
  { key: "moderate", label: "Moderate" },
  { key: "hard", label: "Hard" },
  { key: "max", label: "Max" },
];

const now = new Date().toISOString();

export const DEFAULT_TIMER_PRESETS: IntervalTimerPreset[] = [
  {
    createdAt: now,
    description: "Classic balanced intervals.",
    id: "preset-30-30",
    rounds: 4,
    segments: [
      {
        beepEnabled: true,
        durationSeconds: 30,
        id: "work-30",
        label: "Work",
        type: "work",
        vibrationEnabled: true,
      },
      {
        beepEnabled: true,
        durationSeconds: 30,
        id: "rest-30",
        label: "Rest",
        type: "rest",
        vibrationEnabled: true,
      },
    ],
    title: "30 sec work / 30 sec rest",
    updatedAt: now,
  },
  {
    createdAt: now,
    description: "Short rest intervals.",
    id: "preset-45-15",
    rounds: 4,
    segments: [
      {
        beepEnabled: true,
        durationSeconds: 45,
        id: "work-45",
        label: "Work",
        type: "work",
        vibrationEnabled: true,
      },
      {
        beepEnabled: true,
        durationSeconds: 15,
        id: "rest-15",
        label: "Rest",
        type: "rest",
        vibrationEnabled: true,
      },
    ],
    title: "45 sec work / 15 sec rest",
    updatedAt: now,
  },
  {
    createdAt: now,
    description: "Longer work intervals.",
    id: "preset-60-30",
    rounds: 4,
    segments: [
      {
        beepEnabled: true,
        durationSeconds: 60,
        id: "work-60",
        label: "Work",
        type: "work",
        vibrationEnabled: true,
      },
      {
        beepEnabled: true,
        durationSeconds: 30,
        id: "rest-30",
        label: "Rest",
        type: "rest",
        vibrationEnabled: true,
      },
    ],
    title: "1 min work / 30 sec rest",
    updatedAt: now,
  },
  {
    createdAt: now,
    description: "Simple warmup timer.",
    id: "preset-warmup-5",
    rounds: 1,
    segments: [
      {
        beepEnabled: true,
        durationSeconds: 300,
        id: "warmup-300",
        label: "Warmup",
        type: "warmup",
        vibrationEnabled: true,
      },
    ],
    title: "5 min warmup",
    updatedAt: now,
  },
  {
    createdAt: now,
    description: "Edit this later when custom preset editing is added.",
    id: "preset-custom",
    rounds: 4,
    segments: [
      {
        beepEnabled: true,
        durationSeconds: 30,
        id: "custom-work",
        label: "Work",
        type: "work",
        vibrationEnabled: true,
      },
      {
        beepEnabled: true,
        durationSeconds: 30,
        id: "custom-rest",
        label: "Rest",
        type: "rest",
        vibrationEnabled: true,
      },
    ],
    title: "Custom",
    updatedAt: now,
  },
];

export const FITNESS_DISCLAIMER =
  "This app can help you plan and track workouts. It does not replace advice from a healthcare or fitness professional. Stop exercising and seek help if you feel severe pain, chest pain, faintness, or symptoms that worry you.";

export function getWorkoutTypeOption(workoutType: WorkoutType) {
  return (
    WORKOUT_TYPE_OPTIONS.find((option) => option.key === workoutType) ??
    WORKOUT_TYPE_OPTIONS[WORKOUT_TYPE_OPTIONS.length - 1]
  );
}
