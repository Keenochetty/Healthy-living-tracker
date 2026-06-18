import type { FitnessNutritionPrivacyScope } from "./fitnessNutritionTypes";

export const FITNESS_NUTRITION_PRIVATE_SCOPE: FitnessNutritionPrivacyScope = "private";

export function normalizeFitnessNutritionPrivacyScope(scope?: string | null): FitnessNutritionPrivacyScope {
  if (scope === "selectedFamily" || scope === "caregiverLimited") return scope;
  return FITNESS_NUTRITION_PRIVATE_SCOPE;
}

export function isFitnessNutritionFamilySharingDeferred(scope?: FitnessNutritionPrivacyScope | null) {
  return scope === "selectedFamily" || scope === "caregiverLimited";
}

export function getFitnessNutritionPrivacyCopy(scope?: FitnessNutritionPrivacyScope | null) {
  if (scope === "selectedFamily") return "Selected family sharing requires a later permission-aware wiring pass.";
  if (scope === "caregiverLimited") return "Caregiver-limited sharing requires a later permission-aware wiring pass.";
  return "Private to the signed-in account.";
}

export function isFitnessDataPrivate(scope?: FitnessNutritionPrivacyScope | null) {
  return normalizeFitnessNutritionPrivacyScope(scope) === "private";
}

export function isNutritionDataPrivate(scope?: FitnessNutritionPrivacyScope | null) {
  return normalizeFitnessNutritionPrivacyScope(scope) === "private";
}

export function getPrivacySafeWorkoutTitle(title?: string | null) {
  return title?.trim() ? "Workout reminder" : "Workout reminder";
}

export function getPrivacySafeMealTitle(title?: string | null) {
  return title?.trim() ? "Meal reminder" : "Meal reminder";
}

export function canShowFitnessDataInSharedContext(scope?: FitnessNutritionPrivacyScope | null, hasExplicitPermission = false) {
  return hasExplicitPermission && !isFitnessDataPrivate(scope);
}

export function canShowNutritionDataInSharedContext(scope?: FitnessNutritionPrivacyScope | null, hasExplicitPermission = false) {
  return hasExplicitPermission && !isNutritionDataPrivate(scope);
}

export function getFitnessPrivacyLabel(scope?: FitnessNutritionPrivacyScope | null) {
  return getFitnessNutritionPrivacyCopy(scope);
}

export function getNutritionPrivacyLabel(scope?: FitnessNutritionPrivacyScope | null) {
  return getFitnessNutritionPrivacyCopy(scope);
}
