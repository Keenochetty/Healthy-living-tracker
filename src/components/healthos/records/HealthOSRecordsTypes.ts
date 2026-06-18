import type {
  HealthRecord,
  HealthRecordReminder,
  HealthRecordType,
  RecordsOverviewSummary,
} from "@/types/healthRecords";

export type HealthOSRecordCategory =
  | "prescription"
  | "medicationLabel"
  | "supplementLabel"
  | "doctorNote"
  | "labReport"
  | "vaccineCard"
  | "pregnancy"
  | "babyChild"
  | "medicalAid"
  | "insurance"
  | "appointment"
  | "emergency"
  | "other";

export type HealthOSRecordSource =
  | "camera"
  | "gallery"
  | "documentPicker"
  | "manual"
  | "aiImport"
  | "linkedRealm"
  | "unknown";

export type HealthOSRecordReviewStatus =
  | "saved"
  | "needsReview"
  | "reviewed"
  | "linked"
  | "shared"
  | "archived";

export type HealthOSRecordPrivacyStatus =
  | "private"
  | "sharedSelected"
  | "caregiverLimited"
  | "unknown";

export type HealthOSRecordLinkedRealm =
  | "medication"
  | "supplements"
  | "pregnancy"
  | "babyChild"
  | "calendar"
  | "family"
  | "health"
  | "nutrition"
  | "fitness"
  | "general";

export type HealthOSRecordDisplay = {
  category: HealthOSRecordCategory;
  createdAt?: string;
  dateLabel?: string;
  fileType?: string;
  id: string;
  linkedRealms: HealthOSRecordLinkedRealm[];
  original: HealthRecord;
  privacyStatus: HealthOSRecordPrivacyStatus;
  reviewStatus: HealthOSRecordReviewStatus;
  source: HealthOSRecordSource;
  title: string;
  type: HealthRecordType;
};

export type HealthOSRecordCategorySummary = {
  category: HealthOSRecordCategory;
  count: number;
  label: string;
  types: HealthRecordType[];
};

export type HealthOSRecordContentItem = {
  id: string;
  publishedAt?: string;
  sourceName: string;
  sourceUrl: string;
  summary: string;
  title: string;
  topic: string;
};

export type HealthOSRecordsData = {
  activeFilters: HealthOSRecordCategory[];
  categories: HealthOSRecordCategorySummary[];
  contentPreview: HealthOSRecordContentItem[];
  emergencyPacketSummary: {
    count: number;
    status: string;
  };
  emptyState: string | null;
  error: string | null;
  linkedRecords: HealthOSRecordDisplay[];
  loading: boolean;
  privacyStatus: HealthOSRecordPrivacyStatus;
  recentRecords: HealthOSRecordDisplay[];
  recordHistory: Array<{ id: string; label: string; timestamp?: string }>;
  records: HealthOSRecordDisplay[];
  recordsByCategory: Partial<Record<HealthOSRecordCategory, HealthOSRecordDisplay[]>>;
  reviewQueue: HealthOSRecordDisplay[];
  searchQuery: string;
  sharingSummary: {
    sharedCount: number;
    status: string;
  };
  summary: RecordsOverviewSummary | null;
  uploadStatus: string;
  reminders: HealthRecordReminder[];
};
