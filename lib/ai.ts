import { supabase } from "@/lib/supabase";

export const aiQuickActions = [
  "Add appointment",
  "Log child activity",
  "Show today's updates",
  "Create caregiver instruction",
  "Find emergency contact",
  "Add medication reminder",
  "Explain notification colours"
] as const;

export type AiQuickAction = (typeof aiQuickActions)[number];
export type AiSender = "user" | "assistant" | "system";
export type AiActionStatus = "draft" | "confirmed" | "completed" | "cancelled" | "failed";

export type AiChatSession = {
  id: string;
  profile_id: string;
  family_id: string | null;
  title: string | null;
  created_at: string;
};

export type AiMessage = {
  id: string;
  session_id: string;
  sender: AiSender;
  message: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type AiAction = {
  id: string;
  session_id: string;
  profile_id: string;
  action_type: string;
  action_payload: Record<string, unknown> | null;
  status: AiActionStatus;
  created_at: string;
};

export type LocalAiMessage = {
  id: string;
  sender: AiSender;
  message: string;
};

function cleanText(value: string) {
  return value.trim();
}

function makeLocalId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createLocalAiMessage(sender: AiSender, message: string): LocalAiMessage {
  return {
    id: makeLocalId(),
    message,
    sender
  };
}

export function getSafeAiPlaceholderResponse(input: string) {
  const safeInput = cleanText(input);

  if (!safeInput) {
    return "I can help with a safe summary or draft action. OpenAI tools are not connected yet.";
  }

  return `Safe summary placeholder: I noted "${safeInput}". I can draft an in-app action, but I will not diagnose, expose sensitive details, or contact anyone yet.`;
}

export function getQuickActionPlaceholder(action: AiQuickAction) {
  return `Safe ${action.toLowerCase()} placeholder created. Review details before confirming anything.`;
}

export async function getOrCreateAiChatSession(profileId: string | null | undefined, familyId?: string | null) {
  if (!profileId) {
    throw new Error("Sign in before using the assistant.");
  }

  const { data: existingSession, error: existingError } = await supabase
    .from("ai_chat_sessions")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existingSession) {
    return existingSession as AiChatSession;
  }

  const { data, error } = await supabase
    .from("ai_chat_sessions")
    .insert({
      family_id: familyId ?? null,
      profile_id: profileId,
      title: "Assistant chat"
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as AiChatSession;
}

export async function createAiMessage(sessionId: string, sender: AiSender, message: string, metadata = {}) {
  const safeMessage = cleanText(message);

  if (!safeMessage) {
    throw new Error("Message cannot be empty.");
  }

  const { data, error } = await supabase
    .from("ai_messages")
    .insert({
      message: safeMessage,
      metadata,
      sender,
      session_id: sessionId
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as AiMessage;
}

export async function createAiAction(
  sessionId: string,
  profileId: string,
  actionType: string,
  actionPayload: Record<string, unknown> = {},
  status: AiActionStatus = "draft"
) {
  const { data, error } = await supabase
    .from("ai_actions")
    .insert({
      action_payload: actionPayload,
      action_type: actionType,
      profile_id: profileId,
      session_id: sessionId,
      status
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as AiAction;
}

export async function logQuickAiAction(
  sessionId: string,
  profileId: string,
  action: AiQuickAction,
  safeSummary: string
) {
  return createAiAction(sessionId, profileId, action, {
    quick_action: action,
    safe_summary: safeSummary
  });
}
