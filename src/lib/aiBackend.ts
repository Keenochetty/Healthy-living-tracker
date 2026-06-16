import { supabase } from "@/lib/supabase";
import type { AssistantMode, AssistantRequestResult } from "@/types/assistant";
import type { AiExtractedDraft, AiInputType, AiJobType } from "@/types/ai";
import type { AppAIImportPayload, AppAIInputType } from "@/types/appAI";

export type AiExtractFunctionInput = {
  fileName?: string;
  filePath?: string;
  inputType: AiInputType;
  jobId?: string;
  jobType: AiJobType;
  localUri?: string;
  mimeType?: string;
  textInput?: string;
};

export type AiExtractFunctionResponse = {
  draft: AiExtractedDraft;
  mode: "real" | "mock";
  ok: true;
};

export async function callAiExtractFunction(input: AiExtractFunctionInput) {
  const { data, error } = await supabase.functions.invoke<
    AiExtractFunctionResponse | { error: string; ok: false }
  >("ai-extract", {
    body: input,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("AI extraction returned no data.");
  }

  if (!data.ok) {
    throw new Error("error" in data ? data.error : "AI extraction failed.");
  }

  return data;
}

export type AssistantFunctionInput = {
  allowedDataCategories: string[];
  mode: AssistantMode;
  prompt: string;
  profileId: string;
  taskContext?: Record<string, string | number | boolean | null | undefined>;
};

export type AssistantFunctionResponse = {
  result: AssistantRequestResult;
  mode: "real" | "mock";
  ok: true;
};

export type AiChatSource = {
  title: string;
  url: string;
};

export type AiChatFunctionResponse = {
  importPayload?: AppAIImportPayload | null;
  reply: string;
  sources?: AiChatSource[];
};

type AiChatErrorResponse = {
  error: string;
};

async function getFunctionErrorMessage(error: {
  context?: Response;
  message: string;
}) {
  if (error.context) {
    try {
      const body = (await error.context.json()) as Partial<AiChatErrorResponse>;
      if (body.error) return body.error;
    } catch {
      // Fall back to the Supabase client error below.
    }
  }

  return error.message;
}

export async function askAIWithSources(
  message: string,
  context?: unknown,
  inputType: AppAIInputType = "text",
) {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    throw new Error("A non-empty message is required.");
  }

  const { data, error } = await supabase.functions.invoke<AiChatFunctionResponse>(
    "ai-chat",
    {
      body: { context, inputType, message: trimmedMessage },
    },
  );

  if (error) {
    throw new Error(await getFunctionErrorMessage(error));
  }

  if (!data?.reply) {
    throw new Error("AI chat returned no reply.");
  }

  return {
    importPayload: isAppAIImportPayload(data.importPayload)
      ? data.importPayload
      : null,
    reply: data.reply,
    sources: data.sources ?? [],
  };
}

export async function askAI(message: string, context?: unknown) {
  return (await askAIWithSources(message, context)).reply;
}

function isAppAIImportPayload(value: unknown): value is AppAIImportPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<AppAIImportPayload>;
  return Boolean(
    payload.source &&
      payload.intent &&
      payload.summary &&
      payload.health_flags &&
      payload.nutrition &&
      payload.fitness &&
      payload.medication &&
      payload.supplement &&
      payload.calendar &&
      payload.baby_child &&
      payload.women_health &&
      payload.family &&
      payload.records &&
      Array.isArray(payload.import_targets) &&
      payload.actions,
  );
}

export async function callAssistantFunction(input: AssistantFunctionInput) {
  const { data, error } = await supabase.functions.invoke<
    AssistantFunctionResponse | { error: string; ok: false }
  >("health-assistant", {
    body: input,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Assistant returned no data.");
  }

  if (!data.ok) {
    throw new Error("error" in data ? data.error : "Assistant request failed.");
  }

  return data;
}
