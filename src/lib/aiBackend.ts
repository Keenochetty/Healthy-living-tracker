import { supabase } from "@/lib/supabase";
import type { AssistantMode, AssistantRequestResult } from "@/types/assistant";
import type { AiExtractedDraft, AiInputType, AiJobType } from "@/types/ai";

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
