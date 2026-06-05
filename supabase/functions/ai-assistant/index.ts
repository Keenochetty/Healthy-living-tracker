import { jsonResponse, requireAuthenticatedUser } from "../_shared/security.ts";

Deno.serve(async (req) => {
  const { error } = requireAuthenticatedUser(req);
  if (error) return jsonResponse({ error }, 401);

  return jsonResponse({
    status: "placeholder",
    message: "AI assistant requests must enforce consent, data minimization, permission filtering, safety classification, and draft-only responses."
  });
});
