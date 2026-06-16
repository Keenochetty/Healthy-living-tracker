import { supabase } from "@/lib/supabase";

import type {
  AiImportStatus,
  AiImportTarget,
  AiSessionStatus,
  AiStructuredResult,
  HealthSyncAiImport,
  HealthSyncAiSession,
} from "./types";

type CreateAiSessionInput = {
  activeProfileId?: string | null;
  result: AiStructuredResult;
  status?: AiSessionStatus;
};

type ListAiSessionsParams = {
  activeProfileId?: string | null;
  limit?: number;
  status?: AiSessionStatus;
};

type UpdateAiSessionStatusParams = {
  sessionId: string;
  status: AiSessionStatus;
};

type CreateAiImportInput = {
  appRecordId?: string | null;
  errorMessage?: string | null;
  sessionId: string;
  status?: AiImportStatus;
  target: AiImportTarget;
  targetRoute?: string | null;
};

const AUTH_REQUIRED_MESSAGE =
  "Sign in to save HealthSync AI history. Guest drafts are not synced.";

async function getAuthenticatedUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);
  if (!data.user?.id) throw new Error(AUTH_REQUIRED_MESSAGE);

  return data.user.id;
}

function assertStructuredResult(result: AiStructuredResult) {
  if (!result || typeof result !== "object") {
    throw new Error("Cannot save an empty AI result.");
  }

  if (!result.title?.trim() || !result.type || !result.source) {
    throw new Error("Cannot save an incomplete AI result.");
  }

  if (!Array.isArray(result.import_targets)) {
    throw new Error("Cannot save an AI result without import targets.");
  }
}

function statusTimestamps(status: AiSessionStatus) {
  const now = new Date().toISOString();

  return {
    dismissed_at: status === "dismissed" ? now : null,
    imported_at: status === "imported" ? now : null,
  };
}

export async function createAiSession({
  activeProfileId = null,
  result,
  status = "draft",
}: CreateAiSessionInput): Promise<HealthSyncAiSession> {
  assertStructuredResult(result);

  const userId = await getAuthenticatedUserId();
  const timestamps = statusTimestamps(status);

  const { data, error } = await supabase
    .from("healthsync_ai_sessions")
    .insert({
      active_profile_id: activeProfileId,
      confidence: result.confidence ?? null,
      import_targets: result.import_targets,
      raw_text: result.raw_text ?? null,
      result_type: result.type,
      source: result.source,
      status,
      structured_result: result,
      summary: result.summary ?? null,
      title: result.title.trim(),
      user_id: userId,
      ...timestamps,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as HealthSyncAiSession;
}

export async function listAiSessions({
  activeProfileId,
  limit = 25,
  status,
}: ListAiSessionsParams = {}): Promise<HealthSyncAiSession[]> {
  const userId = await getAuthenticatedUserId();
  const safeLimit = Math.max(1, Math.min(limit, 100));

  let query = supabase
    .from("healthsync_ai_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (activeProfileId === null) {
    query = query.is("active_profile_id", null);
  } else if (activeProfileId) {
    query = query.eq("active_profile_id", activeProfileId);
  }

  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return (data ?? []) as HealthSyncAiSession[];
}

export async function updateAiSessionStatus({
  sessionId,
  status,
}: UpdateAiSessionStatusParams): Promise<void> {
  const userId = await getAuthenticatedUserId();
  const timestamps = statusTimestamps(status);

  const { error } = await supabase
    .from("healthsync_ai_sessions")
    .update({
      dismissed_at: timestamps.dismissed_at,
      imported_at: timestamps.imported_at,
      status,
    })
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function deleteAiSession(sessionId: string): Promise<void> {
  const userId = await getAuthenticatedUserId();

  const { error } = await supabase
    .from("healthsync_ai_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function createAiImport({
  appRecordId = null,
  errorMessage = null,
  sessionId,
  status = "pending",
  target,
  targetRoute = null,
}: CreateAiImportInput): Promise<void> {
  const userId = await getAuthenticatedUserId();

  const { error } = await supabase.from("healthsync_ai_imports").insert({
    app_record_id: appRecordId,
    error_message: errorMessage,
    session_id: sessionId,
    status,
    target,
    target_route: targetRoute,
    user_id: userId,
  });

  if (error) throw new Error(error.message);
}

export async function listAiImportsForSession(
  sessionId: string,
): Promise<HealthSyncAiImport[]> {
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("healthsync_ai_imports")
    .select("*")
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as HealthSyncAiImport[];
}
