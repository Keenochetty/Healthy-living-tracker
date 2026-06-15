export type AssistantMode =
  | "general_health"
  | "quick_logger"
  | "food_logger"
  | "workout_logger"
  | "calendar_helper"
  | "records_helper"
  | "medication_supplement"
  | "womens_health"
  | "pregnancy"
  | "baby_child"
  | "mens_health"
  | "family_caregiver";

export type AssistantActionType =
  | "answer"
  | "create_draft_log"
  | "create_draft_reminder"
  | "create_draft_note"
  | "summarize"
  | "search_records"
  | "prepare_questions"
  | "extract_document_draft"
  | "blocked";

export type AssistantRiskCategory =
  | "low_risk"
  | "sensitive_health"
  | "medication_supplement"
  | "pregnancy"
  | "baby_child"
  | "emergency_or_urgent"
  | "blocked_medical_advice";

export type AssistantDraftStatus =
  | "draft"
  | "confirmed"
  | "cancelled"
  | "edited";

export type AssistantDataCategory =
  | "nutrition"
  | "workout"
  | "biometrics"
  | "womens_health"
  | "pregnancy"
  | "baby_child"
  | "medication_supplements"
  | "records"
  | "mens_health"
  | "calendar";

export type AssistantSettings = {
  allowedDataCategories: AssistantDataCategory[];
  assistantEnabled: boolean;
  conversationHistoryEnabled: boolean;
  createdAt: string;
  id: string;
  profileId: string;
  quickLoggingEnabled: boolean;
  sensitiveCategoryConsent: Partial<Record<AssistantDataCategory, boolean>>;
  updatedAt: string;
  userId: string;
};

export type AssistantConversation = {
  createdAt: string;
  id: string;
  isDeleted: boolean;
  mode: AssistantMode;
  profileId: string;
  title: string;
  updatedAt: string;
  userId: string;
};

export type AssistantMessage = {
  contentEncrypted?: string;
  contentSummary?: string;
  conversationId: string;
  createdAt: string;
  id: string;
  mode: AssistantMode;
  profileId: string;
  riskCategory: AssistantRiskCategory;
  role: "user" | "assistant" | "system";
  userId: string;
};

export type AssistantDraft = {
  actionType: AssistantActionType;
  confirmedAt?: string;
  createdAt: string;
  draftPayload: Record<string, unknown>;
  id: string;
  mode: AssistantMode;
  profileId: string;
  status: AssistantDraftStatus;
  targetRealm: string;
  updatedAt: string;
  userId: string;
};

export type AssistantAuditLog = {
  actionType: AssistantActionType;
  assistantMode: AssistantMode;
  confirmedByUser: boolean;
  createdAt: string;
  createdDraftIds?: string[];
  dataCategoriesAccessed: AssistantDataCategory[];
  id: string;
  profileId: string;
  relatedRecordIds?: string[];
  userId: string;
};

export type AssistantSourceCard = {
  createdAt?: string;
  id: string;
  lastCheckedDate?: string;
  reviewedDate?: string;
  sourceOrganization: string;
  sourceUrl: string;
  summary?: string;
  title: string;
  updatedAt?: string;
};

export type AssistantRequestResult = {
  actionType: AssistantActionType;
  draft?: AssistantDraft;
  message: string;
  riskCategory: AssistantRiskCategory;
  safetyFooter: string;
  sourceCards: AssistantSourceCard[];
};
