export type HealthOSServiceSequenceItem = {
  readonly id: string;
  readonly serviceName: string;
  readonly featureArea: string;
  readonly dependsOnMigrationBatch: string;
  readonly requiredTables: readonly string[];
  readonly requiredRls: readonly string[];
  readonly requiredTypes: readonly string[];
  readonly uiConsumers: readonly string[];
  readonly releaseBlocker: boolean;
  readonly canBeDeferred: boolean;
  readonly notes: string;
};

export const healthOSServiceSequence = [
  service("profile_service", "Profile service", "Profile/Settings", "account_preferences", ["profiles", "user_settings", "profile_settings"], ["Owner-only profile/settings policies."], ["Generated Database profile row/insert/update types."], ["Profile", "Settings"], true, false, "Must not use service role keys in client code."),
  service("onboarding_preferences_service", "Onboarding/preferences service", "Onboarding", "account_preferences", ["profile_modules", "profile_widgets", "user_feature_preferences"], ["Owner-only preference policies."], ["Generated preference table types."], ["Onboarding", "Home"], true, false, "Return safe defaults when preferences are absent."),
  service("care_profile_service", "Person/care profile service", "Care Subject", "care_subject_profiles", ["profiles", "children", "care_profiles"], ["Owner and guardian policies."], ["Generated care profile types."], ["Health Hub", "Family details", "Pregnancy", "Baby/Child"], true, false, "Do not destructively split profile behavior."),
  service("family_circle_service", "Family circle service", "Family", "family_permissions", ["families", "family_memberships", "family_invites"], ["Membership policies."], ["Generated family table types."], ["Family Circle"], true, false, "Invites must not grant access until accepted."),
  service("sharing_permissions_service", "Sharing permissions service", "Family Permissions", "family_permissions", ["sharing_permissions", "caregiver_child_access"], ["Explicit permission policies."], ["Generated permission table types."], ["Family", "Caregiver", "Records"], true, false, "Sensitive records must use explicit permission checks."),
  service("records_service", "Records service", "Records", "records_storage_metadata", ["health_records", "record_files", "record_links"], ["Owner and permission policies."], ["Generated record table types."], ["Records", "Scan", "Medication", "Pregnancy", "Baby/Child"], true, false, "No fake records; empty states only."),
  service("storage_service", "Storage service", "Storage", "records_storage_metadata", ["record_files"], ["Storage metadata ownership policies."], ["Generated record_files type."], ["Records", "Scan", "Profile"], true, false, "Use signed URLs; hide raw storage paths."),
  service("calendar_reminder_service", "Calendar/reminder service", "Calendar/Reminders", "calendar_reminders", ["calendar_events", "event_responses", "reminders", "reminder_history"], ["Event visibility and reminder owner policies."], ["Generated calendar/reminder types."], ["Calendar", "Reminders", "Medication", "AI review"], true, false, "No silent scheduling from AI output."),
  service("medication_supplement_service", "Medication/supplement service", "Medication/Supplements", "medication_supplements", ["medications", "medication_schedules", "supplements", "supplement_schedules"], ["Owner/private-by-default policies."], ["Generated medication/supplement types."], ["Medication", "Supplements"], true, false, "Medication reminders require explicit confirmation."),
  service("pregnancy_service", "Pregnancy service", "Pregnancy", "life_stage_health", ["pregnancy_profiles", "pregnancy_logs", "pregnancy_appointments"], ["Private subject policies."], ["Generated pregnancy types."], ["Pregnancy"], true, false, "Can start with profile/log basics."),
  service("baby_child_service", "Baby/child service", "Baby/Child", "life_stage_health", ["children", "feeding_logs", "sleep_logs", "diaper_logs", "vaccine_records", "growth_measurements"], ["Guardian and caregiver scoped policies."], ["Generated child table types."], ["Baby/Child", "Caregiver"], true, false, "Caregiver writes must be scoped."),
  service("womens_health_service", "Women's health service", "Women's Health", "life_stage_health", ["cycle_logs", "women_health_symptoms", "contraception_logs", "sex_day_logs"], ["Owner-only private policies."], ["Generated women's health types."], ["Cycle", "Women's Health"], true, false, "Private by default; no broad family sharing."),
  service("ai_import_service", "AI import service", "AI Import", "ai_import_review", ["ai_extraction_jobs", "ai_import_envelopes", "ai_review_events", "healthsync_ai_imports"], ["Owner-only AI import policies."], ["Generated AI import types."], ["AI", "Scan", "Import Review"], true, false, "Persist draft/review events only; no automatic realm writes."),
  service("fitness_service", "Fitness service", "Fitness", "fitness_nutrition", ["fitness_plans", "workout_sessions", "exercise_logs", "user_imported_plans"], ["Owner-only fitness policies."], ["Generated fitness types."], ["Fitness"], true, false, "Reference tables must exist before live content queries."),
  service("nutrition_service", "Nutrition service", "Nutrition", "fitness_nutrition", ["nutrition_logs", "meals", "meal_plans", "food_items", "grocery_lists"], ["Owner-only nutrition policies."], ["Generated nutrition types."], ["Food", "Nutrition"], true, false, "Food route should write nutrition-named tables."),
  service("trusted_content_service", "Trusted content service", "Trusted Content", "trusted_content", ["trusted_content", "content_sources", "saved_content"], ["Public reference read; owner-only saved content."], ["Generated trusted content types."], ["Trusted Content", "Realm cards"], false, true, "Can stay static for MVP if sources are not ready."),
  service("notifications_push_service", "Notifications/push token service", "Notifications", "calendar_reminders", ["notifications", "device_tokens", "notification_preferences"], ["Recipient-only notification policies."], ["Generated notification types."], ["Notifications", "Settings", "Reminders"], false, true, "Full push backend can wait for development build/release planning."),
] as const satisfies readonly HealthOSServiceSequenceItem[];

function service(
  id: string,
  serviceName: string,
  featureArea: string,
  dependsOnMigrationBatch: string,
  requiredTables: readonly string[],
  requiredRls: readonly string[],
  requiredTypes: readonly string[],
  uiConsumers: readonly string[],
  releaseBlocker: boolean,
  canBeDeferred: boolean,
  notes: string,
): HealthOSServiceSequenceItem {
  return {
    id,
    serviceName,
    featureArea,
    dependsOnMigrationBatch,
    requiredTables,
    requiredRls,
    requiredTypes,
    uiConsumers,
    releaseBlocker,
    canBeDeferred,
    notes,
  };
}

