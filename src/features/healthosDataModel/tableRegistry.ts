import type { HealthOSTablePrivacyClass } from "./tablePrivacyClasses";

export type HealthOSTableCanonicalStatus =
  | "canonical"
  | "alias"
  | "legacy"
  | "duplicate"
  | "unclear"
  | "missing";

export type HealthOSTableRegistryEntry = {
  tableName: string;
  featureArea: string;
  privacyClass: HealthOSTablePrivacyClass;
  sensitive: boolean;
  ownerColumns: string[];
  relationColumns: string[];
  expectedRls: boolean;
  storageDependency: boolean;
  exportApplies: boolean;
  deleteApplies: boolean;
  canonicalStatus: HealthOSTableCanonicalStatus;
  notes: string;
};

export const healthOSTableRegistry: HealthOSTableRegistryEntry[] = [
  table("profiles", "Auth/Profile", "userPrivate", ["id"], [], "canonical", "Account-level app profile currently overlaps with care-subject profile."),
  table("users", "Auth/Profile", "userPrivate", ["id"], [], "alias", "Core account row used by later migrations; overlaps profiles."),
  table("user_settings", "Settings", "userPrivate", ["user_id", "profile_id"], [], "canonical", "Settings shape has both user and profile variants across migrations."),
  table("profile_settings", "Settings", "userPrivate", ["profile_id"], [], "canonical", "Profile preference sync foundation."),
  table("profile_modules", "Onboarding", "userPrivate", ["profile_id"], [], "canonical", "Module preferences."),
  table("profile_widgets", "Home", "userPrivate", ["profile_id"], [], "canonical", "Widget preferences."),
  table("families", "Family", "familyShared", ["owner_id"], ["id"], "legacy", "Canonical naming should become family_circles, but active schema uses families."),
  table("family_members", "Family", "familyShared", ["profile_id", "managed_by_user_id"], ["family_id"], "legacy", "Overlaps family_memberships and person/care profile concepts."),
  table("family_memberships", "Family", "familyShared", ["user_id"], ["family_id"], "canonical", "Better account-to-circle membership model."),
  table("family_invites", "Family", "familyShared", ["invited_by_user_id"], ["family_id"], "canonical", "Pending invites must not grant data access."),
  table("sharing_permissions", "Permissions", "familyShared", ["owner_profile_id", "created_by_user_id"], ["family_id", "target_profile_id", "child_id"], "canonical", "Needs module-level enforcement before production."),
  table("children", "Baby/Child", "childParentManaged", ["created_by"], ["family_id", "family_member_id"], "canonical", "No 13/18 age transition enforcement yet."),
  table("caregiver_profiles", "Caregiver", "caregiverLimited", ["user_id", "profile_id"], [], "canonical", "Caregiver identity, not switchable health profile."),
  table("caregiver_child_access", "Caregiver", "caregiverLimited", ["caregiver_user_id", "granted_by_user_id"], ["child_id", "family_id"], "canonical", "Assignment and limited access model."),
  table("health_records", "Records/Health", "familyShared", ["created_by_user_id"], ["family_id", "family_member_id"], "canonical", "Generic health record row."),
  table("medical_records", "Records", "familyShared", [], ["family_id"], "legacy", "Early records model."),
  table("medical_documents", "Records", "familyShared", [], ["record_id"], "legacy", "Early document metadata model."),
  table("documents", "Records", "familyShared", ["created_by_user_id", "uploaded_by_user_id"], ["family_id"], "legacy", "Should align into records + record_files."),
  table("record_files", "Records", "userPrivate", ["owner_user_id"], ["record_id"], "missing", "Needed to normalize storage file metadata."),
  table("record_links", "Records", "userPrivate", ["owner_user_id"], ["record_id"], "missing", "Needed to link records to realm rows."),
  table("calendar_events", "Calendar", "familyShared", ["created_by_user_id", "created_by"], ["family_id", "family_member_id", "child_id"], "canonical", "Personal/profile routed events are partially supported."),
  table("event_responses", "Calendar", "familyShared", ["responder_user_id"], ["event_id", "family_id"], "canonical", "Response visibility should follow event visibility."),
  table("reminders", "Reminders", "familyShared", ["created_by_user_id"], ["family_id"], "canonical", "Needs source_realm/source_row_id columns."),
  table("reminder_history", "Reminders", "systemPrivate", ["owner_user_id"], ["reminder_id"], "missing", "Needed for notification/reminder audit trail."),
  table("notifications", "Notifications", "userPrivate", ["recipient_user_id", "recipient_profile_id"], ["family_id", "child_id"], "canonical", "Privacy-safe notification copy required."),
  table("device_tokens", "Notifications", "systemPrivate", ["user_id", "profile_id"], [], "canonical", "Raw tokens must remain private."),
  table("medications", "Medication", "familyShared", [], ["family_id", "family_member_id"], "canonical", "Needs explicit medication sharing permission."),
  table("medicine_logs", "Medication", "familyShared", ["created_by_user_id"], ["family_id"], "legacy", "Older medication log model."),
  table("supplements", "Supplements", "userPrivate", ["owner_user_id"], [], "missing", "No canonical supplement persistence table found."),
  table("pregnancy_profiles", "Pregnancy", "userPrivate", ["owner_user_id"], ["subject_profile_id"], "missing", "Pregnancy UI currently needs canonical persistence."),
  table("cycle_logs", "Women's Health", "userPrivate", ["owner_user_id"], ["subject_profile_id"], "missing", "Cycle storage appears UI/local typed; canonical table missing."),
  table("nutrition_logs", "Nutrition", "userPrivate", ["owner_user_id"], ["subject_profile_id"], "missing", "Food UI has local/services but no canonical migration."),
  table("meals", "Nutrition", "userPrivate", ["owner_user_id"], ["subject_profile_id"], "missing", "Needed for meal diary MVP."),
  table("fitness_exercises", "Fitness", "publicReference", [], [], "missing", "Active service references this table; migration not found."),
  table("fitness_workout_programs", "Fitness", "publicReference", [], [], "missing", "Active service references this table; migration not found."),
  table("fitness_workout_program_days", "Fitness", "publicReference", [], ["program_id"], "missing", "Active service references this table; migration not found."),
  table("fitness_goal_progressions", "Fitness", "publicReference", [], [], "missing", "Active service references this table; migration not found."),
  table("fitness_nutrition_templates", "Fitness/Nutrition", "publicReference", [], [], "missing", "Active service references this table; migration not found."),
  table("user_imported_plans", "Fitness/Nutrition AI import", "userPrivate", ["user_id"], ["profile_id"], "canonical", "Reviewed imported plans."),
  table("user_imported_plan_days", "Fitness/Nutrition AI import", "userPrivate", [], ["imported_plan_id"], "canonical", "Owned through imported plan."),
  table("user_plan_calendar_events", "Fitness/Calendar", "userPrivate", ["user_id"], ["imported_plan_id", "calendar_event_id"], "canonical", "Links imported plans to calendar events."),
  table("user_fitness_history", "Fitness", "userPrivate", ["user_id"], ["profile_id"], "canonical", "Fitness history foundation."),
  table("user_muscle_load_history", "Fitness", "userPrivate", ["user_id"], [], "canonical", "Muscle heatmap history."),
  table("ai_chat_sessions", "AI", "familyShared", ["created_by_user_id"], ["family_id"], "legacy", "Legacy AI family model; app-specific owner tables are safer."),
  table("ai_messages", "AI", "userPrivate", ["created_by_user_id"], ["session_id"], "legacy", "Legacy AI message model."),
  table("ai_actions", "AI", "familyShared", ["requested_by_user_id"], ["family_id", "session_id"], "legacy", "Raw AI action output may contain sensitive data."),
  table("app_ai_chats", "AI", "userPrivate", ["user_id"], [], "canonical", "Owner-only app AI chat model."),
  table("app_ai_messages", "AI", "userPrivate", ["user_id"], ["chat_id"], "canonical", "Owner-only app AI message model."),
  table("app_ai_imports", "AI Import", "userPrivate", ["user_id"], [], "canonical", "Review-first app AI import model."),
  table("healthsync_ai_sessions", "AI", "userPrivate", ["user_id"], [], "canonical", "HealthSync AI history model."),
  table("healthsync_ai_imports", "AI Import", "userPrivate", ["user_id"], ["session_id"], "canonical", "Reviewed import candidates."),
  table("ai_import_envelopes", "AI Import", "userPrivate", ["owner_user_id"], ["extraction_job_id"], "missing", "Canonical naming target; current equivalents are app_ai_imports and healthsync_ai_imports."),
  table("trusted_content", "Trusted Content", "publicReference", [], [], "missing", "Feature is static/client-side; canonical table missing."),
  table("content_sources", "Trusted Content", "publicReference", [], [], "missing", "Canonical source metadata table missing."),
  table("saved_content", "Trusted Content", "userPrivate", ["user_id"], ["content_id"], "missing", "Saved/read-later persistence missing."),
  table("audit_logs", "System", "systemPrivate", ["actor_user_id", "actor_profile_id"], ["family_id"], "canonical", "Metadata must avoid sensitive raw payloads."),
];

function table(
  tableName: string,
  featureArea: string,
  privacyClass: HealthOSTablePrivacyClass,
  ownerColumns: string[],
  relationColumns: string[],
  canonicalStatus: HealthOSTableCanonicalStatus,
  notes: string,
): HealthOSTableRegistryEntry {
  const sensitive = privacyClass !== "publicReference";
  return {
    tableName,
    featureArea,
    privacyClass,
    sensitive,
    ownerColumns,
    relationColumns,
    expectedRls: privacyClass !== "publicReference" || canonicalStatus !== "missing",
    storageDependency: tableName.includes("document") || tableName.includes("record_file"),
    exportApplies: sensitive,
    deleteApplies: sensitive,
    canonicalStatus,
    notes,
  };
}

export function getTableRegistryEntry(tableName: string) {
  return healthOSTableRegistry.find((entry) => entry.tableName === tableName);
}
