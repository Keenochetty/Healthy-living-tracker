export type ConsentType =
  | "health_data"
  | "sensitive_health_data"
  | "womens_health"
  | "contraception"
  | "pregnancy"
  | "baby_child"
  | "mens_health"
  | "medication_supplements"
  | "biometrics"
  | "records_documents"
  | "ai_assistant"
  | "device_sync"
  | "notifications"
  | "family_sharing"
  | "caregiver_access"
  | "analytics"
  | "marketing";

export type ConsentStatus = "not_requested" | "granted" | "denied" | "revoked";

export type PrivacyAuditAction =
  | "consent_granted"
  | "consent_denied"
  | "consent_revoked"
  | "data_shared"
  | "data_unshared"
  | "caregiver_access_granted"
  | "caregiver_access_revoked"
  | "export_requested"
  | "delete_requested"
  | "ai_data_accessed"
  | "device_sync_enabled"
  | "device_sync_disabled"
  | "sensitive_record_viewed"
  | "permission_changed";

export interface ConsentRecord {
  id: string;
  userId: string;
  profileId?: string;
  consentType: ConsentType;
  status: ConsentStatus;
  consentVersion: string;
  consentTextHash?: string;
  sourceScreen?: string;
  grantedAt?: string;
  revokedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PrivacyPolicyVersion {
  id: string;
  documentType: "privacy_policy" | "terms" | "medical_disclaimer";
  version: string;
  title: string;
  content: string;
  status:
    | "draft"
    | "legal_review_needed"
    | "approved"
    | "published"
    | "archived";
  effectiveDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrivacyAuditLog {
  id: string;
  actorUserId: string;
  targetUserId?: string;
  targetProfileId?: string;
  action: PrivacyAuditAction;
  category?: ConsentType;
  relatedId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface DataExportRequest {
  id: string;
  userId: string;
  profileId?: string;
  categories: string[];
  status: "requested" | "processing" | "ready" | "failed" | "expired";
  fileUrl?: string;
  requestedAt: string;
  completedAt?: string;
  expiresAt?: string;
}

export interface DataDeletionRequest {
  id: string;
  userId: string;
  profileId?: string;
  deletionType:
    | "module"
    | "profile"
    | "ai_history"
    | "device_sync"
    | "records"
    | "full_account";
  categories?: string[];
  status:
    | "requested"
    | "confirmed"
    | "processing"
    | "completed"
    | "cancelled"
    | "failed";
  requestedAt: string;
  confirmedAt?: string;
  completedAt?: string;
}

export type ConsentCategoryConfig = {
  consentType: ConsentType;
  description: string;
  isSensitive: boolean;
  title: string;
  version: string;
};
