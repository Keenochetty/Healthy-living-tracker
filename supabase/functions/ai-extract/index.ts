import { corsHeaders } from "../_shared/cors.ts";
import { requireAuthenticatedUser } from "../_shared/security.ts";

const VALID_JOB_TYPES = new Set([
  "doctor_report_scan",
  "prescription_scan",
  "medication_label_scan",
  "food_photo_scan",
  "formula_label_scan",
  "vaccination_card_scan",
  "symptom_summary",
  "care_note_summary",
  "general_note_organise",
]);

const VALID_INPUT_TYPES = new Set(["text", "image", "document"]);

type AiExtractRequest = {
  fileName?: string;
  filePath?: string;
  inputType?: "text" | "image" | "document";
  jobId?: string;
  jobType?: string;
  localUri?: string;
  mimeType?: string;
  textInput?: string;
  user_confirmed_context?: boolean;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed.", ok: false }, 405);
  }

  try {
    const { error: authError } = requireAuthenticatedUser(req);
    if (authError) return jsonResponse({ error: authError, ok: false }, 401);

    const body = (await req.json()) as AiExtractRequest;
    const jobType = body.jobType;
    const inputType = body.inputType;

    if (!jobType || !VALID_JOB_TYPES.has(jobType)) {
      return jsonResponse({ error: "Invalid jobType.", ok: false }, 400);
    }

    if (!inputType || !VALID_INPUT_TYPES.has(inputType)) {
      return jsonResponse({ error: "Invalid inputType.", ok: false }, 400);
    }

    if (!body.textInput?.trim() && !body.filePath && !body.localUri) {
      return jsonResponse({ error: "Input is empty.", ok: false }, 400);
    }
    if ((body.textInput || body.filePath || body.localUri) && body.user_confirmed_context !== true) {
      return jsonResponse({ error: "Private context requires confirmation.", ok: false }, 400);
    }

    return jsonResponse({
      draft: null,
      message: "AI extraction is deferred to the review-first import envelope flow. No data was saved.",
      jobId: body.jobId,
      mode: "deferred",
      ok: true,
    });
  } catch (error) {
    return jsonResponse(
      {
        error: "Could not process this with AI right now. No data was saved.",
        ok: false,
      },
      500,
    );
  }
});
