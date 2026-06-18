export type HealthOSMigrationBacklogType =
  | "createTable"
  | "addColumn"
  | "addIndex"
  | "addForeignKey"
  | "addRlsPolicy"
  | "addStoragePolicy"
  | "addView"
  | "addComment"
  | "dataBackfill"
  | "manualDecision";

export type HealthOSMigrationBacklogItem = {
  id: string;
  title: string;
  area: string;
  reason: string;
  migrationType: HealthOSMigrationBacklogType;
  destructive: boolean;
  releaseBlocker: boolean;
  recommendedBeforeMvp: boolean;
  dependsOn: string[];
  notes: string;
};

export const healthOSMigrationBacklog: HealthOSMigrationBacklogItem[] = [
  item("MVP-001", "Create canonical record_files table", "Records", "File metadata is split across legacy document models and storage helper metadata.", "createTable", false, true, true, [], "Use nullable/additive table only; do not move existing data in this phase."),
  item("MVP-002", "Create canonical record_links table", "Records", "Records need non-duplicating links to medication, pregnancy, baby/child, calendar, and health rows.", "createTable", false, true, true, ["MVP-001"], "Links should be optional until realm handlers are wired."),
  item("MVP-003", "Add reminder source columns", "Reminders", "Reminder rows should point to source_realm/source_table/source_row_id.", "addColumn", false, true, true, [], "Nullable columns only."),
  item("MVP-004", "Create reminder_history table", "Reminders", "Reminder delivery/action history is missing.", "createTable", false, false, true, ["MVP-003"], "Needed for reliable notification audit."),
  item("MVP-005", "Create nutrition logs and meals tables", "Nutrition", "Food/nutrition realm has active UI and services but no canonical persistence migration.", "createTable", false, true, true, [], "Use nutrition naming; keep food as route alias."),
  item("MVP-006", "Create pregnancy profile/log/checklist tables", "Pregnancy", "Pregnancy realm is UI-rich but lacks canonical Supabase persistence.", "createTable", false, true, true, [], "Start with pregnancy_profiles and pregnancy_logs."),
  item("MVP-007", "Create women health cycle tables", "Women's Health", "Cycle/women's health data is private and missing canonical tables.", "createTable", false, true, true, [], "Cycle logs, symptom logs, contraception logs, sex-day logs."),
  item("MVP-008", "Create supplement schedule/log tables", "Supplements", "Supplement realm should not rely on medication tables alone.", "createTable", false, false, true, [], "Can share medication scheduling primitives later."),
  item("MVP-009", "Create trusted content/source/saved tables", "Trusted Content", "Trusted content is currently static/client-side from this audit perspective.", "createTable", false, false, true, [], "Reference content can be public; saved content is user-private."),
  item("MVP-010", "Create fitness content reference tables", "Fitness", "Active service references fitness_exercises and workout program tables not found in migrations.", "createTable", false, true, true, [], "Reference tables require RLS public/auth read policies."),
  item("MVP-011", "Canonicalize private health storage buckets", "Storage", "Client helper references private buckets not all created in migrations.", "addStoragePolicy", false, true, true, [], "Define one bucket set and path policy before upload release."),
  item("MVP-012", "Tighten family medical RLS to explicit permissions", "Family/RLS", "Broad family membership policies remain for sensitive medical data.", "addRlsPolicy", false, true, true, ["MVP-013"], "Use Phase 23 permission keys."),
  item("MVP-013", "Finalize sharing permission table shape", "Family/RLS", "sharing_permissions has multiple legacy shapes across migrations.", "manualDecision", false, true, true, [], "Product decision required before RLS tightening."),
  item("POST-001", "Automated child age transfer", "Child", "13/18 transition ownership is not implemented.", "manualDecision", false, true, false, [], "Needs product/legal design."),
  item("POST-002", "Normalize profiles into care_profiles", "Profile", "Auth user, app profile, and care subject overlap.", "manualDecision", true, false, false, [], "Destructive only after migration/backfill plan."),
  item("POST-003", "Advanced device sync persistence", "Device Sync", "Device integrations are adapter/mock-based.", "createTable", false, false, false, [], "Defer until integrations are production-ready."),
];

function item(
  id: string,
  title: string,
  area: string,
  reason: string,
  migrationType: HealthOSMigrationBacklogType,
  destructive: boolean,
  releaseBlocker: boolean,
  recommendedBeforeMvp: boolean,
  dependsOn: string[],
  notes: string,
): HealthOSMigrationBacklogItem {
  return {
    id,
    title,
    area,
    reason,
    migrationType,
    destructive,
    releaseBlocker,
    recommendedBeforeMvp,
    dependsOn,
    notes,
  };
}
