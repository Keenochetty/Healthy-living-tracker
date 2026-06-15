import { createClient } from "npm:@supabase/supabase-js@2";

import { corsHeaders } from "../_shared/cors.ts";
import {
  getServerOnlyEnv,
  jsonResponse,
  readJsonBody,
  requireAuthenticatedUser,
  requireRecentAuthentication,
} from "../_shared/security.ts";

const EXPORT_TABLES = [
  ["profiles", "id"],
  ["user_settings", "profile_id"],
  ["subscriptions", "user_id"],
  ["health_logs", "created_by_user_id"],
  ["medicine_logs", "created_by_user_id"],
  ["temperature_logs", "created_by_user_id"],
  ["doctor_visits", "created_by_user_id"],
  ["documents", "created_by_user_id"],
  ["reminders", "created_by_user_id"],
  ["health_records", "created_by_user_id"],
  ["ai_chats", "created_by_user_id"],
  ["ai_chat_sessions", "created_by_user_id"],
  ["ai_actions", "requested_by_user_id"],
] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST")
    return respond({ error: "Method not allowed.", ok: false }, 405);

  const { error, userJwt } = requireAuthenticatedUser(req);
  if (error || !userJwt)
    return respond({ error: error ?? "Unauthorized.", ok: false }, 401);
  const recentAuthenticationError = requireRecentAuthentication(userJwt);
  if (recentAuthenticationError)
    return respond({ error: recentAuthenticationError, ok: false }, 401);

  try {
    const body = await readJsonBody<{ categories?: string[] }>(req);
    const supabaseUrl = getServerOnlyEnv("SUPABASE_URL");
    const anonKey = getServerOnlyEnv("SUPABASE_ANON_KEY");
    const client = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${userJwt}` } },
      auth: { persistSession: false },
    });
    const { data: userData, error: userError } =
      await client.auth.getUser(userJwt);
    if (userError || !userData.user)
      return respond(
        { error: "Authenticated user could not be verified.", ok: false },
        401,
      );

    const records: Record<string, unknown[]> = {};
    const unavailable: string[] = [];
    for (const [table, ownerColumn] of EXPORT_TABLES) {
      const result = await client
        .from(table)
        .select("*")
        .eq(ownerColumn, userData.user.id)
        .limit(5000);
      if (result.error) unavailable.push(table);
      else records[table] = result.data ?? [];
    }

    return respond({
      export: {
        account: {
          createdAt: userData.user.created_at,
          email: userData.user.email,
          id: userData.user.id,
        },
        categories: Array.isArray(body.categories) ? body.categories : [],
        generatedAt: new Date().toISOString(),
        records,
        unavailable,
      },
      ok: true,
      status: "ready",
    });
  } catch (error) {
    return respond(
      {
        error: error instanceof Error ? error.message : "Data export failed.",
        ok: false,
      },
      500,
    );
  }
});

function respond(body: unknown, status = 200) {
  const response = jsonResponse(body, status);
  Object.entries(corsHeaders).forEach(([key, value]) =>
    response.headers.set(key, value),
  );
  return response;
}
