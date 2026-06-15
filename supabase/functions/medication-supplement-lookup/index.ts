import { jsonResponse, requireAuthenticatedUser } from "../_shared/security.ts";

Deno.serve(async (req) => {
  const { error } = requireAuthenticatedUser(req);
  if (error) return jsonResponse({ error }, 401);

  return jsonResponse({
    results: [],
    status: "placeholder",
    message:
      "Medication/supplement API calls stay server-side and must never make treatment, dose, or interaction decisions.",
  });
});
