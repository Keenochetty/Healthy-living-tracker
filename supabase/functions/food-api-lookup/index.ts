import { jsonResponse, requireAuthenticatedUser } from "../_shared/security.ts";

Deno.serve(async (req) => {
  const { error } = requireAuthenticatedUser(req);
  if (error) return jsonResponse({ error }, 401);

  return jsonResponse({
    results: [],
    status: "placeholder",
    message: "Food API keys must stay server-side. Return normalized food results only after request validation."
  });
});
