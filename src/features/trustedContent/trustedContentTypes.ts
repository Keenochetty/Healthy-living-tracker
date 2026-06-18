export * from "./types";

import type {
  HealthOSSourceQuality,
  HealthOSTrustedContentCategory,
  HealthOSTrustedContentRealm,
  HealthOSTrustedContentType,
} from "./types";

export type HealthOSTrustedContentBackendStatus =
  | "idle"
  | "loading"
  | "ready"
  | "missingAuth"
  | "missingTable"
  | "adminDeferred"
  | "sourceMissing"
  | "deferred"
  | "error";

export type HealthOSTrustedContentServiceResult<T> = {
  data: T | null;
  deferredReason?: string;
  error: string | null;
  status: HealthOSTrustedContentBackendStatus;
};

export type HealthOSTrustedContentSourceModel = {
  countryCode?: string | null;
  createdAt?: string;
  description?: string | null;
  id?: string;
  languageCode?: string | null;
  medicalReviewProcess?: string | null;
  publisherName?: string | null;
  sourceName: string;
  sourceQuality: HealthOSSourceQuality;
  sourceUrl?: string | null;
  status: "active" | "needsReview" | "archived" | "blocked";
  updatedAt?: string;
};

export type HealthOSTrustedContentBackendItem = {
  aiSummaryStatus: "notAi" | "aiSummaryNeedsReview" | "aiSummaryReviewed" | "aiGeneratedUntrusted" | "unknown";
  archivedAt?: string | null;
  authorName?: string | null;
  category: HealthOSTrustedContentCategory;
  contentType: HealthOSTrustedContentType;
  countryCode?: string | null;
  createdAt?: string;
  id?: string;
  imageUrl?: string | null;
  languageCode?: string | null;
  medicalReviewStatus: string;
  primaryRealm: HealthOSTrustedContentRealm;
  publishedAt?: string | null;
  publisherName?: string | null;
  retrievedAt?: string | null;
  reviewedAt?: string | null;
  safetyDisclaimer?: string | null;
  sourceId?: string | null;
  sourceQuality: HealthOSSourceQuality;
  sourceUrl?: string | null;
  status: "draft" | "published" | "active" | "needsReview" | "archived" | "blocked" | "unknown";
  summary?: string | null;
  tags: string[];
  title: string;
  updatedAt?: string;
};

export type HealthOSTrustedContentTargeting = {
  contentItemId: string;
  createdAt?: string;
  id?: string;
  priority: number;
  status: "active" | "archived";
  targetContext?: string | null;
  targetRealm: HealthOSTrustedContentRealm;
  updatedAt?: string;
};

export type HealthOSSavedContentItem = {
  archivedAt?: string | null;
  contentItemId?: string | null;
  createdAt?: string;
  externalImageUrl?: string | null;
  externalTitle?: string | null;
  externalUrl?: string | null;
  id?: string;
  notes?: string | null;
  ownerUserId?: string;
  saveType: "saved" | "readLater" | "favorite" | "userLink" | "dismissed" | "hidden" | "unknown";
  updatedAt?: string;
};

export type HealthOSContentReadHistory = {
  contentItemId?: string | null;
  createdAt?: string;
  externalUrl?: string | null;
  id?: string;
  openedAt: string;
  ownerUserId?: string;
  sourceRealm?: HealthOSTrustedContentRealm | null;
};

export type HealthOSContentFeedback = {
  contentItemId: string;
  createdAt?: string;
  feedbackType: "helpful" | "notRelevant" | "outdated" | "hardToUnderstand" | "reported" | "savedByMistake" | "unknown";
  id?: string;
  note?: string | null;
  ownerUserId?: string;
};
