import type {
  HealthOSBackendReadiness,
  HealthOSTablePrivacyClass,
} from "./tablePrivacyClasses";

export type HealthOSRealmKey =
  | "home"
  | "calendar"
  | "scan"
  | "health"
  | "family"
  | "ai"
  | "fitness"
  | "nutrition"
  | "food"
  | "medication"
  | "supplements"
  | "records"
  | "pregnancy"
  | "babyChild"
  | "child"
  | "womensHealth"
  | "cycle"
  | "trustedContent"
  | "notifications"
  | "reminders"
  | "profile"
  | "settings"
  | "auth"
  | "onboarding"
  | "caregiver"
  | "elder"
  | "deviceSync"
  | "biometrics";

export type HealthOSRealmDataContract = {
  realmKey: HealthOSRealmKey;
  label: string;
  activeRoutes: string[];
  primaryTables: string[];
  secondaryTables: string[];
  storageBuckets: string[];
  edgeFunctions: string[];
  aiImportTargets: string[];
  recordLinkTargets: string[];
  reminderTargets: string[];
  privacyClass: HealthOSTablePrivacyClass;
  backendReadiness: HealthOSBackendReadiness;
  missingBackendPieces: string[];
  canonicalTables: string[];
  duplicateOrLegacyTables: string[];
  notes: string;
};

export const healthOSRealmDataContracts: HealthOSRealmDataContract[] = [
  realm("home", "Home", ["/", "/(tabs)/today"], ["profile_widgets", "reminders", "health_records"], [], [], [], [], ["health_records", "records"], ["reminders"], "userPrivate", "partial", ["Widget and snapshot data still mixes Supabase and local/static sources."], ["profile_widgets"], []),
  realm("calendar", "Calendar", ["/(tabs)/calendar", "/health-calendar"], ["calendar_events"], ["event_responses", "reminders"], [], [], ["calendar"], ["records"], ["calendar_events", "reminders"], "familyShared", "partial", ["Reminder source fields need normalization."], ["calendar_events", "event_responses"], []),
  realm("scan", "Scan", ["/(tabs)/scan"], ["app_ai_scan_results"], ["healthsync_ai_imports"], ["ai-temp-uploads"], ["ai-extract", "ai-document-extraction"], ["records", "medication", "nutrition"], ["records"], ["records"], "userPrivate", "partial", ["AI temp upload bucket/policy and extraction job model need canonical persistence."], ["app_ai_scan_results"], []),
  realm("health", "Health Hub", ["/(tabs)/health", "/health/[realm]"], ["health_records", "health_logs"], ["temperature_logs", "doctor_visits", "biometrics"], [], [], ["records"], ["health_records"], ["reminders"], "familyShared", "partial", ["Vitals/biometrics canonical tables are incomplete."], ["health_records"], ["health_logs", "temperature_logs"]),
  realm("family", "Family", ["/(tabs)/circle", "/circle/member/[memberId]"], ["families", "family_memberships", "family_members"], ["family_invites", "sharing_permissions"], [], [], [], ["records"], ["notifications"], "familyShared", "partial", ["Canonical naming should become family_circles/family_circle_members in docs."], ["family_memberships", "sharing_permissions"], ["families", "family_members"]),
  realm("ai", "AI", ["/ai", "/ai/import-review", "/ai/review/[jobId]"], ["healthsync_ai_sessions", "healthsync_ai_imports"], ["app_ai_chats", "app_ai_messages", "app_ai_imports", "ai_plan_search_logs"], ["ai-temp-uploads"], ["ai-chat", "ai-extract"], ["fitness", "nutrition", "medication", "calendar", "records", "baby_child", "cycle", "pregnancy"], ["records"], ["reminders"], "userPrivate", "partial", ["Canonical extraction job/envelope/event naming is not fully aligned."], ["healthsync_ai_sessions", "healthsync_ai_imports", "app_ai_imports"], ["ai_chat_sessions", "ai_actions"]),
  realm("fitness", "Fitness", ["/(tabs)/fitness", "/fitness/*"], ["user_imported_plans", "user_fitness_history"], ["user_muscle_load_history", "fitness_muscle_groups"], [], [], ["fitness"], ["records"], ["calendar_events"], "userPrivate", "partial", ["Referenced content tables for exercises/programs are missing from migrations."], ["user_imported_plans", "user_fitness_history"], ["fitness_exercises"]),
  realm("nutrition", "Nutrition", ["/(tabs)/food"], ["nutrition_logs", "meals"], ["user_imported_plans"], ["food-images"], ["food-api-lookup", "barcode-product-lookup"], ["nutrition", "shopping_list"], ["records"], ["reminders"], "userPrivate", "schemaMissing", ["Canonical nutrition log, meal, recipe, and grocery tables are missing."], ["nutrition_logs", "meals"], []),
  realm("food", "Food", ["/food/*", "/(tabs)/food"], ["nutrition_logs", "meals"], [], ["food-images"], ["food-api-lookup", "barcode-product-lookup"], ["nutrition"], ["records"], ["reminders"], "userPrivate", "schemaMissing", ["Food is the route alias for nutrition; backend should use nutrition naming."], ["nutrition_logs", "meals"], []),
  realm("medication", "Medication", ["/medication", "/medication/[medicationId]"], ["medications"], ["medicine_logs", "reminders"], ["medication-labels-private"], ["medication-supplement-lookup"], ["medication"], ["records"], ["reminders"], "familyShared", "partial", ["Schedule/refill/side-effect tables are not normalized."], ["medications"], ["medicine_logs"]),
  realm("supplements", "Supplements", ["/supplements"], ["supplements"], ["reminders"], ["supplement-labels-private"], ["medication-supplement-lookup"], ["supplements"], ["records"], ["reminders"], "userPrivate", "schemaMissing", ["Canonical supplement tables are missing."], ["supplements"], []),
  realm("records", "Records", ["/records"], ["health_records", "documents"], ["medical_records", "medical_documents"], ["health-records-private", "medical-documents"], ["private-file-signed-url", "ai-document-extraction"], ["records"], ["records"], ["reminders"], "userPrivate", "storageMissing", ["record_files and record_links are missing; private bucket set is not canonical."], ["health_records", "record_files", "record_links"], ["documents", "medical_documents"]),
  realm("pregnancy", "Pregnancy", ["/pregnancy"], ["pregnancy_profiles"], ["calendar_events", "health_records"], ["pregnancy-records-private"], [], ["pregnancy"], ["records"], ["calendar_events", "reminders"], "userPrivate", "schemaMissing", ["Pregnancy profile/log/checklist/care-team tables are missing."], ["pregnancy_profiles"], []),
  realm("babyChild", "Baby / Child", ["/baby-child"], ["children", "activity_logs"], ["care_instructions", "activity_photos", "caregiver_child_access"], ["baby-records-private", "activity-photos"], [], ["baby_child"], ["records"], ["reminders"], "childParentManaged", "partial", ["Feeding/sleep/diaper/vaccine/growth/milestone tables are not normalized."], ["children", "activity_logs"], []),
  realm("child", "Child", ["/child", "/child/[childId]"], ["children"], ["activity_logs"], ["baby-records-private"], [], ["baby_child"], ["records"], ["reminders"], "childParentManaged", "partial", ["Child route aliases baby-child realm."], ["children"], []),
  realm("womensHealth", "Women's Health", ["/cycle", "/health/[realm]"], ["cycle_logs"], ["calendar_events", "health_records"], [], [], ["cycle"], ["records"], ["reminders"], "userPrivate", "schemaMissing", ["Cycle, symptom, contraception, and sex-day tables are missing."], ["cycle_logs"], []),
  realm("cycle", "Cycle", ["/cycle"], ["cycle_logs"], [], [], [], ["cycle"], ["records"], ["reminders"], "userPrivate", "schemaMissing", ["Cycle is the route alias for women's health."], ["cycle_logs"], []),
  realm("trustedContent", "Trusted Content", ["/trusted-content"], ["trusted_content", "content_sources"], ["saved_content"], [], ["trusted-content-refresh"], [], [], [], "publicReference", "schemaMissing", ["Current content appears client/static; trusted content tables are missing."], ["trusted_content", "content_sources", "saved_content"], []),
  realm("notifications", "Notifications", ["/settings/notifications"], ["notifications", "device_tokens"], ["reminders"], [], [], [], [], ["reminders"], "userPrivate", "partial", ["Reminder history/source model is incomplete."], ["notifications", "device_tokens"], []),
  realm("reminders", "Reminders", ["/reminders", "/reminders/[reminderId]"], ["reminders"], ["notifications"], [], [], ["calendar", "medication"], ["records"], ["reminders"], "userPrivate", "partial", ["Need source_realm/source_row_id and reminder_history."], ["reminders", "reminder_history"], []),
  realm("profile", "Profile", ["/profile/[profileId]", "/settings/profile-contact"], ["profiles", "profile_settings"], ["emergency_contacts"], ["profile-avatars"], [], [], [], ["notifications"], "userPrivate", "partial", ["App profile and care subject concepts overlap."], ["profiles", "profile_settings"], ["users"]),
  realm("settings", "Settings", ["/settings"], ["user_settings", "profile_settings"], ["device_tokens"], ["profile-avatars"], ["data-export", "delete-account"], [], ["records"], ["notifications"], "userPrivate", "partial", ["Settings spans account, privacy, notifications, and legal placeholders."], ["user_settings", "profile_settings"], []),
  realm("auth", "Auth", ["/auth/sign-in", "/auth/sign-up"], ["auth.users", "profiles"], ["users"], [], [], [], [], [], "userPrivate", "ready", [], ["profiles"], ["users"]),
  realm("onboarding", "Onboarding", ["/onboarding"], ["profile_settings", "profile_modules", "profile_widgets"], ["user_feature_preferences"], [], [], [], [], [], "userPrivate", "partial", ["Onboarding preferences exist, but type generation is handwritten."], ["profile_settings", "profile_modules", "profile_widgets"], []),
  realm("caregiver", "Caregiver", ["/caregiver", "/caregiver/[caregiverId]"], ["caregiver_profiles", "caregiver_child_access"], ["care_instructions", "activity_logs"], ["caregiver-uploads"], [], [], ["records"], ["calendar_events"], "caregiverLimited", "partial", ["Billing/rates are UI-level and not canonical backend yet."], ["caregiver_profiles", "caregiver_child_access"], []),
  realm("elder", "Elder", ["/elder"], ["elder_profiles"], ["health_records"], [], [], [], ["records"], ["reminders"], "familyShared", "uiOnly", ["No elder/dependent canonical table found."], ["elder_profiles"], []),
  realm("deviceSync", "Device Sync", ["/device-sync"], ["device_sync_connections"], ["health_records"], [], [], [], ["health_records"], [], "userPrivate", "uiOnly", ["Device integrations are adapter/mock-based; persistence table missing."], ["device_sync_connections"], []),
  realm("biometrics", "Biometrics", ["/biometrics"], ["biometrics"], ["health_records"], [], [], [], ["records"], ["reminders"], "userPrivate", "uiOnly", ["Biometrics table is not present in migrations."], ["biometrics"], []),
];

function realm(
  realmKey: HealthOSRealmKey,
  label: string,
  activeRoutes: string[],
  primaryTables: string[],
  secondaryTables: string[],
  storageBuckets: string[],
  edgeFunctions: string[],
  aiImportTargets: string[],
  recordLinkTargets: string[],
  reminderTargets: string[],
  privacyClass: HealthOSTablePrivacyClass,
  backendReadiness: HealthOSBackendReadiness,
  missingBackendPieces: string[],
  canonicalTables: string[],
  duplicateOrLegacyTables: string[],
): HealthOSRealmDataContract {
  return {
    realmKey,
    label,
    activeRoutes,
    primaryTables,
    secondaryTables,
    storageBuckets,
    edgeFunctions,
    aiImportTargets,
    recordLinkTargets,
    reminderTargets,
    privacyClass,
    backendReadiness,
    missingBackendPieces,
    canonicalTables,
    duplicateOrLegacyTables,
    notes: missingBackendPieces[0] ?? "Backend model is aligned for current MVP usage.",
  };
}
