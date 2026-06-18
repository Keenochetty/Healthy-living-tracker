export const FITNESS_NUTRITION_REVIEW_FIRST_COPY =
  "Review and confirm imported fitness or nutrition details before saving them as active data.";

export const FITNESS_NUTRITION_NOT_MEDICAL_ADVICE_COPY =
  "HealthOS stores user-reviewed fitness and nutrition information. It does not prescribe workouts, diet plans, or medical guidance.";

export function getFitnessNutritionSourceSafetyCopy(sourceType?: string | null) {
  if (sourceType === "aiImport" || sourceType === "scan" || sourceType === "barcode" || sourceType === "record") {
    return FITNESS_NUTRITION_REVIEW_FIRST_COPY;
  }
  return FITNESS_NUTRITION_NOT_MEDICAL_ADVICE_COPY;
}

export const getWorkoutSafetyDisclaimer = () =>
  "Review workouts for your situation before starting. HealthOS does not prescribe injury, pregnancy, postpartum, or medical exercise plans.";

export const getNutritionSafetyDisclaimer = () =>
  "Review nutrition entries and plans before using them. HealthOS does not prescribe medical diets or guarantee nutrition suitability.";

export const getPregnancyWorkoutReviewCopy = () =>
  "Pregnancy workout plans require review and appropriate professional guidance before use.";

export const getInjuryRecoveryReviewCopy = () =>
  "Injury or recovery workouts require review and appropriate professional guidance before use.";

export const getAllergyNutritionReviewCopy = () =>
  "Allergy-related food information is a review prompt only. HealthOS does not claim a food is allergy-safe.";

export const getDiabetesNutritionReviewCopy = () =>
  "Diabetes-related meal information is a review prompt only. HealthOS does not claim a meal is diabetes-safe.";

export const getChildNutritionReviewCopy = () =>
  "Child nutrition entries require review and appropriate professional guidance before use.";

export const getMacroCalculationDeferredCopy = () =>
  "Calories and macros require a trusted source or later calculation engine and are not generated in this batch.";

export const getExerciseLibraryDeferredCopy = () =>
  "Full exercise database import is deferred. Exercise names and muscle tags remain user-entered or reviewed metadata.";
