import type {
  HealthOSContentFeedback,
  HealthOSSavedContentItem,
  HealthOSSourceQuality,
  HealthOSTrustedContentBackendItem,
  HealthOSTrustedContentCategory,
  HealthOSTrustedContentRealm,
  HealthOSTrustedContentType,
} from "./trustedContentTypes";

export type TrustedContentValidation = { errors: string[]; valid: boolean };

const sourceQualities: HealthOSSourceQuality[] = ["officialHealthAuthority", "clinicalInstitution", "peerReviewed", "registeredProfessional", "trustedPublisher", "manufacturer", "community", "userSaved", "aiGenerated", "unknown"];
const contentTypes: HealthOSTrustedContentType[] = ["article", "guide", "faq", "checklist", "recipe", "exerciseGuide", "sourceSummary", "safetyNotice", "questionPrompt", "externalLink", "video", "appEducation", "other"];
const categories: HealthOSTrustedContentCategory[] = ["generalHealth", "nutrition", "medication", "supplements", "fitness", "pregnancy", "babyChild", "womensHealth", "records", "family", "calendar", "mentalWellbeing", "safety", "appEducation", "other"];
const realms: HealthOSTrustedContentRealm[] = ["home", "health", "nutrition", "medication", "supplements", "fitness", "pregnancy", "babyChild", "womensHealth", "records", "family", "calendar", "ai", "scan", "settings", "general"];

const valid = (): TrustedContentValidation => ({ errors: [], valid: true });
const invalid = (message: string): TrustedContentValidation => ({ errors: [message], valid: false });

export const validateSourceQuality = (value?: string | null) => (sourceQualities.includes(value as HealthOSSourceQuality) ? valid() : invalid("Source quality is not supported."));
export const validateTrustedContentType = (value?: string | null) => (contentTypes.includes(value as HealthOSTrustedContentType) ? valid() : invalid("Content type is not supported."));
export const validateTrustedContentCategory = (value?: string | null) => (categories.includes(value as HealthOSTrustedContentCategory) ? valid() : invalid("Content category is not supported."));
export const validateTrustedContentRealm = (value?: string | null) => (realms.includes(value as HealthOSTrustedContentRealm) ? valid() : invalid("Content realm is not supported."));

export function validateExternalUrl(value?: string | null) {
  if (!value) return valid();
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? valid() : invalid("External URL must use HTTP or HTTPS.");
  } catch {
    return invalid("External URL is invalid.");
  }
}

export const validateImageUrl = validateExternalUrl;

export function validateSavedContent(input: Partial<HealthOSSavedContentItem>) {
  if (!input.contentItemId && !input.externalUrl) return invalid("Saved content requires a content item or external URL.");
  return validateExternalUrl(input.externalUrl);
}

export function validateContentFeedback(input: Partial<HealthOSContentFeedback>) {
  return input.contentItemId ? valid() : invalid("Feedback requires a content item.");
}

export function validateContentForPublishedFeed(input: Partial<HealthOSTrustedContentBackendItem>) {
  if (!input.title) return invalid("Published content requires a title.");
  if (!input.category) return invalid("Published content requires a category.");
  if (!input.sourceUrl && input.sourceQuality !== "userSaved") return invalid("Trusted health content should preserve a source URL or show a warning.");
  return valid();
}
