import { supabase } from "@/lib/supabase";
import { createPrivacyAuditLog } from "@/lib/privacyComplianceStorage";

export type PrivateHealthFileRealm =
  | "records"
  | "baby"
  | "medication"
  | "supplements"
  | "pregnancy"
  | "food"
  | "ai_temp";

export type PrivateHealthBucket =
  | "health-records-private"
  | "profile-avatars"
  | "food-images"
  | "baby-records-private"
  | "medication-labels-private"
  | "supplement-labels-private"
  | "pregnancy-records-private"
  | "ai-temp-uploads";

export type PrivateHealthFileInput = {
  bucket: PrivateHealthBucket;
  bytes: ArrayBuffer | Blob | Uint8Array;
  contentType: string;
  fileName: string;
  profileId: string;
  realm: PrivateHealthFileRealm;
  recordId: string;
  userId: string;
};

export type PrivateFileMetadata = {
  bucket: PrivateHealthBucket;
  contentType: string;
  originalFileName: string;
  path: string;
  profileId: string;
  realm: PrivateHealthFileRealm;
  recordId: string;
  sanitizedFileName: string;
  uploadedByUserId: string;
};

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "pdf", "webp"]);
const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const SIGNED_URL_EXPIRY_SECONDS = 60 * 5;

export async function uploadPrivateHealthFile(input: PrivateHealthFileInput) {
  const validation = validatePrivateHealthFile(input);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  const metadata = buildPrivateFileMetadata(input);
  const { data, error } = await supabase.storage
    .from(input.bucket)
    .upload(metadata.path, input.bytes, {
      contentType: input.contentType,
      upsert: false,
    });

  if (error) {
    throw new Error("Could not upload private file.");
  }

  await createPrivacyAuditLog({
    action: "sensitive_record_viewed",
    category: "records_documents",
    metadata: {
      bucket: input.bucket,
      operation: "upload_private_health_file",
      pathScope: describePrivateFilePath(metadata.path),
      realm: input.realm,
      recordId: input.recordId,
    },
    targetProfileId: input.profileId,
  });

  return { data, metadata };
}

export async function getPrivateFileSignedUrl({
  bucket,
  path,
  profileId,
  recordId,
}: {
  bucket: PrivateHealthBucket;
  path: string;
  profileId: string;
  recordId?: string;
}) {
  const allowed = await validateFileAccessPermission({
    bucket,
    path,
    profileId,
    recordId,
  });
  if (!allowed) {
    throw new Error("You do not have permission to view this file.");
  }

  return generateShortLivedSignedUrl({ bucket, path, profileId, recordId });
}

export async function generateShortLivedSignedUrl({
  bucket,
  path,
  profileId,
  recordId,
}: {
  bucket: PrivateHealthBucket;
  path: string;
  profileId: string;
  recordId?: string;
}) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_EXPIRY_SECONDS);

  if (error) {
    throw new Error("Could not create a private file link.");
  }

  await createPrivacyAuditLog({
    action: "sensitive_record_viewed",
    category: "records_documents",
    metadata: {
      bucket,
      expiresInSeconds: SIGNED_URL_EXPIRY_SECONDS,
      operation: "private_file_signed_url",
      pathScope: describePrivateFilePath(path),
      recordId,
    },
    targetProfileId: profileId,
  });

  return data.signedUrl;
}

export async function deletePrivateHealthFile({
  bucket,
  path,
  profileId,
  recordId,
}: {
  bucket: PrivateHealthBucket;
  path: string;
  profileId: string;
  recordId?: string;
}) {
  const allowed = await validateFileAccessPermission({
    bucket,
    path,
    profileId,
    recordId,
  });
  if (!allowed) {
    throw new Error("You do not have permission to delete this file.");
  }

  const { data, error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    throw new Error("Could not delete private file.");
  }

  return data;
}

export async function listPrivateFilesForRecord({
  bucket,
  profileId,
  realm,
  recordId,
  userId,
}: {
  bucket: PrivateHealthBucket;
  profileId: string;
  realm: PrivateHealthFileRealm;
  recordId: string;
  userId: string;
}) {
  const prefix = `${sanitizePathPart(userId)}/${sanitizePathPart(profileId)}/${realm}/${sanitizePathPart(recordId)}`;
  const allowed = await validateFileAccessPermission({
    bucket,
    path: prefix,
    profileId,
    recordId,
  });
  if (!allowed) {
    throw new Error("You do not have permission to list these files.");
  }

  const { data, error } = await supabase.storage.from(bucket).list(prefix);
  if (error) {
    throw new Error("Could not list private files.");
  }

  return data;
}

export async function validateFileAccessPermission({
  path,
  profileId,
}: {
  bucket: PrivateHealthBucket;
  path: string;
  profileId: string;
  recordId?: string;
}) {
  // Client-side validation is a convenience gate only. Production access must be
  // enforced by storage.objects RLS and, for server-created URLs, Edge Functions.
  return Boolean(
    profileId && path.includes(`/${sanitizePathPart(profileId)}/`),
  );
}

export function validatePrivateHealthFile(
  input: Pick<PrivateHealthFileInput, "bytes" | "contentType" | "fileName">,
) {
  const extension = getFileExtension(input.fileName);
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return {
      reason: "Unsupported file type. Use jpg, jpeg, png, pdf, or webp.",
      valid: false,
    };
  }
  if (!ALLOWED_CONTENT_TYPES.has(input.contentType)) {
    return { reason: "Unsupported content type.", valid: false };
  }
  const size = getByteLength(input.bytes);
  if (size > MAX_FILE_SIZE_BYTES) {
    return { reason: "File is too large. Maximum size is 10MB.", valid: false };
  }
  return { valid: true };
}

export function buildPrivateFileMetadata(
  input: Omit<PrivateHealthFileInput, "bytes">,
): PrivateFileMetadata {
  const sanitizedFileName = sanitizeFileName(input.fileName);
  return {
    bucket: input.bucket,
    contentType: input.contentType,
    originalFileName: input.fileName,
    path: [
      sanitizePathPart(input.userId),
      sanitizePathPart(input.profileId),
      input.realm,
      sanitizePathPart(input.recordId),
      sanitizedFileName,
    ].join("/"),
    profileId: input.profileId,
    realm: input.realm,
    recordId: input.recordId,
    sanitizedFileName,
    uploadedByUserId: input.userId,
  };
}

export function sanitizeFileName(fileName: string) {
  const extension = getFileExtension(fileName);
  const baseName =
    fileName
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "file";
  return `${baseName}.${extension}`;
}

function sanitizePathPart(value: string) {
  return value.replace(/[^a-zA-Z0-9-_]+/g, "-").slice(0, 100);
}

function describePrivateFilePath(path: string) {
  const parts = path.split("/").filter(Boolean);
  return {
    depth: parts.length,
    ownerScoped: parts.length >= 2,
    realm: parts[2] ?? "unknown",
  };
}

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function getByteLength(bytes: ArrayBuffer | Blob | Uint8Array) {
  if (bytes instanceof Uint8Array) return bytes.byteLength;
  if (bytes instanceof ArrayBuffer) return bytes.byteLength;
  return bytes.size;
}
