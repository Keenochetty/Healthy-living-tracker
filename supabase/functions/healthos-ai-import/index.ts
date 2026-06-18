import { requireAuthenticatedUser } from "../_shared/security.ts";
import { validateImportRequest, type HealthOSAIImportRequest } from "./importSchema.ts";
import { jsonResponse, privacySafeSummary } from "./safety.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return jsonResponse({ ok: true });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  const { error: authError } = requireAuthenticatedUser(req);
  if (authError) return jsonResponse({ error: authError }, 401);

  try {
    const body = (await req.json()) as HealthOSAIImportRequest;
    const validation = validateImportRequest(body);
    if (!validation.valid) return jsonResponse({ error: validation.errors[0] }, 400);

    const importModel = Deno.env.get("HEALTHOS_AI_IMPORT_MODEL") ?? Deno.env.get("HEALTHOS_AI_MODEL");
    const hasProviderKey = Boolean(Deno.env.get("OPENAI_API_KEY"));

    return jsonResponse({
      ok: true,
      mode: hasProviderKey && importModel ? "deferred_provider_boundary" : "deferred",
      job: {
        source_type: validation.sourceType,
        requested_target: validation.requestedTarget,
        status: "deferred",
        input_summary: privacySafeSummary(body.text_input),
      },
      envelope: {
        detected_type: "unknown",
        primary_target: validation.requestedTarget,
        review_status: "needs_review",
        confidence_label: "unknown",
        title: "AI import needs review",
        summary_privacy_safe: "AI extraction is not connected yet. No data was saved.",
        fields: [],
        warnings: [
          {
            type: "review_required",
            severity: "important",
            message: "AI output requires review before saving.",
          },
        ],
        source_evidence: [],
      },
    });
  } catch {
    return jsonResponse({ error: "Could not process this with AI right now. No data was saved." }, 500);
  }
});
