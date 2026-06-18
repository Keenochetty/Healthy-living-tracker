import type { HealthOSTrustedContentBackendItem, HealthOSTrustedContentRealm } from "./trustedContentTypes";

export function getTrustedContentDisclaimer(item?: Pick<HealthOSTrustedContentBackendItem, "category" | "safetyDisclaimer"> | null) {
  return item?.safetyDisclaimer ?? getCategorySafetyDisclaimer(item?.category);
}

export function getCategorySafetyDisclaimer(category?: string | null) {
  if (category === "medication" || category === "supplements") return "Review medication and supplement information with a healthcare professional.";
  if (category === "pregnancy") return "Pregnancy information is educational. Confirm concerns with a qualified healthcare professional.";
  if (category === "babyChild") return "Baby and child information is educational. Speak with a pediatric or healthcare professional for concerns.";
  if (category === "womensHealth") return "Women’s health information is educational and does not replace professional care.";
  if (category === "nutrition") return "Nutrition information is educational and does not prescribe medical diets.";
  if (category === "fitness") return "Fitness information is educational and does not prescribe injury, pregnancy, or rehabilitation plans.";
  return "This content is educational and does not replace professional medical advice.";
}

export function requiresProfessionalReviewCopy(category?: string | null) {
  return ["medication", "supplements", "pregnancy", "babyChild", "womensHealth", "nutrition", "fitness"].includes(category ?? "")
    ? getCategorySafetyDisclaimer(category)
    : null;
}

export function canShowContentInRealm(item: Pick<HealthOSTrustedContentBackendItem, "primaryRealm" | "status">, realm?: HealthOSTrustedContentRealm) {
  return (item.status === "published" || item.status === "active") && (!realm || item.primaryRealm === realm);
}

export function canShowContentInSharedContext(item: Pick<HealthOSTrustedContentBackendItem, "category" | "status">, hasExplicitPermission = false) {
  if (item.status !== "published" && item.status !== "active") return false;
  if (["medication", "pregnancy", "babyChild", "womensHealth"].includes(item.category)) return hasExplicitPermission;
  return true;
}

export function shouldShowOutdatedContentWarning(reviewedAt?: string | null, maxAgeMonths = 24) {
  if (!reviewedAt) return false;
  const reviewed = new Date(reviewedAt).getTime();
  return Number.isFinite(reviewed) && Date.now() - reviewed > maxAgeMonths * 30 * 24 * 60 * 60 * 1000;
}

export const getMissingReviewDateWarning = (reviewedAt?: string | null) =>
  reviewedAt ? null : "Review date is missing. Check the source before relying on this content.";
export const getAIContentWarning = (aiSummaryStatus?: string | null) =>
  aiSummaryStatus && aiSummaryStatus !== "notAi" ? "AI-generated or AI-summarized content requires review and is not official medical guidance." : null;
export const getExternalLinkWarning = (sourceUrl?: string | null) =>
  sourceUrl ? "External source link opens outside HealthOS. Check date, location, and relevance." : "External source link is missing.";
