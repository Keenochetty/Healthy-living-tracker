import { supabase } from "@/lib/supabase";
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
    body: input
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
