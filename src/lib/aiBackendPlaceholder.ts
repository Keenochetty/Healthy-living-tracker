import type { AiJob } from "@/types/ai";

const PLACEHOLDER_MESSAGE =
  "HealthSync does not call an AI provider directly. Open ChatGPT externally and paste selected results back into the app.";

export async function uploadAiInputLater(_localUri: string) {
  throw new Error(PLACEHOLDER_MESSAGE);
}

export async function callAiExtractionBackendLater(_job: AiJob) {
  throw new Error(PLACEHOLDER_MESSAGE);
}

// Future real flow:
// Expo app -> user opens ChatGPT externally -> user pastes selected result back
// into HealthSync -> local parsing/import preview.
// with image input + Structured Outputs -> draft JSON -> review screen.
