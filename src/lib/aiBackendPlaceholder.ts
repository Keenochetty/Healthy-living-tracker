import type { AiJob } from "@/types/ai";

const PLACEHOLDER_MESSAGE =
  "Real AI extraction must run through a secure backend or Supabase Edge Function. Do not call OpenAI directly from the mobile app.";

export async function uploadAiInputLater(_localUri: string) {
  throw new Error(PLACEHOLDER_MESSAGE);
}

export async function callAiExtractionBackendLater(_job: AiJob) {
  throw new Error(PLACEHOLDER_MESSAGE);
}

// Future real flow:
// Expo app -> upload file securely -> Supabase Edge Function -> OpenAI Responses API
// with image input + Structured Outputs -> draft JSON -> review screen.
