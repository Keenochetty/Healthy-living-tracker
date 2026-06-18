export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: {
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    status,
  });
}

export function safeProviderError() {
  return "Could not process this with AI right now. No data was saved.";
}

export function privacySafeSummary(text?: string) {
  if (!text?.trim()) return null;
  return text.trim().slice(0, 160);
}
