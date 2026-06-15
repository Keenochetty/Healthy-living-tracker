import { jsonResponse, requireAuthenticatedUser } from "../_shared/security.ts";

Deno.serve(async (req) => {
  const { error } = requireAuthenticatedUser(req);
  if (error) return jsonResponse({ error }, 401);

  return jsonResponse({
    status: "placeholder",
    message:
      "Trusted content refresh should validate source allowlists and record reviewer/last-checked metadata.",
  });
});
