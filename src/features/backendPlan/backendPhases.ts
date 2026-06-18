export type HealthOSBackendPhaseStatus =
  | "planned"
  | "readyToImplement"
  | "blocked"
  | "inProgress"
  | "done"
  | "deferred";

export type HealthOSBackendPhase = {
  readonly id: string;
  readonly title: string;
  readonly purpose: string;
  readonly dependsOn: readonly string[];
  readonly migrationBatches: readonly string[];
  readonly services: readonly string[];
  readonly uiConnections: readonly string[];
  readonly rlsRequirements: readonly string[];
  readonly storageRequirements: readonly string[];
  readonly releaseBlocker: boolean;
  readonly status: HealthOSBackendPhaseStatus;
};

export const healthOSBackendPhases = [
  phase("foundation_account_preferences", "Foundation: Account + Preferences", "Stabilize account profile, settings, onboarding preferences, and notification preference foundations.", [], ["account_preferences"], ["profile_service", "onboarding_preferences_service"], ["auth_profile_settings", "onboarding_preferences"], ["Owner-only profile/preference policies."], ["Profile avatar bucket decision."], true, "readyToImplement"),
  phase("care_subject_profiles", "Care Subject Profiles", "Separate tracked person/care subject concepts from account identity using additive schema only.", ["foundation_account_preferences"], ["care_subject_profiles"], ["care_profile_service"], ["health_hub_profile_context"], ["Owner, guardian, and subject policies."], [], true, "blocked"),
  phase("family_permissions", "Family Permissions", "Create permission-based family sharing and caregiver assignment sequencing.", ["care_subject_profiles"], ["family_permissions"], ["family_circle_service", "sharing_permissions_service"], ["family_circle_basics"], ["Membership and explicit health permission policies."], [], true, "blocked"),
  phase("records_storage", "Records + Storage", "Create secure records metadata, file metadata, links, and storage policy plan.", ["family_permissions"], ["records_storage_metadata"], ["records_service", "storage_service"], ["records_metadata", "scan_to_records_draft"], ["Owner and explicit permission policies for records."], ["Private records bucket.", "Signed URL plan."], true, "planned"),
  phase("calendar_reminders", "Calendar + Reminders", "Normalize event/reminder ownership, source tracing, and reminder history.", ["family_permissions"], ["calendar_reminders"], ["calendar_reminder_service"], ["calendar_reminders"], ["Event visibility and reminder owner policies."], [], true, "planned"),
  phase("medication_supplements", "Medication + Supplements", "Add reviewed medication/supplement schedule, log, refill, and reminder foundations.", ["records_storage", "calendar_reminders"], ["medication_supplements"], ["medication_supplement_service"], ["medication_supplements_reviewed_save"], ["Private-by-default medication/supplement policies."], ["Medication and supplement label bucket policies if used."], true, "planned"),
  phase("life_stage_health", "Life Stage Health", "Add pregnancy, women's health, baby/child, and caregiver-scoped log foundations.", ["care_subject_profiles", "family_permissions"], ["life_stage_health"], ["pregnancy_service", "baby_child_service", "womens_health_service"], ["pregnancy_logs", "baby_child_logs", "womens_health_logs"], ["Private subject, guardian, and caregiver-scoped policies."], ["Baby/child and pregnancy records bucket policies if used."], true, "planned"),
  phase("ai_import_review", "AI Import Review", "Persist AI extraction and import review state without direct writes into health tables.", ["records_storage", "calendar_reminders"], ["ai_import_review"], ["ai_import_service"], ["ai_import_review_storage", "scan_to_records_draft"], ["Owner-only AI import policies."], ["AI temp upload policy."], true, "planned"),
  phase("fitness_nutrition", "Fitness + Nutrition", "Create lifestyle plan/log tables and connect reviewed AI workout/meal imports.", ["ai_import_review"], ["fitness_nutrition"], ["fitness_service", "nutrition_service"], ["fitness_logs_plans", "nutrition_logs_meal_plans"], ["Owner-only lifestyle policies and public reference table policies."], ["Food image policy if enabled."], true, "planned"),
  phase("trusted_content", "Trusted Content", "Separate public trusted content from user-private saved/read-later content.", ["foundation_account_preferences"], ["trusted_content"], ["trusted_content_service"], ["trusted_content_saved"], ["Public reference read, owner-only saved content, admin-only writes."], ["Source-backed content image policy if enabled."], false, "planned"),
  phase("release_qa", "Release QA", "Run privacy, RLS, storage, device, and store-readiness checks after implementation phases.", ["records_storage", "calendar_reminders", "ai_import_review", "fitness_nutrition"], [], [], [], ["Manual RLS checks for each sensitive flow."], ["Storage path and signed URL checks."], true, "planned"),
] as const satisfies readonly HealthOSBackendPhase[];

function phase(
  id: string,
  title: string,
  purpose: string,
  dependsOn: readonly string[],
  migrationBatches: readonly string[],
  services: readonly string[],
  uiConnections: readonly string[],
  rlsRequirements: readonly string[],
  storageRequirements: readonly string[],
  releaseBlocker: boolean,
  status: HealthOSBackendPhaseStatus,
): HealthOSBackendPhase {
  return {
    id,
    title,
    purpose,
    dependsOn,
    migrationBatches,
    services,
    uiConnections,
    rlsRequirements,
    storageRequirements,
    releaseBlocker,
    status,
  };
}

