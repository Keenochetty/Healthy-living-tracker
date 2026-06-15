import { jsonResponse, requireAuthenticatedUser } from "../_shared/security.ts";

Deno.serve(async (req) => {
  const { error } = requireAuthenticatedUser(req);
  if (error) return jsonResponse({ error }, 401);

  return jsonResponse({
    status: "placeholder",
    message:
      "Private signed URL generation must validate JWT, profile permissions, record access, and audit metadata before using service-role storage access.",
  });
});
