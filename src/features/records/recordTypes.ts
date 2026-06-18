export type HealthOSRecordsBackendStatus =
  | "idle"
  | "loading"
  | "ready"
  | "missingAuth"
  | "missingTable"
  | "storageDeferred"
  | "deferred"
  | "error";

export type HealthOSRecordsServiceResult<T> = {
  data: T | null;
  error: string | null;
  status: HealthOSRecordsBackendStatus;
};

export type HealthOSRecordCategory =
  | "prescription"
  | "medicationLabel"
  | "supplementLabel"
  | "doctorNote"
  | "labReport"
  | "vaccineCard"
  | "pregnancyDocument"
  | "babyChildDocument"
  | "medicalAid"
  | "scanUpload"
  | "generalHealth"
  | "other";

export type HealthOSRecordSourceType =
  | "manual"
  | "scan"
  | "documentPicker"
  | "gallery"
  | "aiImport"
  | "linkedRealm";

export type HealthOSRecordReviewStatus =
  | "draft"
  | "needsReview"
  | "reviewed"
  | "saved"
  | "archived"
  | "rejected";

export type HealthOSRecordPrivacyScope =
  | "private"
  | "selected"
  | "caregiverLimited"
  | "emergency";

export type HealthOSRecordFileStatus =
  | "metadataOnly"
  | "pendingUpload"
  | "uploaded"
  | "failed"
  | "archived";

export type HealthOSRecordLinkedRealm =
  | "records"
  | "medication"
  | "supplements"
  | "pregnancy"
  | "babyChild"
  | "womensHealth"
  | "calendar"
  | "health"
  | "aiImport";

export type HealthOSRecord = {
  id?: string;
  ownerUserId: string;
  subjectCareProfileId?: string | null;
  title: string;
  category: HealthOSRecordCategory;
  sourceType: HealthOSRecordSourceType;
  reviewStatus: HealthOSRecordReviewStatus;
  privacyScope: HealthOSRecordPrivacyScope;
  documentDate?: string | null;
  expiresAt?: string | null;
  notes?: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type HealthOSRecordFile = {
  id?: string;
  recordId: string;
  ownerUserId: string;
  bucketId: string;
  storagePath?: string | null;
  originalFileName?: string | null;
  displayName?: string | null;
  contentType?: string | null;
  fileSizeBytes?: number | null;
  uploadStatus: HealthOSRecordFileStatus;
  checksumSha256?: string | null;
  metadata: Record<string, unknown>;
  uploadedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type HealthOSRecordLink = {
  id?: string;
  recordId: string;
  ownerUserId: string;
  linkedRealm: HealthOSRecordLinkedRealm;
  linkedEntityId?: string | null;
  linkLabel?: string | null;
  metadata: Record<string, unknown>;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type HealthOSRecordExtraction = {
  id?: string;
  recordId: string;
  recordFileId?: string | null;
  ownerUserId: string;
  sourceType: HealthOSRecordSourceType;
  reviewStatus: HealthOSRecordReviewStatus;
  extractedFields: Record<string, unknown>;
  warnings: string[];
  confidence?: number | null;
  modelLabel?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type HealthOSEmergencyPacketItem = {
  id?: string;
  ownerUserId: string;
  subjectCareProfileId?: string | null;
  recordId?: string | null;
  itemType: string;
  label?: string | null;
  sortOrder: number;
  isEnabled: boolean;
  metadata: Record<string, unknown>;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type HealthOSRecordCreateInput = {
  subjectCareProfileId?: string | null;
  title: string;
  category?: HealthOSRecordCategory;
  sourceType?: HealthOSRecordSourceType;
  reviewStatus?: HealthOSRecordReviewStatus;
  privacyScope?: HealthOSRecordPrivacyScope;
  documentDate?: string | null;
  expiresAt?: string | null;
  notes?: string | null;
  tags?: string[];
  metadata?: Record<string, unknown>;
};

export type HealthOSRecordUpdateInput = Partial<
  Omit<HealthOSRecordCreateInput, "sourceType">
> & {
  reviewStatus?: HealthOSRecordReviewStatus;
};

export type HealthOSRecordFileCreateInput = {
  recordId: string;
  bucketId?: string;
  storagePath?: string | null;
  originalFileName?: string | null;
  displayName?: string | null;
  contentType?: string | null;
  fileSizeBytes?: number | null;
  uploadStatus?: HealthOSRecordFileStatus;
  checksumSha256?: string | null;
  metadata?: Record<string, unknown>;
};

export type HealthOSRecordLinkCreateInput = {
  recordId: string;
  linkedRealm: HealthOSRecordLinkedRealm;
  linkedEntityId?: string | null;
  linkLabel?: string | null;
  metadata?: Record<string, unknown>;
};

export type HealthOSRecordExtractionCreateInput = {
  recordId: string;
  recordFileId?: string | null;
  sourceType?: HealthOSRecordSourceType;
  reviewStatus?: HealthOSRecordReviewStatus;
  extractedFields?: Record<string, unknown>;
  warnings?: string[];
  confidence?: number | null;
  modelLabel?: string | null;
};

export type HealthOSEmergencyPacketItemCreateInput = {
  subjectCareProfileId?: string | null;
  recordId?: string | null;
  itemType?: string;
  label?: string | null;
  sortOrder?: number;
  isEnabled?: boolean;
  metadata?: Record<string, unknown>;
};
