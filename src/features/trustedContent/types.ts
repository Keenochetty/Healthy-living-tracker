export type HealthOSTrustedContentCategory =
  | "generalHealth"
  | "nutrition"
  | "medication"
  | "supplements"
  | "fitness"
  | "pregnancy"
  | "babyChild"
  | "womensHealth"
  | "records"
  | "family"
  | "calendar"
  | "mentalWellbeing"
  | "safety"
  | "appEducation"
  | "other";

export type HealthOSTrustedContentType =
  | "article"
  | "guide"
  | "faq"
  | "checklist"
  | "recipe"
  | "exerciseGuide"
  | "sourceSummary"
  | "safetyNotice"
  | "questionPrompt"
  | "externalLink"
  | "video"
  | "appEducation"
  | "other";

export type HealthOSSourceQuality =
  | "officialHealthAuthority"
  | "clinicalInstitution"
  | "peerReviewed"
  | "registeredProfessional"
  | "trustedPublisher"
  | "manufacturer"
  | "community"
  | "userSaved"
  | "aiGenerated"
  | "unknown";

export type HealthOSTrustedContentRealm =
  | "home"
  | "health"
  | "nutrition"
  | "medication"
  | "supplements"
  | "fitness"
  | "pregnancy"
  | "babyChild"
  | "womensHealth"
  | "records"
  | "family"
  | "calendar"
  | "ai"
  | "scan"
  | "settings"
  | "general";

export type HealthOSTrustedContentSafetyFlag =
  | "medicalDisclaimer"
  | "medicationReview"
  | "pregnancyReview"
  | "childReview"
  | "allergyReview"
  | "diabeticReview"
  | "emergencyCare"
  | "sourceNeedsReview"
  | "notMedicalAdvice"
  | "countrySpecific";

export type HealthOSTrustedContentSource = {
  accessDate?: string;
  author?: string;
  imageUrl?: string;
  licenseLabel?: string;
  publishedAt?: string;
  publisher?: string;
  reviewedBy?: string;
  sourceId: string;
  sourceName: string;
  sourceQuality: HealthOSSourceQuality;
  sourceUrl?: string;
  updatedAt?: string;
};

export type HealthOSTrustedContentItem = {
  authorName?: string;
  categories: HealthOSTrustedContentCategory[];
  contentType: HealthOSTrustedContentType;
  countryRelevance?: string[];
  id: string;
  imageAlt?: string;
  imageUrl?: string;
  language?: string;
  medicalDisclaimerRequired: boolean;
  publishedAt?: string;
  readLater?: boolean;
  readStatus?: "read" | "reading" | "unread";
  readingTimeLabel?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  routeTarget?: string;
  safetyFlags?: HealthOSTrustedContentSafetyFlag[];
  saved?: boolean;
  source: HealthOSTrustedContentSource;
  summary?: string;
  targetRealms: HealthOSTrustedContentRealm[];
  title: string;
  topicChips?: string[];
  updatedAt?: string;
};

export type HealthOSTrustedContentFilterKey =
  | "all"
  | HealthOSTrustedContentCategory
  | "saved"
  | "needsReview"
  | "officialSources"
  | "recentlyUpdated";

export type HealthOSSourceQualitySummary = {
  label: string;
  quality: HealthOSSourceQuality;
  total: number;
};
