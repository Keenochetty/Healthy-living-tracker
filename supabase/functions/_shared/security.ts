export function requireAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.toLowerCase().startsWith("bearer ")) {
    return { error: "Missing authenticated user token.", userJwt: null };
  }
  return { error: null, userJwt: authHeader.replace(/^bearer\s+/i, "") };
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status
  });
}

export function getServerOnlyEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing server-only environment variable: ${name}`);
  }
  return value;
}
