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
    status,
  });
}

export function getServerOnlyEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing server-only environment variable: ${name}`);
  }
  return value;
}

export async function readJsonBody<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}

export function requireRecentAuthentication(
  jwt: string,
  maximumAgeSeconds = 300,
) {
  try {
    const payloadPart = jwt.split(".")[1];
    if (!payloadPart) return "Authenticated session is invalid.";
    const base64 = payloadPart
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payloadPart.length / 4) * 4, "=");
    const payload = JSON.parse(atob(base64)) as { iat?: number };
    if (
      !payload.iat ||
      Math.floor(Date.now() / 1000) - payload.iat > maximumAgeSeconds
    ) {
      return "Recent re-authentication is required.";
    }
    return null;
  } catch {
    return "Authenticated session is invalid.";
  }
}
