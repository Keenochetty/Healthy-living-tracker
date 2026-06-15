import type { AppIconName } from "@/constants/appIcons";

export type FitnessRealmDestination =
  | "body"
  | "guides"
  | "library"
  | "progress"
  | "routines"
  | "running"
  | "start";

export type FitnessGoalPath = {
  accentColor: string;
  currentLevel?: string;
  destination: FitnessRealmDestination;
  difficulty?: string;
  goalType?: string;
  icon: AppIconName;
  id: string;
  nutritionSupport?: string;
  progression?: Array<{ description: string; title: string }>;
  recoveryRequirement?: string;
  safetyBadge?: string;
  safetyLevel?: string;
  subtitle: string;
  targetLevel?: string;
  timeline?: string;
  title: string;
  trainingDays?: string;
  whyItHelps?: string;
};

export type FitnessExploreCategory = {
  accentColor: string;
  destination: FitnessRealmDestination;
  icon: AppIconName;
  id: string;
  safetyBadge?: string;
  title: string;
};

export type FitnessSafetyNote = {
  guidance: string;
  id: string;
  title: string;
};

export type FitnessWorkoutProgram = {
  accentColor: string;
  audience?: string;
  averageMinutes?: number;
  days?: number;
  daysPerWeek?: number;
  duration: string;
  equipment?: string[];
  focus?: string[];
  goal?: string;
  id: string;
  level?: string;
  recoveryDays?: string;
  routineId: string;
  safetyBadge?: string;
  subtitle: string;
  title: string;
};

export const FITNESS_WORKOUT_PROGRAMS: FitnessWorkoutProgram[] = [
  {
    accentColor: "#0f766e",
    audience: "Adults",
    averageMinutes: 28,
    days: 7,
    daysPerWeek: 3,
    duration: "7 days",
    equipment: ["Bodyweight"],
    focus: ["Full body", "Core"],
    goal: "Consistency",
    id: "starter",
    level: "Beginner",
    recoveryDays: "4 lighter or rest days",
    routineId: "routine-home-full-body",
    subtitle: "A calm way to build momentum",
    title: "7-day starter",
  },
  {
    accentColor: "#1d4ed8",
    audience: "Adults",
    averageMinutes: 30,
    days: 28,
    daysPerWeek: 4,
    duration: "28 days",
    equipment: ["Bodyweight", "Kettlebell"],
    focus: ["Full body", "Cardio"],
    goal: "Weight loss",
    id: "challenge",
    level: "Beginner",
    recoveryDays: "3 recovery days weekly",
    routineId: "routine-weight-loss-circuit",
    subtitle: "Progressive sessions with recovery",
    title: "28-day challenge",
  },
  {
    accentColor: "#7c3aed",
    audience: "Adults",
    averageMinutes: 55,
    days: 28,
    daysPerWeek: 3,
    duration: "4 weeks",
    equipment: ["Barbell", "Dumbbell", "Machine"],
    focus: ["Chest", "Back", "Legs"],
    goal: "Muscle gain",
    id: "strength",
    level: "Intermediate",
    recoveryDays: "Rest between lifting days",
    routineId: "routine-muscle-gain-3-day",
    subtitle: "Build a reliable strength base",
    title: "Strength builder",
  },
  {
    accentColor: "#166534",
    audience: "Adults",
    averageMinutes: 28,
    days: 14,
    daysPerWeek: 3,
    duration: "2 weeks",
    equipment: ["Bodyweight"],
    focus: ["Full body", "Core"],
    goal: "Home fitness",
    id: "home",
    level: "Beginner",
    recoveryDays: "Alternate training days",
    routineId: "routine-home-full-body",
    subtitle: "Simple sessions without equipment",
    title: "Home no-equipment",
  },
  {
    accentColor: "#475569",
    audience: "Adults",
    averageMinutes: 45,
    days: 21,
    daysPerWeek: 3,
    duration: "3 weeks",
    equipment: ["Dumbbell", "Barbell", "Cable"],
    focus: ["Chest", "Shoulders", "Arms"],
    goal: "Strength",
    id: "gym",
    level: "Intermediate",
    recoveryDays: "Rest between hard sessions",
    routineId: "routine-push-day",
    subtitle: "A structured gym starting point",
    title: "Gym plan",
  },
  {
    accentColor: "#9a3412",
    audience: "Pregnancy",
    averageMinutes: 22,
    days: 14,
    daysPerWeek: 3,
    duration: "2 weeks",
    equipment: ["None", "Resistance band"],
    focus: ["Mobility", "Full body"],
    goal: "Pregnancy-safe movement",
    id: "pregnancy",
    level: "Beginner",
    recoveryDays: "Adjust to your body",
    routineId: "routine-mobility-recovery",
    safetyBadge: "General guidance",
    subtitle: "Adapt movement with professional input",
    title: "Pregnancy safe",
  },
  {
    accentColor: "#155e75",
    audience: "Adults",
    averageMinutes: 22,
    days: 7,
    daysPerWeek: 3,
    duration: "7 days",
    equipment: ["None", "Resistance band"],
    focus: ["Mobility", "Full body"],
    goal: "Recovery",
    id: "recovery",
    level: "Beginner",
    recoveryDays: "Designed as lighter movement",
    routineId: "routine-mobility-recovery",
    subtitle: "Mobility and lighter movement",
    title: "Recovery / mobility",
  },
];

export const FITNESS_GOAL_PATHS: FitnessGoalPath[] = [
  {
    accentColor: "#0f766e",
    destination: "running",
    icon: "fitness",
    id: "run-5k",
    subtitle: "A steady run-walk path",
    title: "Run 5km from beginner",
  },
  {
    accentColor: "#1d4ed8",
    destination: "routines",
    icon: "fitness",
    id: "bench-20-50",
    subtitle: "Build pressing strength with control",
    title: "Bench press 20kg to 50kg",
  },
  {
    accentColor: "#7c3aed",
    destination: "routines",
    icon: "weight",
    id: "lose-weight",
    safetyBadge: "Safe pace",
    subtitle: "Consistency-first movement",
    title: "Lose weight safely",
  },
  {
    accentColor: "#be123c",
    destination: "routines",
    icon: "fitness",
    id: "lean-muscle",
    subtitle: "Strength and recovery support",
    title: "Gain lean muscle",
  },
  {
    accentColor: "#9a3412",
    destination: "library",
    icon: "pregnancy",
    id: "pregnancy",
    safetyBadge: "Safety guided",
    subtitle: "Gentle movement with clear limits",
    title: "Pregnancy-safe movement",
  },
  {
    accentColor: "#166534",
    destination: "library",
    icon: "child_baby",
    id: "postpartum",
    safetyBadge: "Professional input",
    subtitle: "A careful return to core movement",
    title: "Postpartum core rebuild",
  },
  {
    accentColor: "#155e75",
    destination: "routines",
    icon: "health",
    id: "mobility",
    subtitle: "Move more comfortably",
    title: "Improve mobility",
  },
  {
    accentColor: "#6b21a8",
    destination: "library",
    icon: "mood",
    id: "mental-reset",
    subtitle: "Low-pressure movement for stress relief",
    title: "Mental reset",
  },
  {
    accentColor: "#0369a1",
    destination: "routines",
    icon: "success",
    id: "consistency",
    subtitle: "Build a routine that lasts",
    title: "Build consistency",
  },
  {
    accentColor: "#475569",
    destination: "library",
    icon: "safety",
    id: "injury-conscious",
    safetyBadge: "General guidance",
    subtitle: "Return carefully and seek advice",
    title: "Injury-conscious return",
  },
];

export const FITNESS_EXPLORE_CATEGORIES: FitnessExploreCategory[] = [
  {
    accentColor: "#fb7185",
    destination: "routines",
    icon: "fitness",
    id: "strength",
    title: "Strength",
  },
  {
    accentColor: "#38bdf8",
    destination: "library",
    icon: "health",
    id: "cardio",
    title: "Cardio",
  },
  {
    accentColor: "#60a5fa",
    destination: "running",
    icon: "fitness",
    id: "running",
    title: "Running",
  },
  {
    accentColor: "#a78bfa",
    destination: "library",
    icon: "mood",
    id: "yoga",
    title: "Yoga",
  },
  {
    accentColor: "#f472b6",
    destination: "library",
    icon: "fitness",
    id: "pilates",
    title: "Pilates",
  },
  {
    accentColor: "#14b8a6",
    destination: "routines",
    icon: "health",
    id: "mobility",
    title: "Mobility",
  },
  {
    accentColor: "#22c55e",
    destination: "library",
    icon: "success",
    id: "stretching",
    title: "Stretching",
  },
  {
    accentColor: "#ec4899",
    destination: "library",
    icon: "pregnancy",
    id: "pregnancy-safe",
    safetyBadge: "Safety",
    title: "Pregnancy-safe",
  },
  {
    accentColor: "#f43f5e",
    destination: "library",
    icon: "child_baby",
    id: "postpartum",
    safetyBadge: "Care",
    title: "Postpartum",
  },
  {
    accentColor: "#f59e0b",
    destination: "library",
    icon: "baby_child",
    id: "kids",
    safetyBadge: "Age-aware",
    title: "Kids movement",
  },
  {
    accentColor: "#06b6d4",
    destination: "library",
    icon: "fitness",
    id: "teens",
    safetyBadge: "Age-aware",
    title: "Teen fitness",
  },
  {
    accentColor: "#10b981",
    destination: "library",
    icon: "home",
    id: "no-equipment",
    title: "No equipment",
  },
  {
    accentColor: "#6366f1",
    destination: "library",
    icon: "fitness",
    id: "gym-equipment",
    title: "Gym equipment",
  },
  {
    accentColor: "#22c55e",
    destination: "body",
    icon: "health",
    id: "recovery",
    title: "Recovery",
  },
  {
    accentColor: "#a855f7",
    destination: "library",
    icon: "mood",
    id: "mental-reset",
    title: "Mental reset",
  },
  {
    accentColor: "#f97316",
    destination: "library",
    icon: "warning",
    id: "advanced",
    safetyBadge: "High intensity",
    title: "Advanced / Insane",
  },
];

export const FITNESS_SAFETY_NOTES: FitnessSafetyNote[] = [
  {
    guidance:
      "Choose pregnancy-safe movement and seek professional advice when needed.",
    id: "pregnancy",
    title: "Pregnancy",
  },
  {
    guidance: "Return gradually and follow professional guidance after birth.",
    id: "postpartum",
    title: "Postpartum",
  },
  {
    guidance:
      "Use age-appropriate movement, supervision and realistic intensity.",
    id: "children-teens",
    title: "Children and teens",
  },
  {
    guidance:
      "Stop when pain feels wrong. Fitness guidance is not injury treatment.",
    id: "injury-pain",
    title: "Injury or pain",
  },
  {
    guidance:
      "Progress load and intensity carefully, with recovery between hard sessions.",
    id: "advanced",
    title: "Advanced training",
  },
  {
    guidance:
      "Prioritise sustainable habits and avoid extreme restriction or overtraining.",
    id: "weight-loss",
    title: "Weight loss safety",
  },
  {
    guidance:
      "Children and teens should not use supplements without qualified professional advice.",
    id: "supplements",
    title: "Supplements warning",
  },
];
