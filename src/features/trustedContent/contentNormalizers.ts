import type {
  HealthContentRealm,
  HealthContentRiskLevel,
  TrustedHealthContentCard,
  TrustedSource,
  TrustedSourceTier,
  TrustedSourceType,
} from "@/types/trustedContent";

import { safetyFlagsForCategories } from "./safetyDisclaimers";
import type {
  HealthOSSourceQuality,
  HealthOSTrustedContentCategory,
  HealthOSTrustedContentItem,
  HealthOSTrustedContentRealm,
  HealthOSTrustedContentSource,
} from "./types";

export function normalizeTrustedContentCard(
  card: TrustedHealthContentCard,
  source?: TrustedSource,
  state?: Pick<HealthOSTrustedContentItem, "readLater" | "readStatus" | "saved">,
): HealthOSTrustedContentItem {
  const category = mapRealmToCategory(card.realm);
  const sourceModel = normalizeTrustedSource(card, source);
  const safetyFlags = safetyFlagsForCategories([category]);
  if (card.riskLevel === "high" || card.riskLevel === "critical") {
    safetyFlags.push("medicalDisclaimer");
  }
  if (card.emergencyRelevant) safetyFlags.push("emergencyCare");
  if (!source) safetyFlags.push("sourceNeedsReview");

  return {
    authorName: card.author,
    categories: [category],
    contentType: inferContentType(card.topicTags),
    countryRelevance: card.countryCodes,
    id: card.id,
    language: "en",
    medicalDisclaimerRequired:
      card.riskLevel !== "low" || safetyFlags.includes("medicalDisclaimer"),
    publishedAt: card.publishedDate,
    readLater: state?.readLater ?? false,
    readStatus: state?.readStatus ?? "unread",
    readingTimeLabel: estimateReadingTime(card.shortSummary),
    reviewedAt: card.reviewedDate,
    reviewedBy: card.reviewedBy ?? card.medicalReviewer,
    routeTarget: "/trusted-content",
    safetyFlags: Array.from(new Set(safetyFlags)),
    saved: state?.saved ?? false,
    source: sourceModel,
    summary: card.shortSummary,
    targetRealms: [mapRealmToTargetRealm(card.realm)],
    title: card.title,
    topicChips: card.topicTags,
    updatedAt: card.updatedAt,
  };
}

export function normalizeTrustedSource(
  card: TrustedHealthContentCard,
  source?: TrustedSource,
): HealthOSTrustedContentSource {
  return {
    accessDate: card.lastCheckedDate,
    author: card.author,
    publisher: source?.sourceOrganization ?? card.sourceOrganization,
    reviewedBy: card.reviewedBy ?? card.medicalReviewer,
    sourceId: card.sourceId,
    sourceName: source?.sourceOrganization ?? card.sourceOrganization,
    sourceQuality: source
      ? mapSourceQuality(source.sourceTier, source.sourceType)
      : "unknown",
    sourceUrl: source?.sourceUrl ?? card.sourceUrl,
    updatedAt: source?.updatedAt ?? card.updatedAt,
  };
}

export function mapRealmToTargetRealm(
  realm: HealthContentRealm,
): HealthOSTrustedContentRealm {
  switch (realm) {
    case "ai_assistant":
      return "ai";
    case "baby_child":
      return "babyChild";
    case "womens_health":
      return "womensHealth";
    case "workout":
      return "fitness";
    case "general":
    case "biometrics":
    case "mens_health":
      return "health";
    default:
      return realm;
  }
}

export function mapRealmToCategory(
  realm: HealthContentRealm,
): HealthOSTrustedContentCategory {
  switch (realm) {
    case "ai_assistant":
      return "appEducation";
    case "baby_child":
      return "babyChild";
    case "biometrics":
    case "general":
    case "mens_health":
      return "generalHealth";
    case "womens_health":
      return "womensHealth";
    case "workout":
      return "fitness";
    default:
      return realm;
  }
}

function mapSourceQuality(
  tier: TrustedSourceTier,
  type: TrustedSourceType,
): HealthOSSourceQuality {
  if (tier === "disallowed") return "unknown";
  switch (type) {
    case "public_health_agency":
    case "government":
    case "clinical_guideline":
      return "officialHealthAuthority";
    case "hospital_clinic":
      return "clinicalInstitution";
    case "peer_reviewed_journal":
      return "peerReviewed";
    case "medical_association":
      return "registeredProfessional";
    case "official_label":
      return "manufacturer";
    case "patient_education":
      return "trustedPublisher";
    default:
      return tier === "tier_1" || tier === "tier_2"
        ? "trustedPublisher"
        : "unknown";
  }
}

function inferContentType(tags: string[]) {
  if (tags.some((tag) => tag.toLowerCase().includes("recipe"))) {
    return "recipe" as const;
  }
  if (tags.some((tag) => tag.toLowerCase().includes("check"))) {
    return "checklist" as const;
  }
  return "article" as const;
}

function estimateReadingTime(summary: string) {
  const words = summary.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 180))} min read`;
}

export function riskNeedsReview(risk: HealthContentRiskLevel) {
  return risk === "high" || risk === "critical";
}
