export type HealthOSMigrationRisk = "low" | "medium" | "high" | "blocker";

export type HealthOSMigrationBatch = {
  readonly id: string;
  readonly title: string;
  readonly purpose: string;
  readonly tables: readonly string[];
  readonly plannedTargetTables: readonly string[];
  readonly dependencies: readonly string[];
  readonly rlsRequired: readonly string[];
  readonly storageRequired: readonly string[];
  readonly generatedTypesRequired: boolean;
  readonly uiUnlocked: readonly string[];
  readonly risk: HealthOSMigrationRisk;
  readonly shouldRunBeforeMvp: boolean;
  readonly notes: string;
};

export const healthOSMigrationSequence = [
  batch("account_preferences", "Account + Preferences", "Align account profile, app settings, onboarding preferences, and notification preferences.", ["profiles", "user_settings", "profile_settings", "profile_modules", "profile_widgets", "user_feature_preferences", "device_tokens"], ["notification_preferences", "app_preferences"], [], ["Owner-only policies for profile and preference rows."], ["profile-avatars policy review"], true, ["Profile", "Settings", "Onboarding", "Home personalization"], "low", true, "Mostly existing schema; add only missing preference tables/columns if needed."),
  batch("care_subject_profiles", "Person / Care Subject Profiles", "Separate account identity from the health subject without destructive profile changes.", ["profiles", "children", "caregiver_profiles"], ["care_profiles", "person_profiles", "self_profile_links"], ["account_preferences"], ["Owner-only care profile policies.", "Guardian policies for child-linked subjects."], [], true, ["Health Hub profile context", "Child/Baby foundation", "Pregnancy subject foundation"], "high", true, "Requires product naming decision; do not split existing profiles destructively."),
  batch("family_permissions", "Family Circles + Sharing Permissions", "Normalize membership and permission-based sharing before sensitive family access expands.", ["families", "family_members", "family_memberships", "family_invites", "sharing_permissions", "caregiver_child_access"], ["family_circles", "family_circle_members", "family_permissions"], ["care_subject_profiles"], ["Membership policies.", "Explicit permission policies for shared health data.", "Caregiver limited-access policies."], [], true, ["Family Circle", "Caregiver limited view", "Shared calendar", "Shared records"], "blocker", true, "Finalize sharing permission shape before tightening RLS."),
  batch("records_storage_metadata", "Records + Storage Metadata", "Create secure record metadata, file metadata, and realm links.", ["health_records", "documents", "medical_records", "medical_documents"], ["record_files", "record_links", "record_extractions"], ["family_permissions"], ["Owner policies.", "Explicit permission policies for shared records."], ["Private records bucket.", "Signed URL policy.", "Raw path hiding rule."], true, ["Records", "Scan to records", "Medication scripts", "Pregnancy documents", "Baby/Child documents"], "blocker", true, "Do this before connecting records writes to UI."),
  batch("calendar_reminders", "Calendar + Reminders", "Normalize calendar events, reminder source ownership, and reminder history.", ["calendar_events", "event_responses", "reminders", "notifications", "device_tokens"], ["reminder_history"], ["family_permissions"], ["Owner/member event visibility.", "Reminder owner policies.", "Notification recipient policies."], [], true, ["Calendar", "Reminder Center", "Medication reminders", "AI reminder drafts"], "high", true, "Add nullable source fields before linking realm-created reminders."),
  batch("medication_supplements", "Medication + Supplements", "Create reviewed medication and supplement schedule/log foundations.", ["medications", "medicine_logs", "reminders"], ["medication_schedules", "medication_logs", "medication_side_effects", "medication_refills", "supplements", "supplement_schedules", "supplement_logs"], ["records_storage_metadata", "calendar_reminders"], ["Owner/private-by-default medication policies.", "Explicit family sharing policies."], ["Medication label bucket policy.", "Supplement label bucket policy."], true, ["Medication", "Supplements", "Prescription scan review"], "high", true, "Medication exists but schedule/log/refill models need normalization."),
  batch("life_stage_health", "Pregnancy + Women's Health + Baby/Child", "Create private life-stage tracking tables.", ["children", "activity_logs", "care_instructions", "activity_photos", "caregiver_child_access"], ["pregnancy_profiles", "pregnancy_logs", "pregnancy_appointments", "pregnancy_checklists", "pregnancy_care_team", "cycle_logs", "contraception_logs", "women_health_symptoms", "sex_day_logs", "feeding_logs", "sleep_logs", "diaper_logs", "vaccine_records", "growth_measurements", "milestone_logs", "caregiver_notes"], ["care_subject_profiles", "family_permissions"], ["Private-by-default subject policies.", "Guardian child policies.", "Caregiver scoped policies."], ["Baby/child private records buckets.", "Activity photos policy."], true, ["Pregnancy", "Women's Health", "Baby/Child", "Caregiver notes"], "blocker", true, "Required if these realms remain persistent in MVP."),
  batch("ai_import_review", "AI Import Review Persistence", "Persist review-first AI extraction/import envelopes without direct writes to realm tables.", ["app_ai_chats", "app_ai_messages", "app_ai_imports", "app_ai_scan_results", "healthsync_ai_sessions", "healthsync_ai_imports"], ["ai_extraction_jobs", "ai_import_envelopes", "ai_review_events"], ["records_storage_metadata", "calendar_reminders"], ["Owner-only AI session/import policies.", "No broad family AI history access."], ["AI temp uploads policy.", "Evidence thumbnail policy if used."], true, ["AI Assistant import cards", "Scan AI review", "Records extraction review"], "high", true, "Review-first persistence is required before AI-created health plans are saved."),
  batch("fitness_nutrition", "Fitness + Nutrition", "Create lifestyle plan/log persistence for workout and meal plan imports.", ["user_imported_plans", "user_imported_plan_days", "user_plan_calendar_events", "user_fitness_history", "user_muscle_load_history", "fitness_muscle_groups"], ["fitness_exercises", "fitness_workout_programs", "fitness_workout_program_days", "fitness_goal_progressions", "fitness_nutrition_templates", "fitness_plans", "workout_sessions", "exercise_logs", "nutrition_logs", "meals", "meal_plans", "food_items", "grocery_lists", "recipe_imports", "allergy_flags"], ["ai_import_review"], ["Owner-only lifestyle data policies.", "Public/auth-readable reference content policies."], ["Food image policy if uploads remain."], true, ["Fitness", "Nutrition/Food", "Meal plan imports", "Workout plan imports"], "high", true, "Active services reference fitness content tables not found in migrations."),
  batch("trusted_content", "Trusted Content + Saved Content", "Separate public trusted content from user-private saved content.", [], ["trusted_content", "content_sources", "saved_content", "read_later_content"], ["account_preferences"], ["Public read policies for source content.", "Owner-only policies for saved content.", "Admin-only write plan."], ["Licensed/source-backed image policy only if needed."], true, ["Trusted Content Hub", "Realm article cards", "Save/read-later"], "medium", false, "Can remain static if trusted content is scoped out of MVP persistence."),
] as const satisfies readonly HealthOSMigrationBatch[];

function batch(
  id: string,
  title: string,
  purpose: string,
  tables: readonly string[],
  plannedTargetTables: readonly string[],
  dependencies: readonly string[],
  rlsRequired: readonly string[],
  storageRequired: readonly string[],
  generatedTypesRequired: boolean,
  uiUnlocked: readonly string[],
  risk: HealthOSMigrationRisk,
  shouldRunBeforeMvp: boolean,
  notes: string,
): HealthOSMigrationBatch {
  return {
    id,
    title,
    purpose,
    tables,
    plannedTargetTables,
    dependencies,
    rlsRequired,
    storageRequired,
    generatedTypesRequired,
    uiUnlocked,
    risk,
    shouldRunBeforeMvp,
    notes,
  };
}

