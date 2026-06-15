import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  ConsentCategoryConfig,
  ConsentRecord,
  ConsentStatus,
  ConsentType,
  DataDeletionRequest,
  DataExportRequest,
  PrivacyAuditAction,
  PrivacyAuditLog,
  PrivacyPolicyVersion,
} from "@/types/privacyCompliance";

const LOCAL_USER_ID = "local-user";
const LOCAL_PROFILE_ID = "local-profile";
const CONSENT_KEY = "family_health_phase23_consent_records";
const POLICY_KEY = "family_health_phase23_privacy_policy_versions";
const AUDIT_KEY = "family_health_phase23_privacy_audit_logs";
const EXPORT_KEY = "family_health_phase23_data_export_requests";
const DELETION_KEY = "family_health_phase23_data_deletion_requests";
const CURRENT_CONSENT_VERSION = "2026-06-05.phase23";

export const CONSENT_CATEGORIES: ConsentCategoryConfig[] = [
  {
    consentType: "health_data",
    description: "Stores information you choose to enter for health features.",
    isSensitive: false,
    title: "Health Data Processing",
    version: CURRENT_CONSENT_VERSION,
  },
  {
    consentType: "sensitive_health_data",
    description:
      "Protects sensitive health details such as symptoms, records, and biometric logs.",
    isSensitive: true,
    title: "Sensitive Health Data",
    version: CURRENT_CONSENT_VERSION,
  },
  {
    consentType: "womens_health",
    description:
      "Cycle, period, contraception, symptoms, and fertility-related data are private by default.",
    isSensitive: true,
    title: "Women’s Health",
    version: CURRENT_CONSENT_VERSION,
  },
  {
    consentType: "contraception",
    description:
      "Contraception notes and reminders are sensitive and private by default.",
    isSensitive: true,
    title: "Contraception",
    version: CURRENT_CONSENT_VERSION,
  },
  {
    consentType: "pregnancy",
    description: "Pregnancy information is sensitive and private by default.",
    isSensitive: true,
    title: "Pregnancy",
    version: CURRENT_CONSENT_VERSION,
  },
  {
    consentType: "baby_child",
    description:
      "Baby and child health information should only be shared with trusted people.",
    isSensitive: true,
    title: "Baby / Child",
    version: CURRENT_CONSENT_VERSION,
  },
  {
    consentType: "mens_health",
    description:
      "Men’s Health notes, fertility notes, and sexual health notes are sensitive and private by default.",
    isSensitive: true,
    title: "Men’s Health",
    version: CURRENT_CONSENT_VERSION,
  },
  {
    consentType: "medication_supplements",
    description:
      "Medication and supplement information is sensitive and should be checked with healthcare professionals when needed.",
    isSensitive: true,
    title: "Medication / Supplements",
    version: CURRENT_CONSENT_VERSION,
  },
  {
    consentType: "biometrics",
    description:
      "Biometric information such as weight, blood pressure, glucose, sleep, and symptoms is sensitive.",
    isSensitive: true,
    title: "Biometrics",
    version: CURRENT_CONSENT_VERSION,
  },
  {
    consentType: "records_documents",
    description:
      "Documents, prescriptions, lab results, scans, and clinic notes are sensitive.",
    isSensitive: true,
    title: "Records / Documents",
    version: CURRENT_CONSENT_VERSION,
  },
  {
    consentType: "ai_assistant",
    description:
      "Assistant data use is optional, draft-first, and consent-scoped.",
    isSensitive: true,
    title: "AI Assistant",
    version: CURRENT_CONSENT_VERSION,
  },
  {
    consentType: "device_sync",
    description:
      "Device sync is optional and imports only the data types you choose.",
    isSensitive: true,
    title: "Device Sync",
    version: CURRENT_CONSENT_VERSION,
  },
  {
    consentType: "notifications",
    description:
      "Notifications are optional; in-app reminders still work without device notifications.",
    isSensitive: false,
    title: "Notifications",
    version: CURRENT_CONSENT_VERSION,
  },
  {
    consentType: "family_sharing",
    description: "Family sharing is optional and can be revoked.",
    isSensitive: true,
    title: "Family Sharing",
    version: CURRENT_CONSENT_VERSION,
  },
  {
    consentType: "caregiver_access",
    description: "Caregivers only see the tasks and data you allow.",
    isSensitive: true,
    title: "Caregiver Access",
    version: CURRENT_CONSENT_VERSION,
  },
  {
    consentType: "analytics",
    description:
      "Analytics are reserved for later and must be opt-in if added.",
    isSensitive: false,
    title: "Analytics",
    version: CURRENT_CONSENT_VERSION,
  },
  {
    consentType: "marketing",
    description:
      "Marketing use is reserved for later and must be opt-in if added.",
    isSensitive: false,
    title: "Marketing",
    version: CURRENT_CONSENT_VERSION,
  },
];

export function getConsentVersion() {
  return CURRENT_CONSENT_VERSION;
}

export async function getConsentRecords(profileId?: string) {
  const records = await readJsonArray<ConsentRecord>(CONSENT_KEY);
  return records.filter(
    (record) =>
      !profileId || record.profileId === profileId || !record.profileId,
  );
}

export async function getConsentStatus(
  consentType: ConsentType,
  profileId = LOCAL_PROFILE_ID,
): Promise<ConsentStatus> {
  const records = await getConsentRecords(profileId);
  return (
    records.find((record) => record.consentType === consentType)?.status ??
    "not_requested"
  );
}

export async function grantConsent(
  consentType: ConsentType,
  sourceScreen = "privacy_center",
  metadata?: Record<string, unknown>,
  profileId = LOCAL_PROFILE_ID,
) {
  return saveConsentRecord({
    consentType,
    metadata,
    profileId,
    sourceScreen,
    status: "granted",
  });
}

export async function denyConsent(
  consentType: ConsentType,
  sourceScreen = "privacy_center",
  metadata?: Record<string, unknown>,
  profileId = LOCAL_PROFILE_ID,
) {
  return saveConsentRecord({
    consentType,
    metadata,
    profileId,
    sourceScreen,
    status: "denied",
  });
}

export async function revokeConsent(
  consentType: ConsentType,
  sourceScreen = "privacy_center",
  metadata?: Record<string, unknown>,
  profileId = LOCAL_PROFILE_ID,
) {
  return saveConsentRecord({
    consentType,
    metadata,
    profileId,
    sourceScreen,
    status: "revoked",
  });
}

export async function requireConsentForFeature(
  consentType: ConsentType,
  profileId = LOCAL_PROFILE_ID,
) {
  return getConsentStatus(consentType, profileId);
}

export async function hasRequiredConsent(
  consentType: ConsentType,
  profileId = LOCAL_PROFILE_ID,
) {
  return (await getConsentStatus(consentType, profileId)) === "granted";
}

export function hashConsentText(text: string) {
  let hash = 5381;
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) + hash) ^ text.charCodeAt(index);
  }
  return (hash >>> 0).toString(16);
}

export async function getPrivacyPolicy() {
  return getLatestDocument("privacy_policy");
}

export async function getTermsOfUse() {
  return getLatestDocument("terms");
}

export async function getMedicalDisclaimer() {
  return getLatestDocument("medical_disclaimer");
}

export async function createPrivacyPolicyVersion(
  input: Omit<PrivacyPolicyVersion, "createdAt" | "id" | "updatedAt">,
) {
  const now = new Date().toISOString();
  const document: PrivacyPolicyVersion = {
    ...input,
    createdAt: now,
    id: createId("privacy-document"),
    updatedAt: now,
  };
  const documents = await readJsonArray<PrivacyPolicyVersion>(POLICY_KEY);
  await writeJsonArray(POLICY_KEY, [document, ...documents]);
  return document;
}

export async function publishPrivacyPolicyVersion(id: string) {
  const documents = await readJsonArray<PrivacyPolicyVersion>(POLICY_KEY);
  const updated = documents.map((document) =>
    document.id === id
      ? {
          ...document,
          effectiveDate: document.effectiveDate ?? new Date().toISOString(),
          status: "published" as const,
          updatedAt: new Date().toISOString(),
        }
      : document,
  );
  await writeJsonArray(POLICY_KEY, updated);
  return updated.find((document) => document.id === id) ?? null;
}

export async function createFamilySharingConsent(
  metadata: Record<string, unknown>,
) {
  return grantConsent("family_sharing", "family_sharing_consent", metadata);
}

export async function createCaregiverAccessConsent(
  metadata: Record<string, unknown>,
) {
  return grantConsent("caregiver_access", "caregiver_access_consent", metadata);
}

export async function revokeFamilySharingConsent(
  metadata?: Record<string, unknown>,
) {
  return revokeConsent("family_sharing", "family_sharing_consent", metadata);
}

export async function revokeCaregiverAccessConsent(
  metadata?: Record<string, unknown>,
) {
  return revokeConsent(
    "caregiver_access",
    "caregiver_access_consent",
    metadata,
  );
}

export async function updateAssistantConsent(
  granted: boolean,
  metadata?: Record<string, unknown>,
) {
  return granted
    ? grantConsent("ai_assistant", "ai_consent", metadata)
    : denyConsent("ai_assistant", "ai_consent", metadata);
}

export async function revokeAssistantConsent(
  metadata?: Record<string, unknown>,
) {
  return revokeConsent("ai_assistant", "ai_consent", metadata);
}

export async function getAssistantConsentStatus() {
  return getConsentStatus("ai_assistant");
}

export async function updateDeviceSyncConsent(
  granted: boolean,
  metadata?: Record<string, unknown>,
) {
  return granted
    ? grantConsent("device_sync", "device_sync_consent", metadata)
    : denyConsent("device_sync", "device_sync_consent", metadata);
}

export async function revokeDeviceSyncConsent(
  metadata?: Record<string, unknown>,
) {
  return revokeConsent("device_sync", "device_sync_consent", metadata);
}

export async function createDataExportRequest(
  categories: string[],
  profileId?: string,
) {
  const requestedAt = new Date().toISOString();
  const request: DataExportRequest = {
    categories,
    id: createId("data-export"),
    profileId,
    requestedAt,
    status: "requested",
    userId: LOCAL_USER_ID,
  };
  const requests = await readJsonArray<DataExportRequest>(EXPORT_KEY);
  await writeJsonArray(EXPORT_KEY, [request, ...requests]);
  await createPrivacyAuditLog({
    action: "export_requested",
    metadata: { categories },
    targetProfileId: profileId,
  });
  return request;
}

export async function getDataExportRequests() {
  return readJsonArray<DataExportRequest>(EXPORT_KEY);
}

export async function generateJsonExportPlaceholder(requestId: string) {
  const requests = await readJsonArray<DataExportRequest>(EXPORT_KEY);
  const request = requests.find((item) => item.id === requestId);
  if (!request) return null;
  return JSON.stringify(
    {
      categories: request.categories,
      generatedAt: new Date().toISOString(),
      notice:
        "Placeholder export. Production export generation must be reviewed before release.",
      requestId,
    },
    null,
    2,
  );
}

export async function completeDataExportRequest(requestId: string) {
  const requests = await readJsonArray<DataExportRequest>(EXPORT_KEY);
  const completedAt = new Date().toISOString();
  const updated = requests.map((request) =>
    request.id === requestId
      ? { ...request, completedAt, status: "ready" as const }
      : request,
  );
  await writeJsonArray(EXPORT_KEY, updated);
  return updated.find((request) => request.id === requestId) ?? null;
}

export async function expireExportFile(requestId: string) {
  const requests = await readJsonArray<DataExportRequest>(EXPORT_KEY);
  const updated = requests.map((request) =>
    request.id === requestId
      ? {
          ...request,
          status: "expired" as const,
          expiresAt: new Date().toISOString(),
        }
      : request,
  );
  await writeJsonArray(EXPORT_KEY, updated);
}

export async function createDataDeletionRequest(
  input: Omit<DataDeletionRequest, "id" | "requestedAt" | "status" | "userId">,
) {
  const request: DataDeletionRequest = {
    ...input,
    id: createId("data-delete"),
    requestedAt: new Date().toISOString(),
    status: "requested",
    userId: LOCAL_USER_ID,
  };
  const requests = await readJsonArray<DataDeletionRequest>(DELETION_KEY);
  await writeJsonArray(DELETION_KEY, [request, ...requests]);
  await createPrivacyAuditLog({
    action: "delete_requested",
    metadata: {
      categories: input.categories,
      deletionType: input.deletionType,
    },
    targetProfileId: input.profileId,
  });
  return request;
}

export async function confirmDataDeletionRequest(id: string) {
  return updateDeletionRequest(id, {
    confirmedAt: new Date().toISOString(),
    status: "confirmed",
  });
}

export async function processDataDeletionPlaceholder(id: string) {
  return updateDeletionRequest(id, {
    completedAt: new Date().toISOString(),
    status: "completed",
  });
}

export async function cancelDataDeletionRequest(id: string) {
  return updateDeletionRequest(id, { status: "cancelled" });
}

export async function getDataDeletionRequests() {
  return readJsonArray<DataDeletionRequest>(DELETION_KEY);
}

export async function createPrivacyAuditLog(
  input: Omit<PrivacyAuditLog, "actorUserId" | "createdAt" | "id"> & {
    actorUserId?: string;
  },
) {
  const log: PrivacyAuditLog = {
    ...input,
    actorUserId: input.actorUserId ?? LOCAL_USER_ID,
    createdAt: new Date().toISOString(),
    id: createId("privacy-audit"),
  };
  const logs = await readJsonArray<PrivacyAuditLog>(AUDIT_KEY);
  await writeJsonArray(AUDIT_KEY, [log, ...logs]);
  return log;
}

export async function getPrivacyAuditLogs() {
  return readJsonArray<PrivacyAuditLog>(AUDIT_KEY);
}

async function saveConsentRecord(input: {
  consentType: ConsentType;
  metadata?: Record<string, unknown>;
  profileId?: string;
  sourceScreen?: string;
  status: ConsentStatus;
}) {
  const now = new Date().toISOString();
  const config = CONSENT_CATEGORIES.find(
    (item) => item.consentType === input.consentType,
  );
  const record: ConsentRecord = {
    consentTextHash: hashConsentText(config?.description ?? input.consentType),
    consentType: input.consentType,
    consentVersion: config?.version ?? CURRENT_CONSENT_VERSION,
    createdAt: now,
    grantedAt: input.status === "granted" ? now : undefined,
    id: createId("consent"),
    metadata: input.metadata,
    profileId: input.profileId,
    revokedAt: input.status === "revoked" ? now : undefined,
    sourceScreen: input.sourceScreen,
    status: input.status,
    updatedAt: now,
    userId: LOCAL_USER_ID,
  };
  const records = await readJsonArray<ConsentRecord>(CONSENT_KEY);
  await writeJsonArray(CONSENT_KEY, [
    record,
    ...records.filter(
      (item) =>
        !(
          item.consentType === record.consentType &&
          item.profileId === record.profileId
        ),
    ),
  ]);
  await createPrivacyAuditLog({
    action:
      input.status === "granted"
        ? "consent_granted"
        : input.status === "revoked"
          ? "consent_revoked"
          : "consent_denied",
    category: input.consentType,
    relatedId: record.id,
    targetProfileId: input.profileId,
    metadata: input.metadata,
  });
  return record;
}

async function getLatestDocument(
  documentType: PrivacyPolicyVersion["documentType"],
) {
  const stored = (await readJsonArray<PrivacyPolicyVersion>(POLICY_KEY)).find(
    (document) => document.documentType === documentType,
  );
  return stored ?? getDraftDocument(documentType);
}

function getDraftDocument(
  documentType: PrivacyPolicyVersion["documentType"],
): PrivacyPolicyVersion {
  const now = new Date().toISOString();
  const title =
    documentType === "privacy_policy"
      ? "Draft Privacy Policy"
      : documentType === "terms"
        ? "Draft Terms of Use"
        : "Medical Disclaimer";
  return {
    content:
      "Draft placeholder for legal review. Final version must be reviewed before public release.",
    createdAt: now,
    documentType,
    id: `draft-${documentType}`,
    status: "legal_review_needed",
    title,
    updatedAt: now,
    version: CURRENT_CONSENT_VERSION,
  };
}

async function updateDeletionRequest(
  id: string,
  partial: Partial<DataDeletionRequest>,
) {
  const requests = await readJsonArray<DataDeletionRequest>(DELETION_KEY);
  const updated = requests.map((request) =>
    request.id === id ? { ...request, ...partial } : request,
  );
  await writeJsonArray(DELETION_KEY, updated);
  return updated.find((request) => request.id === id) ?? null;
}

async function readJsonArray<T>(key: string): Promise<T[]> {
  const value = await AsyncStorage.getItem(key);
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJsonArray<T>(key: string, values: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(values));
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
