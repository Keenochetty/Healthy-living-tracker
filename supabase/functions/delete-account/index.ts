import { createClient } from "npm:@supabase/supabase-js@2";

import { corsHeaders } from "../_shared/cors.ts";
import {
  getServerOnlyEnv,
  jsonResponse,
  readJsonBody,
  requireAuthenticatedUser,
  requireRecentAuthentication,
} from "../_shared/security.ts";

const CONFIRMATION = "DELETE MY ACCOUNT";
const PRIVATE_BUCKETS = [
  "medical-documents",
  "health-records-private",
  "profile-avatars",
  "food-images",
  "baby-records-private",
  "medication-labels-private",
  "supplement-labels-private",
  "pregnancy-records-private",
  "ai-temp-uploads",
  "caregiver-uploads",
];

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
    const body = await readJsonBody<{
      acknowledgeRetention?: boolean;
      confirmation?: string;
    }>(req);
    if (
      body.confirmation !== CONFIRMATION ||
      body.acknowledgeRetention !== true
    ) {
      return respond(
        {
          error: "Deliberate account-deletion confirmation is required.",
          ok: false,
        },
        400,
      );
    }

    const supabaseUrl = getServerOnlyEnv("SUPABASE_URL");
    const anonKey = getServerOnlyEnv("SUPABASE_ANON_KEY");
    const serviceRoleKey = getServerOnlyEnv("SUPABASE_SERVICE_ROLE_KEY");
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${userJwt}` } },
      auth: { persistSession: false },
    });
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
    const { data: userData, error: userError } =
      await userClient.auth.getUser(userJwt);
    if (userError || !userData.user)
      return respond(
        { error: "Authenticated user could not be verified.", ok: false },
        401,
      );

    for (const bucket of PRIVATE_BUCKETS) {
      await removeStorageTree(admin, bucket, userData.user.id);
    }

    await admin.auth.admin.signOut(userJwt, "global");
    const deletion = await admin.auth.admin.deleteUser(userData.user.id);
    if (deletion.error) throw deletion.error;

    return respond({
      completedAt: new Date().toISOString(),
      message: "Account deletion completed.",
      ok: true,
      status: "completed",
    });
  } catch (error) {
    return respond(
      {
        error:
          error instanceof Error ? error.message : "Account deletion failed.",
        ok: false,
      },
      500,
    );
  }
});

async function removeStorageTree(
  admin: ReturnType<typeof createClient>,
  bucket: string,
  prefix: string,
) {
  const paths: string[] = [];
  await collectPaths(admin, bucket, prefix, paths);
  for (let index = 0; index < paths.length; index += 100) {
    await admin.storage.from(bucket).remove(paths.slice(index, index + 100));
  }
}

async function collectPaths(
  admin: ReturnType<typeof createClient>,
  bucket: string,
  prefix: string,
  paths: string[],
) {
  const result = await admin.storage.from(bucket).list(prefix, { limit: 1000 });
  if (result.error) return;
  for (const item of result.data ?? []) {
    const path = `${prefix}/${item.name}`;
    if (item.id) paths.push(path);
    else await collectPaths(admin, bucket, path, paths);
  }
}

function respond(body: unknown, status = 200) {
  const response = jsonResponse(body, status);
  Object.entries(corsHeaders).forEach(([key, value]) =>
    response.headers.set(key, value),
  );
  return response;
}
