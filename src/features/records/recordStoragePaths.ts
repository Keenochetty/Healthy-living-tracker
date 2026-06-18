export const HEALTH_RECORDS_PRIVATE_BUCKET_ID = "health-records-private";
export const SIGNED_RECORD_FILE_URL_SECONDS = 60 * 5;

export type BuildRecordStoragePathInput = {
  ownerUserId: string;
  subjectCareProfileId?: string | null;
  recordId: string;
  fileId: string;
  fileName: string;
};

export function buildRecordStoragePath(input: BuildRecordStoragePathInput) {
  return [
    sanitizePathPart(input.ownerUserId),
    "records",
    sanitizePathPart(input.subjectCareProfileId ?? "self"),
    sanitizePathPart(input.recordId),
    `${sanitizePathPart(input.fileId)}-${sanitizeRecordFileName(input.fileName)}`,
  ].join("/");
}

export function parseRecordStoragePath(path: string) {
  const [ownerUserId, scope, subjectCareProfileId, recordId, fileName] = path.split("/");
  return {
    fileName: fileName ?? null,
    ownerUserId: ownerUserId ?? null,
    recordId: recordId ?? null,
    scope: scope ?? null,
    subjectCareProfileId: subjectCareProfileId ?? null,
  };
}

export function isRecordStoragePathOwnerScoped(path: string, ownerUserId: string) {
  const parsed = parseRecordStoragePath(path);
  return parsed.ownerUserId === ownerUserId && parsed.scope === "records" && Boolean(parsed.recordId && parsed.fileName);
}

export function sanitizeRecordFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "bin";
  const baseName =
    fileName
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "record-file";
  return `${baseName}.${extension.replace(/[^a-z0-9]+/g, "") || "bin"}`;
}

export function getSafeRecordFileDisplayName(fileName?: string | null) {
  return fileName?.trim() || "Private file";
}

export function hideRawRecordStoragePath() {
  return "Private file";
}

function sanitizePathPart(value: string) {
  return value.replace(/[^a-zA-Z0-9-_]+/g, "-").slice(0, 100) || "unknown";
}
