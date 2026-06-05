import { jsonResponse, requireAuthenticatedUser } from "../_shared/security.ts";

Deno.serve(async (req) => {
  const { error } = requireAuthenticatedUser(req);
  if (error) return jsonResponse({ error }, 401);

  return jsonResponse({
    status: "placeholder",
    message: "Delete account processing must validate confirmation, delete storage where required, and retain audit logs according to policy."
  });
});
