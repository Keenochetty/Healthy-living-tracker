import { createWorkoutSession } from "@/lib/fitnessStorage";
import { createHealthRecord } from "@/lib/healthRecordsStorage";
import {
  createMedication,
  createSupplement,
} from "@/lib/medicationSupplementStorage";
import { createNutritionEntry, toNutritionDateKey } from "@/lib/nutritionStorage";
import { createHealthReminder } from "@/services/reminders/reminderEngine";
import type { AppAIImportPayload, AppAIImportTarget } from "@/types/appAI";

export const SUPPORTED_APP_AI_IMPORT_TARGETS: AppAIImportTarget[] = [
  "nutrition",
  "fitness",
  "medication",
  "supplements",
  "calendar",
  "records",
];

export async function importAppAIData(
  payload: AppAIImportPayload,
  target: AppAIImportTarget,
) {
  if (target === "nutrition") {
    return createNutritionEntry({
      allergens: payload.nutrition.allergens,
      calories: value(payload.nutrition.nutrients.calories),
      carbsG: value(payload.nutrition.nutrients.carbs_g),
      entryDate: toNutritionDateKey(new Date()),
      entrySource: "smart_log",
      fatG: value(payload.nutrition.nutrients.fat_g),
      fiberG: value(payload.nutrition.nutrients.fiber_g),
      foodName: payload.summary.title || "AI meal draft",
      ingredients: payload.nutrition.ingredients.join(", "),
      mealGroup: toMealGroup(payload.nutrition.meal_type),
      notes: payload.summary.short_description,
      proteinG: value(payload.nutrition.nutrients.protein_g),
      quantity: payload.nutrition.servings ?? 1,
      unit: "serving",
    });
  }
  if (target === "fitness") {
    return createWorkoutSession({
      durationSeconds: (payload.fitness.duration_minutes ?? 0) * 60,
      intensity: "moderate",
      notes: [...payload.fitness.exercises, ...payload.fitness.safety_notes].join("\n"),
      startedAt: new Date().toISOString(),
      title: payload.fitness.workout_name ?? payload.summary.title,
      workoutType: "strength",
    });
  }
  if (target === "calendar") {
    const date = payload.calendar.start_date ?? toNutritionDateKey(new Date());
    return createHealthReminder({
      dueAt: new Date(`${date}T${payload.calendar.start_time ?? "09:00"}:00`).toISOString(),
      leadTimeMinutes: payload.calendar.reminder_minutes_before ?? undefined,
      notes: payload.summary.short_description,
      repeatRule: payload.calendar.repeat_rule ?? undefined,
      title: payload.calendar.title ?? payload.summary.title,
      type: "custom",
    });
  }
  if (target === "medication") {
    return createMedication({
      instructions: payload.medication.instructions.join(" "),
      name: payload.medication.name ?? payload.summary.title,
      notes: [
        payload.summary.short_description,
        ...payload.medication.interaction_notes,
        ...payload.medication.side_effects,
      ].join("\n"),
      strength: payload.medication.dosage ?? undefined,
    });
  }
  if (target === "supplements") {
    return createSupplement({
      name: payload.supplement.name ?? payload.summary.title,
      notes: [
        payload.summary.short_description,
        payload.supplement.purpose ?? "",
        ...payload.supplement.interaction_notes,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  }
  if (target === "records") {
    return createHealthRecord({
      notes: JSON.stringify(payload.records.extracted_fields, null, 2),
      title: payload.records.document_title ?? payload.summary.title,
      type: "health_note",
    });
  }
  throw new Error(`${target.replace("_", " ")} import is not connected yet.`);
}

function value(input: number | null) {
  return input ?? undefined;
}

function toMealGroup(input: string | null) {
  if (input === "breakfast" || input === "lunch" || input === "dinner") {
    return input;
  }
  return "snacks";
}
