import type { ProfileType } from "@/types/familyPermissions";

export type FeaturePreferenceKey =
  | "fitness"
  | "nutrition"
  | "family_circle"
  | "muscle_growth"
  | "weight_loss"
  | "family_planning"
  | "food_planning"
  | "daily_planning"
  | "workout_guide"
  | "pregnancy"
  | "postpartum"
  | "child_care"
  | "teen_fitness"
  | "recovery"
  | "mental_wellness"
  | "advanced_training"
  | "injury_conscious"
  | "ai_plan_import";

export type FeaturePreferenceDefinition = {
  category: "fitness" | "food" | "family" | "planning" | "wellness";
  description: string;
  canBeHidden: boolean;
  key: FeaturePreferenceKey;
  label: string;
  needsProfileRelevanceCheck: boolean;
  recommendedAudience: string;
  safetyLevel: "standard" | "guided" | "age-aware" | "professional-input";
};

export const DEFAULT_FITNESS_FEATURES: FeaturePreferenceKey[] = [
  "fitness",
  "workout_guide",
  "recovery",
  "mental_wellness",
  "nutrition",
];

export const FITNESS_PREFERENCE_KEYS: FeaturePreferenceKey[] = [
  "fitness",
  "workout_guide",
  "muscle_growth",
  "weight_loss",
  "recovery",
  "mental_wellness",
  "pregnancy",
  "postpartum",
  "child_care",
  "teen_fitness",
  "advanced_training",
  "nutrition",
  "food_planning",
];

export const FEATURE_PREFERENCE_CONFIG: Record<
  FeaturePreferenceKey,
  FeaturePreferenceDefinition
> = {
  fitness: definition(
    "fitness",
    "Fitness",
    "Core movement and activity features.",
    "fitness",
  ),
  nutrition: definition(
    "nutrition",
    "Nutrition Support",
    "General nutrition support linked to movement.",
    "food",
  ),
  family_circle: definition(
    "family_circle",
    "Family Circle",
    "Coordinate health and care with your circle.",
    "family",
  ),
  muscle_growth: definition(
    "muscle_growth",
    "Muscle Growth",
    "Strength-focused goals and programs.",
    "fitness",
  ),
  weight_loss: definition(
    "weight_loss",
    "Weight Loss",
    "Sustainable movement goals for weight management.",
    "fitness",
    "guided",
  ),
  family_planning: definition(
    "family_planning",
    "Family Planning",
    "User-selected family planning tools.",
    "family",
    "professional-input",
    true,
  ),
  food_planning: definition(
    "food_planning",
    "Food Planning",
    "Meal and food planning support.",
    "food",
  ),
  daily_planning: definition(
    "daily_planning",
    "Daily Planning",
    "Plan routines and daily wellbeing tasks.",
    "planning",
  ),
  workout_guide: definition(
    "workout_guide",
    "Workout Guide",
    "Guided workouts, programs, and exercise support.",
    "fitness",
  ),
  pregnancy: definition(
    "pregnancy",
    "Pregnancy-safe Movement",
    "General movement guidance selected by the user.",
    "fitness",
    "professional-input",
    true,
  ),
  postpartum: definition(
    "postpartum",
    "Postpartum",
    "A careful return to movement selected by the user.",
    "fitness",
    "professional-input",
    true,
  ),
  child_care: definition(
    "child_care",
    "Kids Movement",
    "Age-aware movement for managed child profiles.",
    "family",
    "age-aware",
    true,
  ),
  teen_fitness: definition(
    "teen_fitness",
    "Teen Fitness",
    "Age-aware fitness for managed teen profiles.",
    "fitness",
    "age-aware",
    true,
  ),
  recovery: definition(
    "recovery",
    "Recovery",
    "Mobility, lighter movement, and recovery support.",
    "wellness",
    "guided",
  ),
  mental_wellness: definition(
    "mental_wellness",
    "Mental Wellness",
    "Low-pressure movement and wellbeing support.",
    "wellness",
  ),
  advanced_training: definition(
    "advanced_training",
    "Advanced Training",
    "Higher-intensity and advanced training options.",
    "fitness",
    "guided",
    true,
  ),
  injury_conscious: definition(
    "injury_conscious",
    "Injury-conscious Support",
    "General guidance for a careful return to movement.",
    "fitness",
    "professional-input",
    true,
  ),
  ai_plan_import: definition(
    "ai_plan_import",
    "AI Plan Import",
    "Find and review external plans before importing a draft.",
    "fitness",
    "guided",
  ),
};

export const FITNESS_GOAL_FEATURES: Record<string, FeaturePreferenceKey> = {
  "bench-20-50": "muscle_growth",
  "injury-conscious": "injury_conscious",
  "lean-muscle": "muscle_growth",
  "lose-weight": "weight_loss",
  "mental-reset": "mental_wellness",
  mobility: "recovery",
  postpartum: "postpartum",
  pregnancy: "pregnancy",
  "run-5k": "workout_guide",
  consistency: "fitness",
};

export const FITNESS_EXPLORE_FEATURES: Record<string, FeaturePreferenceKey> = {
  advanced: "advanced_training",
  cardio: "fitness",
  "gym-equipment": "workout_guide",
  kids: "child_care",
  "mental-reset": "mental_wellness",
  mobility: "recovery",
  "no-equipment": "workout_guide",
  pilates: "fitness",
  postpartum: "postpartum",
  "pregnancy-safe": "pregnancy",
  recovery: "recovery",
  running: "workout_guide",
  strength: "fitness",
  stretching: "recovery",
  teens: "teen_fitness",
  yoga: "mental_wellness",
};

export const FITNESS_PROGRAM_FEATURES: Record<string, FeaturePreferenceKey> = {
  challenge: "weight_loss",
  gym: "muscle_growth",
  home: "workout_guide",
  pregnancy: "pregnancy",
  recovery: "recovery",
  starter: "fitness",
  strength: "muscle_growth",
};

export function isProfileRelevantForFeature(
  featureKey: FeaturePreferenceKey,
  profileType?: ProfileType,
) {
  if (featureKey === "child_care") return profileType === "child";
  if (featureKey === "teen_fitness") return profileType === "teen";
  return false;
}

function definition(
  key: FeaturePreferenceKey,
  label: string,
  description: string,
  category: FeaturePreferenceDefinition["category"],
  safetyLevel: FeaturePreferenceDefinition["safetyLevel"] = "standard",
  needsProfileRelevanceCheck = false,
): FeaturePreferenceDefinition {
  return {
    canBeHidden: true,
    category,
    description,
    key,
    label,
    needsProfileRelevanceCheck,
    recommendedAudience: needsProfileRelevanceCheck
      ? "Relevant or manually enabled profiles"
      : "Most users",
    safetyLevel,
  };
}
