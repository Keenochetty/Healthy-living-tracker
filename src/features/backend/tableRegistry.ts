import type { HealthOSTableRegistryEntry, HealthOSServiceArea } from "./backendTypes";

const noGeneratedTypes = "No Supabase-generated Database type file was found. src/types/database.ts is manual profile-only coverage.";

const batches: Array<{ batch: number; featureArea: HealthOSServiceArea; rlsStatus: HealthOSTableRegistryEntry["rlsStatus"]; serviceStatus: HealthOSTableRegistryEntry["serviceStatus"]; tables: string[] }> = [
  { batch: 1, featureArea: "account", rlsStatus: "drafted", serviceStatus: "wired", tables: ["profiles", "onboarding_preferences", "app_preferences", "notification_preferences", "profile_photo_metadata"] },
  { batch: 2, featureArea: "careProfiles", rlsStatus: "drafted", serviceStatus: "wired", tables: ["care_profiles", "care_profile_relationships", "active_care_profile_preferences", "caregiver_profiles"] },
  { batch: 3, featureArea: "familySharing", rlsStatus: "drafted", serviceStatus: "wired", tables: ["family_circles", "family_circle_members", "family_invites", "sharing_permissions", "caregiver_assignments", "family_shared_updates"] },
  { batch: 4, featureArea: "records", rlsStatus: "drafted", serviceStatus: "wired", tables: ["records", "record_files", "record_links", "record_extractions", "emergency_packet_items"] },
  { batch: 5, featureArea: "calendarReminders", rlsStatus: "drafted", serviceStatus: "wired", tables: ["calendar_events", "calendar_event_links", "reminders", "reminder_history", "notification_events"] },
  { batch: 6, featureArea: "medicationSafety", rlsStatus: "drafted", serviceStatus: "wired", tables: ["medications", "medication_schedules", "medication_logs", "medication_side_effect_notes", "medication_refill_reminders", "supplements", "supplement_schedules", "supplement_logs", "medication_review_flags"] },
  { batch: 7, featureArea: "lifeStageHealth", rlsStatus: "drafted", serviceStatus: "wired", tables: ["pregnancy_profiles", "pregnancy_logs", "pregnancy_appointments", "pregnancy_checklists", "pregnancy_care_team", "women_health_logs", "contraception_logs", "sex_day_logs", "child_care_logs", "feeding_logs", "sleep_logs", "diaper_logs", "growth_measurements", "vaccine_records", "milestone_logs", "solids_logs", "child_medication_notes", "caregiver_notes"] },
  { batch: 8, featureArea: "aiImport", rlsStatus: "drafted", serviceStatus: "wired", tables: ["ai_extraction_jobs", "ai_import_envelopes", "ai_review_events", "ai_source_evidence", "ai_conversations", "ai_messages"] },
  { batch: 9, featureArea: "fitnessNutrition", rlsStatus: "drafted", serviceStatus: "wired", tables: ["fitness_goals", "workout_plans", "workout_sessions", "exercise_logs", "exercise_set_logs", "muscle_focus_logs", "fitness_progress_notes", "nutrition_goals", "meal_logs", "meal_items", "food_items", "meal_plans", "grocery_lists", "grocery_list_items", "hydration_logs", "nutrition_review_flags"] },
  { batch: 10, featureArea: "trustedContent", rlsStatus: "drafted", serviceStatus: "wired", tables: ["trusted_content_sources", "trusted_content_items", "trusted_content_targeting", "saved_content_items", "content_read_history", "content_feedback"] },
];

export const HEALTHOS_BACKEND_TABLE_REGISTRY: HealthOSTableRegistryEntry[] = batches.flatMap((batch) =>
  batch.tables.map((tableName) => ({
    batch: batch.batch,
    featureArea: batch.featureArea,
    generatedTypeStatus: "missing" as const,
    notes: noGeneratedTypes,
    rlsStatus: batch.rlsStatus,
    routeStatus: "deferred",
    serviceStatus: batch.serviceStatus,
    tableName,
  })),
);

export function getBackendTableRegistryEntry(tableName: string) {
  return HEALTHOS_BACKEND_TABLE_REGISTRY.find((entry) => entry.tableName === tableName) ?? null;
}

export const HEALTHOS_PLANNED_BACKEND_TABLES = HEALTHOS_BACKEND_TABLE_REGISTRY.map((entry) => entry.tableName);
