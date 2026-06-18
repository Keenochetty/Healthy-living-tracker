import type {
  HealthOSContentFeedback,
  HealthOSContentReadHistory,
  HealthOSSavedContentItem,
  HealthOSSourceQuality,
  HealthOSTrustedContentBackendItem,
  HealthOSTrustedContentCategory,
  HealthOSTrustedContentRealm,
  HealthOSTrustedContentSourceModel,
  HealthOSTrustedContentTargeting,
  HealthOSTrustedContentType,
} from "./trustedContentTypes";

type Row = Record<string, any>;

const sourceQualityMap: Record<string, HealthOSSourceQuality> = {
  ai_generated: "aiGenerated",
  clinical_institution: "clinicalInstitution",
  official_health_authority: "officialHealthAuthority",
  peer_reviewed: "peerReviewed",
  registered_professional: "registeredProfessional",
  trusted_publisher: "trustedPublisher",
  user_saved: "userSaved",
};

const camelToSnake = (value: string) => value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
const toQuality = (value?: string | null): HealthOSSourceQuality => sourceQualityMap[value ?? ""] ?? (value as HealthOSSourceQuality) ?? "unknown";
const fromQuality = (value?: HealthOSSourceQuality) => {
  if (value === "aiGenerated") return "ai_generated";
  if (value === "clinicalInstitution") return "clinical_institution";
  if (value === "officialHealthAuthority") return "official_health_authority";
  if (value === "peerReviewed") return "peer_reviewed";
  if (value === "registeredProfessional") return "registered_professional";
  if (value === "trustedPublisher") return "trusted_publisher";
  if (value === "userSaved") return "user_saved";
  return value;
};
const toStatus = (value?: string | null) => (value === "needs_review" ? "needsReview" : value ?? "unknown");
const fromStatus = (value?: string) => (value === "needsReview" ? "needs_review" : value);
const toSaveType = (value?: string | null) => (value === "read_later" ? "readLater" : value === "user_link" ? "userLink" : value ?? "saved");
const fromSaveType = (value?: string) => (value === "readLater" ? "read_later" : value === "userLink" ? "user_link" : value);
const toAIStatus = (value?: string | null) => {
  if (value === "ai_summary_needs_review") return "aiSummaryNeedsReview";
  if (value === "ai_summary_reviewed") return "aiSummaryReviewed";
  if (value === "ai_generated_untrusted") return "aiGeneratedUntrusted";
  if (value === "not_ai") return "notAi";
  return "unknown";
};
const fromAIStatus = (value?: string) => {
  if (value === "aiSummaryNeedsReview") return "ai_summary_needs_review";
  if (value === "aiSummaryReviewed") return "ai_summary_reviewed";
  if (value === "aiGeneratedUntrusted") return "ai_generated_untrusted";
  if (value === "notAi") return "not_ai";
  return value;
};

export function mapTrustedSourceRowToSource(row: Row): HealthOSTrustedContentSourceModel {
  return {
    countryCode: row.country_code,
    createdAt: row.created_at,
    description: row.description,
    id: row.id,
    languageCode: row.language_code,
    medicalReviewProcess: row.medical_review_process,
    publisherName: row.publisher_name,
    sourceName: row.source_name,
    sourceQuality: toQuality(row.source_quality),
    sourceUrl: row.source_url,
    status: toStatus(row.status) as HealthOSTrustedContentSourceModel["status"],
    updatedAt: row.updated_at,
  };
}

export function mapTrustedContentRowToItem(row: Row): HealthOSTrustedContentBackendItem {
  return {
    aiSummaryStatus: toAIStatus(row.ai_summary_status),
    archivedAt: row.archived_at,
    authorName: row.author_name,
    category: (row.category ?? "general_health") as HealthOSTrustedContentCategory,
    contentType: (row.content_type ?? "article") as HealthOSTrustedContentType,
    countryCode: row.country_code,
    createdAt: row.created_at,
    id: row.id,
    imageUrl: row.image_url,
    languageCode: row.language_code,
    medicalReviewStatus: row.medical_review_status ?? "unknown",
    primaryRealm: (row.primary_realm ?? "health") as HealthOSTrustedContentRealm,
    publishedAt: row.published_at,
    publisherName: row.publisher_name,
    retrievedAt: row.retrieved_at,
    reviewedAt: row.reviewed_at,
    safetyDisclaimer: row.safety_disclaimer,
    sourceId: row.source_id,
    sourceQuality: toQuality(row.source_quality),
    sourceUrl: row.source_url,
    status: toStatus(row.status) as HealthOSTrustedContentBackendItem["status"],
    summary: row.summary,
    tags: row.tags ?? [],
    title: row.title,
    updatedAt: row.updated_at,
  };
}

export function mapTrustedContentTargetingRowToTargeting(row: Row): HealthOSTrustedContentTargeting {
  return {
    contentItemId: row.content_item_id,
    createdAt: row.created_at,
    id: row.id,
    priority: row.priority ?? 0,
    status: row.status ?? "active",
    targetContext: row.target_context,
    targetRealm: row.target_realm,
    updatedAt: row.updated_at,
  };
}

export function mapSavedContentRowToSavedItem(row: Row): HealthOSSavedContentItem {
  return {
    archivedAt: row.archived_at,
    contentItemId: row.content_item_id,
    createdAt: row.created_at,
    externalImageUrl: row.external_image_url,
    externalTitle: row.external_title,
    externalUrl: row.external_url,
    id: row.id,
    notes: row.notes,
    ownerUserId: row.owner_user_id,
    saveType: toSaveType(row.save_type) as HealthOSSavedContentItem["saveType"],
    updatedAt: row.updated_at,
  };
}

export function mapContentReadHistoryRowToHistory(row: Row): HealthOSContentReadHistory {
  return {
    contentItemId: row.content_item_id,
    createdAt: row.created_at,
    externalUrl: row.external_url,
    id: row.id,
    openedAt: row.opened_at,
    ownerUserId: row.owner_user_id,
    sourceRealm: row.source_realm,
  };
}

export function mapContentFeedbackRowToFeedback(row: Row): HealthOSContentFeedback {
  return {
    contentItemId: row.content_item_id,
    createdAt: row.created_at,
    feedbackType: toStatus(row.feedback_type) as HealthOSContentFeedback["feedbackType"],
    id: row.id,
    note: row.note,
    ownerUserId: row.owner_user_id,
  };
}

export function mapSavedContentToInsert(input: Partial<HealthOSSavedContentItem>) {
  return toRow(input);
}

export function mapReadHistoryToInsert(input: Partial<HealthOSContentReadHistory>) {
  return toRow(input);
}

export function mapContentFeedbackToInsert(input: Partial<HealthOSContentFeedback>) {
  return toRow(input);
}

export function toRow(input: Row): Row {
  const row: Row = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    row[camelToSnake(key)] = value;
  }
  if ("source_quality" in row) row.source_quality = fromQuality(row.source_quality);
  if ("status" in row) row.status = fromStatus(row.status);
  if ("save_type" in row) row.save_type = fromSaveType(row.save_type);
  if ("ai_summary_status" in row) row.ai_summary_status = fromAIStatus(row.ai_summary_status);
  if ("feedback_type" in row) row.feedback_type = fromStatus(row.feedback_type);
  return row;
}
