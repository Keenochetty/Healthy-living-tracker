export type TrustedSourceTier = "tier_1" | "tier_2" | "tier_3" | "disallowed";

export type TrustedSourceType =
  | "public_health_agency"
  | "medical_association"
  | "hospital_clinic"
  | "peer_reviewed_journal"
  | "official_label"
  | "clinical_guideline"
  | "patient_education"
  | "government"
  | "other";

export type TrustedSourceStatus =
  | "approved"
  | "needs_review"
  | "deprecated"
  | "blocked";

export type HealthContentRiskLevel = "low" | "medium" | "high" | "critical";

export type HealthContentStatus =
  | "draft"
  | "source_needed"
  | "review_needed"
  | "approved"
  | "published"
  | "expired"
  | "archived"
  | "blocked";

export type HealthContentRealm =
  | "nutrition"
  | "workout"
  | "biometrics"
  | "medication"
  | "supplements"
  | "womens_health"
  | "pregnancy"
  | "baby_child"
  | "mens_health"
  | "records"
  | "calendar"
  | "ai_assistant"
  | "general";

export type AgeGroupRelevance =
  | "adult"
  | "teen"
  | "child"
  | "baby"
  | "pregnancy"
  | "all";

export type TrustedSource = {
  clinicalReviewAvailable: boolean;
  country?: string;
  createdAt: string;
  id: string;
  lastSourceCheckedAt?: string;
  notes?: string;
  sourceName: string;
  sourceOrganization: string;
  sourceReviewCycleMonths: number;
  sourceTier: TrustedSourceTier;
  sourceType: TrustedSourceType;
  sourceUrl: string;
  specialty?: string;
  trustStatus: TrustedSourceStatus;
  updatedAt: string;
};

export type TrustedHealthContentCard = {
  ageGroup?: AgeGroupRelevance;
  approvedBy?: string;
  author?: string;
  changeSummary?: string;
  childRelevant: boolean;
  countryCodes?: string[];
  createdAt: string;
  createdBy?: string;
  disclaimerKey: string;
  emergencyRelevant: boolean;
  fullText: string;
  id: string;
  lastCheckedDate: string;
  medicalReviewer?: string;
  nextReviewDate: string;
  pregnancyRelevant: boolean;
  previousVersionId?: string;
  publishedDate?: string;
  realm: HealthContentRealm;
  regionNotes?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  riskLevel: HealthContentRiskLevel;
  shortSummary: string;
  sourceId: string;
  sourceOrganization: string;
  sourceUrl: string;
  status: HealthContentStatus;
  title: string;
  topicTags: string[];
  updatedAt: string;
  versionNumber: number;
};

export type HealthContentDisclaimer = {
  appliesToRealms: HealthContentRealm[];
  createdAt: string;
  id: string;
  key: string;
  riskLevels: HealthContentRiskLevel[];
  text: string;
  title: string;
  updatedAt: string;
};

export type HealthContentQualityCheck = {
  checkedAt: string;
  contentCardId: string;
  disclaimerAssigned: boolean;
  hasTrustedSource: boolean;
  id: string;
  medicalClaimFound: boolean;
  nextReviewDateExists: boolean;
  notes?: string;
  overallStatus: "pass" | "needs_review" | "blocked";
  plainLanguagePassed: boolean;
  riskLevelAssigned: boolean;
  sourceApproved: boolean;
  unsafeWordingFound: boolean;
};

export type HealthContentAuditLog = {
  action: string;
  actorUserId?: string;
  contentCardId?: string;
  createdAt: string;
  id: string;
  newValue?: Record<string, unknown>;
  previousValue?: Record<string, unknown>;
  sourceId?: string;
};
