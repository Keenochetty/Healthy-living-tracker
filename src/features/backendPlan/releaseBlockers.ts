export type HealthOSReleaseBlockerCategory =
  | "schema"
  | "rls"
  | "storage"
  | "auth"
  | "privacy"
  | "ai"
  | "records"
  | "family"
  | "child"
  | "notifications"
  | "legal"
  | "store"
  | "performance"
  | "unknown";

export type HealthOSReleaseBlockerStatus =
  | "open"
  | "planned"
  | "blocked"
  | "fixed"
  | "deferred";

export type HealthOSReleaseBlocker = {
  readonly id: string;
  readonly category: HealthOSReleaseBlockerCategory;
  readonly title: string;
  readonly description: string;
  readonly impact: string;
  readonly requiredBeforeMvp: boolean;
  readonly requiredBeforeStore: boolean;
  readonly recommendedFix: string;
  readonly sourceDocs: readonly string[];
  readonly status: HealthOSReleaseBlockerStatus;
};

export const healthOSReleaseBlockers = [
  blocker("RB-001", "schema", "Generated database types missing", "No generated Supabase database.types.ts was found.", "Services can drift from migrations and miss table/column errors.", true, true, "Generate database types after migrations are finalized and wire the Supabase client to the generated Database type.", ["HEALTHOS_DATABASE_TYPES_AUDIT.md"], "planned"),
  blocker("RB-002", "rls", "Sensitive table RLS incomplete or unknown", "Several sensitive realm tables are missing or have policies that still need explicit review.", "Health data could be over-shared if UI writes are connected too early.", true, true, "Implement owner, guardian, explicit permission, and caregiver-scoped policies before writes.", ["HEALTHOS_RLS_POLICY_AUDIT.md", "HEALTHOS_SCHEMA_GAP_REPORT.md"], "open"),
  blocker("RB-003", "storage", "Records storage policy not canonical", "Private record files need canonical buckets, metadata, and signed URL behavior.", "Records and scan uploads cannot be safely released.", true, true, "Add record_files metadata and align storage object policies to owner/permission metadata.", ["HEALTHOS_STORAGE_POLICY_AUDIT.md", "HEALTHOS_SCHEMA_GAP_REPORT.md"], "open"),
  blocker("RB-004", "records", "Record files and record links missing", "record_files and record_links are planned targets but not implemented.", "Records cannot reliably link to medication, pregnancy, child, calendar, and AI imports.", true, true, "Create additive records metadata/link tables before connecting writes.", ["HEALTHOS_MIGRATION_BACKLOG.md"], "planned"),
  blocker("RB-005", "family", "Family permissions incomplete", "sharing_permissions needs final shape and enforcement for sensitive medical data.", "Broad family membership is too coarse for health records.", true, true, "Finalize permission keys and enforce explicit sharing before shared medical access.", ["HEALTHOS_FAMILY_SHARING_PERMISSIONS.md", "HEALTHOS_DATA_MODEL_ALIGNMENT_MAP.md"], "blocked"),
  blocker("RB-006", "child", "Child ownership and age transition incomplete", "Child data ownership/transfer at age thresholds is not implemented.", "Legal/product risk for child-managed health data.", false, true, "Define legal/product transition rules before store release if child accounts are in scope.", ["HEALTHOS_SCHEMA_GAP_REPORT.md"], "blocked"),
  blocker("RB-007", "ai", "AI import review persistence incomplete", "AI output has multiple persistence models and needs canonical review envelopes/events.", "AI-created plans cannot safely save into health realms.", true, true, "Implement ai_extraction_jobs, ai_import_envelopes, and ai_review_events or formally scope AI saves out.", ["HEALTHOS_AI_IMPORT_CONTRACT_PHASE_16.md", "HEALTHOS_SCHEMA_NORMALIZATION_PHASE_24.md"], "planned"),
  blocker("RB-008", "notifications", "Reminder source/history missing", "Reminders lack canonical source tracing and reminder history.", "Medication/calendar/AI reminders cannot be audited reliably.", true, true, "Add reminder source columns and reminder_history before connecting reminder writes.", ["HEALTHOS_MIGRATION_BACKLOG.md"], "planned"),
  blocker("RB-009", "privacy", "Privacy/legal release copy needs final review", "Health claims, AI safety, data handling, export/delete behavior, and terms links need final review.", "Store review and user trust risk.", true, true, "Run privacy/legal readiness review after backend scope is fixed.", ["HEALTHOS_PRIVACY_LEGAL_READINESS.md", "HEALTHOS_EXPORT_DELETE_READINESS.md"], "open"),
  blocker("RB-010", "auth", "Account export/delete automation not fully proven", "Edge functions exist, but full end-to-end export/delete readiness remains documented as a readiness area.", "Account deletion/export commitments may not match actual coverage.", true, true, "Validate all user-owned tables and storage objects are included before release.", ["HEALTHOS_EXPORT_DELETE_READINESS.md"], "planned"),
  blocker("RB-011", "notifications", "Push backend requires later development-build work", "Push tokens exist, but full push notification backend is not MVP-ready.", "Reminder delivery cannot be promised as production push until implemented.", false, true, "Keep push as after-MVP or clearly mark as local/in-app until backend exists.", ["HEALTHOS_NOTIFICATIONS_REMINDER_CENTER_PHASE_19.md"], "deferred"),
  blocker("RB-012", "store", "Subscription billing not implemented", "Subscription/backend entitlement behavior is not production billing.", "Paid plan claims cannot ship without billing backend.", false, true, "Defer subscriptions or implement billing in a later backend phase.", ["HEALTHOS_MVP_BACKEND_SCOPE.md"], "deferred"),
  blocker("RB-013", "schema", "Persistent realm schemas missing", "Nutrition, pregnancy, cycle, supplements, and trusted content tables are missing or incomplete.", "Visible persistent screens may write nowhere or rely on placeholders.", true, true, "Either implement MVP tables or keep those screens as honest placeholders.", ["HEALTHOS_SCHEMA_GAP_REPORT.md"], "open"),
  blocker("RB-014", "performance", "Backend QA sequence not executed", "RLS/manual checks, storage checks, and device QA still need execution after implementation.", "Release behavior may differ from plan.", true, true, "Run the release QA phase after migrations/services are implemented.", ["HEALTHOS_PERFORMANCE_DEVICE_STORE_READINESS_PHASE_22.md"], "planned"),
] as const satisfies readonly HealthOSReleaseBlocker[];

function blocker(
  id: string,
  category: HealthOSReleaseBlockerCategory,
  title: string,
  description: string,
  impact: string,
  requiredBeforeMvp: boolean,
  requiredBeforeStore: boolean,
  recommendedFix: string,
  sourceDocs: readonly string[],
  status: HealthOSReleaseBlockerStatus,
): HealthOSReleaseBlocker {
  return {
    id,
    category,
    title,
    description,
    impact,
    requiredBeforeMvp,
    requiredBeforeStore,
    recommendedFix,
    sourceDocs,
    status,
  };
}

