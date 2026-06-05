import { jsonResponse, requireAuthenticatedUser } from "../_shared/security.ts";

Deno.serve(async (req) => {
  const { error } = requireAuthenticatedUser(req);
  if (error) return jsonResponse({ error }, 401);

  return jsonResponse({
    status: "placeholder",
    message: "Data export generation must validate ownership, categories, permissions, and create short-lived private export files."
  });
});
