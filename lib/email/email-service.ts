type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(_payload: EmailPayload) {
  const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM"] as const;
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    return {
      ok: false,
      message: `SMTP is not configured. Missing: ${missing.join(", ")}`
    };
  }

  return {
    ok: false,
    message: "SMTP transport placeholder is ready. Add a mail provider implementation when email delivery is enabled."
  };
}
