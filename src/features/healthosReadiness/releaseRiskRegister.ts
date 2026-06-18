export type HealthOSReleaseRiskSeverity =
  | "critical blocker"
  | "deferred / after MVP"
  | "high"
  | "low"
  | "medium";

export type HealthOSReleaseRiskStatus =
  | "deferred"
  | "documented"
  | "needsFix"
  | "needsReview"
  | "notStarted";

export type HealthOSReleaseRisk = {
  area: string;
  fileOrRouteReference?: string;
  id: string;
  impact: string;
  recommendedFix: string;
  releaseBlocker: boolean;
  risk: string;
  severity: HealthOSReleaseRiskSeverity;
  status: HealthOSReleaseRiskStatus;
};

export const healthOSReleaseRiskRegister: HealthOSReleaseRisk[] = [
  risk("RISK-001", "Legal", "Privacy policy and terms are not final.", "Store submission and user trust blocker.", "Write and review final legal policies before release.", "critical blocker", "notStarted", true, "docs/HEALTHOS_PRIVACY_LEGAL_READINESS.md"),
  risk("RISK-002", "Account deletion", "Deletion flow needs end-to-end backend/device QA.", "Apple/Google policy risk.", "Verify account deletion and data deletion paths in a development build.", "critical blocker", "needsReview", true, "supabase/functions/delete-account"),
  risk("RISK-003", "Notifications", "Push/local notification behavior cannot be fully validated in Expo Go.", "Reminder reliability and store QA risk.", "Test notification permissions, private lock-screen display, scheduling, and tap routing in development builds.", "high", "documented", true, "src/services/reminders/notificationService.ts"),
  risk("RISK-004", "AI", "AI backend must stay server-side and review-first.", "Privacy and medical safety risk.", "Verify no client API keys and all imports require review before save.", "high", "needsReview", true, "supabase/functions/ai-chat"),
  risk("RISK-005", "Records", "Secure file upload/viewer flow is not final.", "Sensitive document handling risk.", "Finalize private storage, signed URL expiry, and viewer fallback.", "high", "needsFix", true, "src/components/healthos/records"),
  risk("RISK-006", "Performance", "Some growing lists still use ScrollView/map.", "Slow-device freeze risk with large data.", "Virtualize AI messages, records, reminders, trusted content, and long timelines before production scale.", "medium", "documented", false, "src/components/ai/AiAssistantSheet.tsx"),
  risk("RISK-007", "Store assets", "Store assets and reviewer plan are missing.", "Submission cannot proceed.", "Prepare icon, screenshots, descriptions, data forms, and demo account plan.", "critical blocker", "notStarted", true),
  risk("RISK-008", "Subscriptions", "Subscription UI exists but billing is not implemented.", "Misleading monetization and store policy risk if exposed as paid.", "Keep copy as placeholder or implement platform billing before release.", "high", "documented", true, "src/app/settings/subscription.tsx"),
  risk("RISK-009", "Device permissions", "Camera/photos/biometrics/notifications need denied-state device QA.", "Crash or dead-end risk.", "Run denied, limited, unavailable, and settings-return scenarios.", "medium", "documented", false),
  risk("RISK-010", "Health claims", "Health copy needs professional review.", "Store rejection and safety risk.", "Review all health, medication, pregnancy, child, AI, and fitness copy.", "high", "documented", true),
];

function risk(
  id: string,
  area: string,
  risk: string,
  impact: string,
  recommendedFix: string,
  severity: HealthOSReleaseRiskSeverity,
  status: HealthOSReleaseRiskStatus,
  releaseBlocker: boolean,
  fileOrRouteReference?: string,
): HealthOSReleaseRisk {
  return { area, fileOrRouteReference, id, impact, recommendedFix, releaseBlocker, risk, severity, status };
}
