export type HealthOSModelAlias = {
  aliasKey: string;
  canonicalKey: string;
  activeRouteAliases: string[];
  tableAliases: string[];
  status: "activeAlias" | "legacy" | "duplicate" | "unclear";
  recommendation: string;
};

export const healthOSModelAliases: HealthOSModelAlias[] = [
  alias("food", "nutrition", ["/food", "/(tabs)/food"], ["nutrition_logs", "meals"], "activeAlias", "Keep food as route language; use nutrition for canonical tables."),
  alias("circle", "family", ["/circle", "/(tabs)/circle"], ["families", "family_members", "family_memberships"], "activeAlias", "Keep Circle as UI label if desired; use family_circles/family_circle_members as target naming."),
  alias("baby-child", "babyChild", ["/baby-child", "/child"], ["children", "activity_logs"], "activeAlias", "Keep route aliases; normalize baby/child data around child profiles and child logs."),
  alias("cycle", "womensHealth", ["/cycle"], ["cycle_logs"], "activeAlias", "Use women's health as realm and cycle as a subdomain/table prefix."),
  alias("notifications", "reminders", ["/settings/notifications", "/reminders"], ["notifications", "reminders"], "duplicate", "Model reminders as scheduled source records and notifications as delivery/events."),
  alias("profile", "settings/account", ["/profile/[profileId]", "/settings"], ["profiles", "user_settings", "profile_settings"], "duplicate", "Separate auth account, app profile, and care subject in target model."),
  alias("documents", "records", ["/records"], ["documents", "medical_documents", "record_files"], "legacy", "Use records + record_files + record_links as canonical model."),
  alias("articles", "trustedContent", ["/trusted-content"], ["trusted_content", "content_sources", "saved_content"], "activeAlias", "Use trusted content for canonical health articles/source metadata."),
  alias("ai_extractions", "aiImport", ["/ai/import-review"], ["app_ai_imports", "healthsync_ai_imports", "ai_import_envelopes"], "duplicate", "Use AI import envelope/review event terminology going forward."),
];

function alias(
  aliasKey: string,
  canonicalKey: string,
  activeRouteAliases: string[],
  tableAliases: string[],
  status: HealthOSModelAlias["status"],
  recommendation: string,
): HealthOSModelAlias {
  return {
    aliasKey,
    canonicalKey,
    activeRouteAliases,
    tableAliases,
    status,
    recommendation,
  };
}
