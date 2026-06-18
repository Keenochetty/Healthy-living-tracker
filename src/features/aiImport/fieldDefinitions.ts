import type { HealthOSAIImportTarget, HealthOSAIImportType } from "./types";

export type HealthOSAIFieldDefinition = {
  editable: boolean;
  key: string;
  label: string;
  medicalRisk?: "none" | "low" | "medium" | "high";
  requiredForTargets: HealthOSAIImportTarget[];
  sensitive?: boolean;
  unit?: string;
  validationHint?: string;
};

const FIELD_SETS: Record<HealthOSAIImportType, HealthOSAIFieldDefinition[]> = {
  article: fields(["title", "summary", "sourceUrl"]),
  baby_child_document: [
    field("childName", "Child name", ["babyChild"], true, "high"),
    field("documentTitle", "Document title", ["records", "babyChild"], true, "medium"),
    field("date", "Date", ["records"], true, "medium"),
    field("provider", "Provider", ["records"], false),
    field("vaccineEntries", "Vaccine entries", ["babyChild"], true, "high"),
    field("growthMeasurements", "Growth measurements", ["babyChild"], true, "high"),
    field("followUps", "Follow-ups", ["calendar"], true, "medium"),
  ],
  calendar_event: [
    field("title", "Title", ["calendar"], false),
    field("date", "Date", ["calendar"], true, "medium", "Required before creating a calendar event."),
    field("startTime", "Start time", ["calendar"], true, "medium"),
    field("endTime", "End time", [], true, "low"),
    field("privacy", "Privacy", ["calendar"], true, "medium"),
  ],
  cycle_note: [
    field("date", "Date", ["womensHealth"], true, "medium"),
    field("logType", "Log type", ["womensHealth"], true, "medium"),
    field("symptoms", "Symptoms", ["womensHealth"], true, "medium"),
    field("privacy", "Privacy", ["womensHealth"], true, "high"),
  ],
  doctor_note: [
    field("documentTitle", "Document title", ["records"], true, "medium"),
    field("provider", "Provider", ["records"], false),
    field("date", "Date", ["records"], true, "medium"),
    field("summary", "Summary", ["records"], true, "high"),
    field("followUpItems", "Follow-up items", ["calendar"], true, "medium"),
  ],
  exercise: fields(["exerciseName", "sets", "reps", "duration", "safetyNotes"], ["fitness"]),
  family_note: [
    field("title", "Title", ["family"], true, "medium"),
    field("note", "Note", ["family"], true, "medium"),
    field("sharedWith", "Shared with", ["family"], true, "high", "Sharing requires explicit permission."),
    field("privacy", "Privacy", ["family"], true, "high"),
  ],
  food_label: [
    field("productName", "Product name", ["nutrition"], false),
    field("servingSize", "Serving size", ["nutrition"], false, "medium"),
    field("calories", "Calories", ["nutrition"], false, "low"),
    field("protein", "Protein", [], false, "low", undefined, "g"),
    field("carbs", "Carbs", [], false, "low", undefined, "g"),
    field("fat", "Fat", [], false, "low", undefined, "g"),
    field("allergens", "Allergens", ["nutrition"], true, "high"),
  ],
  general_note: fields(["title", "note"], ["records"]),
  grocery_list: fields(["items", "notes"], ["nutrition", "records"]),
  gym_machine: fields(["machineName", "possibleExercises", "targetMuscles", "setupNotes", "safetyNotes"], ["fitness"]),
  lab_report: [
    field("reportName", "Report name", ["records"], true, "medium"),
    field("provider", "Provider", ["records"], false),
    field("date", "Date", ["records"], true, "medium"),
    field("values", "Values", ["health"], true, "high"),
    field("referenceRanges", "Reference ranges", [], true, "high"),
  ],
  meal: fields(["mealName", "ingredients", "caloriesEstimate", "allergyFlags"], ["nutrition"]),
  meal_plan: fields(["planTitle", "days", "meals", "ingredients", "groceryItems", "allergyFlags"], ["nutrition", "calendar", "records"]),
  medical_record: fields(["documentTitle", "provider", "date", "summary", "followUpItems"], ["records", "health"]),
  medication: [
    field("medicationName", "Medication name", ["medication"], true, "high"),
    field("strength", "Strength", ["medication"], true, "high"),
    field("doseInstructions", "Dose instructions", ["medication"], true, "high", "Always confirm with a healthcare professional."),
    field("frequency", "Frequency", ["medication", "calendar"], true, "high"),
    field("timing", "Timing", ["calendar"], true, "high"),
  ],
  pregnancy_document: [
    field("documentTitle", "Document title", ["records", "pregnancy"], true, "medium"),
    field("date", "Date", ["records"], true, "medium"),
    field("provider", "Provider", [], false),
    field("dueDate", "Due date", ["pregnancy"], true, "high", "Due dates always require confirmation."),
    field("appointmentDate", "Appointment date", ["calendar"], true, "medium"),
  ],
  prescription: [
    field("medicationName", "Medication name", ["medication"], true, "high"),
    field("strength", "Strength", ["medication"], true, "high"),
    field("doseInstructions", "Dose instructions", ["medication"], true, "high"),
    field("frequency", "Frequency", ["medication", "calendar"], true, "high"),
    field("prescriber", "Prescriber", ["records"], false),
    field("refillInfo", "Refill info", ["records"], true, "medium"),
  ],
  recipe: fields(["recipeTitle", "ingredients", "steps", "servings", "allergens"], ["nutrition", "records"]),
  supplement: [
    field("supplementName", "Supplement name", ["supplements"], true, "high"),
    field("amount", "Amount", ["supplements"], true, "high"),
    field("frequency", "Frequency", ["supplements", "calendar"], true, "high"),
    field("warnings", "Warnings", ["supplements"], true, "high"),
  ],
  symptom_note: fields(["date", "symptoms", "note", "privacy"], ["health", "records"]),
  unknown: [],
  vaccine_card: [
    field("personName", "Person name", ["records"], true, "high"),
    field("vaccineName", "Vaccine name", ["babyChild", "records"], true, "high"),
    field("vaccineDate", "Vaccine date", ["babyChild", "calendar"], true, "high"),
    field("provider", "Provider", ["records"], false),
    field("nextDueDate", "Next due date", ["calendar"], true, "high", "Only if provider or user confirms."),
  ],
  workout_plan: fields(["planTitle", "goal", "exercises", "sets", "reps", "schedule", "safetyNotes"], ["fitness", "calendar", "records"]),
};

export function getFieldDefinitions(importType: HealthOSAIImportType) {
  return FIELD_SETS[importType] ?? [];
}

function fields(
  keys: string[],
  requiredForTargets: HealthOSAIImportTarget[] = ["records"],
): HealthOSAIFieldDefinition[] {
  return keys.map((key) => field(key, labelize(key), requiredForTargets, false));
}

function field(
  key: string,
  label: string,
  requiredForTargets: HealthOSAIImportTarget[],
  sensitive = false,
  medicalRisk: "none" | "low" | "medium" | "high" = "low",
  validationHint?: string,
  unit?: string,
): HealthOSAIFieldDefinition {
  return { editable: true, key, label, medicalRisk, requiredForTargets, sensitive, unit, validationHint };
}

function labelize(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}
