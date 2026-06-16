import type { AiJob } from "@/types/ai";

const PLACEHOLDER_MESSAGE =
  "HealthSync calls AI only through secure Supabase Edge Functions. The Expo app never stores an OpenAI API key.";

export async function uploadAiInputLater(_localUri: string) {
  throw new Error(PLACEHOLDER_MESSAGE);
}

export async function callAiExtractionBackendLater(_job: AiJob) {
  throw new Error(PLACEHOLDER_MESSAGE);
}

// Future real flow:
// Expo app -> Supabase Edge Function -> OpenAI API
// with image input + Structured Outputs -> draft JSON -> review screen.
