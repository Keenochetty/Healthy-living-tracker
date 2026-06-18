export type HealthOSUiConnectionItem = {
  readonly id: string;
  readonly routeOrFeature: string;
  readonly serviceRequired: string;
  readonly tablesRequired: readonly string[];
  readonly rlsRequired: readonly string[];
  readonly storageRequired: readonly string[];
  readonly emptyStateRequired: boolean;
  readonly errorStateRequired: boolean;
  readonly privacyCopyRequired: boolean;
  readonly canRemainPlaceholderForMvp: boolean;
  readonly releaseBlocker: boolean;
  readonly notes: string;
};

export const healthOSUiConnectionSequence = [
  ui("auth_profile_settings", "Auth/Profile/Settings", "profile_service", ["profiles", "user_settings", "profile_settings"], ["Owner-only profile/settings policies."], ["profile-avatars if enabled"], true, true, true, false, true, "Can connect first because the account foundation already exists in migrations."),
  ui("onboarding_preferences", "Onboarding preferences", "onboarding_preferences_service", ["profile_modules", "profile_widgets", "user_feature_preferences"], ["Owner-only preference policies."], [], true, true, true, false, true, "Use safe defaults until rows exist."),
  ui("health_hub_profile_context", "Health Hub profile context", "care_profile_service", ["profiles", "children", "care_profiles"], ["Owner/guardian policies."], [], true, true, true, false, true, "Do not connect writes to missing care profile tables until migration exists."),
  ui("family_circle_basics", "Family circle basics", "family_circle_service", ["families", "family_memberships", "family_invites"], ["Membership policies."], [], true, true, true, false, true, "Shared health views need sharing permissions first."),
  ui("records_metadata", "Records metadata", "records_service", ["health_records", "record_files", "record_links"], ["Owner and explicit permission policies."], ["Private records bucket"], true, true, true, false, true, "Records writes are blocked until storage metadata is normalized."),
  ui("scan_to_records_draft", "Scan to Records draft", "ai_import_service", ["ai_extraction_jobs", "ai_import_envelopes", "record_files"], ["Owner-only AI import and record file policies."], ["AI temp uploads", "private records bucket"], true, true, true, false, true, "Scan can create drafts, not direct health records."),
  ui("medication_supplements_reviewed_save", "Medication/Supplements reviewed save", "medication_supplement_service", ["medications", "medication_schedules", "supplements", "supplement_schedules"], ["Owner/private medication policies."], ["Medication/supplement label buckets if enabled"], true, true, true, false, true, "Reminder creation needs explicit confirmation."),
  ui("calendar_reminders", "Calendar/Reminders", "calendar_reminder_service", ["calendar_events", "reminders", "reminder_history"], ["Event visibility and reminder owner policies."], [], true, true, true, false, true, "Add source fields before linking AI-created reminders."),
  ui("pregnancy_logs", "Pregnancy profile/logs", "pregnancy_service", ["pregnancy_profiles", "pregnancy_logs"], ["Owner-only pregnancy policies."], ["Pregnancy records bucket if enabled"], true, true, true, false, true, "Persistent pregnancy UI needs schema first."),
  ui("baby_child_logs", "Baby/Child profile/logs", "baby_child_service", ["children", "feeding_logs", "sleep_logs", "diaper_logs"], ["Guardian/caregiver scoped policies."], ["Baby/child private bucket if enabled"], true, true, true, false, true, "Caregiver access must be scoped."),
  ui("womens_health_logs", "Women's Health private logs", "womens_health_service", ["cycle_logs", "women_health_symptoms"], ["Owner-only private policies."], [], true, true, true, false, true, "No broad family access."),
  ui("ai_import_review_storage", "AI Import Review storage", "ai_import_service", ["ai_extraction_jobs", "ai_import_envelopes", "ai_review_events"], ["Owner-only AI import policies."], ["AI temp uploads"], true, true, true, false, true, "Required for import buttons under chat responses."),
  ui("nutrition_logs_meal_plans", "Nutrition logs/meal plans", "nutrition_service", ["nutrition_logs", "meals", "meal_plans", "food_items"], ["Owner-only nutrition policies."], ["Food images if enabled"], true, true, true, false, true, "Can show honest placeholder if nutrition persistence is scoped out."),
  ui("fitness_logs_plans", "Fitness logs/plans", "fitness_service", ["fitness_plans", "workout_sessions", "exercise_logs", "user_imported_plans"], ["Owner-only fitness policies."], [], true, true, true, false, true, "Existing imported plan tables help, but reference content gaps remain."),
  ui("trusted_content_saved", "Trusted Content/saved content", "trusted_content_service", ["trusted_content", "content_sources", "saved_content"], ["Public reference and owner-saved policies."], [], true, true, true, true, false, "Can remain static if trusted content persistence is deferred."),
  ui("notifications_push_later", "Notifications/push token later", "notifications_push_service", ["notifications", "device_tokens", "notification_preferences"], ["Recipient-only notification policies."], [], true, true, true, true, false, "Full push backend can be after MVP; settings display can be earlier."),
] as const satisfies readonly HealthOSUiConnectionItem[];

function ui(
  id: string,
  routeOrFeature: string,
  serviceRequired: string,
  tablesRequired: readonly string[],
  rlsRequired: readonly string[],
  storageRequired: readonly string[],
  emptyStateRequired: boolean,
  errorStateRequired: boolean,
  privacyCopyRequired: boolean,
  canRemainPlaceholderForMvp: boolean,
  releaseBlocker: boolean,
  notes: string,
): HealthOSUiConnectionItem {
  return {
    id,
    routeOrFeature,
    serviceRequired,
    tablesRequired,
    rlsRequired,
    storageRequired,
    emptyStateRequired,
    errorStateRequired,
    privacyCopyRequired,
    canRemainPlaceholderForMvp,
    releaseBlocker,
    notes,
  };
}

