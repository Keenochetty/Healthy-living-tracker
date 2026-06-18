export const allowedTargets = new Set([
  "nutrition",
  "medication",
  "supplements",
  "records",
  "fitness",
  "calendar",
  "reminders",
  "pregnancy",
  "baby_child",
  "womens_health",
  "family",
  "health",
  "trusted_content",
  "home",
  "none",
]);

export const allowedSourceTypes = new Set([
  "chat",
  "scan",
  "record",
  "document",
  "image",
  "camera",
  "gallery",
  "manual_text",
  "meal_photo",
  "food_label",
  "medication_label",
  "prescription",
  "doctor_note",
  "pregnancy_document",
  "baby_child_document",
  "workout_plan",
  "unknown",
]);

export type HealthOSAIImportRequest = {
  source_type?: string;
  requested_target?: string;
  subject_care_profile_id?: string;
  source_record_id?: string;
  text_input?: string;
  context_refs?: unknown[];
  user_confirmed_context?: boolean;
};

export function validateImportRequest(body: HealthOSAIImportRequest) {
  const errors: string[] = [];
  const sourceType = body.source_type ?? "unknown";
  const requestedTarget = body.requested_target ?? "none";

  if (!allowedSourceTypes.has(sourceType)) errors.push("Invalid source_type.");
  if (!allowedTargets.has(requestedTarget)) errors.push("Invalid requested_target.");
  if ((body.text_input || body.context_refs?.length) && body.user_confirmed_context !== true) {
    errors.push("Private context requires confirmation.");
  }

  return { valid: errors.length === 0, errors, sourceType, requestedTarget };
}
