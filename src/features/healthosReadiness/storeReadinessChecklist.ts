export type HealthOSStoreReadinessStatus =
  | "blocker"
  | "deferred"
  | "needsContent"
  | "needsImplementation"
  | "notApplicable"
  | "ready";

export type HealthOSStoreReadinessItem = {
  id: string;
  platform: "apple" | "google" | "shared";
  releaseBlocker: boolean;
  requirement: string;
  status: HealthOSStoreReadinessStatus;
};

export const healthOSStoreReadinessChecklist: HealthOSStoreReadinessItem[] = [
  shared("privacy-policy", "Privacy policy URL and final text", "blocker", true),
  shared("terms", "Terms/support/legal URLs", "blocker", true),
  shared("medical-disclaimer", "Medical disclaimer reviewed by qualified advisor", "needsContent", true),
  shared("account-deletion", "Account deletion and data deletion path verified end to end", "needsImplementation", true),
  shared("demo-account", "Reviewer demo/test account plan", "needsContent", true),
  shared("store-assets", "Icon, splash, screenshots, feature graphic, descriptions, keywords", "needsContent", true),
  shared("ai-disclosure", "AI output review-first behavior disclosed", "needsContent", true),
  shared("children-family-data", "Child/family data handling explained", "needsContent", true),
  apple("apple-health-claims", "Apple health claims and no-diagnosis review", "needsContent", true),
  apple("apple-privacy-labels", "Apple privacy nutrition labels", "needsContent", true),
  apple("apple-iap", "Subscription/IAP copy and Apple billing flow if paid later", "deferred", false),
  apple("apple-notifications", "Push/local notification purpose copy", "needsContent", true),
  google("google-health-declaration", "Google Play health apps declaration", "needsContent", true),
  google("google-data-safety", "Google Play Data Safety form categories", "needsContent", true),
  google("google-ads", "Ads status documented", "needsContent", true),
  google("google-billing", "Google Play Billing plan if paid later", "deferred", false),
  google("google-content-rating", "Content rating questionnaire", "needsContent", true),
];

function shared(id: string, requirement: string, status: HealthOSStoreReadinessStatus, releaseBlocker: boolean) {
  return item("shared", id, requirement, status, releaseBlocker);
}

function apple(id: string, requirement: string, status: HealthOSStoreReadinessStatus, releaseBlocker: boolean) {
  return item("apple", id, requirement, status, releaseBlocker);
}

function google(id: string, requirement: string, status: HealthOSStoreReadinessStatus, releaseBlocker: boolean) {
  return item("google", id, requirement, status, releaseBlocker);
}

function item(
  platform: HealthOSStoreReadinessItem["platform"],
  id: string,
  requirement: string,
  status: HealthOSStoreReadinessStatus,
  releaseBlocker: boolean,
): HealthOSStoreReadinessItem {
  return { id, platform, releaseBlocker, requirement, status };
}
