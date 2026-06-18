export type HealthOSAfterMvpComplexity = "low" | "medium" | "high" | "veryHigh";

export type HealthOSAfterMvpScopeItem = {
  readonly id: string;
  readonly feature: string;
  readonly reasonDeferred: string;
  readonly dependencies: readonly string[];
  readonly estimatedComplexity: HealthOSAfterMvpComplexity;
  readonly riskIfBuiltNow: string;
  readonly futureTrigger: string;
};

export const healthOSAfterMvpScope = [
  item("AMVP-001", "Full subscription billing", "Requires billing provider, entitlements, webhooks, refunds, and store policy review.", ["Product pricing", "Legal terms", "Billing provider"], "veryHigh", "Billing bugs can block store review and create support debt.", "Implement when MVP value is validated."),
  item("AMVP-002", "Full push notification backend", "Requires development build, push provider setup, scheduling backend, and delivery QA.", ["Reminder source model", "Notification preferences", "Device QA"], "high", "Premature push promises can fail silently on devices.", "Implement after reminder persistence is stable."),
  item("AMVP-003", "Caregiver billing/rates/payments", "Caregiver payments add marketplace, tax, dispute, and compliance complexity.", ["Caregiver access model", "Billing system", "Legal review"], "veryHigh", "Payment flows are risky before core caregiver permissions are stable.", "Revisit after caregiver care flows are proven."),
  item("AMVP-004", "Medical aid/pharmacy directory", "Requires third-party data source licensing and regional coverage decisions.", ["Vendor/source selection", "Content policy"], "high", "Poor data quality can create medical trust issues.", "Add after trusted source process exists."),
  item("AMVP-005", "Device integrations", "Apple Health/Health Connect and device sync need native build and permission QA.", ["Development build", "Health data model", "Privacy review"], "veryHigh", "Sensitive imports can pollute records without mapping/consent.", "Revisit after manual logs are stable."),
  item("AMVP-006", "Apple Health / Health Connect", "Native platform integration should follow device integration strategy.", ["Native build", "Device QA", "Privacy copy"], "veryHigh", "Platform permission mistakes are hard to debug and review.", "Implement as a dedicated native integration phase."),
  item("AMVP-007", "Advanced analytics/charts", "Requires stable data model and enough real user data.", ["Canonical health logs", "Chart components"], "medium", "Charts can imply precision from incomplete data.", "Add after real persistence and chart QA."),
  item("AMVP-008", "Automated data export/delete", "Edge functions exist, but full automation should follow final table/storage inventory.", ["Final schema", "Storage bucket map", "Legal review"], "high", "Incomplete export/delete violates user trust.", "Promote after schema scope is frozen."),
  item("AMVP-009", "Full content admin panel", "Admin workflows need roles, moderation, source tracking, and audit logs.", ["Trusted content schema", "Admin auth"], "high", "Unsafe content writes can expose unreviewed health advice.", "Build after trusted content MVP is defined."),
  item("AMVP-010", "Advanced AI history/search", "Searchable AI history needs privacy, retention, and indexing decisions.", ["AI import schema", "Retention policy"], "high", "AI content can contain sensitive health data.", "Add after AI review storage is stable."),
  item("AMVP-011", "Automated child age transfer", "Requires legal/product policy for child data ownership and guardian consent.", ["Legal decision", "Child account model"], "veryHigh", "Incorrect transfer can expose minors' data.", "Handle as its own compliance phase."),
  item("AMVP-012", "Multi-country medical content rules", "Jurisdiction-specific health content rules need editorial/legal process.", ["Trusted source policy", "Legal review"], "veryHigh", "Wrong regional guidance can create medical/legal risk.", "Add when expanding beyond initial market."),
  item("AMVP-013", "AI source verification pipeline", "Requires source retrieval, citation validation, and safety review workflow.", ["Trusted content schema", "AI safety policy"], "veryHigh", "False verification creates misplaced trust.", "Add after trusted content and AI review foundations are stable."),
  item("AMVP-014", "Offline sync", "Conflict resolution and health data sync are complex and high risk.", ["Canonical schema", "Audit model", "Conflict policy"], "veryHigh", "Bad merges can corrupt health records.", "Add after core online flows are reliable."),
] as const satisfies readonly HealthOSAfterMvpScopeItem[];

function item(
  id: string,
  feature: string,
  reasonDeferred: string,
  dependencies: readonly string[],
  estimatedComplexity: HealthOSAfterMvpComplexity,
  riskIfBuiltNow: string,
  futureTrigger: string,
): HealthOSAfterMvpScopeItem {
  return {
    id,
    feature,
    reasonDeferred,
    dependencies,
    estimatedComplexity,
    riskIfBuiltNow,
    futureTrigger,
  };
}

