import { supabase } from "@/lib/supabase";
import type {
  AppAIChat,
  AppAIImport,
  AppAIImportPayload,
  AppAIImportTarget,
} from "@/types/appAI";

export async function getAppAIChats() {
  const { data, error } = await supabase
    .from("app_ai_chats")
    .select("id,title,last_message_preview,created_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(10);
  if (error) throw new Error(error.message);
  return (data ?? []) as AppAIChat[];
}

export async function createAppAIChat(userId: string, title: string) {
  const { data, error } = await supabase
    .from("app_ai_chats")
    .insert({ title: title.slice(0, 80), user_id: userId })
    .select("id,title,last_message_preview,created_at,updated_at")
    .single();
  if (error) throw new Error(error.message);
  return data as AppAIChat;
}

export async function saveAppAIMessage(input: {
  chatId: string;
  content: string;
  importPayload?: AppAIImportPayload;
  role: "user" | "assistant";
  sources?: Array<{ title: string; url: string }>;
  userId: string;
}) {
  const { data, error } = await supabase
    .from("app_ai_messages")
    .insert({
      chat_id: input.chatId,
      content: input.content,
      import_payload: input.importPayload,
      role: input.role,
      sources: input.sources ?? [],
      user_id: input.userId,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await supabase
    .from("app_ai_chats")
    .update({
      last_message_preview: input.content.slice(0, 140),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.chatId);
  return data.id as string;
}

export async function getAppAIMessages(chatId: string) {
  const { data, error } = await supabase
    .from("app_ai_messages")
    .select("id,role,content,sources,import_payload,created_at")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAppAIImports() {
  const { data, error } = await supabase
    .from("app_ai_imports")
    .select("id,target,payload,status,created_at")
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) throw new Error(error.message);
  return (data ?? []) as AppAIImport[];
}

export async function logAppAIImport(input: {
  chatId?: string;
  messageId?: string;
  payload: AppAIImportPayload;
  target: AppAIImportTarget;
  userId: string;
}) {
  const { error } = await supabase.from("app_ai_imports").insert({
    chat_id: input.chatId,
    message_id: input.messageId,
    payload: input.payload,
    status: "confirmed",
    target: input.target,
    user_id: input.userId,
  });
  if (error) throw new Error(error.message);
}
