import { corsHeaders } from "../_shared/cors.ts";
import { requireAuthenticatedUser } from "../_shared/security.ts";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const { error: authError } = requireAuthenticatedUser(req);
  if (authError) {
    return jsonResponse({ error: authError }, 401);
  }

  return jsonResponse(
    {
      error:
        "HealthSync no longer calls an AI provider from Supabase. Open ChatGPT with your own account, then paste selected results back into HealthSync.",
    },
    410,
  );
});
