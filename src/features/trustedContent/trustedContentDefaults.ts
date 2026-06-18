import type {
  HealthOSContentFeedback,
  HealthOSContentReadHistory,
  HealthOSSavedContentItem,
  HealthOSTrustedContentBackendItem,
  HealthOSTrustedContentSourceModel,
} from "./trustedContentTypes";

export const TRUSTED_CONTENT_EDUCATIONAL_DISCLAIMER =
  "This content is educational and does not replace professional medical advice.";

export function defaultTrustedContentSource(sourceName = "Unknown source"): HealthOSTrustedContentSourceModel {
  return { sourceName, sourceQuality: "unknown", status: "needsReview" };
}

export function defaultTrustedContentItem(title = "Untitled content"): HealthOSTrustedContentBackendItem {
  return {
    aiSummaryStatus: "notAi",
    category: "generalHealth",
    contentType: "article",
    medicalReviewStatus: "unknown",
    primaryRealm: "health",
    safetyDisclaimer: TRUSTED_CONTENT_EDUCATIONAL_DISCLAIMER,
    sourceQuality: "unknown",
    status: "draft",
    tags: [],
    title,
  };
}

export const defaultSavedContentItem = (): HealthOSSavedContentItem => ({ saveType: "saved" });
export const defaultReadHistory = (): HealthOSContentReadHistory => ({ openedAt: new Date().toISOString() });
export const defaultContentFeedback = (contentItemId: string): HealthOSContentFeedback => ({ contentItemId, feedbackType: "unknown" });
