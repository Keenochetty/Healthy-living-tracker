import { jsonResponse, requireAuthenticatedUser } from "../_shared/security.ts";

Deno.serve(async (req) => {
  const { error } = requireAuthenticatedUser(req);
  if (error) return jsonResponse({ error }, 401);

  return jsonResponse({
    product: null,
    status: "placeholder",
    message: "Barcode lookups may cache centrally only after validating the user and avoiding sensitive payload logs."
  });
});
